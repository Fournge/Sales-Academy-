/**
 * Helper to process, validate, and convert various video URLs
 * Specially tailored for Google Drive share links, YouTube, Loom, Vimeo, and direct MP4/WebM.
 */

export interface FormattedVideo {
  embedUrl: string;
  originalUrl: string;
  type: 'drive' | 'youtube' | 'loom' | 'vimeo' | 'direct' | 'unsupported';
  isGoogleDrive: boolean;
  driveFileId?: string;
  isValid: boolean;
  helperMessage?: string;
}

export function formatVideoUrl(rawUrl: string): FormattedVideo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      embedUrl: '',
      originalUrl: '',
      type: 'unsupported',
      isGoogleDrive: false,
      isValid: false,
      helperMessage: 'No video URL provided.',
    };
  }

  const trimmed = rawUrl.trim();

  // 1. Google Drive URLs
  // Patterns:
  // https://drive.google.com/file/d/1A2B3C4D5E6F/view?usp=sharing
  // https://drive.google.com/file/d/1A2B3C4D5E6F/view
  // https://drive.google.com/file/d/1A2B3C4D5E6F/preview
  // https://drive.google.com/open?id=1A2B3C4D5E6F
  // https://drive.google.com/uc?id=1A2B3C4D5E6F
  // https://docs.google.com/file/d/1A2B3C4D5E6F/edit
  const driveFileRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const driveMatch = trimmed.match(driveFileRegex);

  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      originalUrl: trimmed,
      type: 'drive',
      isGoogleDrive: true,
      driveFileId: fileId,
      isValid: true,
      helperMessage: "Google Drive link converted to embed preview. File sharing must be set to 'Anyone with the link can view'.",
    };
  }

  // 2. YouTube URLs (Regular, Shorts, Embeds, youtu.be)
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`,
      originalUrl: trimmed,
      type: 'youtube',
      isGoogleDrive: false,
      isValid: true,
      helperMessage: 'Streaming via YouTube Player Engine.',
    };
  }

  // 3. Loom URLs
  const loomMatch = trimmed.match(/loom\.com\/share\/([a-zA-Z0-9_-]+)/);
  if (loomMatch && loomMatch[1]) {
    return {
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}?autoplay=1`,
      originalUrl: trimmed,
      type: 'loom',
      isGoogleDrive: false,
      isValid: true,
      helperMessage: 'Streaming via Loom Player.',
    };
  }

  // 4. Vimeo URLs
  const vimeoMatch = trimmed.match(/vimeo\.com\/([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      originalUrl: trimmed,
      type: 'vimeo',
      isGoogleDrive: false,
      isValid: true,
      helperMessage: 'Streaming via Vimeo Player.',
    };
  }

  // 5. Direct Video file formats (.mp4, .webm, .ogg)
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(trimmed)) {
    return {
      embedUrl: trimmed,
      originalUrl: trimmed,
      type: 'direct',
      isGoogleDrive: false,
      isValid: true,
      helperMessage: 'Streaming via Direct HTML5 HD Video Player.',
    };
  }

  // If already an iframe embed or standard https URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      embedUrl: trimmed,
      originalUrl: trimmed,
      type: 'direct',
      isGoogleDrive: false,
      isValid: true,
      helperMessage: 'Streaming via web frame.',
    };
  }

  return {
    embedUrl: trimmed,
    originalUrl: trimmed,
    type: 'unsupported',
    isGoogleDrive: false,
    isValid: false,
    helperMessage: 'Please enter a valid Google Drive share link, YouTube link, or direct video URL.',
  };
}
