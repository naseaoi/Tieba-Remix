import { currentPageType } from "@/lib/api/remixed";
import { getNavUnreadCount } from "@/lib/api/tieba-user";
import { asyncdom } from "@/lib/elemental";
import { onMounted, onUnmounted, ref } from "vue";

const NATIVE_MESSAGE_COUNT_SELECTOR = ".u_menu_news .j_news > span";

export function useNavMessageUnreadCount() {
    const unreadMessageCount = ref(0);
    let mounted = false;
    let observer: MutationObserver | undefined;
    let pollTimer = 0;
    let pending = false;

    const refresh = async () => {
        if (!mounted || pending || document.visibilityState === "hidden") return;
        pending = true;
        try {
            const count = await getNavUnreadCount();
            if (mounted) unreadMessageCount.value = count;
        } catch {
            // 短暂断网时保留上次计数，下次轮询重试。
        } finally {
            pending = false;
        }
    };

    onMounted(async () => {
        mounted = true;
        if (currentPageType() === "search") {
            void refresh();
            pollTimer = window.setInterval(() => { void refresh(); }, 60000);
            document.addEventListener("visibilitychange", refresh);
            window.addEventListener("focus", refresh);
            return;
        }
        const counter = await asyncdom<"span">(NATIVE_MESSAGE_COUNT_SELECTOR, undefined, 10000);
        if (!mounted || !counter) return;

        const syncUnreadState = () => {
            const count = Number.parseInt(counter.textContent?.match(/\d+/)?.[0] ?? "0", 10);
            unreadMessageCount.value = Number.isFinite(count) ? Math.max(0, count) : 0;
        };

        syncUnreadState();
        observer = new MutationObserver(syncUnreadState);
        observer.observe(counter, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
        });
    });

    onUnmounted(() => {
        mounted = false;
        observer?.disconnect();
        window.clearInterval(pollTimer);
        document.removeEventListener("visibilitychange", refresh);
        window.removeEventListener("focus", refresh);
    });

    return unreadMessageCount;
}
