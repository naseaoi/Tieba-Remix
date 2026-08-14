import { GM_deleteValue, GM_getValue, GM_setValue } from "@/lib/monkey";
import { NavBarHideMode } from "@/components/nav-bar.vue";
import _ from "@/lib/utils/_";
import { setTheme } from "./api/remixed";
import { applyCustomStyle, applyDynamicFonts, setCustomBackground, setStyleTheme } from "./theme";
import { isLiteralObject, spawnOffsetTS } from "./utils";

export const MainTitle = "Tieba Remix";
export const Owner = "naseaoi";
export const RepoName = "Tieba-Remix";
export const GithubRepo = `https://github.com/${Owner}/${RepoName}`;
export const GiteeRepo = `https://gitee.com/${Owner}/${RepoName}`;
export const BaiduPassport = "https://passport.baidu.com/";

export const REMIXED =
    "\n" +
    "██████╗ ███████╗███╗   ███╗██╗██╗  ██╗███████╗██████╗ \n" +
    "██╔══██╗██╔════╝████╗ ████║██║╚██╗██╔╝██╔════╝██╔══██╗\n" +
    "██████╔╝█████╗  ██╔████╔██║██║ ╚███╔╝ █████╗  ██║  ██║\n" +
    "██╔══██╗██╔══╝  ██║╚██╔╝██║██║ ██╔██╗ ██╔══╝  ██║  ██║\n" +
    "██║  ██║███████╗██║ ╚═╝ ██║██║██╔╝ ██╗███████╗██████╔╝\n" +
    "╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ \n";

type UserKeyEvent = "getter" | "setter";
type UserKeyEventsListener<T> = Record<UserKeyEvent, ((value: T) => unknown)>;
type UserKeyEventsListeners<T> = Record<UserKeyEvent, Array<((value: T) => unknown)>>;
export class UserKey<T, LegacyType = unknown> {
    // 备份注册表：UserKey 默认加入，UserKeyTS（运行时缓存）在子类构造里 excludeFromBackup() 退出
    private static backupRegistry = new Set<UserKey<unknown>>();

    public key: string;
    public defaultValue: T;
    private listeners: UserKeyEventsListeners<T>;
    protected migration?: (maybeLegacy: T | LegacyType) => T;
    private validator?: (value: unknown) => boolean;

    constructor(
        key: string,
        defaultValue: T,
        listeners?: Partial<UserKeyEventsListener<T>>,
        migration?: (maybeLegacy: T | LegacyType) => T,
        validator?: (value: unknown) => boolean,
    ) {
        this.key = key;
        this.defaultValue = defaultValue;
        this.listeners = {
            getter: listeners?.getter ? [listeners.getter] : [],
            setter: listeners?.setter ? [listeners.setter] : [],
        };
        this.migration = migration;
        this.validator = validator;
        UserKey.backupRegistry.add(this as UserKey<unknown>);
    }

    protected excludeFromBackup(): void {
        UserKey.backupRegistry.delete(this as UserKey<unknown>);
    }

    public static getBackupableKeys(): UserKey<unknown>[] {
        return Array.from(UserKey.backupRegistry);
    }

    public restore(value: unknown): boolean {
        try {
            const normalized = isLiteralObject(value) && isLiteralObject(this.defaultValue)
                ? _.merge({}, this.defaultValue, value)
                : value;
            const restored = this.migration
                ? this.migration(normalized as T | LegacyType)
                : normalized as T;
            if (!this.isValid(restored)) return false;
            this.set(restored);
            return true;
        } catch {
            return false;
        }
    }

    protected dispatchEvent(event: UserKeyEvent, value: T) {
        this.listeners[event].forEach(listener => listener(value));
    }

    public on(event: UserKeyEvent, listener: (value: T) => unknown) {
        this.listeners[event].push(listener);
    }

    public get() {
        let value = GM_getValue<T>(this.key, this.defaultValue);
        if (isLiteralObject(value) && isLiteralObject(this.defaultValue) &&
            Object.keys(value as object).length < Object.keys(this.defaultValue as object).length) {
            value = _.merge({}, this.defaultValue, value);
        }
        if (this.migration) {
            const migrated = this.migration(value);
            if (!_.isEqual(migrated, value)) {
                value = migrated;
                GM_setValue(this.key, value);
            }
        }
        this.dispatchEvent("getter", value);
        return value;
    }

    public set(value: T) {
        GM_setValue(this.key, value);
        this.dispatchEvent("setter", value);
    }

    public remove() {
        GM_deleteValue(this.key);
    }

    public merge(value: Partial<T>) {
        if (isLiteralObject(value)) {
            const merged = { ...this.get(), ...value };
            this.set(merged);
        }
    }

    public mergeDeeply(value: Partial<T>) {
        if (isLiteralObject(value)) {
            const merged = _.merge({}, this.get(), value);
            this.set(merged);
        }
    }

    private isValid(value: unknown): value is T {
        return this.validator?.(value) ?? isValueCompatible(value, this.defaultValue);
    }
}

export class UserKeyTS<T, LegacyType = unknown> extends UserKey<T, LegacyType> {
    private defaultInvalid = () => spawnOffsetTS(0, 0, 0, 12);

    constructor(
        key: string,
        defaultValue: T,
        invalidfn?: (() => number),
        listeners?: Partial<UserKeyEventsListener<T>>,
        migration?: (maybeLegacy: T | LegacyType) => T,
    ) {
        super(key, defaultValue, listeners, migration);
        this.defaultInvalid = invalidfn ? invalidfn : this.defaultInvalid;
        // 时间敏感的键是运行时缓存（推送、版本检查等），不纳入备份
        this.excludeFromBackup();
    }

    public get() {
        let value = getUserValueTS<T>(this.key, this.defaultValue);
        if (isLiteralObject(value) && isLiteralObject(this.defaultValue) &&
            Object.keys(value as object).length < Object.keys(this.defaultValue as object).length) {
            value = _.merge({}, this.defaultValue, value);
        }
        if (this.migration) value = this.migration(value);
        this.dispatchEvent("getter", value);
        return value;
    }

    /**
     * 设置时间敏感的用户 key
     * @param value 需要设置的值
     * @param invalidTime 失效时间，默认为函数执行 12 小时后
     */
    public set(value: T, invalidTime?: number) {
        setUserValueTS(this.key, value, invalidTime ? invalidTime : this.defaultInvalid());
        this.dispatchEvent("setter", value);
    }

    public merge(value: Partial<T>, invalidTime?: number) {
        if (isLiteralObject(value)) {
            const merged = { ...this.get(), ...value };
            this.set(merged, invalidTime ? invalidTime : this.defaultInvalid());
        }
    }

    public mergeDeeply(value: Partial<T>, invalidTime?: number) {
        if (isLiteralObject(value)) {
            const merged = _.merge({}, this.get(), value);
            this.set(merged, invalidTime ? invalidTime : this.defaultInvalid());
        }
    }
}

function isValueCompatible(value: unknown, template: unknown): boolean {
    if (template === undefined) return value === undefined;
    if (template === null) return value === null;
    if (Array.isArray(template)) return Array.isArray(value);
    if (isLiteralObject(template)) {
        if (!isLiteralObject(value)) return false;
        const objectValue = value as Record<string, unknown>;
        return Object.entries(template).every(([key, nestedTemplate]) =>
            !(key in objectValue) || isValueCompatible(objectValue[key], nestedTemplate)
        );
    }
    return typeof value === typeof template;
}

export interface UpdateConfig {
    time: "1h" | "3h" | "6h" | "never";
    notify: boolean;
    /** 更新通道：stable=正式版（GitHub /releases/latest），preview=预览版（含 prerelease） */
    channel: "stable" | "preview";
}

/** 用户禁用的所有模块的 id */
export const disabledModules = new UserKey<string[]>(
    "disabledModules", [], undefined, undefined,
    value => Array.isArray(value) && value.every(item => typeof item === "string"),
);
/** 未读推送 */
export const unreadFeeds = new UserKeyTS<TiebaPost[]>("unreadFeeds", []);
/** 最新发行版相关信息（正式通道缓存） */
export const latestRelease = new UserKeyTS<Maybe<GiteeRelease>>("latestRelease", undefined);
/** 最新发行版相关信息（预览通道缓存，独立 key 以免与正式通道串味） */
export const latestPreviewRelease = new UserKeyTS<Maybe<GiteeRelease>>("latestPreviewRelease", undefined);
/** 更新配置 */
export const updateConfig = new UserKey<UpdateConfig>("updateConfig", {
    time: "6h",
    notify: true,
    channel: "stable",
}, undefined, undefined, value => {
    if (!isLiteralObject(value)) return false;
    const config = value as Partial<UpdateConfig>;
    return ["1h", "3h", "6h", "never"].includes(config.time ?? "")
        && typeof config.notify === "boolean"
        && ["stable", "preview"].includes(config.channel ?? "");
});
/** 今日是否提醒用户更新 */
export const showUpdateToday = new UserKeyTS("showUpdateToday", true, () => new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000);
/** 用户决定跳过更新的版本的标签 */
export const ignoredTag = new UserKey("ignoredTag", "");
/** 用户主题设置 */
export const themeType = new UserKey<"auto" | "dark" | "light">(
    "themeType",
    "auto",
    {
        setter(value) {
            setTheme(value);
        },
    }, undefined, value => ["auto", "dark", "light"].includes(String(value)));
/** 样式风格（Remixed / Vercel） */
export const styleTheme = new UserKey<"remixed" | "vercel">(
    "styleTheme",
    "vercel",
    {
        setter(value) {
            setStyleTheme(value);
        },
    }, undefined, value => ["remixed", "vercel"].includes(String(value)));
/** 紧凑布局 */
export const compactLayout = new UserKey("compactLayout", false);
/** 磨砂玻璃质感（导航栏、首页标题栏等模糊背景） */
export const glassEffect = new UserKey("glassEffect", false, {
    setter(value) {
        document.documentElement.toggleAttribute("glass-effect", value);
    },
});
/** 首页「贴吧热议」折叠状态记忆 */
export const indexTopicCollapsed = new UserKey<boolean>("indexTopicCollapsed", false);
/** 吧首页置顶帖折叠状态记忆 */
export const forumPinnedCollapsed = new UserKey<Record<string, boolean>>("forumPinnedCollapsed", {});
/** 吧首页置顶帖最后访问时间 */
export const forumPinnedVisitedAt = new UserKey<Record<string, number>>("forumPinnedVisitedAt", {});
/** 主题色 */
export const themeColor = new UserKey("themeColor", {
    light: "#589AFE",
    dark: "#589AFE",
}, undefined, undefined, value => {
    if (!isLiteralObject(value)) return false;
    const colors = value as Record<string, unknown>;
    return typeof colors.light === "string" && typeof colors.dark === "string";
});
/** 用户自定义背景图 */
export const customBackground = new UserKey<Maybe<string>>(
    "customBackground",
    undefined,
    {
        setter() {
            setCustomBackground();
        },
    },
    undefined,
    value => value === undefined || typeof value === "string",
);
/** 页面扩展 */
export const pageExtension = new UserKey("pageExtension", {
    index: true,
    thread: true,
});
/** 帖子列表新版布局 */
export const forumThreadModernLayout = new UserKey<boolean>("forumThreadModernLayout", true);
/** 是否显示吧首页底部贴吧原生发帖模块 */
export const showBottomEditor = new UserKey<boolean>("showBottomEditor", false);
/** 自定义主要字体组合 */
export const userFonts = new UserKey<string[]>(
    "userFonts",
    ["Microsoft YaHei"],
    { setter() { applyDynamicFonts(); } },
    undefined,
    value => Array.isArray(value) && value.every(font => typeof font === "string"),
);
/** 自定义等宽字体组合 */
export const monospaceFonts = new UserKey<string[]>("monospaceFonts", [
    "Consolas", "JetBrains Mono", "Fira Code", "Menlo", "monospace",
], {
    setter() { applyDynamicFonts(); },
}, undefined, value => Array.isArray(value) && value.every(font => typeof font === "string"));
/** 导航栏模式 */
export const navBarHideMode = new UserKey<NavBarHideMode>("navBarHideMode", "fold", {
    setter(value) {
        document.documentElement.dataset.navBarMode = value;
    },
}, undefined, value => ["fold", "alwaysFold", "never"].includes(String(value)));
/** 自定义样式 */
export const customStyle = new UserKey<string>("customStyle", "", {
    setter() { applyCustomStyle(); },
});
export const fontWeights = new UserKey("fontWeights", {
    "normal": 400,
    "bold": 600,
}, {
    setter() { applyDynamicFonts(); },
});
export const highQualityImage = new UserKey("highQualityImage", true);
/** 看图模式队列范围：full = 全帖所有图片；floor = 仅当前楼层 */
export const threadImageQueueScope = new UserKey<"full" | "floor">(
    "threadImageQueueScope", "floor", undefined, undefined,
    value => value === "full" || value === "floor",
);

export const SymbolFont = "Material Symbols";

export const currentStorageBase = new Map<string, unknown>();
export type CurrentStorageEntry<T = unknown> = [string, T];

export const HOME_FEED_IMAGES: CurrentStorageEntry<Record<number, ThreadPicture[]>> = ["home_feed_images", {}];
export const THREAD_IMAGES: CurrentStorageEntry<ThreadPicture[]> = ["thread_images", []];
export const THREAD_IMAGES_LZONLY: CurrentStorageEntry<ThreadPicture[]> = ["thread_images_lzonly", []];

export const currentStorage = {
    get<T extends CurrentStorageEntry>(entry: T): T[1] {
        return currentStorageBase.get(entry[0]) as T[1];
    },
    set<T extends CurrentStorageEntry>(entry: T, value: T[1]): void {
        currentStorageBase.set(entry[0], value);
    },
    has<T extends CurrentStorageEntry>(entry: T): boolean {
        return currentStorageBase.has(entry[0]);
    },
    delete<T extends CurrentStorageEntry>(entry: T): void {
        currentStorageBase.delete(entry[0]);
    },
    clear(): void {
        currentStorageBase.clear();
    },
    entries(): IterableIterator<CurrentStorageEntry> {
        return currentStorageBase.entries();
    },
    keys(): IterableIterator<string> {
        return currentStorageBase.keys();
    },
    values(): IterableIterator<unknown> {
        return currentStorageBase.values();
    },
    forEach(callback: (value: unknown, key: string) => void): void {
        currentStorageBase.forEach(callback);
    },
    size(): number {
        return currentStorageBase.size;
    },
};

export interface GiteeRelease {
    "id": number
    "tag_name": string
    "target_commitish": string
    "prerelease": boolean
    "name": string
    "body": string
    "author": {
        "id": number
        /** 原始用户名 */
        "login": string
        "name": string
        "avatar_url": string
        "url": string
        "html_url": string
        "remark": string
        "followers_url": string
        "following_url": string
        "gists_url": string
        "starred_url": string
        "subscriptions_url": string
        "organizations_url": string
        "repos_url": string
        "events_url": string
        "received_events_url": string
        "type": string
    },
    "created_at": string
    "assets": {
        "browser_download_url": string
        "name"?: string
    }[]
}

export interface GiteeReleaseNotFound {
    message: string
}

/**
 * 获取时间敏感的值
 * @param key 需要获取的值对应的键
 * @param def 未获取到值时返回的默认值
 * @returns 获取到的对应值 | 预先设置的默认值 | undefined
 */
export function getUserValueTS<T>(key: string, def: T): T {
    try {
        const valueTS = GM_getValue<UserValueTS<T>>(key, {
            value: def,
            invalidTime: 0,
        });

        const timeStamp = Date.now();
        // 当前时间与失效时间匹配
        if (valueTS.invalidTime >= timeStamp) {
            return valueTS.value;
        } else {
            return def;
        }
    } catch (error) {
        return def;
    }
}

/**
 * 设置一个时间敏感的值进行存储
 * @param key 该值对应的键
 * @param value 需要设置的值
 * @param invalidTime 该值的失效时间
 */
export function setUserValueTS<T>(key: string, value: T, invalidTime: number): void;
/**
 * 设置一个时间敏感的值进行存储
 * @param key 该值对应的键
 * @param value 需要设置的值
 */
export function setUserValueTS<T>(key: string, value: UserValueTS<T>): void;

export function setUserValueTS(key: string, value: unknown, invalidTime?: number): void {
    try {
        if (invalidTime) {
            // 时间戳 + 值
            GM_setValue(key, {
                value: value,
                invalidTime: invalidTime,
            });
        } else {
            // 直接传入 UserValueNS
            GM_setValue(key, value);
        }
    } catch (error) {
        console.warn("setUserValueTS", error);
    }
}
