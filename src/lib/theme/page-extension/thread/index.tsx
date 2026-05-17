import { imagesViewer } from "@/components/images-viewer";
import Pager from "@/components/pager.vue";
import ThreadEditor from "@/components/thread-editor.vue";
import TogglePanel, { TogglePanelProps } from "@/components/toggle-panel.vue";
import { currentPageType } from "@/lib/api/remixed";
import { getAllThreadImages, levelToClass, tiebaAPI } from "@/lib/api/tieba";
import { asyncdom, dom, domrd, findParent } from "@/lib/elemental";
import { CSSRule, overwriteCSS, parseCSSRule } from "@/lib/elemental/styles";
import { threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
import { RenderedComponent, renderDialog } from "@/lib/render";
import { appendJSX, insertJSX } from "@/lib/render/jsx-extension";
import { floatBar, setFloatButtonTooltip } from "@/lib/tieba-components/float-bar";
import { pager } from "@/lib/tieba-components/pager";
import { compactLayout, navBarHideMode, pageExtension, threadImageQueueScope } from "@/lib/user-values";
import { waitUntil } from "@/lib/utils";
import _ from "@/lib/utils/_";
import { UserButton } from "user-view";
import { VNode } from "vue";
import commentsStyle from "./comments.scss?inline";
import compactStyle from "./compact.scss?inline";
import { threadParser } from "./parser";
import threadStyle from "./thread.scss?inline";

export default async function () {
    if (!pageExtension.get().thread) return;
    if (currentPageType() !== "thread") return;

    function normalizeCommentEmotionPanel(root: ParentNode = document, reposition = false) {
        const viewportPadding = 12;
        const triggerGap = 8;

        (root.querySelectorAll<HTMLElement>(".lzl_edui_dialog_container")).forEach(panel => {
            if (getComputedStyle(panel).display === "none") {
                panel.dataset.positioned = "false";
                panel.style.width = "";
                panel.style.height = "";
                panel.style.top = "";
                panel.style.bottom = "";
                panel.style.left = "";
                return;
            }

            const dropdown = panel.querySelector<HTMLElement>(".inde_edui_dropdown_menu");
            const container = panel.querySelector<HTMLElement>(".emotion_container");
            const content = panel.querySelector<HTMLElement>(".s_layer_content");
            const scrollPanel = panel.querySelector<HTMLElement>(".tbui_scroll_panel");
            const contentPanel = panel.querySelector<HTMLElement>(".tbui_panel_content");
            const table = panel.querySelector<HTMLElement>(".s_layer_table");
            const tab = panel.querySelector<HTMLElement>(".s_layer_tab, .ueditor_emotion_tab");
            const preview = panel.querySelector<HTMLElement>(".emotion_preview");
            const trigger = panel.parentElement?.querySelector<HTMLElement>(".j_lzl_p_sm, .lzl_panel_smile");

            if (!scrollPanel || !contentPanel || !table) return;

            const tableHeight = Math.ceil(table.getBoundingClientRect().height);
            const tabHeight = tab ? Math.ceil(tab.getBoundingClientRect().height) : 0;
            const panelHeight = tableHeight;

            [panel, dropdown, container, content, scrollPanel, contentPanel].forEach(elem => {
                if (!elem) return;
                elem.style.height = "auto";
                elem.style.minHeight = "0";
            });

            contentPanel.style.height = `${panelHeight}px`;
            contentPanel.style.overflow = "visible";
            scrollPanel.style.height = `${panelHeight}px`;
            scrollPanel.style.overflowX = "hidden";
            scrollPanel.style.overflowY = "auto";

            if (preview) {
                preview.style.display = "none";
                preview.style.width = "0";
                preview.style.height = "0";
                preview.style.padding = "0";
                preview.style.border = "none";
                preview.style.overflow = "hidden";
            }

            if (dropdown) {
                const totalHeight = panelHeight + tabHeight;
                dropdown.style.height = `${totalHeight}px`;
                panel.style.height = `${totalHeight}px`;

                const dropdownWidth = Math.ceil(dropdown.getBoundingClientRect().width);
                if (dropdownWidth <= 0) return;
                panel.style.width = `${dropdownWidth}px`;

                if (trigger) {
                    const triggerRect = trigger.getBoundingClientRect();
                    if (reposition) {
                        const maxLeft = Math.max(viewportPadding, window.innerWidth - dropdownWidth - viewportPadding);
                        const left = Math.min(Math.max(triggerRect.right - dropdownWidth, viewportPadding), maxLeft);
                        const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding;
                        const spaceAbove = triggerRect.top - viewportPadding;

                        let verticalPlacement = "below";
                        if (spaceBelow < totalHeight + triggerGap && spaceAbove >= totalHeight + triggerGap) {
                            verticalPlacement = "above";
                        } else if (spaceBelow < totalHeight + triggerGap && spaceAbove < totalHeight + triggerGap) {
                            verticalPlacement = spaceAbove > spaceBelow ? "above" : "below";
                        }

                        panel.dataset.verticalPlacement = verticalPlacement;
                        panel.style.left = `${Math.round(left)}px`;
                        panel.style.right = "auto";
                        panel.style.transform = "none";
                    }

                    if (panel.dataset.verticalPlacement === "above") {
                        const bottom = Math.round(window.innerHeight - triggerRect.top + triggerGap);
                        const projectedTop = window.innerHeight - bottom - totalHeight;

                        if (projectedTop >= viewportPadding) {
                            panel.style.top = "auto";
                            panel.style.bottom = `${bottom}px`;
                        } else {
                            panel.style.top = `${viewportPadding}px`;
                            panel.style.bottom = "auto";
                        }
                    } else {
                        const top = Math.min(
                            Math.max(triggerRect.bottom + triggerGap, viewportPadding),
                            Math.max(viewportPadding, window.innerHeight - totalHeight - viewportPadding),
                        );

                        panel.style.top = `${Math.round(top)}px`;
                        panel.style.bottom = "auto";
                    }
                }

                panel.dataset.positioned = "true";
            }
        });
    }

    function scheduleCommentEmotionPanelNormalize(reposition = false) {
        const delays = [0, 60, 180];
        delays.forEach(delay => {
            window.setTimeout(() => {
                requestAnimationFrame(() => normalizeCommentEmotionPanel(document, reposition));
            }, delay);
        });
    }

    overwriteCSS(
        threadStyle,
        compactStyle,
        commentsStyle,
    );

    await waitUntil(() => !(document.body == null)).then(function () {
        // document.body.insertBefore(mainWrapper, document.body.firstChild);
        if (compactLayout.get()) {
            document.body.toggleAttribute("compact-layout");
        }
    });

    // 滚动隐藏模式：与 nav-bar 协同，首次向下滚动后永久收紧顶部空白（不再恢复）
    (function setupScrollCollapse() {
        let collapsed = false;
        let lastScrollY = window.scrollY;
        const handle = _.throttle(function () {
            if (collapsed) return;
            if (navBarHideMode.get() !== "fold") return;
            if (window.scrollY > lastScrollY && window.scrollY > 8) {
                document.documentElement.toggleAttribute("thread-top-collapsed", true);
                collapsed = true;
            }
            lastScrollY = window.scrollY;
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
                        icon: "favorite",
                        name: "收藏",
                        defaultValue: (function () {
                            return dom<"a">(".j_favor, #j_favthread .p_favthr_main")?.innerText === "收藏" ? false : true;
                        })(),
                        event() {
                            dom<"a">(".j_favor, #j_favthread .p_favthr_main")?.click();
                        },
                    },
                    {
                        icon: "face_6",
                        name: "只看楼主",
                        defaultValue: (function () {
                            return dom<"a">("#lzonly_cntn")?.innerText === "只看楼主" ? false : true;
                        })(),
                        event() {
                            dom<"a">("#lzonly_cntn")?.click();
                        },
                    },
                    {
                        icon: "compare_arrows",
                        name: "紧凑布局",
                        defaultValue: (() => compactLayout.get())(),
                        event() {
                            document.body.toggleAttribute("compact-layout");
                            compactLayout.set(!compactLayout.get());
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
        }, "module-settings", "menu");
        setFloatButtonTooltip(settingsButton.el, "更多");

        document.body.insertBefore(domrd("div", {
            class: "vue-module-control",
            style: "display: none;",
        }), document.body.firstChild);
    });

    const content = await asyncdom<"div">(".content");
    const pbContent = await asyncdom<"div">("#pb_content");

    await createContents();
    async function createContents() {
        const threadList = await asyncdom("#j_p_postlist");
        threadList.classList.add("content-wrapper");

        let thread = threadParser();

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
                        class="icon forum-button add-forum-button"
                        noBorder
                        onClick={() => dom<"button">("#j_head_focus_btn")?.click()}>
                        {PageData.user.is_like ? "check" : "add"}
                    </UserButton>
                </div>
            </div>
        </div>, content, pbContent);

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

        threadFloorsObserver.addEvent(function () {
            if (dom(".d_author", []).length === 0) return;

            // TODO: performance
            thread = threadParser();
            thread.cotents.forEach((c, i) => {
                const floor = c.post.closest(".l_post")?.querySelector<HTMLDivElement>(".d_post_content_main");
                if (!floor) return;
                const authorContainer = createAuthorContainer(i);
                floor.insertBefore(authorContainer, floor.firstChild);
            });

            // 去除左侧用户栏
            (dom(".d_author", [])).forEach(el => el.remove());
        });

        function createAuthorContainer(index: number) {
            const authorContainer = domrd("div", {
                class: "author-container",
            });

            thread.cotents[index].profile.nameAnchor.classList.add("anchor");

            authorContainer.appendChild(thread.cotents[index].profile.avatar);
            authorContainer.appendChild(thread.cotents[index].profile.nameAnchor);

            const badgeContainer = appendJSX<HTMLDivElement>(<div class="badge-container"></div>, authorContainer);

            const profileLevel = thread.cotents[index].profile.level;
            const badgeTitle = thread.cotents[index].profile.badgeTitle;
            const hasLevel = Number.isFinite(profileLevel) && profileLevel > 0;
            appendJSX(
                <div class={hasLevel ? `floor-badge level-${levelToClass(profileLevel)}` : "floor-badge"}>
                    <div class="badge-level">{hasLevel ? profileLevel : ""}</div>
                    <div class="badge-title">{badgeTitle}</div>
                </div>, badgeContainer.root);

            if (thread.cotents[index].isLouzhu)
                appendJSX(<div class="floor-badge">楼主</div>, badgeContainer.root);

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

        threadFloorsObserver.addEvent(async () => {
            await waitUntil(() => !!PageData.thread.thread_id);
            (dom<"img">(".BDE_Image", threadList, [])).forEach(el => {
                const newEl = el.cloneNode(false) as HTMLImageElement;
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
                newEl.addEventListener("mousedown", stop, true);
                newEl.addEventListener("auxclick", stop, true);
                newEl.addEventListener("click", async function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    let allImages: ThreadPicture[];
                    try {
                        allImages = await getAllThreadImages({ threadId: PageData.thread.thread_id, lzOnly: false });
                    } catch (err) {
                        console.warn("[Tieba-Remix] 拉取帖子图片失败:", err);
                        return;
                    }

                    if (threadImageQueueScope.get() === "floor") {
                        const pid = +(newEl.dataset.pid ?? 0);
                        const floorPics = allImages.filter(p => p.postId === pid);
                        const floorImages = dom<"img">(".BDE_Image", postContent!, []);
                        const localIndex = Math.max(0, floorImages.findIndex(img => img === newEl));
                        if (floorPics.length > 0) {
                            imagesViewer({
                                content: floorPics,
                                defaultIndex: Math.min(localIndex, floorPics.length - 1),
                            });
                        }
                        return;
                    }

                    if (newEl.dataset.index == null) {
                        const postIdMatch = +(newEl.dataset.pid ?? 0);
                        newEl.dataset.index = `${allImages.findIndex(img => img.postId === postIdMatch) + dom<"img">(".BDE_Image", postContent!, []).findIndex(img => img === newEl)}`;
                    }
                    imagesViewer({
                        content: allImages,
                        defaultIndex: parseInt(newEl.dataset.index ?? "0", 10),
                    });
                });
                el.replaceWith(newEl);
            });
        });

        // 去除楼中楼用户发言的冒号
        threadCommentsObserver.addEvent(() => {
            (dom(".lzl_cnt", [])).forEach(el => {
                el.childNodes.forEach(node => {
                    if (node)
                        node.nodeType === 3 ? node.remove() : undefined;
                });
            });

            requestAnimationFrame(() => normalizeCommentEmotionPanel());
        });

        document.addEventListener("mousedown", event => {
            const target = event.target;
            if (!(target instanceof Element)) return;

            const trigger = target.closest(".j_lzl_p_sm, .lzl_panel_smile");
            if (!trigger) return;

            const panel = trigger.parentElement?.querySelector<HTMLElement>(".lzl_edui_dialog_container");
            if (panel) panel.dataset.positioned = "false";
        }, true);

        document.addEventListener("click", event => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const trigger = target.closest(".j_lzl_p_sm, .lzl_panel_smile");
            const panelAction = target.closest(".j_emotion, .s_tab_btn, .s_prev, .s_next");
            if (!trigger && !panelAction) return;

            const shouldReposition = !!trigger;
            if (trigger) {
                const panel = trigger.parentElement?.querySelector<HTMLElement>(".lzl_edui_dialog_container");
                if (panel) panel.dataset.positioned = "false";
            }
            scheduleCommentEmotionPanelNormalize(shouldReposition);
        }, true);

        const syncOpenEmotionPanels = () => {
            if (!document.querySelector(".lzl_edui_dialog_container[style*='display: block']")) return;
            requestAnimationFrame(() => normalizeCommentEmotionPanel(document, true));
        };

        window.addEventListener("resize", syncOpenEmotionPanels);
        window.addEventListener("scroll", syncOpenEmotionPanels, true);

        // 开发模式需要重启 observer
        if (import.meta.env.DEV) {
            threadFloorsObserver.observe();
            threadCommentsObserver.observe();
        }
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
    insertPager(pbContent, pbContent.firstChild, {
        marginBottom: "24px",
        position: PageData.pager.total_page <= 1 ? "absolute" : "",
        right: PageData.pager.total_page <= 1 ? "48px" : "",
    });

    createTextbox();
    async function createTextbox() {
        await waitUntil(() => !(floatBar.get() == null));
        await waitUntil(() => !(dom("#ueditor_replace") == null));

        if (!floatBar.buttons().some(b => b.type === "post")) {
            floatBar.add("post", showEditor, undefined, undefined, 2);
        }

        const postButton = floatBar.buttons().find(button => {
            return button.type === "post";
        });
        postButton?.el.addEventListener("click", showEditor);

        // 添加末尾帖子回复入口
        insertPager(pbContent, pbContent.lastChild, {
            paddingTop: "24px",
        });
        appendJSX(
            <div id="thread-jsx-components">
                <UserButton class="dummy-button" noBorder onClick={showEditor}>回复帖子</UserButton>
            </div>, pbContent);

        function showEditor() {
            const editorBody = dom("#ueditor_replace");
            const ueditor = editorBody?.closest(".edui-container") ?? editorBody;
            if (ueditor) {
                renderDialog(<ThreadEditor ueditor={ueditor} type={"reply"} />);
            }
        }
    }
}
