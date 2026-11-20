/**
 * Client-Side Audio Extractor, Optimizer & High-Performance Uploader
 *
 * Supports two processing modes:
 *  - 'server': Skips browser transcoding for fastest possible turnaround; uploads directly with live progress.
 *  - 'local':  Extracts & compresses audio to 16 kHz Mono 32 kbps MP3 off the main thread via Web Worker
 *              to save up to 90% internet data quota while keeping the UI 60fps responsive.
 */

import { Mp3Encoder } from '@breezystack/lamejs';

export type ProcessingMode = 'server' | 'local';

export interface ExtractedMedia {
    file: File | Blob;
    durationSeconds: number;
    originalName: string;
    sizeBytes: number;
    isExtracted: boolean;
    modeUsed: ProcessingMode;
}

export interface PrepareMediaOptions {
    mode?: ProcessingMode;
    isRtl?: boolean;
}

export interface UploadProgressInfo {
    loadedBytes: number;
    totalBytes: number;
    percent: number;
}

/**
 * Read the duration of any video or audio file using HTML5 Media Element (lightweight metadata only).
 */
export async function getMediaDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
        const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(file.name);
        const element = document.createElement(isVideo ? 'video' : 'audio');
        element.preload = 'metadata';

        const objectUrl = URL.createObjectURL(file);
        element.src = objectUrl;

        let settled = false;
        const finish = (duration: number) => {
            if (settled) return;
            settled = true;
            URL.revokeObjectURL(objectUrl);
            element.removeAttribute('src');
            element.load();
            resolve(duration);
        };

        element.onloadedmetadata = () => {
            const d = Number.isFinite(element.duration) ? Math.round(element.duration) : 0;
            finish(d);
        };

        element.onerror = () => finish(0);

        // Timeout fallback after 5s in case metadata takes too long
        setTimeout(() => finish(0), 5000);
    });
}

/**
 * Check if a file is already a small, compressed audio file that does not benefit from local re-encoding.
 * Uncompressed WAV and video files always benefit from local compression.
 */
export function canUploadDirectly(file: File): boolean {
    const isCompressedAudio =
        (file.type.startsWith('audio/') && !/wav|wave|x-wav/i.test(file.type)) ||
        /\.(mp3|m4a|aac|ogg|oga|webm|opus)$/i.test(file.name);
    const isSmall = file.size <= 8 * 1024 * 1024;
    return isCompressedAudio && isSmall;
}

/**
 * Resample audio channel data to 16,000 Hz Mono using inline linear interpolation.
 * Mixes stereo directly inside the resampling loop to avoid allocating an extra full-length buffer in RAM.
 */
function manualResampleTo16kMono(decodedBuffer: AudioBuffer): Float32Array {
    const sourceRate = decodedBuffer.sampleRate;
    const targetRate = 16000;
    const numChannels = decodedBuffer.numberOfChannels;
    const sourceLength = decodedBuffer.length;

    const ch0 = decodedBuffer.getChannelData(0);
    const ch1 = numChannels > 1 ? decodedBuffer.getChannelData(1) : null;

    if (sourceRate === targetRate) {
        if (!ch1) {
            // Return a copy so buffer can be transferred safely to Web Worker
            return new Float32Array(ch0);
        }
        const mono = new Float32Array(sourceLength);
        for (let i = 0; i < sourceLength; i++) {
            mono[i] = (ch0[i] + ch1[i]) * 0.5;
        }
        return mono;
    }

    const ratio = sourceRate / targetRate;
    const targetLength = Math.max(1, Math.round(sourceLength / ratio));
    const result = new Float32Array(targetLength);

    if (!ch1) {
        for (let i = 0; i < targetLength; i++) {
            const sourceIndex = i * ratio;
            const indexLow = Math.floor(sourceIndex);
            const indexHigh = indexLow + 1 < sourceLength ? indexLow + 1 : sourceLength - 1;
            const weight = sourceIndex - indexLow;
            result[i] = ch0[indexLow] * (1 - weight) + ch0[indexHigh] * weight;
        }
    } else {
        for (let i = 0; i < targetLength; i++) {
            const sourceIndex = i * ratio;
            const indexLow = Math.floor(sourceIndex);
            const indexHigh = indexLow + 1 < sourceLength ? indexLow + 1 : sourceLength - 1;
            const weight = sourceIndex - indexLow;
            const sLow = (ch0[indexLow] + ch1[indexLow]) * 0.5;
            const sHigh = (ch0[indexHigh] + ch1[indexHigh]) * 0.5;
            result[i] = sLow * (1 - weight) + sHigh * weight;
        }
    }

    return result;
}

/**
 * Encode PCM Float32 audio data in a dedicated Web Worker (zero UI blocking, zero-copy transfer).
 */
function encodeMp3InWorker(
    channelData: Float32Array,
    sampleRate: number,
    kbps: number,
    onEncodeProgress?: (percent: number) => void
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        if (typeof Worker === 'undefined') {
            reject(new Error('Web Workers are not supported.'));
            return;
        }

        let worker: Worker;
        try {
            worker = new Worker(new URL('./audio-encoder.worker.ts', import.meta.url), {
                type: 'module',
            });
        } catch (err) {
            reject(err);
            return;
        }

        const cleanup = () => {
            worker.terminate();
        };

        worker.onmessage = (event: MessageEvent) => {
            const msg = event.data;
            if (msg.type === 'progress') {
                onEncodeProgress?.(msg.percent);
            } else if (msg.type === 'done') {
                cleanup();
                resolve(new Blob(msg.chunks, { type: 'audio/mp3' }));
            } else if (msg.type === 'error') {
                cleanup();
                reject(new Error(msg.message || 'Worker MP3 encoding failed.'));
            }
        };

        worker.onerror = (err) => {
            cleanup();
            reject(new Error(err.message || 'Audio encoder worker crashed.'));
        };

        // Transfer underlying ArrayBuffer with zero copy for maximum speed & minimal RAM
        worker.postMessage({ channelData, sampleRate, kbps }, [channelData.buffer]);
    });
}

/**
 * Fallback chunked async MP3 encoder on main thread (yields to browser every ~40ms so UI stays responsive).
 */
async function encodeMp3ChunkedFallback(
    channelData: Float32Array,
    sampleRate: number = 16000,
    kbps: number = 32,
    onEncodeProgress?: (percent: number) => void
): Promise<Blob> {
    const mp3Encoder = new Mp3Encoder(1, sampleRate, kbps);
    const totalSamples = channelData.length;
    const sampleBlockSize = 1152;
    const chunkInt16 = new Int16Array(sampleBlockSize);
    const mp3Data: Uint8Array[] = [];

    let lastYield = performance.now();
    let lastPercent = -1;

    for (let i = 0; i < totalSamples; i += sampleBlockSize) {
        const end = Math.min(i + sampleBlockSize, totalSamples);
        const len = end - i;
        const target = len === sampleBlockSize ? chunkInt16 : new Int16Array(len);

        for (let j = 0; j < len; j++) {
            const s = channelData[i + j];
            const clamped = s < -1 ? -1 : s > 1 ? 1 : s;
            target[j] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
        }

        const mp3buf = mp3Encoder.encodeBuffer(target);
        if (mp3buf.length > 0) {
            mp3Data.push(new Uint8Array(mp3buf));
        }

        const now = performance.now();
        if (now - lastYield > 40) {
            const percent = Math.floor((end / totalSamples) * 100);
            if (percent !== lastPercent) {
                lastPercent = percent;
                onEncodeProgress?.(percent);
            }
            await new Promise((r) => setTimeout(r, 0));
            lastYield = performance.now();
        }
    }

    const endBuf = mp3Encoder.flush();
    if (endBuf.length > 0) {
        mp3Data.push(new Uint8Array(endBuf));
    }

    onEncodeProgress?.(100);
    return new Blob(mp3Data, { type: 'audio/mp3' });
}

/**
 * Prepare media file for transcription according to selected mode:
 *  - 'server': Instant pass-through (reads lightweight duration only) -> fastest overall turnaround.
 *  - 'local':  In-browser Web Worker compression to 16kHz Mono 32kbps MP3 -> saves up to 90% internet quota.
 */
export async function prepareMediaForTranscription(
    file: File,
    onProgress?: (progressPercent: number, statusText: string) => void,
    options: PrepareMediaOptions = {}
): Promise<ExtractedMedia> {
    const mode: ProcessingMode = options.mode ?? 'local';
    const isRtl = options.isRtl ?? true;

    onProgress?.(5, isRtl ? 'فحص وقراءة بيانات الملف...' : 'Inspecting media file...');
    const durationSeconds = await getMediaDuration(file);

    // SERVER MODE: Skip all heavy in-browser transcoding for maximum speed
    if (mode === 'server') {
        onProgress?.(
            100,
            isRtl ? 'جاهز للرفع المباشر السريع إلى الخادم...' : 'Ready for direct fast server upload...'
        );
        return {
            file,
            durationSeconds,
            originalName: file.name,
            sizeBytes: file.size,
            isExtracted: false,
            modeUsed: 'server',
        };
    }

    // LOCAL MODE: If already a tiny compressed audio file (<= 8MB), upload directly
    if (canUploadDirectly(file)) {
        onProgress?.(
            100,
            isRtl ? 'الملف الصوتي مضغوط وصغير بالفعل — جاهز للرفع المباشر.' : 'Audio is already compact — ready to upload.'
        );
        return {
            file,
            durationSeconds,
            originalName: file.name,
            sizeBytes: file.size,
            isExtracted: false,
            modeUsed: 'local',
        };
    }

    onProgress?.(
        15,
        isRtl ? 'قراءة واستخلاص المسار الصوتي داخل جهازك...' : 'Reading & extracting audio track on your device...'
    );

    try {
        const arrayBuffer = await file.arrayBuffer();
        onProgress?.(30, isRtl ? 'فك ترميز الترددات الصوتية...' : 'Decoding audio frequencies...');

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
            throw new Error('Web Audio API is not supported in this browser.');
        }

        const audioCtx = new AudioContextClass();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        await audioCtx.close();

        onProgress?.(
            48,
            isRtl ? 'ضبط التردد إلى 16kHz أحادي القناة (Whisper Standard)...' : 'Resampling to 16kHz Mono...'
        );

        let renderedData: Float32Array;
        let finalDuration = Math.round(decodedBuffer.duration) || durationSeconds;

        try {
            const targetSampleRate = 16000;
            const targetLength = Math.ceil(decodedBuffer.duration * targetSampleRate);
            const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);

            const source = offlineCtx.createBufferSource();
            source.buffer = decodedBuffer;
            source.connect(offlineCtx.destination);
            source.start(0);

            const renderedBuffer = await offlineCtx.startRendering();
            // Copy to a clean transferable Float32Array so the OfflineAudioContext buffer can be GC'd
            renderedData = new Float32Array(renderedBuffer.getChannelData(0));
            finalDuration = Math.round(renderedBuffer.duration) || finalDuration;
        } catch (offlineErr) {
            console.warn('OfflineAudioContext fallback to inline software resampling:', offlineErr);
            renderedData = manualResampleTo16kMono(decodedBuffer);
        }

        onProgress?.(60, isRtl ? 'ضغط الصوت إلى MP3 فائق الكفاءة (32 kbps)...' : 'Compressing to high-efficiency MP3 (32 kbps)...');

        let encodedBlob: Blob;
        const outputExt = 'mp3';
        const mimeType = 'audio/mp3';

        const reportEncodeProgress = (encPct: number) => {
            const overall = Math.min(98, 60 + Math.round(encPct * 0.38));
            onProgress?.(
                overall,
                isRtl
                    ? `جاري ضغط الصوت على جهازك (${encPct}%)...`
                    : `Compressing audio on device (${encPct}%)...`
            );
        };

        try {
            // Keep a backup reference ONLY if worker initialization itself fails synchronously
            encodedBlob = await encodeMp3InWorker(renderedData, 16000, 32, reportEncodeProgress);
        } catch (workerErr) {
            console.warn('Web Worker MP3 encoding fallback to chunked async encoder:', workerErr);
            // If buffer was detached by failed worker transfer, re-extract from decodedBuffer
            const fallbackData = renderedData.byteLength > 0 ? renderedData : manualResampleTo16kMono(decodedBuffer);
            encodedBlob = await encodeMp3ChunkedFallback(fallbackData, 16000, 32, reportEncodeProgress);
        }

        // Smart guard: if the compressed MP3 ended up larger than an already-audio original, keep the smaller one
        const isOriginalAudio =
            file.type.startsWith('audio/') || /\.(mp3|m4a|aac|ogg|oga|webm|opus)$/i.test(file.name);
        if (isOriginalAudio && encodedBlob.size >= file.size) {
            onProgress?.(
                100,
                isRtl ? 'الملف الأصلي أصغر حجماً بالفعل — سيتم رفعه كما هو.' : 'Original file is already smaller — keeping original.'
            );
            return {
                file,
                durationSeconds: finalDuration,
                originalName: file.name,
                sizeBytes: file.size,
                isExtracted: false,
                modeUsed: 'local',
            };
        }

        const outputFilename = file.name.replace(/\.[^/.]+$/, '') + '.' + outputExt;

        onProgress?.(100, isRtl ? 'اكتمل ضغط الصوت بنجاح!' : 'Audio compression completed!');

        return {
            file: new File([encodedBlob], outputFilename, { type: mimeType }),
            durationSeconds: finalDuration,
            originalName: file.name,
            sizeBytes: encodedBlob.size,
            isExtracted: true,
            modeUsed: 'local',
        };
    } catch (err) {
        console.warn('In-browser extraction fallback to raw file:', err);
        return {
            file,
            durationSeconds,
            originalName: file.name,
            sizeBytes: file.size,
            isExtracted: false,
            modeUsed: 'local',
        };
    }
}

/**
 * Upload FormData using XMLHttpRequest to provide smooth, real-time upload progress (0-100%).
 */
export function uploadFormDataWithProgress<T = any>(
    url: string,
    formData: FormData,
    headers: Record<string, string>,
    onProgress?: (info: UploadProgressInfo) => void
): Promise<{ ok: boolean; status: number; data: T }> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);

        Object.entries(headers).forEach(([key, value]) => {
            if (value) {
                xhr.setRequestHeader(key, value);
            }
        });

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && event.total > 0) {
                const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
                onProgress?.({
                    loadedBytes: event.loaded,
                    totalBytes: event.total,
                    percent,
                });
            }
        };

        xhr.onload = () => {
            let parsed: any = {};
            try {
                parsed = JSON.parse(xhr.responseText || '{}');
            } catch {
                parsed = {
                    success: false,
                    message:
                        xhr.status === 413
                            ? 'حجم الملف أكبر من الحد المسموح للرفع المباشر على الخادم. يرجى اختيار خيار "الضغط على جهازك" لتقليص الحجم قبل الرفع.'
                            : `HTTP ${xhr.status}`,
                };
            }

            resolve({
                ok: xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                data: parsed as T,
            });
        };

        xhr.onerror = () => {
            reject(new Error('تعذر الاتصال بالخادم أثناء الرفع. يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً.'));
        };

        xhr.ontimeout = () => {
            reject(new Error('انتهت مهلة رفع الملف. جرب تفعيل خيار "على جهازك" لتقليص الحجم وتسريع الرفع.'));
        };

        xhr.send(formData);
    });
}
