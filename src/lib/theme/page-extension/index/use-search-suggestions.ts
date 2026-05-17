import { SuggestionResponse, tiebaAPI } from "@/lib/api/tieba";
import { findParent } from "@/lib/elemental";
import _ from "@/lib/utils/_";
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

    async function loadSuggestions(query?: string) {
        const response = await tiebaAPI.suggestions(query);
        if (response.ok) {
            response.json().then((value: SuggestionResponse) => {
                if (!query || query === "") {
                    const topicList = value.hottopic_list.search_data;
                    if (topicList)
                        suggestions.value = topicList.map((topic) => ({
                            image: topic.topic_pic,
                            title: topic.topic_name,
                            desc: topic.topic_desc,
                            href: topic.topic_url,
                        }));
                } else {
                    const matchList = value.query_match.search_data;
                    if (matchList)
                        suggestions.value = matchList.map((match) => ({
                            image: match.fpic,
                            title: match.fname,
                            desc: match.forum_desc,
                            href: tiebaAPI.URL_forum(match.fname),
                        }));
                }
            });
        }
    }

    function toggleSuggControls(e: Event) {
        const el = e.target as HTMLElement;
        const pt = findParent(el, "search-controls");
        suggToggle.value = !!pt;
    }

    function searchBoxFocus() {
        if (suggestions.value.length <= 0) {
            loadSuggestions().then(() => {
                suggToggle.value = true;
            });
        } else {
            suggToggle.value = true;
        }
    }

    function searchTextChange() {
        loadSuggestions(searchText.value);
    }

    const searchMatch = useDebounce(searchTextChange, 500);

    const onFocusin = (ev: Event) => toggleSuggControls(ev);
    const onMousedown = (ev: Event) => toggleSuggControls(ev);
    window.addEventListener("focusin", onFocusin);
    window.addEventListener("mousedown", onMousedown);

    onUnmounted(() => {
        window.removeEventListener("focusin", onFocusin);
        window.removeEventListener("mousedown", onMousedown);
    });

    return { searchText, suggToggle, suggestions, searchBoxFocus, searchMatch };
}
