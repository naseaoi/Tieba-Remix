import type { SuggestionResponse } from "@/lib/api/tieba";
import { tiebaAPI } from "@/lib/api/tieba";
import { findParent } from "@/lib/elemental";
import { useDebounce } from "@/lib/utils/composables";
import { onUnmounted, ref } from "vue";

export function useSearchSuggestions() {
    const searchText = ref("");
    const suggToggle = ref(false);
    const suggestions = ref<{
        image: string
        title: string
        desc: string
        href: string
    }[]>([]);
    let latestRequest = 0;

    async function loadSuggestions(query?: string) {
        const request = ++latestRequest;
        const normalizedQuery = query?.trim() ?? "";

        try {
            const response = await tiebaAPI.suggestions(normalizedQuery || undefined);
            if (!response.ok) return;

            const value = await response.json() as SuggestionResponse;
            if (request !== latestRequest || normalizedQuery !== searchText.value.trim()) return;

            if (!normalizedQuery) {
                const topicList = value.hottopic_list?.search_data ?? [];
                suggestions.value = topicList.map((topic) => ({
                    image: topic.topic_pic,
                    title: topic.topic_name,
                    desc: topic.topic_desc,
                    href: topic.topic_url,
                }));
                return;
            }

            const matchList = value.query_match?.search_data ?? [];
            suggestions.value = matchList.map((match) => ({
                image: match.fpic,
                title: match.fname,
                desc: match.forum_desc,
                href: tiebaAPI.URL_forum(match.fname),
            }));
        } catch {
            return;
        }
    }

    function toggleSuggControls(e: Event) {
        const el = e.target as HTMLElement;
        const pt = findParent(el, "search-controls");
        suggToggle.value = !!pt;
    }

    async function searchBoxFocus() {
        if (suggestions.value.length <= 0) {
            await loadSuggestions(searchText.value);
            suggToggle.value = true;
        } else {
            suggToggle.value = true;
        }
    }

    function searchTextChange() {
        void loadSuggestions(searchText.value);
    }

    const searchMatch = useDebounce(searchTextChange, 500);

    const onFocusin = (ev: Event) => toggleSuggControls(ev);
    const onMousedown = (ev: Event) => toggleSuggControls(ev);
    window.addEventListener("focusin", onFocusin);
    window.addEventListener("mousedown", onMousedown);

    onUnmounted(() => {
        latestRequest++;
        window.removeEventListener("focusin", onFocusin);
        window.removeEventListener("mousedown", onMousedown);
    });

    return { searchText, suggToggle, suggestions, searchBoxFocus, searchMatch, loadSuggestions };
}
