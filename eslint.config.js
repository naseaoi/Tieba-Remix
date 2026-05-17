import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import globals from "globals";

export default tseslint.config(
    {
        ignores: [
            "build/**",
            "node_modules/**",
            "dist/**",
            "*.min.js",
            "**/tieba-remix.user.js",
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs["flat/base"],
    {
        files: ["**/*.vue"],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tseslint.parser,
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                extraFileExtensions: [".vue"],
            },
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
            },
        },
        rules: {
            "indent": ["error", 4, { "SwitchCase": 1 }],
            "semi": ["error", "always"],
            "no-var": "warn",
            "strict": "error",
            "spaced-comment": "off",
            "no-undef": "off",
            "radix": "off",
            "no-param-reassign": "off",
            "eqeqeq": ["error", "always", { null: "ignore" }],
            "prefer-template": "warn",
            "quotes": ["warn", "double", {
                avoidEscape: true,
                allowTemplateLiterals: true,
            }],
            "comma-dangle": ["error", {
                arrays: "always-multiline",
                objects: "always-multiline",
                imports: "always-multiline",
                exports: "always-multiline",
                functions: "only-multiline",
            }],
            "@typescript-eslint/triple-slash-reference": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-unused-vars": ["warn", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_|^error$",
            }],
            "@typescript-eslint/no-var-requires": "off",
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
);
