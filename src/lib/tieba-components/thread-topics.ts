import { currentPageType } from "@/lib/api/remixed";
import { domrd } from "@/lib/elemental";
import { threadCommentsObserver } from "@/lib/observers";

const CHECKED_ATTR = "data-tbr-topics";
const CONTENT_SELECTOR = ".d_post_content, .lzl_cnt .lzl_content_main";
const TOPIC_PATH = "/hottopic/browse/hottopic";
const MAX_NAME_LENGTH = 32;
const NAME_PATTERN = new RegExp(`^[\\p{L}\\p{N}\\p{M}_]{1,${MAX_NAME_LENGTH}}`, "u");
let installed = false;

export interface TopicSegment {
    text: string;
    // 服务端已识别的话题名；纯文本片段为空
    topic?: string;
}

interface TopicSpan {
    end: number;
    name: string;
}

export function installThreadTopics(): void {
    if (installed || currentPageType() !== "thread") return;
    installed = true;
    threadCommentsObserver.addEvent(renderThreadTopics);
}

// 服务端只识别成对的「#话题#」，连写的「#A#B#C」只会识别出间隔的话题，其余留作文本，这里按文本重新切分
export function renderThreadTopics(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>(`:is(${CONTENT_SELECTOR}):not([${CHECKED_ATTR}])`).forEach(content => {
        content.setAttribute(CHECKED_ATTR, "");
        if (content.textContent?.includes("#")) collectRuns(content).forEach(rewriteRun);
    });
}

// 「#话题#」与「#话题」两种写法：名称须以 #、空白或片段末尾结束；
// 名称后的 # 若紧跟另一个合法名称，则同时作为下一个话题的开头
export function tokenizeTopics(segments: readonly TopicSegment[]): TopicSegment[] {
    let text = "";
    const spans = new Map<number, TopicSpan>();
    segments.forEach(segment => {
        if (segment.topic) spans.set(text.length, { end: text.length + segment.text.length, name: segment.topic });
        text += segment.text;
    });

    const tokens: TopicSegment[] = [];
    let plainStart = 0;
    let chained = false;
    let i = 0;
    while (i < text.length) {
        const span: TopicSpan | undefined = chained ? undefined : spans.get(i);
        let name: string | undefined;
        let closer: number | undefined;
        if (span) {
            name = span.name;
            closer = span.end - i > 1 && text[span.end - 1] === "#" ? span.end - 1 : undefined;
        } else if (text[i] === "#" && (chained || !/[A-Za-z0-9]/.test(text[i - 1] ?? ""))) {
            name = readName(text, i + 1);
            const end = i + 1 + (name?.length ?? 0);
            // 后方的服务端话题保持原样，不把其开头的 # 当作闭合符
            closer = text[end] === "#" && !spans.has(end) ? end : undefined;
        }
        if (!name) {
            chained = false;
            i++;
            continue;
        }

        chained = closer !== undefined && readName(text, closer + 1) !== undefined;
        const end = closer === undefined ? span?.end ?? i + 1 + name.length : chained ? closer : closer + 1;
        if (plainStart < i) tokens.push({ text: text.slice(plainStart, i) });
        tokens.push({ text: text.slice(i, end), topic: name });
        i = plainStart = end;
    }
    if (plainStart < text.length) tokens.push({ text: text.slice(plainStart) });
    return tokens;
}

function readName(text: string, start: number): string | undefined {
    const name = NAME_PATTERN.exec(text.slice(start))?.[0];
    if (!name || /^\d+$/.test(name)) return undefined;
    const next = text[start + name.length];
    return next === undefined || next === "#" || /\s/.test(next) ? name : undefined;
}

type RunNode = Text | HTMLAnchorElement;

// 连续的文本节点与话题链接构成一段；表情、换行、@ 等元素会截断话题
function collectRuns(content: HTMLElement): RunNode[][] {
    const runs: RunNode[][] = [];
    let run: RunNode[] = [];
    content.childNodes.forEach(node => {
        if (node instanceof Text || isTopicLink(node)) {
            run.push(node);
            return;
        }
        if (run.length > 0) runs.push(run);
        run = [];
    });
    if (run.length > 0) runs.push(run);
    return runs.filter(nodes => nodes.some(node => node.textContent?.includes("#")));
}

function isTopicLink(node: Node): node is HTMLAnchorElement {
    return node instanceof HTMLAnchorElement
        && (node.getAttribute("href") ?? "").includes(TOPIC_PATH)
        && node.children.length === 0;
}

function rewriteRun(nodes: RunNode[]): void {
    // 服务端输出的嵌套 <a> 会被解析出一个空话题链接，切分后一并移除
    const segments = nodes.filter(node => node.textContent).map(node => node instanceof Text
        ? { text: node.data }
        : { text: node.textContent ?? "", topic: readTopicName(node) });
    const tokens = tokenizeTopics(segments);
    if (nodes.length === segments.length && serialize(tokens) === serialize(segments)) return;

    const parts = tokens.map(token => token.topic
        ? domrd("a", { href: topicUrl(token.topic) }, token.text)
        : document.createTextNode(token.text));
    nodes[0].before(...parts);
    nodes.forEach(node => node.remove());
}

function readTopicName(link: HTMLAnchorElement): string {
    try {
        const name = new URL(link.href, location.href).searchParams.get("topic_name");
        if (name) return name;
    } catch {
        // 无法解析的链接退回到链接文字
    }
    return (link.textContent ?? "").replace(/^#|#$/g, "");
}

function topicUrl(name: string): string {
    return `https://tieba.baidu.com${TOPIC_PATH}?topic_id=0&topic_name=${encodeURIComponent(name)}&is_video_topic=0`;
}

function serialize(segments: readonly TopicSegment[]): string {
    return JSON.stringify(segments.map(segment => [segment.text, segment.topic ?? ""]));
}
