import { Mp3Encoder } from '@breezystack/lamejs';

interface EncodeRequest {
    channelData: Float32Array;
    sampleRate: number;
    kbps: number;
}

const ctx = self as unknown as {
    postMessage: (message: any, transfer?: Transferable[]) => void;
    addEventListener: (type: 'message', listener: (e: MessageEvent<EncodeRequest>) => void) => void;
};

ctx.addEventListener('message', (event: MessageEvent<EncodeRequest>) => {
    try {
        const { channelData, sampleRate = 16000, kbps = 32 } = event.data;
        const mp3Encoder = new Mp3Encoder(1, sampleRate, kbps);

        const totalSamples = channelData.length;
        const sampleBlockSize = 1152;
        const chunkInt16 = new Int16Array(sampleBlockSize);
        const mp3Chunks: ArrayBuffer[] = [];

        let lastReportedPercent = -1;

        // Convert & encode in streaming blocks to avoid allocating a second giant Int16Array in RAM
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
                // Copy slice into its own transferable ArrayBuffer
                const copy = new Uint8Array(mp3buf.length);
                copy.set(mp3buf);
                mp3Chunks.push(copy.buffer);
            }

            const percent = Math.floor((end / totalSamples) * 100);
            if (percent >= lastReportedPercent + 5 || end === totalSamples) {
                lastReportedPercent = percent;
                ctx.postMessage({ type: 'progress', percent });
            }
        }

        const endBuf = mp3Encoder.flush();
        if (endBuf.length > 0) {
            const copy = new Uint8Array(endBuf.length);
            copy.set(endBuf);
            mp3Chunks.push(copy.buffer);
        }

        ctx.postMessage({ type: 'done', chunks: mp3Chunks }, mp3Chunks);
    } catch (err: any) {
        ctx.postMessage({ type: 'error', message: err?.message || 'MP3 encoding failed in worker.' });
    }
});
