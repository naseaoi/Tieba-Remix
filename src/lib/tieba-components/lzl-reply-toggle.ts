const SUBPOST_REPLY_SELECTOR = ".lzl_content_reply .lzl_s_r";
const REPLY_KEY_DATA = "tbrLzlReplyKey";

let installed = false;
let closeEditorImpl = defaultCloseEditor;

export function installLzlReplyToggle(closeEditor?: (editor: HTMLElement) => void): void {
    if (closeEditor) closeEditorImpl = closeEditor;
    if (installed) return;
    installed = true;

    document.addEventListener("click", event => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const link = target.closest<HTMLElement>(SUBPOST_REPLY_SELECTOR);
        if (!link) {
            const entry = target.closest<HTMLElement>(".j_lzl_p");
            const floor = entry?.closest<HTMLElement>(".l_post");
            if (floor) {
                window.setTimeout(() => {
                    const editor = findOpenSubPostEditor(floor);
                    if (editor) delete editor.dataset[REPLY_KEY_DATA];
                }, 0);
            }
            return;
        }

        const floor = link.closest<HTMLElement>(".l_post");
        if (!floor) return;

        const replyKey = getSubPostReplyKey(link);
        const editor = findOpenSubPostEditor(floor);
        if (!editor || editor.dataset[REPLY_KEY_DATA] !== replyKey) {
            window.setTimeout(() => {
                const openedEditor = findOpenSubPostEditor(floor);
                if (openedEditor) openedEditor.dataset[REPLY_KEY_DATA] = replyKey;
            }, 0);
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        delete editor.dataset[REPLY_KEY_DATA];
        closeEditorImpl(editor);
    }, true);
}

function getSubPostReplyKey(link: HTMLElement): string {
    const post = link.closest<HTMLElement>(".lzl_single_post");
    const dataField = post?.getAttribute("data-field") ?? "";
    const subPostId = dataField.match(/["']spid["']\s*:\s*["']?(\d+)/)?.[1];
    if (subPostId) return subPostId;

    const posts = [...(post?.parentElement?.querySelectorAll<HTMLElement>(".lzl_single_post") ?? [])];
    const index = post ? posts.indexOf(post) : -1;
    return `${getFloorPostId(link)}:${index}`;
}

function getFloorPostId(element: HTMLElement): string {
    const dataField = element.closest<HTMLElement>(".l_post")?.getAttribute("data-field") ?? "";
    return dataField.match(/["']post_id["']\s*:\s*["']?(\d+)/)?.[1] ?? "";
}

function findOpenSubPostEditor(floor: HTMLElement): HTMLElement | undefined {
    return [...floor.querySelectorAll<HTMLElement>(".j_lzl_e_c")]
        .find(editor => isElementVisible(editor));
}

function isElementVisible(element: HTMLElement): boolean {
    const style = getComputedStyle(element);
    if (style.display === "none") return false;
    if (style.visibility === "hidden") return false;
    if (style.opacity === "0") return false;
    return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

function defaultCloseEditor(editor: HTMLElement): void {
    editor.style.display = "none";
    editor.style.height = "";
    editor.style.opacity = "";
    editor.style.boxSizing = "";
    editor.classList.remove("tbr-lzl-toggling");
}
