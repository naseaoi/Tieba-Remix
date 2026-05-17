import { GM_deleteValue, GM_listValues } from "@/lib/monkey";
import { NavBarHideMode } from "@/components/nav-bar.vue";
import { MainSettingKey, SettingContent, SubSettingKey, UserSettings } from "@/components/settings.vue";
import { backupUserConfigs, restoreUserConfigs } from "@/lib/api/remixed";
import { UpdateConfig, compactLayout, customStyle, disabledModules, fontWeights, glassEffect, monospaceFonts, navBarHideMode, pageExtension, showBottomEditor, styleTheme, themeType, threadImageQueueScope, updateConfig, userFonts } from "@/lib/user-values";
import { AllModules } from "@/lib/utils";
import _ from "@/lib/utils/_";
import { UserSelectItem, messageBox } from "user-view";
import { markRaw } from "vue";
import AboutDetail from "./setting-widgets/about.detail.vue";
import AboutUpdate from "./setting-widgets/about.update.vue";
import LayoutCustomBack from "./setting-widgets/layout.custom-back.vue";
import ThemeColor from "./setting-widgets/theme.color.vue";

export const getUserSettings = _.once((): UserSettings => ({
    "visibility": {
        name: "显示",
        icon: "visibility",
        description: "主题、显示设置",
        sub: {
            "theme": {
                name: "主题",
                content: {
                    "switch-theme": {
                        title: "主题偏好",
                        description:
                            `在自动模式下，将根据当前系统设置自动选择合适的主题`,
                        widgets: [{
                            type: "select",
                            content: [
                                { value: "auto", text: "自动", desc: "根据系统设置自动切换主题" },
                                { value: "dark", text: "深色", desc: "使用深色主题" },
                                { value: "light", text: "浅色", desc: "使用浅色主题" },
                            ] as UserSelectItem<ReturnType<typeof themeType.get>>[],
                            init() {
                                return themeType.get();
                            },
                            event(theme: ReturnType<typeof themeType.get>) {
                                themeType.set(theme);
                            },
                        }],
                    },

                    "style-theme": {
                        title: "样式风格",
                        description:
                            `提供两套视觉主题，切换后即时生效`,
                        widgets: [{
                            type: "select",
                            content: [
                                { value: "remixed", text: "Remixed", desc: "脚本默认风格，圆润色彩与品牌紫" },
                                { value: "vercel", text: "Vercel", desc: "极简中性，吧首页帖子列表为卡片网格" },
                            ] as UserSelectItem<ReturnType<typeof styleTheme.get>>[],
                            init() {
                                return styleTheme.get();
                            },
                            event(value: ReturnType<typeof styleTheme.get>) {
                                styleTheme.set(value);
                            },
                        }],
                    },

                    "glass-effect": {
                        title: "磨砂玻璃质感",
                        description:
                            `为导航栏、首页标题栏、下拉菜单等元素启用磨砂玻璃背景效果`,
                        widgets: [{
                            type: "toggle",
                            content: `关闭后，所有使用到磨砂玻璃质感的位置都将回退为普通半透明背景`,
                            init() {
                                return glassEffect.get();
                            },
                            event() {
                                glassEffect.set(!glassEffect.get());
                                return glassEffect.get();
                            },
                        }],
                    },

                    "color": {
                        title: "主题颜色",
                        description:
                            `自定义主题色，由于存在深浅两种主题，需要设置两种主题色。`,
                        widgets: [{
                            type: "component",
                            component: markRaw(ThemeColor),
                        }],
                    },
                },
            },

            "layout": {
                name: "页面布局",
                content: {
                    "compact-layout": {
                        title: "紧凑布局",
                        widgets: [{
                            type: "toggle",
                            content: `对部分页面应用更紧凑的布局以提高信息密度。当前会受到影响的页面有：新版看贴页面`,
                            init() {
                                return compactLayout.get();
                            },
                            event() {
                                compactLayout.set(!compactLayout.get());
                                document.body.toggleAttribute("compact-layout");
                                return compactLayout.get();
                            },
                        }],
                    },

                    "forum-bottom-editor": {
                        title: "显示吧首页底部发帖模块",
                        widgets: [{
                            type: "toggle",
                            content: `开启后会在吧首页底部显示贴吧原生的发帖编辑器`,
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

                    "custom-background": {
                        widgets: [{
                            type: "component",
                            component: markRaw(LayoutCustomBack),
                        }],
                    },

                    "nav-bar-mode": {
                        title: "导航栏隐藏模式",
                        description:
                            `设置导航栏的隐藏模式`,
                        widgets: [{
                            type: "select",
                            content: [
                                { value: "fold", text: "滚动隐藏", desc: "当页面向下滚动时隐藏导航栏，将鼠标移至屏幕最顶端可重新呼出" },
                                { value: "alwaysFold", text: "始终隐藏", desc: "导航栏始终保持隐藏，将鼠标移至屏幕最顶端可呼出" },
                                { value: "never", text: "始终显示", desc: "始终显示完整的导航栏" },
                            ] as UserSelectItem<NavBarHideMode>[],
                            init() {
                                return navBarHideMode.get();
                            },
                            event(hideMode: NavBarHideMode) {
                                navBarHideMode.set(hideMode);
                            },
                        }],
                    },
                },
            },

            "page-extension": {
                name: "页面扩展",
                content: {
                    "index": {
                        title: "首页扩展",
                        widgets: [{
                            type: "toggle",
                            content: `首页扩展旨在提供更纯粹的浏览体验，提供管理关注的吧、贴吧热议、瀑布流推送等功能`,
                            init() {
                                return pageExtension.get().index;
                            },
                            event() {
                                pageExtension.merge({ index: !pageExtension.get().index });
                                return pageExtension.get().index;
                            },
                        }],
                    },

                    "thread": {
                        title: "帖子浏览页面扩展",
                        widgets: [{
                            type: "toggle",
                            content: `使用全新的 UI 简化帖子浏览，并改进屏幕空间利用率`,
                            init() {
                                return pageExtension.get().thread;
                            },
                            event() {
                                pageExtension.merge({ thread: !pageExtension.get().thread });
                                return pageExtension.get().thread;
                            },
                        }],
                    },

                    "thread-image-queue": {
                        title: "看图模式加载全帖图片",
                        description:
                            `控制看图模式打开时的图片队列范围`,
                        widgets: [{
                            type: "toggle",
                            content: `开启时加载整个帖子的所有图片到队列；关闭时仅加载当前楼层中的图片`,
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
                } as Record<string, SettingContent>,
            },

            "fonts": {
                name: "字体",
                content: {
                    "code-zh": {
                        title: "主要字体组合",
                        description:
                            `应用在贴吧绝大多数场景的字体组合`,
                        widgets: [{
                            type: "textarea",
                            placeHolder: "填入字体名，以换行分隔。若需要中英文混排，需将英文字体写在中文字体之前",
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
                        title: "等宽字体组合",
                        description: `应用在数据显示等场景的等宽字体组合`,
                        widgets: [{
                            type: "textarea",
                            placeHolder: "填入字体名，以换行分隔。建议在此处写入等宽字体",
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
                        title: "字重调整",
                        description:
                            `设置字体的字重`,
                        widgets: [
                            {
                                type: "subTitle",
                                content: "默认字重",
                            },
                            {
                                type: "textbox",
                                placeHolder: "默认字重",
                                init() {
                                    return fontWeights.get().normal;
                                },
                                event(e) {
                                    const newValue = (e.target as HTMLInputElement).value;
                                    fontWeights.merge({ normal: +newValue });
                                },
                            },
                            {
                                type: "subTitle",
                                content: "粗体字重",
                            },
                            {
                                type: "textbox",
                                placeHolder: "粗体字重",
                                init() {
                                    return fontWeights.get().bold;
                                },
                                event(e) {
                                    const newValue = (e.target as HTMLInputElement).value;
                                    fontWeights.merge({ bold: +newValue });
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
        icon: "deployed_code",
        description: "用户模块管理及部署",
        sub: AllModules().filter(m => m.id !== "remixed-theme").reduce<Record<string, SubSettingKey>>((accu, curr) => {
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
        icon: "labs",
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
                name: "重置所有配置",
                content: {
                    "reset": {
                        title: "重置所有配置",
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
