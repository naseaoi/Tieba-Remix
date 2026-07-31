import vue from "@vitejs/plugin-vue";
import vueJSX from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [vue(), vueJSX()],
    resolve: {
        alias: {
            "$": resolve(__dirname, "./src/test/monkey-stub.ts"),
            "@": resolve(__dirname, "./src"),
            "libelemental": resolve(__dirname, "./src/test/libelemental-stub.ts"),
            "user-view": resolve(__dirname, "./src/test/user-view-stub.ts"),
        },
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
    },
});
