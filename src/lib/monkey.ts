interface MonkeyScriptInfo {
    script: {
        name: string;
        version: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

interface MonkeyGlobal {
    GM_addStyle?: (css: string) => HTMLStyleElement;
    GM_deleteValue?: (key: string) => void;
    GM_getValue?: <T>(key: string, defaultValue?: T) => T;
    GM_info?: MonkeyScriptInfo;
    GM_listValues?: () => string[];
    GM_openInTab?: (url: string, options?: { active?: boolean }) => unknown;
    GM_registerMenuCommand?: (name: string, fn: () => void) => unknown;
    GM_setValue?: (key: string, value: unknown) => void;
}

const fallbackInfo: MonkeyScriptInfo = {
    script: {
        name: "Tieba Remix",
        version: "developer-only",
    },
};

let cachedMonkeyGlobal: MonkeyGlobal | undefined;

function monkeyGlobal() {
    if (cachedMonkeyGlobal) return cachedMonkeyGlobal;

    const directGlobal = globalThis as typeof globalThis & MonkeyGlobal;
    if (hasMonkeyValueApis(directGlobal)) {
        cachedMonkeyGlobal = directGlobal;
        return cachedMonkeyGlobal;
    }

    const doc = typeof document !== "undefined" ? document : undefined;
    if (doc) {
        const docRecord = doc as unknown as Record<PropertyKey, unknown>;
        const ownKeys = [
            ...Object.getOwnPropertyNames(doc),
            ...Object.getOwnPropertySymbols(doc),
        ];

        for (const key of ownKeys) {
            const candidate = docRecord[key] as MonkeyGlobal | undefined;
            if (candidate && hasMonkeyValueApis(candidate)) {
                cachedMonkeyGlobal = candidate;
                return cachedMonkeyGlobal;
            }
        }
    }

    cachedMonkeyGlobal = directGlobal;
    return cachedMonkeyGlobal;
}

function hasMonkeyValueApis(target: MonkeyGlobal | undefined) {
    return typeof target?.GM_getValue === "function"
        && typeof target?.GM_setValue === "function"
        && typeof target?.GM_deleteValue === "function"
        && !!target?.GM_info?.script;
}

export function getGMInfo(): MonkeyScriptInfo {
    return monkeyGlobal().GM_info ?? fallbackInfo;
}

export function hasCoreMonkeyApis() {
    const gm = monkeyGlobal();
    return hasMonkeyValueApis(gm)
        && typeof gm.GM_addStyle === "function"
        && typeof gm.GM_registerMenuCommand === "function"
        && !!gm.GM_info?.script;
}

export function waitForCoreMonkeyApis(timeout = 3000) {
    return new Promise<boolean>((resolve) => {
        if (hasCoreMonkeyApis()) {
            resolve(true);
            return;
        }

        const start = performance.now();
        let id = 0;

        const tick = () => {
            if (hasCoreMonkeyApis()) {
                resolve(true);
                return;
            }

            if (performance.now() - start >= timeout) {
                resolve(false);
                return;
            }

            id = requestAnimationFrame(tick);
        };

        id = requestAnimationFrame(tick);

        void id;
    });
}

export function GM_getValue<T>(key: string, defaultValue: T): T {
    const fn = monkeyGlobal().GM_getValue;
    return typeof fn === "function" ? fn<T>(key, defaultValue) : defaultValue;
}

export function GM_setValue(key: string, value: unknown) {
    monkeyGlobal().GM_setValue?.(key, value);
}

export function GM_deleteValue(key: string) {
    monkeyGlobal().GM_deleteValue?.(key);
}

export function GM_listValues() {
    const fn = monkeyGlobal().GM_listValues;
    return typeof fn === "function" ? fn() : [];
}

export function GM_addStyle(css: string) {
    const fn = monkeyGlobal().GM_addStyle;
    if (typeof fn === "function") return fn(css);

    const style = document.createElement("style");
    style.textContent = css;
    (document.head ?? document.documentElement).appendChild(style);
    return style;
}

export function GM_registerMenuCommand(name: string, fn: () => void) {
    return monkeyGlobal().GM_registerMenuCommand?.(name, fn);
}

export function GM_openInTab(url: string, options?: { active?: boolean }) {
    const fn = monkeyGlobal().GM_openInTab;
    if (typeof fn === "function") return fn(url, options);
    return window.open(url, options?.active === false ? "_blank" : "_blank", "noopener,noreferrer");
}
