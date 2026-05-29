import { currentPageType } from "@/lib/api/remixed";
import { SuggestionResponse, tiebaAPI } from "@/lib/api/tieba";
import { asyncdom } from "@/lib/elemental";
import { debounce } from "lodash-es";

let installed = false;

const ICON_SEARCH = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
const ICON_ENTER_BA = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>`;
const ICON_SEARCH_ALL = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;

interface Suggestion {
    fname: string;
    fpic: string;
    desc: string;
}

const buildForumUrl = (kw: string): string => `/f?ie=utf-8&kw=${encodeURIComponent(kw)}`;

export function installForumFloatingSearch(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    void (async () => {
        const bar = await asyncdom<"ul">(".tbui_aside_float_bar");
        if (!bar) return;
        if (bar.querySelector(".trex-search-floating")) return;

        const li = document.createElement("li");
        li.className = "tbui_aside_fbar_button trex-search-floating";

        const wrap = document.createElement("div");
        wrap.className = "trex-search-floating-wrap";

        const suggList = document.createElement("div");
        suggList.className = "trex-search-floating-suggestions";

        const panel = document.createElement("div");
        panel.className = "trex-search-floating-panel";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "trex-search-floating-input";
        input.placeholder = "搜索贴吧";
        input.spellcheck = false;
        input.autocomplete = "off";

        const enterBaBtn = document.createElement("button");
        enterBaBtn.type = "button";
        enterBaBtn.className = "trex-search-floating-btn trex-search-floating-btn-enter-ba";
        enterBaBtn.title = "进入贴吧";
        enterBaBtn.setAttribute("aria-label", "进入贴吧");
        enterBaBtn.innerHTML = ICON_ENTER_BA;

        const searchAllBtn = document.createElement("button");
        searchAllBtn.type = "button";
        searchAllBtn.className = "trex-search-floating-btn trex-search-floating-btn-search-all";
        searchAllBtn.title = "全吧搜索";
        searchAllBtn.setAttribute("aria-label", "全吧搜索");
        searchAllBtn.innerHTML = ICON_SEARCH_ALL;

        panel.appendChild(input);
        panel.appendChild(enterBaBtn);
        panel.appendChild(searchAllBtn);

        wrap.appendChild(suggList);
        wrap.appendChild(panel);

        const toggle = document.createElement("a");
        toggle.href = "javascript:;";
        toggle.className = "icon tbui_aside_fbar_button trex-search-floating-toggle";
        toggle.title = "搜索";
        toggle.setAttribute("aria-label", "搜索");
        toggle.innerHTML = ICON_SEARCH;

        li.appendChild(wrap);
        li.appendChild(toggle);

        bar.insertBefore(li, bar.firstChild);

        let expanded = false;
        const setExpanded = (next: boolean): void => {
            if (expanded === next) return;
            expanded = next;
            li.classList.toggle("expanded", next);
            if (next) {
                requestAnimationFrame(() => input.focus());
            } else {
                clearSuggestions();
            }
        };

        const renderSuggestions = (items: Suggestion[]): void => {
            suggList.innerHTML = "";
            if (items.length === 0) {
                li.classList.remove("has-suggestions");
                return;
            }
            for (const item of items) {
                const liItem = document.createElement("div");
                liItem.className = "trex-search-floating-sugg-item";
                liItem.setAttribute("role", "button");
                liItem.tabIndex = 0;
                liItem.dataset.fname = item.fname;
                if (item.fpic) {
                    const img = document.createElement("img");
                    img.className = "trex-search-floating-sugg-img";
                    img.src = item.fpic;
                    img.alt = "";
                    liItem.appendChild(img);
                }
                const text = document.createElement("div");
                text.className = "trex-search-floating-sugg-text";
                const title = document.createElement("div");
                title.className = "trex-search-floating-sugg-title";
                title.textContent = item.fname;
                const desc = document.createElement("div");
                desc.className = "trex-search-floating-sugg-desc";
                desc.textContent = item.desc;
                text.appendChild(title);
                text.appendChild(desc);
                liItem.appendChild(text);
                suggList.appendChild(liItem);
            }
            li.classList.add("has-suggestions");
        };

        const clearSuggestions = (): void => {
            suggList.innerHTML = "";
            li.classList.remove("has-suggestions");
        };

        const fetchSuggestions = async (query: string): Promise<void> => {
            if (!query) { clearSuggestions(); return; }
            try {
                const response = await tiebaAPI.suggestions(query);
                if (!response.ok) return;
                const data = await response.json() as SuggestionResponse;
                const matches = data.query_match?.search_data ?? [];
                const items: Suggestion[] = matches.slice(0, 6).map(m => ({
                    fname: m.fname,
                    fpic: m.fpic,
                    desc: m.forum_desc,
                }));
                if (input.value.trim() !== query) return;
                renderSuggestions(items);
            } catch {
                // 静默失败，不影响主流程
            }
        };

        const debouncedFetch = debounce((q: string) => { void fetchSuggestions(q); }, 250);

        toggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(!expanded);
        });

        const submitEnterBa = (): void => {
            const kw = input.value.trim();
            if (!kw) { input.focus(); return; }
            location.href = buildForumUrl(kw);
        };

        const submitSearchAll = (): void => {
            const kw = input.value.trim();
            if (!kw) { input.focus(); return; }
            location.href = `/f/search/res?ie=utf-8&qw=${encodeURIComponent(kw)}`;
        };

        enterBaBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            submitEnterBa();
        });

        searchAllBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            submitSearchAll();
        });

        input.addEventListener("input", () => {
            const q = input.value.trim();
            if (!q) { clearSuggestions(); return; }
            debouncedFetch(q);
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                submitEnterBa();
            } else if (e.key === "Escape") {
                e.preventDefault();
                setExpanded(false);
                toggle.focus();
            }
        });

        const goSuggestion = (target: HTMLElement): void => {
            const fname = target.dataset.fname;
            if (!fname) return;
            location.href = buildForumUrl(fname);
        };

        suggList.addEventListener("pointerdown", (e) => {
            if (e.button !== 0) return;
            const target = (e.target as Element).closest<HTMLElement>(".trex-search-floating-sugg-item");
            if (!target) return;
            e.preventDefault();
            e.stopPropagation();
            goSuggestion(target);
        });

        suggList.addEventListener("click", (e) => {
            const target = (e.target as Element).closest<HTMLElement>(".trex-search-floating-sugg-item");
            if (!target) return;
            e.preventDefault();
            e.stopPropagation();
        });

        suggList.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            const target = (e.target as Element).closest<HTMLElement>(".trex-search-floating-sugg-item");
            if (!target) return;
            e.preventDefault();
            e.stopPropagation();
            goSuggestion(target);
        });

        document.addEventListener("click", (e) => {
            if (!expanded) return;
            if (li.contains(e.target as Node)) return;
            setExpanded(false);
        });

        li.addEventListener("focusout", (e) => {
            if (!expanded) return;
            const next = e.relatedTarget as Node | null;
            if (next && li.contains(next)) return;
            setExpanded(false);
        });
    })();
}
