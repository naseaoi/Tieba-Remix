# 主题样式分层

## 两层结构

- 基础层：`src/stylesheets/main/*` 与 `src/stylesheets/tieba/*`，负责通用变量、动画和原生页面的基础改造。
- 覆盖层：`src/stylesheets/tieba-vercel/*`，规则包在 `html.style-vercel` 下，借助根 class 的优先级覆盖基础层。调色板 `main/palette.scss` 同样使用 `html.style-vercel.light-theme` / `.dark-theme`。
- `style-vercel` 由 `bootstrap` 固定添加在 `<html>` 上，是覆盖层生效的前提。它也是用户自定义 CSS 可能依赖的公开选择器，保持名称不变。

## 加载顺序

- `src/lib/theme/index.ts` 先注入基础 bucket（animations → variables → base → universal → palette），再注入当前页面 bucket（基础层页面样式在前，覆盖层页面样式在后）。
- 同优先级规则依赖注入先后决定胜负，调整 bucket 时保持"覆盖层晚于对应基础层"。
- 设置面板样式 `tieba-vercel/settings.scss` 在打开设置时由 `ensureSettingsCSS()` 按需注入。

## 修改约束

- 新增覆盖规则写在覆盖层并放在 `html.style-vercel` 下，不直接修改基础层去迎合新视觉。
- 删除基础层声明前，确认覆盖层以不低于它的优先级、无附加条件地覆盖同一元素的同一属性；全新首页、新版看帖页面可关闭，关闭后原生节点仍依赖基础层样式。
- 主题色只通过 `applyThemeColor()` 生成 `--tieba-theme-*`；`--user-theme-*` 是给 user-view 组件库使用的别名，设置面板在 `.settings-wrapper` 内将其局部改为中性色。
