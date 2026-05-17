import debounce from "lodash-es/debounce";
import throttle from "lodash-es/throttle";
import type { DebounceSettings, ThrottleSettings } from "lodash-es";
import { onBeforeUnmount } from "vue";

export function useDebounce<T extends (...args: never[]) => unknown>(
    fn: T,
    wait: number,
    options?: DebounceSettings,
) {
    const debounced = debounce(fn, wait, options);
    onBeforeUnmount(() => debounced.cancel());
    return debounced;
}

export function useThrottle<T extends (...args: never[]) => unknown>(
    fn: T,
    wait: number,
    options?: ThrottleSettings,
) {
    const throttled = throttle(fn, wait, options);
    onBeforeUnmount(() => throttled.cancel());
    return throttled;
}
