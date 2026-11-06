import { GM_deleteValue, GM_listValues } from "@/lib/monkey";
import { Boxes, Eye, FlaskConical } from "@lucide/vue";
import type { NavBarHideMode } from "@/components/nav-bar.vue";
import type { MainSettingKey, SubSettingKey, UserSettings } from "@/components/settings.vue";
import { backupUserConfigs, restoreUserConfigs } from "@/lib/api/remixed";
import { AvatarShape, UpdateConfig, avatarShape, compactLayout, customStyle, disabledModules, fontWeights, forumStickyNav, forumThreadModernLayout, glassEffect, monospaceFonts, navBarHideMode, pageExtension, showBottomEditor, themeType, threadImageQueueScope, updateConfig, userFonts } from "@/lib/user-values";
import { AllModules } from "@/lib/utils";
import _ from "@/lib/utils/_";
import { UserSelectItem, messageBox, toast } from "user-view";
import { markRaw } from "vue";
import AboutDetail from "./setting-widgets/about.detail.vue";
import AboutUpdate from "./setting-widgets/about.update.vue";
import LayoutCustomBack from "./setting-widgets/layout.custom-back.vue";
import ThemeColor from "./setting-widgets/theme.color.vue";

function notifyReloadRequired() {
    toast({ message: "刷新页面后生效", type: "basic" });
}

function parseFontWeight(value: string) {
    const weight = Number(value);
    return Number.isInteger(weight) && weight >= 1 && weight <= 1000 ? weight : undefined;
}

export const getUserSettings = _.once((): UserSettings => ({
    "visibility": {
        name: "显示",
        icon: Eye,
        description: "主题、布局与字体",
        sub: {
            "theme": {
                name: "主题样式",
                content: {
                    "switch-theme": {
                        title: "主题模式",
                        description: "深色、浅色或跟随系统自动切换",
                        widgets: [{
                            type: "select",
                            content: [
                                { value: "auto", text: "跟随系统", desc: "根据系统设置自动切换深色、浅色" },
                                { value: "dark", text: "深色" },
                                { value: "light", text: "浅色" },
                            ] as UserSelectItem<ReturnType<typeof themeType.get>>[],
                            init() {
                                return themeType.get();
                            },
                            event(theme: ReturnType<typeof themeType.get>) {
                                themeType.set(theme);
                            },
                        }],
                    },

                    "color": {
                        title: "强调色",
                        description: "用于点赞、焦点、进度条等强调元素",
                        widgets: [{
                            type: "component",
                            component: markRaw(ThemeColor),
                        }],
                    },

                    "avatar-shape": {
                        title: "头像形状",
                        description: "帖子列表、楼层与楼中楼中的用户头像",
                        widgets: [{
                            type: "select",
                            content: [
                                { value: "circle", text: "圆形" },
                                { value: "rounded", text: "圆角矩形" },
                            ] as UserSelectItem<AvatarShape>[],
                            init() {
                                return avatarShape.get();
                            },
                            event(shape: AvatarShape) {
                                avatarShape.set(shape);
                            },
                        }],
                    },

                    "glass-effect": {
                        title: "磨砂玻璃质感",
                        description: "导航栏、下拉菜单等浮层使用模糊背景",
                        widgets: [{
                            type: "toggle",
                            init() {
                                return glassEffect.get();
                            },
                            event() {
                                glassEffect.set(!glassEffect.get());
                                return glassEffect.get();
                            },
                        }],
                    },

                    "custom-background": {
                        widgets: [{
                            type: "component",
                            component: markRaw(LayoutCustomBack),
                        }],
                    },
                },
            },

            "layout": {
                name: "页面布局",
                content: {
                    "index": {
                        title: "全新首页",
                        description: "集中展示关注的吧、贴吧热议与瀑布流推送",
                        widgets: [{
                            type: "toggle",
                            init() {
                                return pageExtension.get().index;
                            },
                            event() {
                                pageExtension.merge({ index: !pageExtension.get().index });
                                notifyReloadRequired();
                                return pageExtension.get().index;
                            },
                        }],
                    },

                    "forum-thread-modern": {
                        title: "新版帖子列表",
                        description: "重排吧首页帖子的作者信息、正文与互动栏",
                        widgets: [{
                            type: "toggle",
                            init() {
                                return forumThreadModernLayout.get();
                            },
                            event() {
                                forumThreadModernLayout.set(!forumThreadModernLayout.get());
                                return forumThreadModernLayout.get();
                            },
                        }],
                    },

                    "forum-bottom-editor": {
                        title: "吧首页底部发帖框",
                        description: "在帖子列表下方显示贴吧原生发帖编辑器",
                        widgets: [{
                            type: "toggle",
                            init() {
                                return showBottomEditor.get();
                            },
                            event() {
                                const next = !showBottomEditor.get();
                                showBottomEditor.set(next);
                                document.body.toggleAttribute("hide-bottom-editor", !next);
                                return next;
                            },
                        }],
                    },

                    "thread": {
                        title: "新版看帖页面",
                        description: "精简帖子页界面，扩大正文阅读区域",
                        widgets: [{
                            type: "toggle",
                            init() {
                                return pageExtension.get().thread;
                            },
                            event() {
                                pageExtension.merge({ thread: !pageExtension.get().thread });
                                notifyReloadRequired();
                                return pageExtension.get().thread;
                            },
                        }],
                    },

                    "compact-layout": {
                        title: "紧凑楼层",
                        description: "缩小新版看帖页面的楼层间距，单屏显示更多内容",
                        disabled: () => !pageExtension.get().thread,
                        widgets: [{
                            type: "toggle",
                            init() {
                                return compactLayout.get();
                            },
                            event() {
                                const next = !compactLayout.get();
                                compactLayout.set(next);
                                document.body.toggleAttribute("compact-layout", next);
                                return next;
                            },
                        }],
                    },
                },
            },

            "browsing": {
                name: "浏览交互",
                content: {
                    "nav-bar-mode": {
                        title: "顶部导航栏",
                        widgets: [{
                            type: "select",
                            content: [
                                { value: "fold", text: "滚动时隐藏", desc: "向下滚动时隐藏，鼠标移至屏幕顶端可呼出" },
                                { value: "alwaysFold", text: "始终隐藏", desc: "鼠标移至屏幕顶端可呼出" },
                                { value: "never", text: "始终显示" },
                            ] as UserSelectItem<NavBarHideMode>[],
                            init() {
                                return navBarHideMode.get();
                            },
                            event(hideMode: NavBarHideMode) {
                                navBarHideMode.set(hideMode);
                            },
                        }],
                    },

                    "forum-sticky-nav": {
                        title: "吧内标签栏吸顶",
                        description: "滚动吧首页时，「看贴」「图片」等标签栏固定在顶部并显示吧名",
                        widgets: [{
                            type: "toggle",
                            init() {
                                return forumStickyNav.get();
                            },
                            event() {
                                forumStickyNav.set(!forumStickyNav.get());
                                return forumStickyNav.get();
                            },
                        }],
                    },

                    "thread-image-queue": {
                        title: "看图浏览全帖图片",
                        description: "看图模式中可切换整个帖子的图片，关闭后仅浏览当前楼层",
                        widgets: [{
                            type: "toggle",
                            init() {
                                return threadImageQueueScope.get() === "full";
                            },
                            event() {
                                const next = threadImageQueueScope.get() === "full" ? "floor" : "full";
                                threadImageQueueScope.set(next);
                                return next === "full";
                            },
                        }],
                    },
                },
            },

            "fonts": {
                name: "字体",
                content: {
                    "code-zh": {
                        title: "正文字体",
                        description: "每行一个字体，按顺序回退",
                        widgets: [{
                            type: "textarea",
                            placeHolder: "中英文混排时，英文字体写在中文字体之前",
                            init() {
                                return userFonts.get().join("\n");
                            },
                            event(e) {
                                userFonts.set(((e.target as HTMLInputElement).value).split("\n"));
                                return userFonts.get().join("\n");
                            },
                        }],
                    },

                    "code-monospace": {
                        title: "等宽字体",
                        description: "用于数字、代码等需要对齐的内容",
                        widgets: [{
                            type: "textarea",
                            placeHolder: "每行一个字体，按顺序回退",
                            init() {
                                return monospaceFonts.get().join("\n");
                            },
                            event(e) {
                                monospaceFonts.set(((e.target as HTMLInputElement).value).split("\n"));
                                return monospaceFonts.get().join("\n");
                            },
                        }],
                    },

                    "font-weights": {
                        title: "字重",
                        widgets: [
                            {
                                type: "subTitle",
                                content: "常规",
                            },
                            {
                                type: "textbox",
                                placeHolder: "默认字重",
                                init() {
                                    return fontWeights.get().normal;
                                },
                                event(e) {
                                    const weight = parseFontWeight((e.target as HTMLInputElement).value);
                                    if (weight) fontWeights.merge({ normal: weight });
                                },
                            },
                            {
                                type: "subTitle",
                                content: "粗体",
                            },
                            {
                                type: "textbox",
                                placeHolder: "粗体字重",
                                init() {
                                    return fontWeights.get().bold;
                                },
                                event(e) {
                                    const weight = parseFontWeight((e.target as HTMLInputElement).value);
                                    if (weight) fontWeights.merge({ bold: weight });
                                },
                            },
                        ],
                    },
                },
            },
        },
    },

    "modules": {
        name: "模块",
        icon: Boxes,
        description: "用户模块管理及部署",
        sub: AllModules().reduce<Record<string, SubSettingKey>>((accu, curr) => {
            function toSubSettingKey(module: UserModule): SubSettingKey {
                return {
                    name: module.name,
                    description: module.brief,
                    content: {
                        "module-info": {
                            title: module.name,
                            description:
                                `${module.id} ${module.version}`,
                            widgets: [{
                                type: "toggle",
                                content: module.description,
                                init() {
                                    return disabledModules.get().includes(module.id) ? false : true;
                                },
                                event() {
                                    if (disabledModules.get().includes(module.id)) {
                                        const newSet = new Set(disabledModules.get());
                                        newSet.delete(module.id);
                                        disabledModules.set([...newSet]);
                                        return true;
                                    } else {
                                        disabledModules.set([module.id, ...disabledModules.get()]);
                                        return false;
                                    }
                                },
                            }],
                        },

                        ...module.settings,
                    },
                };
            }

            accu[curr.name] = toSubSettingKey(curr);
            return accu;
        }, {}) as MainSettingKey["sub"],
    },

    "enhanced": {
        name: "高级",
        icon: FlaskConical,
        description: "性能、更新与高级设置",
        sub: {
            "backup-recover": {
                name: "备份与恢复",
                content: {
                    "data-backup": {
                        title: "数据备份",
                        description:
                            `备份脚本所有自定义配置`,
                        widgets: [{
                            type: "button",
                            content: "备份",
                            event() {
                                backupUserConfigs();
                            },
                        }],
                    },

                    "recover-backup": {
                        title: "数据恢复",
                        description:
                            `从备份文件中恢复脚本所有自定义配置`,
                        widgets: [{
                            type: "button",
                            content: "恢复",
                            event() {
                                restoreUserConfigs();
                            },
                        }],
                    },
                },
            },

            "custom-style": {
                name: "自定义样式",
                content: {
                    "content": {
                        title: "自定义样式",
                        description:
                            `你可以在这里添加一些自定义的CSS代码，用以覆盖脚本内置的一些样式`,
                        widgets: [{
                            type: "textarea",
                            init() {
                                return customStyle.get();
                            },
                            event(e: Event) {
                                customStyle.set((e.target as HTMLInputElement).value);
                            },
                        }],
                    },
                },
            },

            "factory-reset": {
                name: "重置配置",
                content: {
                    "reset": {
                        title: "重置配置",
                        description:
                            `如果你需要将脚本的一切配置恢复默认，请使用此功能`,
                        widgets: [{
                            type: "button",
                            content: "重置",
                            async event() {
                                if (await messageBox({
                                    title: "重置所有配置",
                                    content: "该操作是不可逆的，请做最后一次确认",
                                    type: "forceTrueFalse",
                                }) === "positive") {
                                    GM_listValues().forEach((key) => {
                                        GM_deleteValue(key);
                                    });
                                    location.reload();
                                }
                            },
                        }],
                    },
                },
            },

            "update": {
                name: "检查更新",
                content: {
                    "update-channel": {
                        title: "更新通道",
                        description:
                            `稳定版提供较为稳定的体验；预览版及时跟进新体验，可能不稳定`,
                        widgets: [{
                            type: "select",
                            content: [
                                { value: "stable", text: "稳定版" },
                                { value: "preview", text: "预览版" },
                            ] as UserSelectItem<UpdateConfig["channel"]>[],
                            init() {
                                return updateConfig.get().channel ?? "stable";
                            },
                            event(channel: UpdateConfig["channel"]) {
                                updateConfig.merge({ channel });
                                // 切换通道后旧通道的缓存仍在另一个 key，下一次检查会拿对应通道的数据
                            },
                        }],
                    },

                    "update-time": {
                        title: "检查更新设置",
                        description:
                            `发行信息追踪频率`,
                        widgets: [{
                            type: "select",
                            content: [
                                { value: "1h", text: "1 小时" },
                                { value: "3h", text: "3 小时" },
                                { value: "6h", text: "6 小时" },
                                { value: "never", text: "从不" },
                            ] as UserSelectItem<UpdateConfig["time"]>[],
                            init() {
                                return updateConfig.get().time;
                            },
                            event(updateTime: UpdateConfig["time"]) {
                                updateConfig.merge({ time: updateTime });
                            },
                        }],
                    },

                    "update-notify": {
                        title: "弹窗更新",
                        widgets: [{
                            type: "toggle",
                            content: `当检测到新版本时会在网页里弹窗提醒`,
                            init() {
                                return updateConfig.get().notify;
                            },
                            event() {
                                updateConfig.merge({ notify: !updateConfig.get().notify });
                            },
                        }],
                    },

                    "update-component": {
                        widgets: [{
                            type: "component",
                            component: markRaw(AboutUpdate),
                        }],
                    },
                },
            },

            "about": {
                name: "关于项目",
                content: {
                    "about-component": {
                        widgets: [{
                            type: "component",
                            component: markRaw(AboutDetail),
                        }],
                    },
                },
            },
        },
    },
}));
