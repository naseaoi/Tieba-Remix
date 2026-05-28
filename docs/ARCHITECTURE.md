# 项目架构

油猴用户脚本，给百度贴吧 web 端做增强。Vue 3 + TS + Vite 6 + `vite-plugin-monkey`，入口 [`src/main.ts`](../src/main.ts)，产物 `build/tieba-remix.user.js`。

## 构建命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | dev 服务器，提供 user.js 安装链接给油猴热重载 |
| `pnpm build` | 类型检查 + terser 压缩 |
| `pnpm build-dev` | 不压缩，便于线上调试 |
| `pnpm lint` | ESLint 9 flat config |

发布走 tag 触发 CI，见 [`push-git.md`](./push-git.md)。

## userscript metadata

全部在 [`vite.config.ts`](../vite.config.ts) 的 `scriptOptions.userscript`：

- `match` — 启用页面
- `connect` — **跨域白名单**，必须显式列出，否则 `GM_xmlhttpRequest` 拒绝
- `version` — 不要手改，CI 从 tag 注入
- `@grant` — **不要手写**，`vite-plugin-monkey` 按代码里的 `import { GM_xxx } from "$"` 自动生成

## 启动流程

[`src/main.ts`](../src/main.ts)：

```
setupLegacyRedirect(bootstrap)     ← 新版 SPA 通过 cookie 切回旧版才会调 bootstrap
  └─ bootstrap
      ├─ GM_registerMenuCommand("设置", ...)
      ├─ 主题 / 导航栏 / 页面类型 attribute 注入（尽早避免闪屏）
      ├─ installXxx() —— 固定装置，src/lib/tieba-components/ 下
      ├─ index() / thread() —— page-extension
      ├─ parseUserModules(import.meta.glob("./modules/**/index.ts"))
      └─ observers.observe()
```

新功能优先做成 **模块**（用户可在"设置 → 模块"开关）。临时小补丁才用 `installXxx`。

## 新增模块（最常见任务）

1. 新建 `src/modules/<id>/index.ts`，默认导出 `UserModule`：

   ```ts
   export default {
       id: "your-id",            // 必须唯一
       name: "显示名",
       author: "...",
       version: "1.0",
       brief: "一句话简介",
       description: "详细说明",
       scope: ["thread"],         // true | PageType[] | RegExp
       runAt: "DOMLoaded",        // immediately | afterHead | DOMLoaded | loaded
       entry: main,
   } as UserModule;
   ```

2. 完成。模块自动被 [`src/lib/common/packer.ts`](../src/lib/common/packer.ts) 加载，自动出现在设置 → 模块里，自带启停开关（通过 `disabledModules` UserKey）。

需要子开关时把类型换成 `UserModuleEx`（[`src/ex.d.ts`](../src/ex.d.ts)），加 `settings` 字段，参考 [`src/modules/toolkit/index.ts`](../src/modules/toolkit/index.ts)。完整 + 跨域 + Vue 组件的样板见 [`src/modules/poll-display/`](../src/modules/poll-display/)。

`PageType`：`index` / `thread` / `forum` / `user` / `unhandled`，由 [`currentPageType()`](../src/lib/api/remixed.ts) 决定。

## 关键基础设施

| 干什么 | 用什么 | 在哪 |
| --- | --- | --- |
| 配置持久化 | `UserKey<T>` / `UserKeyTS<T>` | [`src/lib/user-values.ts`](../src/lib/user-values.ts) |
| 油猴 API | `GM_getValue` / `GM_addStyle` / `gmRequest` 等 | [`src/lib/monkey.ts`](../src/lib/monkey.ts) |
| DOM 选择 | `dom` / `asyncdom` / `domrd` / `findParent` | [`src/lib/elemental/`](../src/lib/elemental/) |
| Vue/JSX 挂载 | `appendJSX` / `insertJSX` / `renderDialog` | [`src/lib/render/`](../src/lib/render/) |
| 共享 observers | `threadFloorsObserver` / `threadCommentsObserver` / `forumThreadsObserver` | [`src/lib/observers.ts`](../src/lib/observers.ts) |
| 贴吧官方接口 | `tiebaAPI`（同源 `fetch`） | [`src/lib/api/tieba.ts`](../src/lib/api/tieba.ts) |
| 页面数据 | `PageData.thread.thread_id` 等 | [`src/PageData.d.ts`](../src/PageData.d.ts) |

**不要绕过这些**：持久化只用 `UserKey`、跨域只用 `gmRequest`、DOM 操作优先用 `elemental`。

## 跨域规则

| 目标 | 方法 |
| --- | --- |
| `tieba.baidu.com` / 同源 / 带 CORS | `fetch()`，可复用登录态 cookie |
| 贴吧 App 接口（`tiebac.baidu.com` 等） | **必须** `gmRequest()`，且先在 `vite.config.ts` 的 `userscript.connect` 加白名单 |

`gmRequest` 不允许覆盖 `User-Agent` 头。

## 常用 DOM 选择器

| 用途 | 选择器 |
| --- | --- |
| 帖子页楼层容器 | `#j_p_postlist` |
| 单个楼层 | `.l_post` |
| 楼层正文 | `.d_post_content_main` / `.d_post_content` |
| 楼中楼条目 | `.lzl_single_post` |
| 楼中楼内容 | `.lzl_cnt .lzl_content_main` |
| 吧首页帖子列表 | `#pagelet_frs-list/pagelet/thread` |

## 主题 CSS 变量

`--tieba-theme-color` / `-background` / `-hover` / `-active` / `-fore`、`--default-background`、`--minimal-fore` / `-2` / `-3` / `-4`（数字越大越浅）。主题模式通过 `<html>` 上的 `data-page-type` / `glass-effect` / `data-nav-bar-mode` 切换。

## 陷阱

1. **预览版改动只进 preview 分支**。正式版通过 PR 合并到 main
2. **`PageData.pager.cur_page > 1` 时帖子页没有首楼**。改首楼的模块必先判 `=== 1`
3. **跨贴吧 App 域不能用 `fetch`**。CORS 必拦
4. **新版 SPA 上 `PageData` 不存在**。`setupLegacyRedirect` 会拦截，新版页面不应注入任何东西
5. **不要复制 `disabledModules` 机制**。整模块开关已经天然支持

## 目录速查

```
src/
├── main.ts                   启动入口
├── global.d.ts               UserModule / TiebaPost 等全局类型
├── PageData.d.ts             贴吧全局 PageData 类型
├── ex.d.ts                   UserModuleEx 扩展类型
├── components/               全局共享 Vue 组件
├── lib/
│   ├── monkey.ts             GM API 封装
│   ├── user-values.ts        UserKey + 各种持久化配置
│   ├── elemental/            DOM 工具
│   ├── observers.ts          共享 MutationObserver
│   ├── render/               Vue / JSX 挂载工具
│   ├── theme/                主题、page-extension
│   ├── tieba-components/     installXxx 固定补丁
│   ├── api/                  remixed / tieba 接口客户端
│   ├── common/               packer + settings 面板定义
│   └── legacy-redirect.ts    新版 SPA → 旧版切换
├── modules/                  可在设置里开关的功能模块
└── stylesheets/              全局样式 + SCSS mixin
```
