import { GM_getValue, GM_info, GM_listValues, GM_openInTab, GM_setValue } from "$";
import { GiteeRelease, GiteeReleaseNotFound, Owner, RepoName, ignoredTag, latestRelease, showUpdateToday, themeType, updateConfig } from "@/lib/user-values";
import { outputFile, selectLocalFile, spawnOffsetTS, waitUntil } from "@/lib/utils";
import _ from "lodash";
import { marked } from "marked";
import { messageBox, toast } from "user-view";
import { parseCSSRule } from "../elemental/styles";
import { userDialog } from "../render";
import { darkPrefers } from "../theme";

export type PageType = "index" | "thread" | "forum" | "user" | "unhandled"

marked.setOptions({});

// function dt2PageType(s: string): PageType {
//     switch (s) {
//         case "index":
//             return "index";
//         case "pb_bright":
//             return "thread";
//         case "frs":
//             return "forum";
//         case "main":
//             return "user";
//         default:
//             return "unhandled";
//     }
// }

/**
 * 获取当前页面的类型
 * @returns 当前页面的类型
 */
export function currentPageType(): PageType {
    // if (PageData) return dt2PageType(PageData.page);

    if (location.hostname.toLowerCase() !== "tieba.baidu.com") return "unhandled";

    const pathname = location.pathname.toLocaleLowerCase();

    if (_.includes(["/", "/index.html"], pathname)) return "index";
    if (/\/p\/\d+/.test(pathname)) return "thread";
    if (pathname === "/f") return "forum";
    if (pathname === "/home/main") return "user";

    return "unhandled";
}

export type ReleaseFetchErrorKind = "disabled" | "ratelimit" | "network" | "server" | "notfound";

export interface ReleaseFetchOutcome {
    release?: GiteeRelease;
    errorKind?: ReleaseFetchErrorKind;
    errorMessage?: string;
}

/** 拉取最新 Release，区分成功 / 禁用 / 速率限制 / 网络 / 服务器 / 未找到 */
export async function getLatestReleaseFromGitee(forceUpdate = false): Promise<ReleaseFetchOutcome> {
    if (latestRelease.get() && !forceUpdate) {
        return { release: latestRelease.get() };
    }

    const TTL = (function () {
        switch (updateConfig.get().time) {
            case "1h": return 1;
            case "3h": return 3;
            case "6h": return 6;
            case "never": return -1;
        }
    })();

    if (TTL < 0) {
        return { errorKind: "disabled", errorMessage: "自动检查更新已关闭，请前往「检查更新设置」开启" };
    }

    const updateUrl = `https://api.github.com/repos/${Owner}/${RepoName}/releases/latest`;

    let response: Response;
    try {
        response = await fetch(updateUrl);
    } catch (err) {
        return {
            errorKind: "network",
            errorMessage: `网络请求失败：${(err as Error)?.message ?? "未知错误"}`,
        };
    }

    if (response.status === 403 || response.status === 429) {
        return { errorKind: "ratelimit", errorMessage: "GitHub 接口请求频率限制，请稍后再试" };
    }
    if (response.status === 404) {
        return { errorKind: "notfound", errorMessage: "尚未发布任何 Release" };
    }
    if (!response.ok) {
        return {
            errorKind: "server",
            errorMessage: `请求失败：HTTP ${response.status} ${response.statusText}`,
        };
    }

    let result: any;
    try {
        result = await response.json();
    } catch {
        return { errorKind: "server", errorMessage: "响应解析失败" };
    }

    if ((result as GiteeReleaseNotFound)?.message && !result?.tag_name) {
        return { errorKind: "server", errorMessage: (result as GiteeReleaseNotFound).message };
    }

    if (result?.author && !result.author.name) {
        result.author.name = result.author.login;
    }

    latestRelease.set(result, spawnOffsetTS(0, 0, 0, TTL));
    return { release: result };
}

export function checkUpdateAndNotify(showLatest = false) {
    // 不追踪发行信息
    if (updateConfig.get().time === "never") return;
    // 静默
    if (!updateConfig.get().notify) return;
    // 今日已不能再提醒
    if (!showUpdateToday.get()) return;

    // 开发者专用
    if (GM_info.script.version === "developer-only") return;

    getLatestReleaseFromGitee().then(({ release: latestRelease }) => {
        if (latestRelease && latestRelease.tag_name.slice(1) !== GM_info.script.version) {
            // 忽略当前版本
            if (ignoredTag.get() === latestRelease.tag_name) return;

            userDialog(
                <div class="markdown"
                    v-html={marked(latestRelease.body)}
                    style={parseCSSRule({ maxWidth: "600px" })} />,
                {
                    title: latestRelease.name,
                    dialogButtons: [
                        {
                            text: "安装",
                            event() {
                                installFromRelease(latestRelease);
                                return true;
                            },
                            style: "themed",
                        },
                        {
                            text: "今日不再提醒",
                            event() {
                                showUpdateToday.set(false);
                                return true;
                            },
                        },
                        {
                            text: "跳过该版本",
                            event() {
                                ignoredTag.set(latestRelease.tag_name);
                                return true;
                            },
                        },
                    ],
                });
        } else {
            if (showLatest)
                messageBox({
                    title: "检查更新",
                    content: "当前已是最新版本",
                    type: "okCancel",
                });
        }
    });
}

export function installFromRelease(release: GiteeRelease) {
    function notFound() {
        toast({
            message: "安装失败：未找到可用的资源",
            type: "error",
            duration: 6000,
            blurEffect: true,
        });
    }

    const asset = resolveReleaseInstallUrl(release);

    if (asset) {
        GM_openInTab(asset, {
            active: true,
        });
    } else {
        notFound();
        return;
    }
}

export function resolveReleaseInstallUrl(release: GiteeRelease) {
    if (!release.tag_name) return undefined;

    if (release.assets && release.assets.length > 0) {
        for (const asset of release.assets) {
            if (asset.name && asset.name.endsWith(".user.js")) {
                return asset.browser_download_url;
            }
        }
    }

    return `https://raw.githubusercontent.com/${Owner}/${RepoName}/${release.tag_name}/build/tieba-remix.user.js`;
}

export function getResource(path: string) {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `https://raw.githubusercontent.com/${Owner}/${RepoName}/master/${cleanPath}`;
}

export function setTheme(theme: ReturnType<typeof themeType.get>) {
    switch (theme) {
        case "dark":
            darkTheme();
            break;

        case "light":
            lightTheme();
            break;

        case "auto":
        default:
            darkPrefers.matches ? darkTheme() : lightTheme();
            break;
    }

    function lightTheme() {
        document.documentElement.classList.add("light-theme");
        document.documentElement.classList.remove("dark-theme");
        document.documentElement.classList.remove("dark");

        waitUntil(() => !_.isNil(document.body)).then(function () {
            document.body.classList.remove("dark-theme");
        });
    }

    function darkTheme() {
        document.documentElement.classList.add("dark-theme");
        document.documentElement.classList.remove("light-theme");
        document.documentElement.classList.add("dark");

        waitUntil(() => !_.isNil(document.body)).then(function () {
            document.body.classList.add("dark-theme");
        });
    }
}

export function backupUserConfigs() {
    const excluded = ["unreadFeeds", "latestRelease", "showUpdateToday"];
    const userKeys = _.filter(GM_listValues(), key => !_.includes(excluded, key));
    const userValues = _.map(userKeys, key => {
        return GM_getValue(key);
    });
    const configs = _.zipObject(userKeys, userValues);
    outputFile(`tieba-remix-backup@${new Date().getTime()}.json`, JSON.stringify(configs));
}

export async function restoreUserConfigs() {
    const backupData = JSON.parse(await selectLocalFile());
    _.forEach(Object.entries(backupData), ([key, value]) => {
        GM_setValue(key, value);
    });
}
