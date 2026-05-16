import { renderDialog } from "@/lib/render";
import ImagesViewer, { ImagesViewerOpts } from "./images-viewer.vue";

export default ImagesViewer;
export * from "./images-viewer.vue";
export { openThreadImages } from "./open-thread-images";

export function imagesViewer(opts: ImagesViewerOpts) {
    // 进入看图模式时把 body 钉成 fixed，并整体上移 scrollY，
    // 这样背景视觉位置不会跳到顶部；退出时还原样式并 scrollTo 回原位
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

    renderDialog(<ImagesViewer {...opts} />, undefined, {
        unloaded: restore,
        abnormalUnload: restore,
    });
}
