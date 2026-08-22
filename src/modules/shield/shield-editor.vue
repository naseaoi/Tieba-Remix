<template>
    <UserDialog ref="dialog" v-bind="dialogOpts"
        :default-payload="{ ...props.rule, scopes: [...props.rule.scopes] }">
        <div class="shield-editor-panel">
            <header class="editor-header">
                <h3>编辑屏蔽规则</h3>
                <button type="button" class="close-button" aria-label="关闭" title="关闭" @click="unload">
                    <X aria-hidden="true" />
                </button>
            </header>

            <main class="editor-body">
                <section class="editor-section">
                    <div class="rule-heading">
                        <label for="shield-editor-rule">屏蔽词</label>
                        <div class="rule-options">
                            <UserCheck v-model="ruleRef.toggle" id="shield-editor-toggle" text="启用规则" />
                            <UserCheck v-model="useRegex" id="shield-editor-regex" text="正则表达式" />
                        </div>
                    </div>
                    <UserTextbox v-model="ruleRef.content" id="shield-editor-rule" muti-lines
                        @keypress="keyPressHandler" />
                </section>

                <section class="editor-section">
                    <div class="section-heading">
                        <label>应用范围</label>
                        <span>至少选择一项，可多选</span>
                    </div>
                    <ShieldScopeSelector v-model="ruleRef.scopes" id-prefix="shield-editor-scope" />
                </section>
            </main>

            <footer class="editor-actions">
                <UserButton class="delete-button" @click="deleteRule">删除</UserButton>
                <UserButton class="save-button" :theme-style="true" @click="submit">保存</UserButton>
            </footer>
        </div>
    </UserDialog>
</template>

<script lang="tsx" setup>
import { X } from "@lucide/vue";
import { UserButton, UserCheck, UserDialog, UserDialogOpts, UserTextbox, toast } from "user-view";
import { ref } from "vue";
import { getShieldRuleValidationError, ShieldRule } from "./shield";
import ShieldScopeSelector from "./shield-scope-selector.vue";

interface ShieldEditorOpts {
    rule: ShieldRule;
}

const props = defineProps<ShieldEditorOpts>();
const dialog = ref<InstanceType<typeof UserDialog>>();
const useRegex = ref(props.rule.type === "regex");
const ruleRef = ref<ShieldRule>({
    ...props.rule,
    scopes: [...props.rule.scopes],
});
const dialogOpts: UserDialogOpts = {
    animation: false,
    shadowMode: true,
    clickModalToUnload: true,
    pressEscapeToUnload: true,
    containerStyle: {
        padding: "0",
        border: "none",
        borderRadius: "0",
        background: "transparent",
        boxShadow: "none",
    },
    contentStyle: {
        padding: "0",
    },
};

function keyPressHandler(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
    }
}

function submit() {
    const newRule: ShieldRule = {
        ...ruleRef.value,
        content: ruleRef.value.content.trim(),
        scopes: [...ruleRef.value.scopes],
        type: useRegex.value ? "regex" : "text",
    };
    const validationError = getShieldRuleValidationError(newRule);
    if (validationError) {
        toast({ message: validationError, type: "warning" });
        return;
    }
    dialog.value?.unload(newRule);
}

function unload() {
    dialog.value?.unload({ ...props.rule, scopes: [...props.rule.scopes] });
}

function deleteRule() {
    dialog.value?.unload();
}
</script>

<style lang="scss" scoped>
.shield-editor-panel {
    display: flex;
    overflow: hidden;
    width: min(620px, calc(100vw - 32px));
    max-height: calc(100vh - 32px);
    flex-direction: column;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    background-color: var(--default-background);
    box-shadow: 0 16px 48px rgb(0 0 0 / 24%);

    .editor-header {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid var(--border-color);
        gap: 12px;

        h3 {
            margin: 0;
            color: var(--default-fore);
            font-size: 18px;
        }

        .close-button {
            display: flex;
            width: 28px;
            height: 28px;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: none;
            border-radius: 6px;
            background: transparent;
            color: var(--minimal-fore);
            cursor: pointer;
            font-size: 19px;
            transition: var(--default-duration);

            svg {
                width: 18px;
                height: 18px;
                stroke-width: 1.75;
            }

            &:hover,
            &:focus-visible {
                background-color: var(--trans-light-background);
                color: var(--default-fore);
                outline: none;
            }
        }
    }

    .editor-body {
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 16px;
        overflow-y: auto;
    }

    .editor-section {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .rule-heading,
        .section-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;

            label {
                flex-shrink: 0;
                color: var(--default-fore);
                font-size: 14px;
                font-weight: var(--font-weight-bold);
            }
        }

        .section-heading span {
            color: var(--minimal-fore);
            font-size: 12px;
        }

        .rule-options {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 16px;
        }

        #shield-editor-rule {
            width: 100%;
            min-height: 72px;
            max-height: 160px;
            box-sizing: border-box;
            padding: 8px;
            font-family: var(--user-font-mono);
            font-size: 14px;
            resize: vertical;
        }
    }

    .editor-actions {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-top: 1px solid var(--border-color);
        background-color: var(--trans-light-background);
        gap: 12px;

        .delete-button,
        .save-button {
            min-width: 84px;
            padding: 6px 16px;
        }

        .delete-button {
            color: var(--error-color);
        }
    }
}

@media (width <= 620px) {
    .shield-editor-panel {
        .editor-section {
            .rule-heading {
                flex-direction: column;
                align-items: flex-start;
            }

            .rule-options {
                justify-content: flex-start;
            }
        }
    }
}
</style>
