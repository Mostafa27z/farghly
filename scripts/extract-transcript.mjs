#!/usr/bin/env node

import {
  YoutubeTranscript,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptVideoUnavailableError,
  YoutubeTranscriptTooManyRequestError,
} from 'youtube-transcript';

/**
 * Extract YouTube Video ID from any standard YouTube URL or ID string
 */
export function extractVideoId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();

  // If already 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common YouTube URL formats
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    /youtube\.com\/live\/([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Format raw transcript segments and compute metadata
 */
function processTranscript(videoId, rawSegments) {
  let fullTextParts = [];
  let maxEndTime = 0;
  let detectedLang = 'ar';

  const segments = rawSegments.map((item, index) => {
    // Clean up text
    const cleanText = (item.text || '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n+/g, ' ')
      .trim();

    if (item.lang) {
      detectedLang = item.lang;
    }

    const offsetSec = Math.round((item.offset || 0) / 1000 * 100) / 100;
    const durationSec = Math.round((item.duration || 0) / 1000 * 100) / 100;
    const endSec = offsetSec + durationSec;

    if (endSec > maxEndTime) {
      maxEndTime = endSec;
    }

    fullTextParts.push(cleanText);

    return {
      index: index + 1,
      text: cleanText,
      offset_seconds: offsetSec,
      duration_seconds: durationSec,
      end_seconds: endSec,
      timestamp_formatted: formatTimestamp(offsetSec),
    };
  });

  return {
    success: true,
    video_id: videoId,
    language: detectedLang,
    segment_count: segments.length,
    duration_seconds: Math.round(maxEndTime),
    duration_formatted: formatTimestamp(maxEndTime),
    full_text: fullTextParts.join(' '),
    segments,
  };
}

function formatTimestamp(seconds) {
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.log(JSON.stringify({
      success: false,
      code: 'MISSING_INPUT',
      message_ar: 'يرجى تزويد رابط يوتيوب صحيح أو معرف الفيديو.',
      message_en: 'Please provide a valid YouTube URL or Video ID.',
    }));
    process.exit(0);
  }

  const videoId = extractVideoId(input);
  if (!videoId) {
    console.log(JSON.stringify({
      success: false,
      code: 'INVALID_URL',
      message_ar: 'الرابط المدخل غير صالح. يرجى التأكد من رابط الفيديو.',
      message_en: 'Invalid YouTube URL provided.',
    }));
    process.exit(0);
  }

  try {
    const rawSegments = await YoutubeTranscript.fetchTranscript(videoId);

    if (!rawSegments || rawSegments.length === 0) {
      console.log(JSON.stringify({
        success: false,
        code: 'EMPTY_TRANSCRIPT',
        message_ar: 'لم يتم العثور على أي نصوص أو ترجمات داخل هذا الفيديو.',
        message_en: 'No transcript text found for this video.',
      }));
      process.exit(0);
    }

    const result = processTranscript(videoId, rawSegments);
    console.log(JSON.stringify(result));
    process.exit(0);
  } catch (error) {
    let code = 'UNKNOWN_ERROR';
    let message_ar = 'حدث خطأ غير متوقع أثناء استخراج النص من يوتيوب.';
    let message_en = error.message || 'An unexpected error occurred while fetching transcript.';

    if (error instanceof YoutubeTranscriptDisabledError) {
      code = 'TRANSCRIPTS_DISABLED';
      message_ar = 'عذراً، قام صاحب الفيديو بتعطيل خاصية الترجمة والتفريغ النصي لهذا الفيديو.';
      message_en = 'Transcripts are disabled on this video by the creator.';
    } else if (error instanceof YoutubeTranscriptNotAvailableError) {
      code = 'NOT_AVAILABLE';
      message_ar = 'عذراً، لا تتوفر ترجمة أو تفريغ نصي لهذا الفيديو على يوتيوب.';
      message_en = 'No transcript available for this video on YouTube.';
    } else if (error instanceof YoutubeTranscriptVideoUnavailableError) {
      code = 'VIDEO_UNAVAILABLE';
      message_ar = 'عذراً، هذا الفيديو غير متاح، محذوف، أو خاص.';
      message_en = 'This video is unavailable, private, or deleted.';
    } else if (error instanceof YoutubeTranscriptTooManyRequestError) {
      code = 'TOO_MANY_REQUESTS';
      message_ar = 'عذراً، خوادم يوتيوب مشغولة مؤقتاً بالطلبات، يرجى إعادة المحاولة بعد دقيقة.';
      message_en = 'YouTube is temporarily rate-limiting requests. Please try again shortly.';
    }

    console.log(JSON.stringify({
      success: false,
      code,
      message_ar,
      message_en,
      raw_error: error.message,
    }));
    process.exit(0);
  }
}

main();
