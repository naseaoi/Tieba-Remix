import { asyncdom } from "@/lib/elemental";
import { onMounted, onUnmounted, ref } from "vue";

const NATIVE_MESSAGE_COUNT_SELECTOR = ".u_menu_news .j_news > span";

export function useNavMessageUnreadCount() {
    const unreadMessageCount = ref(0);
    let mounted = false;
    let observer: MutationObserver | undefined;

    onMounted(async () => {
        mounted = true;
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
    });

    return unreadMessageCount;
}
