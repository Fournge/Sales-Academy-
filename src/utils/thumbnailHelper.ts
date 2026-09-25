/**
 * Helper to auto-extract thumbnail pictures from YouTube, Google Drive, or provide themed visual scenes
 */

export function extractThumbnailUrl(videoUrl?: string, posterUrl?: string): string | null {
  // 1. If explicit custom poster is set
  if (posterUrl && posterUrl.trim().length > 0) {
    return posterUrl.trim();
  }

  if (!videoUrl || !videoUrl.trim()) return null;
  const trimmed = videoUrl.trim();

  // 2. Extract YouTube Thumbnail
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  // 3. Extract Google Drive Thumbnail
  const driveMatch = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w640`;
  }

  return null;
}
