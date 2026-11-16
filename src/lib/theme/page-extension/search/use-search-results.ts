import { searchForumPosts } from "@/lib/api/tieba";
import type { SearchPost } from "@/lib/api/tieba-search";
import { shieldList } from "@/modules/shield/shield";
import { computed, ref, shallowRef, type Ref } from "vue";
import { isSearchPostShielded, type SearchPageState } from "./search-state";

// 屏蔽规则可能连续滤空多页，自动加载在此之后停下等用户手动继续
const MAX_EMPTY_AUTO_PAGES = 3;

export type SearchLoadStatus = "idle" | "loading" | "error" | "done";

export function useSearchResults(state: Ref<SearchPageState>) {
    const posts = shallowRef<SearchPost[]>([]);
    const status = ref<SearchLoadStatus>("idle");
    const rules = shallowRef(shieldList.get());
    const emptyStreak = ref(0);
    let page = 0;
    let token = 0;
    let seen = new Set<string>();

    shieldList.on("setter", value => { rules.value = value; });

    const visiblePosts = computed(() => posts.value.filter(post => !isSearchPostShielded(post, rules.value)));
    const initialLoading = computed(() => status.value === "loading" && posts.value.length === 0);
    const canAutoLoad = computed(() => status.value === "idle" && emptyStreak.value < MAX_EMPTY_AUTO_PAGES);

    function reset() {
        token++;
        page = 0;
        seen = new Set();
        posts.value = [];
        emptyStreak.value = 0;
        status.value = state.value.word ? "idle" : "done";
    }

    async function loadMore() {
        if (status.value === "loading" || status.value === "done" || !state.value.word) return;
        const current = ++token;
        status.value = "loading";
        try {
            const { word, forumName, type, sort } = state.value;
            const result = await searchForumPosts({ word, forumName: forumName || undefined, type, sort, page: page + 1 });
            if (current !== token) return;

            page++;
            const fresh = result.posts.filter(post => !seen.has(post.key));
            fresh.forEach(post => seen.add(post.key));
            posts.value = [...posts.value, ...fresh];

            const shown = fresh.filter(post => !isSearchPostShielded(post, rules.value)).length;
            emptyStreak.value = shown > 0 ? 0 : emptyStreak.value + 1;
            status.value = result.hasMore && result.posts.length > 0 ? "idle" : "done";
        } catch (error) {
            if (current !== token) return;
            console.warn("[Tieba Remix] 搜索失败", error);
            status.value = "error";
        }
    }

    function retry() {
        emptyStreak.value = 0;
        if (status.value === "error") status.value = "idle";
        void loadMore();
    }

    return { posts: visiblePosts, status, initialLoading, canAutoLoad, reset, loadMore, retry };
}
