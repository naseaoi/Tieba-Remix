import { renderDialog } from "@/lib/render";
import type { ImagesViewerOpts } from "./images-viewer.vue";
import { notifyImageViewerFailure } from "./image-feedback";

let viewerComponentRequest: ReturnType<typeof loadViewerComponent> | undefined;

export function prepareImagesViewer(): void {
    void getViewerComponent().catch(() => undefined);
}

export async function imagesViewer(opts: ImagesViewerOpts): Promise<boolean> {
    if (!hasAvailableImage(opts.content)) {
        notifyImageViewerFailure("empty");
        return false;
    }

    // 进入看图模式时把 body 钉成 fixed，并整体上移 scrollY
    const savedX = window.scrollX;
    const savedY = window.scrollY;
    const body = document.body;
    const prev = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width,
    };
    body.style.position = "fixed";
    body.style.top = `-${savedY}px`;
    body.style.left = `-${savedX}px`;
    body.style.right = "0";
    body.style.width = "100%";

    const restore = () => {
        body.style.position = prev.position;
        body.style.top = prev.top;
        body.style.left = prev.left;
        body.style.right = prev.right;
        body.style.width = prev.width;
        window.scrollTo(savedX, savedY);
    };

    try {
        const { default: ImagesViewer } = await getViewerComponent();
        renderDialog(ImagesViewer, opts, {
            unloaded: restore,
            abnormalUnload: restore,
        });
        return true;
    } catch (error) {
        restore();
        console.warn("[Tieba-Remix] 打开看图模式失败:", error);
        notifyImageViewerFailure("viewer");
        return false;
    }
}

function loadViewerComponent() {
    return import("./images-viewer.vue");
}

function getViewerComponent(): ReturnType<typeof loadViewerComponent> {
    viewerComponentRequest ??= loadViewerComponent().catch(error => {
        viewerComponentRequest = undefined;
        throw error;
    });
    return viewerComponentRequest;
}

function hasAvailableImage(content: ImagesViewerOpts["content"]): boolean {
    if (typeof content === "string") return content.trim().length > 0;
    if (Array.isArray(content)) {
        return content.some(image => typeof image === "string"
            ? image.trim().length > 0
            : !!(image.original || image.thumbnail));
    }
    return content.images.some(image => !!(image.original || image.thumb));
}
