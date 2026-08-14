export const FORUM_VIDEO_MAX_WIDTH = 240;
export const FORUM_VIDEO_MAX_HEIGHT = 180;

export interface ForumVideoPreviewSize {
    width: number
    height: number
}

export function constrainForumVideoPreviewSize(width: number, height: number): ForumVideoPreviewSize | undefined {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;

    const scale = Math.min(1, FORUM_VIDEO_MAX_WIDTH / width, FORUM_VIDEO_MAX_HEIGHT / height);
    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
}
