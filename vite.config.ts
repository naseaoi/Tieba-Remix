import vue from "@vitejs/plugin-vue";
import vueJSX from "@vitejs/plugin-vue-jsx";
import deepmerge from "deepmerge";
import { resolve } from "path";
import postcssPresetEnv from "postcss-preset-env";
import { UserConfig, defineConfig } from "vite";
import monkey, { MonkeyOption } from "vite-plugin-monkey";

// 版本号来源：CI 从 tag 名通过 USERSCRIPT_VERSION 注入
const USERSCRIPT_VERSION = process.env.USERSCRIPT_VERSION?.replace(/^v/, "") || "0.0.0-dev";

const scriptOptions: MonkeyOption = {
    entry: "src/main.ts",
    userscript: {
        name: "Tieba RemixFork",
        namespace: "https://github.com/naseaoi/Tieba-Remix",
        version: USERSCRIPT_VERSION,
        description: "贴吧网页端重塑",
        author: "naseaoi",
        license: "MIT",
        updateURL: "https://github.com/naseaoi/Tieba-Remix/releases/latest/download/tieba-remix.user.js",
        downloadURL: "https://github.com/naseaoi/Tieba-Remix/releases/latest/download/tieba-remix.user.js",
        icon: "https://raw.githubusercontent.com/naseaoi/Tieba-Remix/main/assets/images/main/icon16.png",
        icon64: "https://raw.githubusercontent.com/naseaoi/Tieba-Remix/main/assets/images/main/icon64.png",
        match: [
            "*://tieba.baidu.com/",
            "*://tieba.baidu.com/index.*",
            "*://tieba.baidu.com/?*",
            "*://tieba.baidu.com/p/*",
            "*://tieba.baidu.com/f?*",
            "*://jump.bdimg.com/safecheck/*",
            "*://jump2.bdimg.com/safecheck/*",
        ],
        connect: [
            "tiebac.baidu.com",
            "tieba.baidu.com",
            "uploadphotos.baidu.com",
        ],
        "run-at": "document-start",
    },
    build: {
        systemjs: "inline",
    },
};

const commonConfig = defineConfig({
    build: {
        outDir: "build",
        reportCompressedSize: false,
        cssCodeSplit: false,
        // 静态资源 base64 内联上限
        assetsInlineLimit: 64 * 1024,
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `
                @use "@/stylesheets/modules/common" as *;
                @use "@/stylesheets/modules/animation-exports" as *;`,
            },
        },
        postcss: {
            plugins: [
                postcssPresetEnv(),
            ],
        },
    },
    plugins: [
        vue(),
        vueJSX({}),
    ],
    resolve: {
        alias: [
            {
                find: "@",
                replacement: resolve(__dirname, "./src"),
            },
        ],
    },
    server: {
        proxy: {
            "/p": {
                target: "https://tieba.baidu.com",
                changeOrigin: true,
            },
            "/f": {
                target: "https://tieba.baidu.com",
                changeOrigin: true,
            },
            "/suggestion": {
                target: "https://tieba.baidu.com",
                changeOrigin: true,
            },
        },
    },
    optimizeDeps: {
        exclude: [
            "vite-plugin-monkey/dist/client",
        ],
    },
});

const devConfig = defineConfig({
    build: {
        minify: false,
        cssMinify: false,
    },
    plugins: [
        monkey(scriptOptions),
    ],
});

const forkConfig = defineConfig({
    build: {
        minify: false,
        cssMinify: false,
    },
    plugins: [
        monkey(scriptOptions),
    ],
});

const prodConfig = defineConfig({
    build: {
        minify: "terser",
        cssMinify: true,
        terserOptions: {
            sourceMap: false,
            toplevel: true,
            format: {
                comments: false,
            },
            compress: {
                pure_funcs: [
                    "console.log",
                    "console.info",
                    "console.debug",
                    "deb",
                ],
            },
        },
    },
    plugins: [
        monkey(scriptOptions),
    ],
});

const viteConfig = {
    build: {
        "development": () => deepmerge<UserConfig>(commonConfig, devConfig),
        "production": () => deepmerge<UserConfig>(commonConfig, prodConfig),
        "fork": () => deepmerge<UserConfig>(commonConfig, forkConfig),
    },
    serve: {
        "development": () => deepmerge<UserConfig>(commonConfig, devConfig),
    },
};

export default defineConfig(({ command, mode }) => {
    return viteConfig[command][mode]();
});
