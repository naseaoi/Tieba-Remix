import { threadCommentsObserver } from "@/lib/observers";

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

export function setupCommentEmotionPanel() {
    threadCommentsObserver.addEvent(() => {
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
}
