import { imagesViewer, notifyImageViewerFailure, prepareImagesViewer } from "@/components/images-viewer";
import {
    ArrowLeftRight,
    Check,
    Heart,
    Menu,
    MessageSquare,
    MessageSquareWarning,
    Plus,
    UserRound,
} from "@lucide/vue";
import Pager from "@/components/pager.vue";
import ThreadEditor from "@/components/thread-editor.vue";
import TogglePanel, { TogglePanelProps } from "@/components/toggle-panel.vue";
import { currentPageType } from "@/lib/api/remixed";
import { getAllThreadImages, levelToClass, tiebaAPI } from "@/lib/api/tieba";
import { asyncdom, dom, domrd, findParent } from "@/lib/elemental";
import { CSSRule, overwriteCSS, parseCSSRule } from "@/lib/elemental/styles";
import { THREAD_LAYOUT_STATUS_ATTR, THREAD_LAYOUT_STATUS_READY } from "@/lib/legacy-redirect";
import { addCoalescedObserverEvent, threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
import { RenderedComponent, renderDialog } from "@/lib/render";
import { appendJSX, insertJSX } from "@/lib/render/jsx-extension";
import { floatBar, setFloatButtonTooltip } from "@/lib/tieba-components/float-bar";
import { pager } from "@/lib/tieba-components/pager";
import { installThreadFavoriteTagPopup } from "@/lib/tieba-components/thread-favorite-tag-popup";
import { compactLayout, navBarHideMode, pageExtension, threadImageQueueScope } from "@/lib/user-values";
import { waitUntil } from "@/lib/utils";
import { requestUEditorInit, resolveReadyUEditor, waitForReadyUEditor } from "@/lib/utils/use-ueditor";
import _ from "@/lib/utils/_";
import { UserButton, toast } from "user-view";
import { VNode } from "vue";
import { setupCommentEmotionPanel } from "./comment-emotion-panel";
import { setupCommentToggleAnimation } from "./comment-toggle";
import commentsStyle from "./comments.scss?inline";
import compactStyle from "./compact.scss?inline";
import { threadParser } from "./parser";
import threadStyle from "./thread.scss?inline";

const THREAD_IMAGE_BOUND = "data-tbr-thread-image-bound";

export default async function () {
    if (!pageExtension.get().thread) return;
    if (currentPageType() !== "thread") return;
    if (isThreadUnavailablePage()) {
        markThreadLayoutReady();
        return;
    }

    installThreadFavoriteTagPopup();

    overwriteCSS(
        threadStyle,
        compactStyle,
        commentsStyle,
    );

    setupCommentToggleAnimation();

    await waitUntil(() => !(document.body == null)).then(function () {
        // document.body.insertBefore(mainWrapper, document.body.firstChild);
        if (compactLayout.get()) {
            document.body.toggleAttribute("compact-layout");
        }
    });

    // 滚动隐藏模式：与 nav-bar 协同，首次向下滚动后永久收紧顶部空白（不再恢复）
    (function setupScrollCollapse() {
        let collapsed = false;
        let lastScrollY = 0;
        let userScrollIntent = false;
        const markUserScrollIntent = () => {
            userScrollIntent = true;
        };
        const markKeyboardScrollIntent = (event: KeyboardEvent) => {
            if (["ArrowDown", "PageDown", "End", " "].includes(event.key)) userScrollIntent = true;
        };
        window.addEventListener("wheel", markUserScrollIntent, { passive: true });
        window.addEventListener("touchstart", markUserScrollIntent, { passive: true });
        window.addEventListener("keydown", markKeyboardScrollIntent);
        const handle = _.throttle(function () {
            if (collapsed) return;
            if (navBarHideMode.get() !== "fold") return;
            const scrollY = window.scrollY;
            if (!userScrollIntent) {
                lastScrollY = scrollY;
                return;
            }
            if (scrollY > lastScrollY && scrollY > 8) {
                document.documentElement.toggleAttribute("thread-top-collapsed", true);
                collapsed = true;
            }
            lastScrollY = scrollY;
        }, 100);
        window.addEventListener("scroll", handle, { passive: true });

        navBarHideMode.on("setter", (mode) => {
            if (mode !== "fold") {
                document.documentElement.removeAttribute("thread-top-collapsed");
                collapsed = false;
                lastScrollY = window.scrollY;
            }
        });
    })();

    waitUntil(() => !(floatBar.get() == null)).then(function () {
        let settingsPanel: RenderedComponent | undefined;
        const settingsButton = floatBar.add("other", function () {
            if (settingsPanel) {
                (settingsPanel.instance as { unload?: () => void }).unload?.();
                return;
            }

            const rect = settingsButton.el.getBoundingClientRect();
            settingsButton.el.classList.add("is-open");
            settingsPanel = renderDialog<TogglePanelProps>(TogglePanel, {
                toggles: [
                    {
                        icon: Heart,
                        name: "收藏",
                        defaultValue: (function () {
                            return dom<"a">(".j_favor, #j_favthread .p_favthr_main")?.innerText === "收藏" ? false : true;
                        })(),
                        event() {
                            dom<"a">(".j_favor, #j_favthread .p_favthr_main")?.click();
                        },
                    },
                    {
                        icon: UserRound,
                        name: "只看楼主",
                        defaultValue: (function () {
                            return dom<"a">("#lzonly_cntn")?.innerText === "只看楼主" ? false : true;
                        })(),
                        event() {
                            dom<"a">("#lzonly_cntn")?.click();
                        },
                    },
                    {
                        icon: ArrowLeftRight,
                        name: "紧凑布局",
                        defaultValue: (() => compactLayout.get())(),
                        event() {
                            document.body.toggleAttribute("compact-layout");
                            compactLayout.set(!compactLayout.get());
                        },
                    },
                    {
                        icon: MessageSquareWarning,
                        name: "反馈",
                        momentary: true,
                        event() {
                            dom<"a">(".tbui_fbar_feedback a")?.click();
                        },
                    },
                ],
                anchorRect: {
                    top: rect.top,
                    bottom: rect.bottom,
                    left: rect.left,
                    right: rect.right,
                    width: rect.width,
                    height: rect.height,
                },
            }, {
                unloaded() {
                    settingsPanel = undefined;
                    settingsButton.el.classList.remove("is-open");
                },
                abnormalUnload() {
                    settingsPanel = undefined;
                    settingsButton.el.classList.remove("is-open");
                },
            });
        }, "module-settings", Menu);
        setFloatButtonTooltip(settingsButton.el, "更多");

        document.body.insertBefore(domrd("div", {
            class: "vue-module-control",
            style: "display: none;",
        }), document.body.firstChild);
    });

    const content = await asyncdom<"div">(".content", undefined, 10_000);
    const pbContent = await asyncdom<"div">("#pb_content", undefined, 10_000);
    if (!content || !pbContent) {
        markThreadLayoutReady();
        return;
    }
    const contentRoot = content;
    const pbContentRoot = pbContent;

    await createContents();

    async function createContents() {
        const maybeThreadList = await asyncdom<"div">("#j_p_postlist", undefined, 10_000);
        if (!maybeThreadList) {
            markThreadLayoutReady();
            return;
        }
        const threadList = maybeThreadList;

        let thread = threadParser();
        if (thread.cotents.length === 0) {
            markThreadLayoutReady();
            return;
        }
        if (!thread.forum.components.iconContainer?.children[0]) {
            markThreadLayoutReady();
            return;
        }

        const forumIconLink = (thread.forum.components.iconContainer.children[0] as HTMLImageElement).src;  // 分辨率比从 PageData 中获取到的更高

        insertJSX(<div id="title-wrapper">
            <h3 class="thread-title">{
                _.unescape(PageData.thread.title.split("回复：").pop() ?? "")
                    .replace(/&#039;/g, "'")
                    .replace(/&quot;/g, '"')
            }</h3>

            <div class="forum-wrapper-button">
                <a class="forum-icon-link" href={tiebaAPI.URL_forum(PageData.forum.forum_name)} title={`进入${PageData.forum.forum_name}吧`}>
                    <img class="forum-icon" src={forumIconLink} alt="吧头像" />
                </a>
                <div class="button-container">
                    <UserButton
                        class="forum-button add-forum-button"
                        noBorder
                        onClick={() => dom<"button">("#j_head_focus_btn")?.click()}>
                        {PageData.user.is_like ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
                    </UserButton>
                </div>
            </div>
        </div>, contentRoot, pbContentRoot);

        applyAuthorContainers(thread);
        threadList.classList.add("content-wrapper");

        // 绑定事件
        dom<"button">(".sign-in-button")?.addEventListener("click", function () {
            dom<"button">(".j_signbtn")?.click();
        });

        // 楼层举报按钮相关
        // 楼层举报按钮的文本只在刷新帖子时才会出现，翻页时不会出现
        // 缺少文本时手动插入
        // 由于一些动态加载行为，在 DOMContentLoaded 后判断举报按钮中的文字节点是否存在更为妥当
        document.addEventListener("DOMContentLoaded", function () {
            threadFloorsObserver.addEvent(function () {
                (dom<"a">(".j_jb_ele a", [])).forEach(el => {
                    if (el.lastChild?.nodeType !== Node.TEXT_NODE) {
                        el.appendChild(new Text("举报"));
                    }
                });
            });

            // 帖子主楼层显示分隔符，但无人回帖时不显示
            if (PageData.pager.cur_page === 1 && PageData.thread.reply_num > 1) {
                const firstFloor = dom<"div">(".l_post", threadList);
                if (firstFloor) firstFloor.style.borderBottom = "2px solid var(--tieba-theme-fore) !important";
            }
        }, { once: true });

        addCoalescedObserverEvent(function () {
            if (dom(".d_author", threadList, []).length === 0) return;

            thread = threadParser();
            applyAuthorContainers(thread);
        }, threadFloorsObserver);

        function applyAuthorContainers(sourceThread: ReturnType<typeof threadParser>) {
            sourceThread.cotents.forEach((c, i) => {
                const postRoot = c.post.closest(".l_post");
                if (!postRoot?.querySelector(".d_author")) return;

                const floor = postRoot.querySelector<HTMLDivElement>(".d_post_content_main");
                if (!floor) return;
                if (floor.querySelector(".author-container")) return;

                const authorContainer = createAuthorContainer(sourceThread, i);
                floor.insertBefore(authorContainer, floor.firstChild);
            });

            (dom(".d_author", threadList, [])).forEach(el => el.remove());
        }

        function createAuthorContainer(sourceThread: ReturnType<typeof threadParser>, index: number) {
            const authorContainer = domrd("div", {
                class: "author-container",
            });

            sourceThread.cotents[index].profile.nameAnchor.classList.add("anchor");

            authorContainer.appendChild(sourceThread.cotents[index].profile.avatar);
            authorContainer.appendChild(sourceThread.cotents[index].profile.nameAnchor);

            const badgeContainer = appendJSX<HTMLDivElement>(<div class="badge-container"></div>, authorContainer);

            const profileLevel = sourceThread.cotents[index].profile.level;
            const badgeTitle = sourceThread.cotents[index].profile.badgeTitle;
            const hasLevel = Number.isFinite(profileLevel) && profileLevel > 0;
            appendJSX(
                <div class={hasLevel ? `floor-badge level-${levelToClass(profileLevel)}` : "floor-badge"}>
                    <div class="badge-level">{hasLevel ? profileLevel : ""}</div>
                    <div class="badge-title">{badgeTitle}</div>
                </div>, badgeContainer.root);

            if (sourceThread.cotents[index].isLouzhu)
                appendJSX(<div class="floor-badge floor-owner-badge"><span>楼主</span></div>, badgeContainer.root);

            return authorContainer;
        }

        // 头像 lazy load
        const avatarObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const avatar = entry.target.children[0] as HTMLImageElement;
                    const lazyLink = avatar.getAttribute("data-tb-lazyload");

                    if (avatar.src !== lazyLink) {
                        if (lazyLink)
                            avatar.src = lazyLink;
                        else
                            observer.unobserve(entry.target);
                    } else {
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            root: null,
            rootMargin: "0px",
            threshold: 0.5,
        });

        thread.cotents.forEach(content => {
            avatarObserver.observe(content.profile.avatar);
        });

        let threadImagesReady = Promise.resolve();
        const processThreadImages = async () => {
            if (!PageData.thread.thread_id) {
                await waitUntil(() => !!PageData.thread.thread_id, 2_000).catch(() => undefined);
            }
            if (!PageData.thread.thread_id) return;

            (dom<"img">(`.BDE_Image:not([${THREAD_IMAGE_BOUND}])`, threadList, [])).forEach(el => {
                const newEl = el.cloneNode(false) as HTMLImageElement;
                newEl.setAttribute(THREAD_IMAGE_BOUND, "");
                const postContent = findParent(el, "d_post_content");

                let ancestor: HTMLElement | null = el.parentElement;
                while (ancestor && ancestor !== postContent) {
                    if (ancestor instanceof HTMLAnchorElement) {
                        ancestor.removeAttribute("href");
                        ancestor.removeAttribute("target");
                        ancestor.style.cursor = "pointer";
                    }
                    ancestor = ancestor.parentElement;
                }

                newEl.dataset.pid = postContent?.id?.split("_").pop();
                const stop = (e: Event) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                };
                newEl.addEventListener("pointerenter", () => prepareImagesViewer(), { once: true });
                newEl.addEventListener("pointerdown", () => prepareImagesViewer(), { once: true });
                newEl.addEventListener("mousedown", stop, true);
                newEl.addEventListener("auxclick", stop, true);
                newEl.addEventListener("click", async function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    prepareImagesViewer();

                    let allImages: ThreadPicture[];
                    try {
                        allImages = await getAllThreadImages({ threadId: PageData.thread.thread_id, lzOnly: false });
                    } catch (err) {
                        console.warn("[Tieba-Remix] 拉取帖子图片失败:", err);
                        notifyImageViewerFailure("fetch");
                        return;
                    }

                    if (threadImageQueueScope.get() === "floor") {
                        const pid = +(newEl.dataset.pid ?? 0);
                        const floorPics = allImages.filter(p => p.postId === pid);
                        const floorImages = dom<"img">(".BDE_Image", postContent!, []);
                        const localIndex = Math.max(0, floorImages.findIndex(img => img === newEl));
                        void imagesViewer({
                            content: floorPics,
                            defaultIndex: Math.max(0, Math.min(localIndex, floorPics.length - 1)),
                        });
                        return;
                    }

                    if (newEl.dataset.index == null) {
                        const postIdMatch = +(newEl.dataset.pid ?? 0);
                        newEl.dataset.index = `${allImages.findIndex(img => img.postId === postIdMatch) + dom<"img">(".BDE_Image", postContent!, []).findIndex(img => img === newEl)}`;
                    }
                    void imagesViewer({
                        content: allImages,
                        defaultIndex: parseInt(newEl.dataset.index ?? "0", 10),
                    });
                });
                el.replaceWith(newEl);
            });
        };
        addCoalescedObserverEvent(() => {
            threadImagesReady = processThreadImages();
        }, threadFloorsObserver);

        // 去除楼中楼用户发言的冒号
        threadCommentsObserver.addEvent(() => {
            (dom(".lzl_cnt:not([data-tbr-lzl-normalized])", [])).forEach(el => {
                el.childNodes.forEach(node => {
                    if (node)
                        node.nodeType === 3 ? node.remove() : undefined;
                });
                el.setAttribute("data-tbr-lzl-normalized", "");
            });
        });

        setupCommentEmotionPanel();

        threadFloorsObserver.observe();
        threadCommentsObserver.observe();
        await threadImagesReady;
        return threadList;
    }

    // pager 相关
    const pagerVNodes: VNode[] = [];
    const insertPager = (parent: Element, position: Node | null, additionalStyles?: CSSRule) => {
        const { vnode: pagerVNode } = insertJSX(createPager(additionalStyles), parent, position ?? undefined);
        pagerVNodes.push(pagerVNode);

        function createPager(additionalStyles?: CSSRule) {
            const pagerComponent =
                <Pager
                    total={PageData.pager.total_page}
                    current={PageData.pager.cur_page}
                    showPagers={PageData.pager.total_page > 1}
                    pagerChange={function (page) {
                        pager.jumpTo(page);
                        pagerVNodes.forEach(pagerVNode => {
                            const exposed = (pagerVNode.component as { exposeProxy?: { current: number } } | null)?.exposeProxy;
                            if (exposed) exposed.current = page;
                        });
                    }}
                    style={parseCSSRule({
                        width: "100%",
                        padding: "0",
                        ...additionalStyles,
                    })}>
                    {{
                        tailSlot: () => `回帖 ${PageData.thread.reply_num - 1}`,
                    }}
                </Pager>;
            return pagerComponent;
        }
    };
    insertPager(pbContentRoot, pbContentRoot.firstChild, {
        marginBottom: "24px",
        position: PageData.pager.total_page <= 1 ? "absolute" : "",
        right: PageData.pager.total_page <= 1 ? "48px" : "",
    });
    await waitForThreadLayoutPaint();
    markThreadLayoutReady();

    createTextbox();
    async function createTextbox() {
        await waitUntil(() => !(floatBar.get() == null));
        await waitUntil(() => !(dom("#ueditor_replace") == null));

        const nativePostButtons = floatBar.buttons().filter(button => button.type === "post");
        nativePostButtons.forEach(button => {
            button.el.style.display = "none";
            button.el.toggleAttribute("aria-hidden", true);
        });
        const commentButton = floatBar.add("other", showEditor, "trex-comment-button", MessageSquare, 2);
        setFloatButtonTooltip(commentButton.el, "评论");

        // 添加末尾帖子回复入口
        insertPager(pbContentRoot, pbContentRoot.lastChild, {
            paddingTop: "24px",
        });
        appendJSX(
            <div id="thread-jsx-components">
                <UserButton class="dummy-button" noBorder onClick={showEditor}>回复帖子</UserButton>
            </div>, pbContentRoot);

        let editorDialog: RenderedComponent | undefined;
        let openingEditor = false;
        async function showEditor() {
            if (editorDialog) {
                (editorDialog.instance as { unload?: () => void }).unload?.();
                return;
            }
            if (openingEditor) return;
            openingEditor = true;
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            const scrollY = window.scrollY;
            try {
                requestNativeEditorInit(scrollY);
                const ueditor = await waitForReadyUEditor();
                if (!ueditor) {
                    toast({ message: "编辑器加载中，请稍后再试", type: "warning" });
                    return;
                }
                restoreScrollPosition(scrollY);
                editorDialog = renderDialog(ThreadEditor, { ueditor, type: "reply" }, {
                    unloaded() { editorDialog = undefined; },
                    abnormalUnload() { editorDialog = undefined; },
                });
            } finally {
                openingEditor = false;
            }
        }

        function requestNativeEditorInit(scrollY: number) {
            requestUEditorInit();
            if (resolveReadyUEditor()) {
                restoreScrollPosition(scrollY);
                return;
            }
            nativePostButtons.forEach(button => {
                const anchor = button.el.querySelector<HTMLElement>("a");
                (anchor ?? button.el).click();
            });
            restoreScrollPosition(scrollY);
        }

        function restoreScrollPosition(scrollY: number) {
            window.scrollTo({ top: scrollY });
            requestAnimationFrame(() => window.scrollTo({ top: scrollY }));
            requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: scrollY })));
            window.setTimeout(() => window.scrollTo({ top: scrollY }), 80);
        }

        document.addEventListener("click", function (event) {
            const target = event.target;
            if (!(target instanceof Element) || !target.closest(".p_reply_first")) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            void showEditor();
        }, true);
    }
}

function isThreadUnavailablePage(): boolean {
    if (document.querySelector(".page404")) return true;
    if (PageData?.thread?.thread_id) return false;
    return document.querySelector("#j_p_postlist, #pb_content") == null;
}

function markThreadLayoutReady(): void {
    document.documentElement.setAttribute(THREAD_LAYOUT_STATUS_ATTR, THREAD_LAYOUT_STATUS_READY);
}

function waitForThreadLayoutPaint(): Promise<void> {
    return new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
}
