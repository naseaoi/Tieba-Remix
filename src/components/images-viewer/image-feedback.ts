import { toast } from "user-view";

export type ImageViewerFailureReason = "fetch" | "empty" | "resource" | "viewer";

const failureMessages: Record<ImageViewerFailureReason, string> = {
    fetch: "图片信息加载失败，无法打开看图模式，请稍后重试",
    empty: "没有获取到可用图片，图片可能已失效",
    resource: "图片资源加载失败，可能已失效或网络异常",
    viewer: "看图模式打开失败，请刷新页面后重试",
};

let lastReason: ImageViewerFailureReason | undefined;
let lastNotifyTime = 0;

export function notifyImageViewerFailure(reason: ImageViewerFailureReason): void {
    const now = Date.now();
    if (lastReason === reason && now - lastNotifyTime < 1500) return;

    lastReason = reason;
    lastNotifyTime = now;
    toast({
        message: failureMessages[reason],
        type: "warning",
        duration: 5000,
    });
}
