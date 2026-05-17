<div align="center">

<img src="assets/images/main/icon.png" width="80" height="80">

# Tieba Remix

**贴吧网页端重塑**

[![License](https://img.shields.io/github/license/naseaoi/Tieba-Remix?style=flat-square)](LICENSE)
[![Release](https://img.shields.io/github/v/release/naseaoi/Tieba-Remix?style=flat-square)](https://github.com/naseaoi/Tieba-Remix/releases)
[![Downloads](https://img.shields.io/github/downloads/naseaoi/Tieba-Remix/total?style=flat-square)](https://github.com/naseaoi/Tieba-Remix/releases)
[![Stars](https://img.shields.io/github/stars/naseaoi/Tieba-Remix?style=flat-square)](https://github.com/naseaoi/Tieba-Remix)

</div>

---

## 功能特性

- 全新 UI 主题，支持 Vercel 风格
- 图片查看器增强
- 帖子屏蔽 / 过滤
- 导航栏优化
- 设置面板可视化配置
- 自动更新检测

## 安装

> 需要浏览器安装用户脚本管理器，推荐 [Tampermonkey](https://www.tampermonkey.net/)

👉 [点击安装](https://raw.githubusercontent.com/naseaoi/Tieba-Remix/master/build/tieba-remix.user.js)

## 兼容性

- 优先适配 **Edge / Chrome + Tampermonkey**
- 使用了较新的 Web API，请保持浏览器版本更新

## 开发

```bash
pnpm install
pnpm dev        # 开发模式
pnpm build      # 生产构建
pnpm lint       # 代码检查
```

技术栈：Vue 3 + TypeScript + Vite + vite-plugin-monkey + ESLint 9 (flat config)

## 注意事项

- 不处理贴吧原版广告，如需屏蔽请使用广告拦截插件
- 部分功能可能影响性能，可在设置中自行开关
- 脚本包含内置资源，会产生额外流量消耗

## 致谢

本项目 fork 自 [HacksawBlade/Tieba-Remix](https://github.com/HacksawBlade/Tieba-Remix)，感谢原作者的工作。

## 许可证

[MIT](LICENSE)
