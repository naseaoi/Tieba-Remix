import type { UserModuleManifest } from "@/lib/common/packer";

export const userModuleManifests: UserModuleManifest[] = [
    {
        id: "easy-jump",
        scope: /jump2?.bdimg.com\/safecheck\//,
        runAt: "immediately",
        loader: () => import("./easy-jump"),
    },
    {
        id: "nologin-tieba",
        scope: ["index", "forum", "thread"],
        runAt: "afterHead",
        loader: () => import("./no-login"),
    },
    {
        id: "notrans-emojis",
        scope: true,
        runAt: "afterHead",
        loader: () => import("./notrans-emojis"),
    },
    {
        id: "poll-display",
        scope: ["thread"],
        runAt: "DOMLoaded",
        loader: () => import("./poll-display"),
    },
    {
        id: "portal",
        scope: ["thread"],
        runAt: "immediately",
        loader: () => import("./portal"),
    },
    {
        id: "remixed-theme",
        scope: true,
        runAt: "immediately",
        loader: () => import("./remixed-theme"),
    },
    {
        id: "shield",
        scope: true,
        runAt: "immediately",
        loader: () => import("./shield"),
    },
    {
        id: "thread-agree-count",
        scope: ["thread"],
        runAt: "DOMLoaded",
        loader: () => import("./thread-agree-count"),
    },
    {
        id: "tieba-tags",
        scope: ["thread"],
        runAt: "loaded",
        loader: () => import("./tieba-tags"),
    },
    {
        id: "toolkit",
        scope: true,
        runAt: "immediately",
        loader: () => import("./toolkit"),
    },
];
