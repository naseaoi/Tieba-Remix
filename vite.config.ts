import vue from "@vitejs/plugin-vue";
import vueJSX from "@vitejs/plugin-vue-jsx";
import deepmerge from "deepmerge";
import { resolve } from "path";
import postcssPresetEnv from "postcss-preset-env";
import { UserConfig, defineConfig } from "vite";
import monkey, { MonkeyOption, cdn, util } from "vite-plugin-monkey";

const scriptOptions: MonkeyOption = {
    entry: "src/main.ts",
    userscript: {
        name: "Tieba Remix Dev",
        namespace: "https://github.com/naseaoi/Tieba-Remix",
        version: "0.5.2",
        description: "贴吧网页端重塑",
        author: "naseaoi",
        license: "MIT",
        updateURL: "https://raw.githubusercontent.com/naseaoi/Tieba-Remix/master/build/tieba-remix.user.js",
        downloadURL: "https://raw.githubusercontent.com/naseaoi/Tieba-Remix/master/build/tieba-remix.user.js",
        icon: "https://raw.githubusercontent.com/naseaoi/Tieba-Remix/master/assets/images/main/icon16.png",
        icon64: "https://raw.githubusercontent.com/naseaoi/Tieba-Remix/master/assets/images/main/icon64.png",
        match: [
            "*://tieba.baidu.com/",
            "*://tieba.baidu.com/index.*",
            "*://tieba.baidu.com/?*",
            "*://tieba.baidu.com/p/*",
            "*://tieba.baidu.com/f?*",
            "*://jump.bdimg.com/safecheck/*",
            "*://jump2.bdimg.com/safecheck/*",
        ],
        require: [
            "https://fastly.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js",
        ],
        "run-at": "document-start",
    },
    build: {
        externalGlobals: {
            "vue": cdn.jsdelivrFastly("Vue", "dist/vue.global.prod.js")
                .concat(util.dataUrl(";window.Vue=Vue;")),
            "libelemental": cdn.jsdelivrFastly("libelemental", "build/index.min.js"),
            "user-view": cdn.jsdelivrFastly("UserView", "build/index.min.js"),
        },
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
