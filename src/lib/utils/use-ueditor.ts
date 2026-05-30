import { uploadTiebaImage, type UploadedImage } from "@/lib/api/upload-image";
import { asyncdom } from "@/lib/elemental";
import { toast } from "user-view";
import { onBeforeUnmount, ref, type Ref } from "vue";

export interface UEditorOptions {
    ueditor: Element;
    editable?: string;
    submit?: string;
    autoScroll?: boolean;
    pasteImage?: boolean;
}

interface UEditorInstance {
    execCommand(command: string, ...args: unknown[]): unknown;
}

function activeUEditor(): UEditorInstance | undefined {
    const ue = (window as unknown as { UE?: { getActiveEditor?(): UEditorInstance | null } }).UE;
    return ue?.getActiveEditor?.() ?? undefined;
}

function collectClipboardImages(data: DataTransfer | null): File[] {
    if (!data) return [];
    return Array.from(data.items)
        .filter(item => item.kind === "file" && item.type.startsWith("image/"))
        .map(item => item.getAsFile())
        .filter((file): file is File => file != null);
}

function buildImageHTML(image: UploadedImage): string {
    const size = image.width > 0 && image.height > 0
        ? ` width="${image.width}" height="${image.height}"`
        : "";
    return `<img class="BDE_Image" data-isupload="1" src="${image.displayUrl}"${size}>`;
}

async function uploadAndInsert(editor: UEditorInstance, file: File): Promise<void> {
    try {
        const image = await uploadTiebaImage(file, PageData.forum.id);
        editor.execCommand("inserthtml", buildImageHTML(image), true);
    } catch (error) {
        toast({ type: "error", message: `图片上传失败：${(error as Error).message}`, duration: 5000 });
    }
}

async function onEditorPaste(event: ClipboardEvent): Promise<void> {
    const images = collectClipboardImages(event.clipboardData);
    if (images.length === 0) return;

    const editor = activeUEditor();
    if (!editor) return;

    event.preventDefault();
    toast({
        type: "basic",
        message: images.length > 1 ? `正在上传 ${images.length} 张图片…` : "正在上传图片…",
        duration: 2000,
    });

    for (const file of images) {
        await uploadAndInsert(editor, file);
    }
}

export function useUEditor<T extends HTMLElement = HTMLElement>(
    slot: Ref<T | undefined>,
    options: UEditorOptions,
) {
    const {
        ueditor,
        editable = "#ueditor_replace",
        submit = ".j_submit",
        autoScroll = true,
        pasteImage = true,
    } = options;

    const originParent = ref<HTMLElement | null>(null);
    let scrollObserver: MutationObserver | undefined;
    let scrollTarget: HTMLElement | undefined;
    let pasteHost: HTMLElement | undefined;

    function scrollToBottom() {
        if (scrollTarget) scrollTarget.scrollTop = scrollTarget.scrollHeight;
    }

    async function enableAutoScroll() {
        if (!slot.value) return;
        scrollTarget = await asyncdom<"div">(".edui-body-container", slot.value);
        scrollObserver = new MutationObserver(scrollToBottom);
        scrollObserver.observe(scrollTarget, { childList: true, subtree: true, characterData: true });
        scrollTarget.addEventListener("input", scrollToBottom);
    }

    function enablePasteUpload() {
        if (!slot.value) return;
        pasteHost = slot.value;
        pasteHost.addEventListener("paste", onEditorPaste, true);
    }

    function disablePasteUpload() {
        pasteHost?.removeEventListener("paste", onEditorPaste, true);
        pasteHost = undefined;
    }

    async function adopt() {
        if (!slot.value) return;
        originParent.value = ueditor.parentElement;
        slot.value.appendChild(ueditor);
        if (autoScroll) await enableAutoScroll();
        if (pasteImage) enablePasteUpload();
    }

    function restore() {
        scrollObserver?.disconnect();
        scrollObserver = undefined;
        scrollTarget?.removeEventListener("input", scrollToBottom);
        scrollTarget = undefined;
        disablePasteUpload();
        if (originParent.value && slot.value?.contains(ueditor)) {
            originParent.value.appendChild(ueditor);
        }
        originParent.value = null;
    }

    async function focus() {
        if (!slot.value) return;
        (await asyncdom<"div">(editable, slot.value)).focus({ preventScroll: true });
    }

    function normalizeImagesForSubmit() {
        slot.value?.querySelectorAll<HTMLImageElement>("img.BDE_Image").forEach(img => {
            const src = img.getAttribute("src");
            if (src && src.includes("?")) img.setAttribute("src", src.split("?")[0]);
        });
    }

    async function submitPost() {
        normalizeImagesForSubmit();
        (await asyncdom<"a">(submit)).click();
    }

    onBeforeUnmount(restore);

    return { adopt, restore, focus, submit: submitPost };
}
