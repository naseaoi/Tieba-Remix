# 发布流程

打 tag 即发布，CI 自动构建并创建 GitHub Release。

## 预览版

```bash
git switch preview                            # 改动只在 preview 分支提交
git push
git tag v0.5.8-preview.1 && git push --tags   # 含 - 后缀 → prerelease
```

## 正式版（预览验证通过后）

```bash
git switch master
git merge --ff-only preview && git push       # preview → master
git tag v0.5.8 && git push --tags             # 无 - 后缀 → 正式
```

## 规则

- tag 形如 `v<semver>`。**含 `-`** → prerelease + 挂在 `preview` 分支；否则 → 挂在 `master` 分支
- 版本号由 CI 从 tag 注入到 `vite.config.ts`，**不要手改**
- 预览改动只走 `preview` 分支，禁止直推 `master`（正式版用户的 updateURL 指向 master）

## CI 在做什么

[`.github/workflows/release.yml`](../.github/workflows/release.yml)：tag push → `pnpm install` → `USERSCRIPT_VERSION=<tag> pnpm build` → `gh release create/upload` 上传 `build/tieba-remix.user.js`。

## 本地手动 build（极少用到）

```bash
USERSCRIPT_VERSION=v0.5.8-preview.1 pnpm build
```
不设环境变量时 version 会落到 `0.0.0-dev`。

## 一次性迁移提示

历史上构建产物 `build/tieba-remix.user.js` 提交进 git，`updateURL` 指向 `raw.githubusercontent.com/.../master/build/...`。本次已切到：

- 产物不再入 git（`.gitignore` 已加 `build/`），由 CI 在 release asset 提供
- `updateURL` / `downloadURL` 改为 `github.com/naseaoi/Tieba-Remix/releases/latest/download/tieba-remix.user.js`（GitHub 自动 302 到最新非 prerelease release 的同名 asset）

首次正式版发布（v0.5.8 起）后，**旧 v0.5.7 用户的自动更新通道会 404**，需要手动重装一次新 user.js 切到新 `updateURL`。建议在 v0.5.8 release notes 里写明。
