import { fetchSubPostImagePage, type SubPostImage } from "@/lib/api/tieba";
import { currentPageType } from "@/lib/api/remixed";
import { imagesViewer } from "@/components/images-viewer/viewer";
import { dom, domrd } from "@/lib/elemental";
import { threadCommentsObserver } from "@/lib/observers";
import "./sub-post-images.css";

const IMAGE_MARKER = "[图片]";
const CHECKED_ATTR = "data-tbr-sub-post-images-checked";
const pending = new Set<number>();
let installed = false;

interface ImageReply {
    post: HTMLElement;
    id: number;
    content: HTMLElement;
}

export function installSubPostImages(): void {
    if (installed || currentPageType() !== "thread") return;
    installed = true;
    threadCommentsObserver.addEvent(renderSubPostImages);
}

export function renderSubPostImages(): void {
    const groups = new Map<number, ImageReply[]>();
    dom<"li">(`.lzl_single_post:not([${CHECKED_ATTR}])`, []).forEach(post => {
        const content = dom<"span">(".lzl_content_main", post);
        if (!content?.textContent?.includes(IMAGE_MARKER)) return;
        const field = post.getAttribute("data-field") ?? "";
        // AJAX 翻页得到的楼中楼 data-field 是 JSON 且不含 pid，需从所在楼层读取
        const parentId = readFieldId(field, "pid")
            ?? readFieldId(post.closest(".l_post")?.getAttribute("data-field") ?? "", "post_id");
        const id = readFieldId(field, "spid");
        if (!parentId || !id) return;
        const replies = groups.get(parentId) ?? [];
        replies.push({ post, id, content });
        groups.set(parentId, replies);
    });

    const threadId = Number(PageData.thread.thread_id);
    if (!Number.isSafeInteger(threadId) || threadId <= 0) return;
    groups.forEach((replies, parentId) => {
        if (pending.has(parentId)) return;
        pending.add(parentId);
        void loadImages(threadId, parentId, replies).then(success => {
            pending.delete(parentId);
            if (success) renderSubPostImages();
        });
    });
}

async function loadImages(threadId: number, parentId: number, replies: ImageReply[]): Promise<boolean> {
    try {
        const remaining = new Set(replies.map(reply => reply.id));
        const imagesById = new Map<number, SubPostImage[]>();
        for (let page = 1; page <= 20 && remaining.size > 0; page++) {
            const result = await fetchSubPostImagePage(threadId, parentId, page);
            result.imagesById.forEach((images, id) => {
                if (!remaining.has(id)) return;
                imagesById.set(id, images);
                remaining.delete(id);
            });
            if (!result.hasMore) break;
        }
        replies.forEach(({ post, id, content }) => {
            if (!post.isConnected) return;
            post.setAttribute(CHECKED_ATTR, "");
            const images = imagesById.get(id);
            if (images?.length) insertImages(content, images);
        });
        return true;
    } catch (error) {
        console.warn("[Tieba-Remix] 获取楼中楼图片失败:", error);
        return false;
    }
}

function readFieldId(field: string, name: string): number | undefined {
    const match = field.match(new RegExp(`["']${name}["']\\s*:\\s*["']?(\\d+)`));
    const id = Number(match?.[1]);
    return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

function insertImages(content: HTMLElement, images: SubPostImage[]): void {
    const nodes: Text[] = [];
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        if (node.data.includes(IMAGE_MARKER)) nodes.push(node);
    }

    let imageIndex = 0;
    nodes.forEach(node => {
        const parts = node.data.split(IMAGE_MARKER);
        const fragment = document.createDocumentFragment();
        fragment.append(parts[0]);
        for (let i = 1; i < parts.length; i++) {
            fragment.append(imageIndex < images.length
                ? createImageLink(images, imageIndex++)
                : IMAGE_MARKER);
            fragment.append(parts[i]);
        }
        node.replaceWith(fragment);
    });
    while (imageIndex < images.length) content.append(createImageLink(images, imageIndex++));
}

function createImageLink(images: SubPostImage[], index: number): HTMLAnchorElement {
    const image = images[index];
    const preview = domrd("img", {
        src: image.thumbnail,
        alt: "楼中楼图片",
        loading: "lazy",
        decoding: "async",
    });
    const link = domrd("a", {
        class: "tbr-sub-post-image",
        href: image.original,
        target: "_blank",
        rel: "noopener noreferrer",
        title: "查看图片",
    }, [preview]);
    link.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        void imagesViewer({ content: images, defaultIndex: index });
    });
    return link;
}
