import type { SettingContent } from "@/components/settings.vue";
import type { UserModuleEx } from "@/ex";
import { tiebaAPI } from "@/lib/api/tieba";
import { dom, findParent } from "@/lib/elemental";
import { threadCommentsObserver } from "@/lib/observers";
import { UserKey } from "@/lib/user-values";

export default {
    id: "toolkit",
    name: "实用工具库",
    author: "锯条",
    version: "1.1",
    brief: "优化原版贴吧体验的一组功能",
    description: "这是一个轻量级的工具库，包含了诸如重新加载错误头像等实用功能。",
    scope: true,
    runAt: "immediately",
    settings: {
        reloadAvatars: {
            title: "重新加载错误头像",
            widgets: [{
                type: "toggle",
                content: `将偶尔无法正常显示的头像资源链接到正常的 URL`,
                init: () => toolkitToggles.get().reloadAvatars,
                event() {
                    toolkitToggles.merge({ reloadAvatars: !toolkitToggles.get().reloadAvatars });
                },
            }],
        },
    } as Record<string, SettingContent>,
    entry: function () {
        syncToolkitFeatures(toolkitToggles.get());
    },
} as UserModuleEx;

interface ToolkitToggles {
    reloadAvatars: boolean;
}

const TOOLKIT_TOGGLES_KEY = "toolkitToggles";
const TOOLKIT_TOGGLES_DEFAULT: ToolkitToggles = {
    reloadAvatars: true,
};

const toolkitToggles = new UserKey<ToolkitToggles, unknown>(
    TOOLKIT_TOGGLES_KEY,
    TOOLKIT_TOGGLES_DEFAULT,
    undefined,
    normalizeToolkitToggles,
);

let reloadAvatarsEnabled = false;
let reloadAvatarsRegistered = false;
let avatarObserver: IntersectionObserver | undefined;
let avatarEventController: AbortController | undefined;

toolkitToggles.on("setter", syncToolkitFeatures);

function syncToolkitFeatures(toggles: ToolkitToggles): void {
    setReloadAvatarsEnabled(toggles.reloadAvatars);
}

function setReloadAvatarsEnabled(enabled: boolean): void {
    if (reloadAvatarsEnabled === enabled) return;
    reloadAvatarsEnabled = enabled;

    if (!enabled) {
        avatarObserver?.disconnect();
        avatarObserver = undefined;
        avatarEventController?.abort();
        avatarEventController = undefined;
        return;
    }

    avatarEventController = new AbortController();
    avatarObserver = new IntersectionObserver(handleAvatarIntersections, { threshold: 0 });
    if (!reloadAvatarsRegistered) {
        reloadAvatarsRegistered = true;
        threadCommentsObserver.addEvent(scanAvatars);
    } else {
        scanAvatars();
    }
}

function scanAvatars(): void {
    if (!reloadAvatarsEnabled || !avatarObserver) return;
    const avatars = dom<"img">(".lzl_single_post img:not(.BDE_Smiley, [data-loaded])", []);
    avatars.forEach(avatar => avatarObserver?.observe(avatar));
}

function handleAvatarIntersections(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        processAvatar(entry.target as HTMLImageElement);
    });
}

function processAvatar(avatar: HTMLImageElement): void {
    if (!reloadAvatarsEnabled) return;
    avatarObserver?.unobserve(avatar);

    if (!avatar.complete) {
        const signal = avatarEventController?.signal;
        if (!signal) return;
        const onSettled = () => {
            avatar.removeEventListener("load", onSettled);
            avatar.removeEventListener("error", onSettled);
            processAvatar(avatar);
        };
        avatar.addEventListener("load", onSettled, { once: true, signal });
        avatar.addEventListener("error", onSettled, { once: true, signal });
        return;
    }

    if (avatar.naturalWidth > 0) {
        avatar.setAttribute("data-loaded", "");
        return;
    }

    const userCard = findParent<"li">(avatar, "j_user_card");
    const portrait = parsePortrait(userCard?.getAttribute("data-field"));
    if (!portrait) return;
    avatar.src = tiebaAPI.URL_profile(portrait);
    avatar.setAttribute("data-loaded", "");
}

function parsePortrait(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    const candidates = value.includes("'") ? [value, value.replace(/'/g, '"')] : [value];
    for (const candidate of candidates) {
        try {
            const parsed = JSON.parse(candidate) as { id?: unknown };
            if (typeof parsed.id === "string" && parsed.id) return parsed.id;
        } catch {
            continue;
        }
    }
    return undefined;
}

function normalizeToolkitToggles(value: unknown): ToolkitToggles {
    if (typeof value !== "object" || value === null) return TOOLKIT_TOGGLES_DEFAULT;
    const stored = value as Partial<ToolkitToggles>;
    return {
        reloadAvatars: typeof stored.reloadAvatars === "boolean"
            ? stored.reloadAvatars
            : TOOLKIT_TOGGLES_DEFAULT.reloadAvatars,
    };
}
