# AGENTS.md

## 修改与验证

- 开发过程中按改动范围做快速验证：逻辑改动运行相关测试 `pnpm test <文件或关键字>`，类型改动运行 `pnpm typecheck`，Vue/SCSS/CSS 改动运行 `pnpm exec stylelint <文件>`。
- 交付前运行与 CI 一致的完整检查并全部通过：`pnpm lint`、`pnpm lint:styles`、`pnpm test`、`pnpm build`（`build` 已包含类型检查）。
- 新增或修改可脱离页面验证的逻辑（解析、匹配、计算、DOM 转换）时，在同目录补充或更新 `*.test.ts`（Vitest + jsdom）。
- 页面布局、样式和交互改动通过 `pnpm dev` 在真实贴吧页面确认效果；无法确认时在交付说明中注明。
- `build/` 是构建产物且不入库，不手动修改。

## 用户模块

- 可由用户启停的新功能优先放在 `src/modules/<id>/`；固定页面补丁才放在 `src/lib/tieba-components/` 并使用 `installXxx`。
- 新增模块时必须同时登记到 `src/modules/manifest.ts`。项目不会通过目录自动发现模块。
- manifest 中的 `id`、`scope`、`runAt` 必须与模块默认导出保持一致；manifest 决定模块是否加载和何时运行。
- 普通模块使用 `UserModule`，需要设置项时使用 `UserModuleEx`。字段约束以 `src/global.d.ts`、`src/ex.d.ts` 和现有模块为准，不复制静态模板。
- 不重复实现 `disabledModules`；模块加载器已经统一处理启停状态。

## 基础设施

- 持久化配置使用 `UserKey<T>` 或 `UserKeyTS<T>`，不得直接散落调用 GM 存储 API。
- DOM 查询与创建优先使用 `src/lib/elemental/` 中的 `dom`、`asyncdom`、`domrd`、`findParent`。
- 动态楼层、楼中楼和帖子列表优先复用 `src/lib/observers.ts` 中的共享 observers，不重复创建同目标观察器。
- Vue/JSX 挂载和弹窗使用 `src/lib/render/` 中的现有能力。
- 贴吧接口优先集中到 `src/lib/api/tieba.ts`，避免在业务组件中重复拼装请求逻辑。

## userscript 与跨域

- userscript metadata 统一维护在 `vite.config.ts` 的 `scriptOptions.userscript`。
- 不手改 `version`；版本号由发布 tag 和 CI 注入。
- 不手写 `@grant`；`vite-plugin-monkey` 根据代码中的 GM API import 自动生成。
- `tieba.baidu.com` 同源请求或支持 CORS 的请求使用 `fetch()`。
- 贴吧 App 域等跨域请求必须使用 `gmRequest()`，并先加入 `userscript.connect` 白名单。
- `gmRequest()` 不得尝试覆盖 `User-Agent` 请求头。

## 页面行为

- 新版贴吧 SPA 不存在旧版 `PageData`；依赖 `PageData` 的逻辑只能在 `setupLegacyRedirect` 放行后的旧版页面运行。
- `PageData.pager.cur_page > 1` 时帖子页没有首楼；修改首楼前必须判断当前页为第一页。
- 页面范围使用 `currentPageType()` 和模块 `scope` 判断，不通过零散 URL 字符串重复判断。
- 吧页的标题卡、导航、侧栏和帖子列表容器由 Bigpipe pagelet 异步渲染，冷缓存时晚于 DOMContentLoaded；依赖这些节点的初始化用 `asyncdom` 等待，不在 DOMContentLoaded 时一次性查询。
- 规则或设置变更需要实时影响当前页面时，必须触发对应 observer 或同步更新当前 DOM 状态。

## 分支与发布

- 日常开发直接在 `preview` 上提交；实验性、可能放弃或需要多次会话完成的改动，从 `preview` 切出功能分支，合并后删除该分支（本地与远端）。
- `main` 只接收来自 `preview` 的发布 PR，不直接提交。
- 提交信息使用 Conventional Commits（`feat:`、`fix:`、`refactor:` 等）。
- 发布流程和 tag 规则以 `docs/push-git.md` 为准。
