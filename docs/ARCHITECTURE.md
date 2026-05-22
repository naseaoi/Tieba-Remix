# Tieba-Remix 项目架构

> 给后续接手者（含 AI）的快速入门。读完这一篇，应当无需自己从零探索就能新增功能、定位代码、避开常见坑。
>
> 本文不重复 README 的安装/特性介绍，只讲**结构、约定与陷阱**。

## 1. 项目本质

油猴用户脚本（Tampermonkey / Violentmonkey），目标是给百度贴吧 web 端做增强。

- **运行环境**：浏览器 + 用户脚本管理器，源代码经 `vite-plugin-monkey` 打包成单个 `tieba-remix.user.js`
- **技术栈**：Vue 3 + TypeScript + Vite 6 + JSX（Vue JSX runtime）+ SCSS
- **入口**：[`src/main.ts`](../src/main.ts)，挂在 `document-start`
- **产物**：[`build/tieba-remix.user.js`](../build/tieba-remix.user.js)

## 2. 构建系统

| 命令 | 模式 | 用途 |
| --- | --- | --- |
| `npm run dev` | development | Vite 开发服务器，提供 `*.user.js` 安装链接给油猴热重载 |
| `npm run build` | production | 先 `vue-tsc --noEmit` 类型检查，再 terser 压缩，输出 `build/tieba-remix.user.js` |
| `npm run build-dev` | development | 构建未压缩版本，便于线上调试 |
| `npm run build-fork` | fork | fork 分发渠道专用构建 |
| `npm run lint` | — | ESLint 9 flat config |

### Userscript metadata 在哪改

全部在 [`vite.config.ts`](../vite.config.ts) 的 `scriptOptions.userscript` 对象里：

- `match` — 启用的页面（贴吧域 + 跳转中转页）
- `connect` — **跨域白名单**，必须显式列出，否则 `GM_xmlhttpRequest` 会拒绝
- `require` — 外链 CDN
- `@grant` — **不要手写**，`vite-plugin-monkey` 会扫描代码里 `import { GM_xxx } from "$"` 自动生成

### CDN externals

`vite.config.ts` 的 `build.externalGlobals` 把 `vue` / `libelemental` / `user-view` 外置走 jsDelivr，避免重复打包，所以 build 产物里看不到 vue 源码。

## 3. 启动流程

读 [`src/main.ts`](../src/main.ts) 时按此顺序理解：

```
setupLegacyRedirect(bootstrap)        ← 新版 SPA 贴吧通过 cookie 切回旧版后才会调 bootstrap
  └─ bootstrap(signal)
      ├─ waitForCoreMonkeyApis → GM_registerMenuCommand("设置", ...)
      └─ startBootstrap
          ├─ 主题 / 导航栏 / 页面类型 attribute 注入（尽早，避免闪屏）
          ├─ installXxx() —— 一组直接 import 的"固定装置"，针对吧首页/帖子页打补丁
          ├─ loadDynamicCSS + loadMainCSS
          ├─ index() / thread() —— page-extension 入口，对当前页应用扩展
          ├─ parseUserModules(import.meta.glob("./modules/**/index.ts"))
          └─ observers.observe() —— 监听帖子流/楼层/评论变化
```

**关键**：`installXxx()` 与 `parseUserModules()` 是两种并存的扩展方式。

- `installXxx` 是 hard-coded 始终运行的小补丁，写在 [`src/lib/tieba-components/`](../src/lib/tieba-components/) 下
- `modules/` 才是用户可在"设置 → 模块"开关的功能模块。**新功能优先做成模块**

## 4. 模块系统（最重要的一节）

### 4.1 自动注册

[`src/main.ts`](../src/main.ts) 用 `import.meta.glob("./modules/**/index.ts")` 扫描所有模块，无需在任何地方手动注册。

新增模块只需：

```
src/modules/<your-id>/
  ├── index.ts            ← 默认导出 UserModule
  └── ... 其它文件随意（.vue、.scss、辅助 .ts）
```

### 4.2 UserModule 接口

类型定义在 [`src/global.d.ts`](../src/global.d.ts)。

```ts
interface UserModule {
    id: string;                                         // 必须唯一，作为 disabledModules 里的 key
    name: string;                                       // 显示名
    author: string;
    version: string;
    brief: string;                                      // 一句话简介
    description: string;                                // 详细说明
    switch?: boolean;                                   // 强制开关，一般不用
    scope: true | PageType[] | RegExp;                  // 见 4.3
    runAt: "immediately" | "afterHead" | "DOMLoaded" | "loaded";  // 见 4.4
    entry: (() => void);
    // settings?: ...                                   // 见 4.5；用 UserModuleEx 才有类型支持
}
```

参考实现：
- [`src/modules/portal/index.ts`](../src/modules/portal/index.ts) — 最小模块模板
- [`src/modules/toolkit/index.ts`](../src/modules/toolkit/index.ts) — 带 settings 子项 + UserKey 持久化的模板
- [`src/modules/poll-display/index.ts`](../src/modules/poll-display/index.ts) — 完整 Vue 组件挂载 + 跨域 API 调用的模板（见第 12 节）

### 4.3 `scope` 取值

- `true` — 所有匹配的页面都运行
- `string[]` — 指定 `PageType`，由 [`src/lib/api/remixed.ts`](../src/lib/api/remixed.ts) 的 `currentPageType()` 决定，可选值：
  - `"thread"` 帖子页 `tieba.baidu.com/p/<tid>`
  - `"forum"` 吧首页 `tieba.baidu.com/f?kw=xxx`
  - `"index"` 站点首页
  - `"user"` 个人主页
  - `"unhandled"` 兜底
- `RegExp` — 按 `location.href` 匹配

### 4.4 `runAt` 取值

由 [`src/lib/common/packer.ts`](../src/lib/common/packer.ts) 调度：

| 值 | 时机 |
| --- | --- |
| `immediately` | 装载即执行 |
| `afterHead` | `<head>` 解析完成后 |
| `DOMLoaded` | `DOMContentLoaded` 后 |
| `loaded` | `window.load` 后 |

需要操作 DOM 的模块默认选 `DOMLoaded`。需要早期注入样式的选 `afterHead`。

### 4.5 设置面板 —— 自动出现

[`src/lib/common/settings/index.tsx`](../src/lib/common/settings/index.tsx) 的"模块"分类会自动遍历 `AllModules()`，给每个模块生成一张卡片，自带"启用/禁用"开关（通过修改 `disabledModules` UserKey）。

**因此：模块开关无需任何额外代码。** 只要 `id` 合法，新模块就会自动出现在设置 → 模块里。

如果模块内还想暴露细分子开关，把类型从 `UserModule` 升级为 `UserModuleEx`（[`src/ex.d.ts`](../src/ex.d.ts)），在 `settings` 字段里写 `Record<string, SettingContent>`：

```ts
import { UserModuleEx } from "@/ex";
import { UserKey } from "@/lib/user-values";

const toggles = new UserKey("myModuleToggles", { foo: true });

export default {
    id: "my-module",
    // ...
    settings: {
        foo: {
            title: "Foo 开关",
            widgets: [{
                type: "toggle",
                content: "做什么的说明",
                init: () => toggles.get().foo,
                event() { toggles.merge({ foo: !toggles.get().foo }); },
            }],
        },
    },
    entry() { /* 读取 toggles.get().foo */ },
} as UserModuleEx;
```

常用 widget 类型：`toggle` / `subTitle` / `textbox`，完整定义见 [`src/components/settings.vue`](../src/components/settings.vue)。

### 4.6 已有模块速查

| 模块 | 作用 |
| --- | --- |
| `remixed-theme` | 主题样式总入口，**不要禁用** |
| `portal` | 贴子里 av/BV 号自动转 B 站链接 |
| `toolkit` | 重新加载错误头像等小工具集合 |
| `shield` | 帖子 / 用户屏蔽过滤 |
| `tieba-tags` | 贴吧标签美化 |
| `easy-jump` | 关键字跳转 |
| `no-login` | 关闭登录拦截 |
| `notrans-emojis` | 阻止表情包翻译 |
| `poll-display` | 投票面板（贴吧 web/wap 不显示投票，本模块走 App 接口补回） |

## 5. 状态持久化（UserKey）

[`src/lib/user-values.ts`](../src/lib/user-values.ts) 中的 `UserKey<T>` 是 `GM_setValue` / `GM_getValue` 的封装：

```ts
const myConfig = new UserKey<MyConfig>("myConfig", { foo: true });
myConfig.get();                  // 读
myConfig.set({ foo: false });    // 写
myConfig.merge({ foo: false });  // 浅合并
myConfig.on("setter", v => ...); // 监听变化
```

- 默认会被加入备份注册表（"备份与恢复"会带上）
- 时间敏感的缓存用 `UserKeyTS`，自动过期
- **不要直接调 `GM_setValue`**，统一走 `UserKey` 以便备份 / 订阅

## 6. GM API 兼容层

[`src/lib/monkey.ts`](../src/lib/monkey.ts) 是项目对油猴 API 的薄封装，**所有调用都走这里**，原因：

1. dev 环境下没有 GM API，封装提供降级实现（如 `GM_addStyle` 退化为 `<style>` 元素）
2. 油猴脚本注入时机不稳，封装内部做了"延迟探测"，避免早期空指针

已封装的 API：`GM_getValue` / `setValue` / `deleteValue` / `listValues`、`GM_addStyle`、`GM_registerMenuCommand`、`GM_openInTab`、`GM_xmlhttpRequest`（封装为 Promise 版 `gmRequest`）。

### 6.1 跨域请求规则（容易踩坑）

| 目标域 | 怎么请求 |
| --- | --- |
| `tieba.baidu.com` / `*.bdstatic.com` 等同源 / 带 CORS 的域 | 直接 `fetch()` 即可，可复用浏览器登录态 cookie |
| 贴吧 App 接口（`tiebac.baidu.com`、`c.tieba.baidu.com`） | **必须** `gmRequest()`，且 `vite.config.ts` 的 `userscript.connect` 要先把域名加进去 |

直接用 `fetch()` 跨域到 App 域会被 CORS 拦截。`gmRequest()` 通过油猴的 `GM_xmlhttpRequest`，由扩展进程发请求，绕过浏览器同源限制。

### 6.2 调用示例

```ts
import { gmRequest } from "@/lib/monkey";

const res = await gmRequest<"json">({
    method: "POST",
    url: "https://tiebac.baidu.com/c/f/pb/page",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: bodyString,
    responseType: "json",
    timeout: 10_000,
});
// res.response 已是 JSON 对象
```

注意：Tampermonkey 出于安全考虑不允许覆盖 `User-Agent` 头。

## 7. DOM 工具与渲染

### 7.1 选择器：dom / asyncdom

[`src/lib/elemental/index.ts`](../src/lib/elemental/index.ts) 提供两套选择器：

```ts
import { dom, asyncdom, domrd, findParent } from "@/lib/elemental";

const btn = dom<"button">("#submit");                    // 立刻取，不存在返回 null
const list = dom<"div">(".item", parent, []);            // 第三参数 [] 表示取数组
const wrap = await asyncdom<"div">("#j_p_postlist");     // 等到出现为止
const wrapT = await asyncdom<"div">("#x", undefined, 5000); // 带超时，可能 undefined
const div = domrd("div", { class: "foo", style: "..." }); // create + set attrs 一步到位
```

### 7.2 挂载 Vue / JSX 组件到现有 DOM

[`src/lib/render/jsx-extension.tsx`](../src/lib/render/jsx-extension.tsx)：

```ts
import { appendJSX, insertJSX } from "@/lib/render/jsx-extension";
import { h } from "vue";
import MyPanel from "./panel.vue";

appendJSX(h(MyPanel, { /* props */ }), parentEl);   // 追加到末尾
insertJSX(<MyPanel ... />, parentEl, beforeNode);   // 也支持 JSX 语法
```

它会包一层 `.jsx-wrapper`，把 Vue 渲染上下文挂到目标节点，返回 `{ root, vnode, remove() }`。

### 7.3 弹窗 / 对话框

用 `renderDialog(Component, props, hooks)`（[`src/lib/render`](../src/lib/render/)）。整个设置面板、回帖框都是用它弹的。

### 7.4 观察者（动态内容）

[`src/lib/observers.ts`](../src/lib/observers.ts) 暴露几个共享 `MutationObserver`，多个模块复用同一个观察者比各自起 observer 性能更好：

```ts
import { threadFloorsObserver, threadCommentsObserver, forumThreadsObserver, legacyIndexFeedsObserver } from "@/lib/observers";

threadFloorsObserver.addEvent(() => {
    // 每次楼层 DOM 变化（翻页、动态加载）都跑一遍
});
```

观察者由 main.ts 统一 `observe()`，模块只需 `addEvent()`。

| 观察者 | 触发条件 |
| --- | --- |
| `threadFloorsObserver` | 帖子页 `#j_p_postlist` 直接子节点变更（翻页） |
| `threadCommentsObserver` | 帖子页楼中楼出现 / 展开 |
| `forumThreadsObserver` | 吧首页帖子列表变更 |
| `legacyIndexFeedsObserver` | 旧版首页推送变更 |

## 8. 全局数据：PageData

贴吧旧版页面在 HTML 里直接塞了一个 `window.PageData` 对象，包含当前用户、当前吧、当前帖子、权限位等。类型定义见 [`src/PageData.d.ts`](../src/PageData.d.ts)。

常用字段：

```ts
PageData.thread.thread_id        // 帖子 tid
PageData.thread.title            // 帖子标题
PageData.thread.author           // 楼主名
PageData.thread.reply_num        // 回复数
PageData.forum.forum_id          // 吧 fid
PageData.forum.forum_name        // 吧名
PageData.user.user_id            // 当前登录用户
PageData.user.is_login           // 是否已登录
PageData.pager.cur_page          // 当前页码
PageData.pager.total_page        // 总页数
PageData.tbs                     // 提交操作要用的 anti-CSRF token
```

**坑**：`PageData.pager.cur_page > 1` 时帖子页**没有首楼**（首楼只在第 1 页存在）。改首楼的模块必须先判 `cur_page === 1`。

## 9. 关键 DOM 选择器

| 用途 | 选择器 |
| --- | --- |
| 帖子页楼层列表容器 | `#j_p_postlist` |
| 帖子页单个楼层 | `.l_post` |
| 楼层正文容器 | `.d_post_content_main` |
| 楼层正文文本 | `.d_post_content` |
| 楼层作者区 | `.d_author` |
| 楼中楼条目 | `.lzl_single_post` |
| 楼中楼内容 | `.lzl_cnt .lzl_content_main` |
| 吧首页帖子列表 | `#pagelet_frs-list/pagelet/thread` |
| 头像挂件容器 | `.j_user_card` |
| 收藏按钮 | `.j_favor`, `#j_favthread .p_favthr_main` |
| 只看楼主切换 | `#lzonly_cntn` |

新增需求时优先用上面的稳定选择器，避免依赖临时 class。

## 10. 样式与主题变量

主题样式入口：[`src/stylesheets/`](../src/stylesheets/) + 各模块自带的 `.scss` / `.vue` `<style>`。

`additionalData` 在 `vite.config.ts` 已自动 `@use` 公共 mixin：

```scss
@use "@/stylesheets/modules/common" as *;
@use "@/stylesheets/modules/animation-exports" as *;
```

常用 CSS 变量（在 `:root` / `html` 上设置，模块直接用）：

| 变量 | 含义 |
| --- | --- |
| `--tieba-theme-color` | 主题主色（链接、强调） |
| `--tieba-theme-background` | 主题色低饱和底色 |
| `--tieba-theme-hover` / `--tieba-theme-active` | 交互态 |
| `--tieba-theme-fore` | 主题色前景文字 |
| `--default-background` | 卡片默认底色 |
| `--minimal-fore` | 主前景文字色 |
| `--minimal-fore-2`/`-3`/`-4` | 次级 / 三级 / 四级前景（颜色越浅） |

切主题（亮 / 暗、Remixed / Vercel）通过 `<html>` 上的 `data-page-type`、`glass-effect`、`data-nav-bar-mode` 等 attribute 切样式作用域。

## 11. 编码规范

**遵循全局 CLAUDE.md（[`~/.claude/CLAUDE.md`](../../../.claude/CLAUDE.md)）**：中文回复、KISS / YAGNI / DRY、多文件拆分。本项目额外约定：

- 模块目录按功能划分一个文件夹，复杂模块拆 `api.ts` / `panel.vue` / `md5.ts` 等分文件
- `.vue` SFC 用 `<script lang="ts" setup>`；模块入口用 `.ts`；JSX 用 `.tsx`
- DOM 操作优先用 [`src/lib/elemental`](../src/lib/elemental/) 工具，少写裸 `document.querySelector`
- 持久化只用 `UserKey`，不直接调 `GM_setValue`
- 跨域只用 `gmRequest`，不直接调 `GM_xmlhttpRequest`
- 注释只写"为什么"，不写"做什么"

## 12. 案例：poll-display 模块

[`src/modules/poll-display/`](../src/modules/poll-display/) 是一个完整的中等复杂度模块，几乎用到所有上面提到的机制，建议作为新模块的样板。

它解决的问题：贴吧 web/wap 端从不渲染投票模块，只有 App 端有。本模块走 App 接口拿到 `poll_info` 后在网页端只读展示。

**文件结构**：

```
src/modules/poll-display/
├── index.ts        ← UserModule 入口：判 cur_page、拿 tid、调 API、挂面板
├── api.ts          ← App 接口 `tiebac.baidu.com/c/f/pb/page` 签名 + 调用
├── md5.ts          ← 轻量 MD5 实现（签名所必需，浏览器 SubtleCrypto 不支持 MD5）
└── panel.vue       ← 只读投票面板组件
```

**关键决策**：

1. `scope: ["thread"]` + `runAt: "DOMLoaded"`，保证首楼 DOM 已就绪
2. 入口先判 `PageData.pager.cur_page === 1`，翻页时首楼不存在
3. 用 `asyncdom("#j_p_postlist")` 等楼层容器，再找 `.l_post` 首楼，再挂 `.d_post_content_main`
4. 防重复挂载用 `data-poll-display-injected` 属性标记
5. 拉数据失败时静默 warn，不阻塞其它模块
6. 跨域 `tiebac.baidu.com` 通过 `gmRequest`，`vite.config.ts` 已加 `connect`
7. 提交投票需要 BDUSS + 风控对抗，**只读不写**，避免封号风险

## 13. 陷阱与禁忌

1. **不要在 `src/modules/<id>/index.ts` 之外的位置注册模块**——packer 只扫这个 glob
2. **不要在新增 GM API 时只加代码不加 `@grant`**——vite-plugin-monkey 是按 import 自动加的，但要确保是从 `"$"` 导入；跨域请求还要在 `connect` 里加目标域名
3. **不要假设 `PageData` 一定存在**——新版 SPA 上没有，应当判空
4. **不要假设首楼一定在 DOM 里**——翻页（`cur_page > 1`）和某些"只看楼主"状态下不在
5. **不要把"模块开关"自己写一遍**——`disabledModules` 已经覆盖整模块的启停
6. **不要直接 fetch 贴吧 App 域**——CORS 必然拦截
7. **不要写 hard-coded UA**——`GM_xmlhttpRequest` 不允许覆盖 `User-Agent`
8. **不要破坏新版 SPA**——`setupLegacyRedirect` 会先判版本，新版页面不应注入任何 CSS / 属性，由它自身切 cookie 后 reload

## 14. 调试技巧

- **本地开发**：`npm run dev` 后，把控制台输出的 `*.user.js` 链接装进油猴，刷新即生效
- **看构建产物的 metadata**：`build/tieba-remix.user.js` 顶部
- **PageData 验证**：在贴吧页 console 直接 `PageData.thread.thread_id` 之类
- **接口探测**：贴吧 wap 完整版 `https://tieba.baidu.com/mo/q/threadcontent?kz=<tid>&pn=1` 无需登录可拿大部分页面数据；App 接口需要签名
- **观察者触发时机不对**：先确认你 `addEvent` 在 `observers.observe()` 之前调用；通常应当在模块 `entry()` 里调

## 15. 目录速查

```
src/
├── main.ts                       启动入口
├── global.d.ts                   UserModule / TiebaPost 等全局类型
├── PageData.d.ts                 贴吧页面注入的全局 PageData 类型
├── ex.d.ts                       UserModuleEx 等扩展类型
├── components/                   全局共享 Vue 组件（设置面板、对话框、编辑器）
├── lib/
│   ├── monkey.ts                 GM API 封装
│   ├── user-values.ts            UserKey + 各种持久化配置
│   ├── elemental/                DOM 选择器工具
│   ├── observers.ts              共享 MutationObserver
│   ├── render/                   Vue / JSX 挂载工具
│   ├── theme/                    主题、页面扩展（page-extension）
│   ├── tieba-components/         hard-coded 小补丁（installXxx）
│   ├── api/
│   │   ├── remixed.ts            currentPageType()、检查更新、备份恢复
│   │   └── tieba.ts              贴吧官方接口客户端（同源 fetch）
│   ├── common/
│   │   ├── packer.ts             模块加载器
│   │   └── settings/             设置面板内容定义
│   └── legacy-redirect.ts        新版 SPA → 旧版的切换逻辑
├── modules/                      可在设置里开关的功能模块
└── stylesheets/                  全局样式 + SCSS mixin
```
