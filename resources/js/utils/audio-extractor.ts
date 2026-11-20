/**
 * Client-Side Audio Extractor & Optimizer
 *
 * Extracts audio tracks from video files (.mp4, .mov, .webm) and
 * compresses/downsamples audio to 16 kHz Mono 32 kbps MP3 in the browser before uploading.
 * This saves 95%+ bandwidth and works cleanly on Hostinger Shared Hosting.
 */

import { Mp3Encoder } from '@breezystack/lamejs';

export interface ExtractedMedia {
    file: File | Blob;
    durationSeconds: number;
    originalName: string;
    sizeBytes: number;
    isExtracted: boolean;
}

/**
 * Read the duration of any video or audio file using HTML5 Media Element.
 */
export async function getMediaDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
        const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(file.name);
        const element = document.createElement(isVideo ? 'video' : 'audio');
        element.preload = 'metadata';

        const objectUrl = URL.createObjectURL(file);
        element.src = objectUrl;

        const cleanup = () => {
            URL.revokeObjectURL(objectUrl);
            element.removeAttribute('src');
            element.load();
        };

        element.onloadedmetadata = () => {
            const duration = Math.round(element.duration || 0);
            cleanup();
            resolve(duration);
        };

        element.onerror = () => {
            cleanup();
            resolve(0);
        };

        // Timeout fallback after 6s in case metadata takes too long
        setTimeout(() => {
            cleanup();
            resolve(0);
        }, 6000);
    });
}

/**
 * Check if a file is already a compact audio file that can be sent directly (<12 MB).
 * Audio files >= 12 MB or any video file will be optimized & compressed in-browser to 16kHz 32kbps mono MP3.
 */
export function canUploadDirectly(file: File): boolean {
    const isAudio = file.type.startsWith('audio/') || /\.(mp3|m4a|aac|ogg|oga|webm|wav|flac)$/i.test(file.name);
    const isUnder12Mb = file.size <= 12 * 1024 * 1024;
    return isAudio && isUnder12Mb;
}

/**
 * Resample audio channel data to 16,000 Hz Mono using software linear interpolation.
 * Used as a fallback when OfflineAudioContext exceeds memory or frame limits on long recordings.
 */
function manualResampleTo16kMono(decodedBuffer: AudioBuffer): Float32Array {
    const sourceRate = decodedBuffer.sampleRate;
    const targetRate = 16000;
    const numChannels = decodedBuffer.numberOfChannels;
    const sourceLength = decodedBuffer.length;

    // Mixdown to mono
    const monoSource = new Float32Array(sourceLength);
    if (numChannels === 1) {
        monoSource.set(decodedBuffer.getChannelData(0));
    } else {
        const ch0 = decodedBuffer.getChannelData(0);
        const ch1 = decodedBuffer.getChannelData(1);
        for (let i = 0; i < sourceLength; i++) {
            monoSource[i] = (ch0[i] + ch1[i]) * 0.5;
        }
    }

    if (sourceRate === targetRate) {
        return monoSource;
    }

    const ratio = sourceRate / targetRate;
    const targetLength = Math.max(1, Math.round(sourceLength / ratio));
    const result = new Float32Array(targetLength);

    for (let i = 0; i < targetLength; i++) {
        const sourceIndex = i * ratio;
        const indexLow = Math.floor(sourceIndex);
        const indexHigh = Math.min(indexLow + 1, sourceLength - 1);
        const weight = sourceIndex - indexLow;
        result[i] = monoSource[indexLow] * (1 - weight) + monoSource[indexHigh] * weight;
    }

    return result;
}

/**
 * Extract audio track from video/large audio file and downsample to 16kHz Mono 32kbps MP3.
 * Whisper internally operates on 16kHz 16-bit mono.
 */
export async function prepareMediaForTranscription(
    file: File,
    onProgress?: (progressPercent: number, statusText: string) => void
): Promise<ExtractedMedia> {
    onProgress?.(5, 'فحص وقراءة بيانات الملف...');
    const durationSeconds = await getMediaDuration(file);

    // If it's already a compact audio file and under 12MB, upload directly without re-encoding
    if (canUploadDirectly(file)) {
        onProgress?.(100, 'الملف الصوتي جاهز للرفع المباشر.');
        return {
            file,
            durationSeconds,
            originalName: file.name,
            sizeBytes: file.size,
            isExtracted: false,
        };
    }

    onProgress?.(15, 'استخلاص المسار الصوتي وضغط الملف داخل المتصفح...');

    try {
        const arrayBuffer = await file.arrayBuffer();
        onProgress?.(35, 'فك ترميز الترددات الصوتية...');

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
            throw new Error('Web Audio API is not supported in this browser.');
        }

        const audioCtx = new AudioContextClass();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        await audioCtx.close();

        onProgress?.(60, 'ضبط التردد إلى 16kHz أحادي القناة (Whisper Standard)...');

        let renderedData: Float32Array;
        let finalDuration = Math.round(decodedBuffer.duration) || durationSeconds;

        try {
            // Attempt hardware-accelerated downsample to 16,000 Hz Mono using OfflineAudioContext
            const targetSampleRate = 16000;
            const targetLength = Math.ceil(decodedBuffer.duration * targetSampleRate);
            const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);

            const source = offlineCtx.createBufferSource();
            source.buffer = decodedBuffer;
            source.connect(offlineCtx.destination);
            source.start(0);

            const renderedBuffer = await offlineCtx.startRendering();
            renderedData = renderedBuffer.getChannelData(0);
            finalDuration = Math.round(renderedBuffer.duration) || finalDuration;
        } catch (offlineErr) {
            console.warn('OfflineAudioContext fallback to software resampling:', offlineErr);
            renderedData = manualResampleTo16kMono(decodedBuffer);
        }

        onProgress?.(80, 'ضغط الصوت إلى MP3 فائق الكفاءة (32 kbps)...');

        let encodedBlob: Blob;
        let outputExt = 'mp3';
        let mimeType = 'audio/mp3';

        try {
            encodedBlob = encodeMp3Data(renderedData, 16000);
        } catch (mp3Err) {
            console.warn('MP3 encoding fallback to WAV:', mp3Err);
            encodedBlob = encodeWavData(renderedData, 16000);
            outputExt = 'wav';
            mimeType = 'audio/wav';
        }

        const outputFilename = file.name.replace(/\.[^/.]+$/, '') + '.' + outputExt;

        onProgress?.(100, 'اكتمل تجهيز وضغط الصوت بنجاح!');

        return {
            file: new File([encodedBlob], outputFilename, { type: mimeType }),
            durationSeconds: finalDuration,
            originalName: file.name,
            sizeBytes: encodedBlob.size,
            isExtracted: true,
        };
    } catch (err) {
        console.warn('In-browser extraction fallback to raw file:', err);
        // Fallback: If Web Audio decoding fails on rare video codec, send original file directly
        return {
            file,
            durationSeconds,
            originalName: file.name,
            sizeBytes: file.size,
            isExtracted: false,
        };
    }
}

/**
 * Encode PCM Float32 audio data into 16kHz Mono 32 kbps MP3 using lamejs.
 */
function encodeMp3Data(channelData: Float32Array, sampleRate: number = 16000): Blob {
    const channels = 1; // Mono
    const kbps = 32; // 32 kbps mono gives ~14.4 MB per hour

    const mp3Encoder = new Mp3Encoder(channels, sampleRate, kbps);

    // Convert Float32 (-1.0 to 1.0) into 16-bit PCM integer samples
    const samples = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
        const s = Math.max(-1, Math.min(1, channelData[i]));
        samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    const mp3Data: Uint8Array[] = [];
    const sampleBlockSize = 1152;

    for (let i = 0; i < samples.length; i += sampleBlockSize) {
        const sampleChunk = samples.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }

    const endBuf = mp3Encoder.flush();
    if (endBuf.length > 0) {
        mp3Data.push(endBuf);
    }

    return new Blob(mp3Data, { type: 'audio/mp3' });
}

/**
 * Fallback: Encode PCM Float32 audio data into 16-bit PCM WAV (Mono).
 */
function encodeWavData(channelData: Float32Array, sampleRate: number = 16000): Blob {
    const numChannels = 1; // Mono
    const format = 1; // PCM
    const bitDepth = 16;

    const dataLength = channelData.length * (bitDepth / 8);
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);

    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write PCM 16-bit samples
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
        let sample = channelData[i];
        sample = Math.max(-1, Math.min(1, sample));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
