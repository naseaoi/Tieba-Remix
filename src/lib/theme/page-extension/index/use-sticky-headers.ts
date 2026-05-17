import { useThrottle } from "@/lib/utils/composables";
import { InjectionKey, Ref, onMounted, onUnmounted, ref } from "vue";

export type RegisterStickyHeader = (el: Ref<HTMLElement | undefined>) => Ref<boolean>;

export const StickyHeadersKey: InjectionKey<RegisterStickyHeader> = Symbol("stickyHeaders");

interface Entry {
    el: Ref<HTMLElement | undefined>;
    stuck: Ref<boolean>;
}

export function useStickyHeaders(topPx: () => number, throttleMs = 16) {
    const entries: Entry[] = [];

    const register: RegisterStickyHeader = (el) => {
        const stuck = ref(false);
        entries.push({ el, stuck });
        return stuck;
    };

    const update = useThrottle(() => {
        const top = topPx();
        for (const entry of entries) {
            const node = entry.el.value;
            const parent = node?.parentElement;
            if (!parent) {
                entry.stuck.value = false;
                continue;
            }
            entry.stuck.value = parent.getBoundingClientRect().top <= top;
        }
    }, throttleMs);

    onMounted(() => {
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        update();
    });

    onUnmounted(() => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
    });

    return { register, update };
}
