<template>
    <div class="shield-container">
        <section class="shield-compose">
            <div class="section-heading">
                <div>
                    <h3>添加规则</h3>
                    <p>输入屏蔽词，再勾选需要生效的位置</p>
                </div>
                <UserCheck v-model="useRegex" id="shield-use-regex" text="正则表达式" />
            </div>

            <label class="field-label" for="shield-rule-input">屏蔽词</label>
            <UserTextbox v-model="inputRule" id="shield-rule-input" muti-lines class="shield-input"
                placeholder="输入关键词或正则表达式" @keypress="inputKeyPress" />

            <div class="scope-heading">
                <div>
                    <span class="field-label">应用范围</span>
                    <span class="required-hint">至少选择一项，可多选</span>
                </div>
                <span class="selected-count">已选择 {{ selectedScopes.length }} 项</span>
            </div>
            <ShieldScopeSelector v-model="selectedScopes" id-prefix="shield-create-scope" />

            <div class="compose-footer">
                <span>按 Enter 添加，Shift + Enter 换行</span>
                <UserButton class="submit-button" :shadow-border="true" :theme-style="true"
                    @click="updateShieldList">
                    <Plus class="button-icon" aria-hidden="true" />
                    添加规则
                </UserButton>
            </div>
        </section>

        <section class="shield-rules">
            <div class="section-heading rules-heading">
                <div>
                    <h3>已有规则</h3>
                    <p>{{ shieldListRef.length }} 条规则，点击卡片可编辑</p>
                </div>
                <UserButton v-if="shieldListRef.length > 0" class="remove-all" @click="removeAllWithConfirm">
                    <Trash2 class="button-icon" aria-hidden="true" />
                    清空规则
                </UserButton>
            </div>

            <div v-if="shieldListRef.length === 0" class="empty-list-container">
                <ListFilterPlus class="empty-icon" aria-hidden="true" />
                <div>
                    <strong>还没有屏蔽规则</strong>
                    <p>在上方输入屏蔽词并选择应用范围即可添加</p>
                </div>
            </div>

            <div v-else class="rule-grid">
                <UserButton v-for="(rule, index) in shieldListRef" :key="`${rule.content}-${index}`"
                    class="rule-card" :class="{ disabled: !rule.toggle }" @click="editRule(rule, index)">
                    <div class="rule-card-heading">
                        <span class="rule-type">{{ rule.type === "regex" ? "正则" : "文本" }}</span>
                        <span v-if="!rule.toggle" class="rule-status">已停用</span>
                        <Pencil class="edit-icon" aria-hidden="true" />
                    </div>
                    <p class="rule-content">{{ rule.content }}</p>
                    <div class="scope-badges">
                        <span v-for="scope in rule.scopes" :key="scope" class="scope-badge">
                            <component :is="shieldScopeMeta[scope].icon" class="scope-icon" aria-hidden="true" />
                            {{ shieldScopeMeta[scope].label }}
                        </span>
                    </div>
                </UserButton>
            </div>
        </section>
    </div>
</template>

<script lang="tsx" setup>
import { ListFilterPlus, Pencil, Plus, Trash2 } from "@lucide/vue";
import { renderDialog } from "@/lib/render";
import { UserButton, UserCheck, UserTextbox, messageBox, toast } from "user-view";
import { ref } from "vue";
import { getShieldRuleValidationError, ShieldRule, ShieldScope, shieldList, shieldScopeOptions } from "./shield";
import ShieldEditor from "./shield-editor.vue";
import ShieldScopeSelector from "./shield-scope-selector.vue";

const shieldListRef = ref<ShieldRule[]>(shieldList.get());
const inputRule = ref("");
const useRegex = ref(false);
const selectedScopes = ref<ShieldScope[]>(["thread-title"]);
const shieldScopeMeta = Object.fromEntries(
    shieldScopeOptions.map(option => [option.value, option])
) as Record<ShieldScope, typeof shieldScopeOptions[number]>;

function inputKeyPress(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        updateShieldList();
    }
}

function editRule(rule: ShieldRule, index: number) {
    renderDialog(ShieldEditor, { rule }, {
        unloaded(updatedRule?: ShieldRule) {
            if (!updatedRule) {
                shieldListRef.value.splice(index, 1);
                shieldList.set([...shieldListRef.value]);
                return;
            }
            shieldListRef.value[index] = updatedRule;
            shieldList.set([...shieldListRef.value]);
        },
    });
}

function removeAll() {
    shieldListRef.value = [];
    shieldList.set([]);
}

async function removeAllWithConfirm() {
    if (await messageBox({
        content: "该操作将无法恢复，确定要删除所有屏蔽规则吗？",
        type: "forceTrueFalse",
    }) === "positive") {
        removeAll();
    }
}

function updateShieldList() {
    const rule: ShieldRule = {
        content: inputRule.value.trim(),
        type: useRegex.value ? "regex" : "text",
        scopes: [...selectedScopes.value],
        toggle: true,
    };
    const validationError = getShieldRuleValidationError(rule);
    if (validationError) {
        toast({ message: validationError, type: "warning" });
        return;
    }

    shieldListRef.value = [...shieldListRef.value, rule];
    shieldList.set(shieldListRef.value);
    inputRule.value = "";
}
</script>

<style lang="scss" scoped>
.shield-container {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 16px;

    .shield-compose,
    .shield-rules {
        display: flex;
        flex-direction: column;
        padding: 14px;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        gap: 10px;
    }

    .section-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;

        h3 {
            margin: 0;
            color: var(--default-fore);
            font-size: 16px;
        }

        p {
            margin: 4px 0 0;
            color: var(--minimal-fore);
            font-size: 12px;
        }
    }

    .field-label {
        color: var(--light-fore);
        font-size: 13px;
        font-weight: var(--font-weight-bold);
    }

    .shield-input {
        width: 100%;
        min-height: 68px;
        max-height: 128px;
        box-sizing: border-box;
        padding: 8px;
        font-size: 14px;
        resize: vertical;
    }

    .scope-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 2px;
        gap: 12px;

        .required-hint {
            margin-left: 8px;
            color: var(--minimal-fore);
            font-size: 12px;
        }

        .selected-count {
            color: var(--tieba-theme-color);
            font-size: 12px;
        }
    }

    .compose-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--minimal-fore);
        font-size: 12px;
        gap: 12px;

        .submit-button {
            display: flex;
            align-items: center;
            padding: 6px 14px;
            gap: 4px;

            .button-icon {
                width: 18px;
                height: 18px;
                stroke-width: 1.75;
            }
        }
    }

    .rules-heading {
        align-items: center;

        .remove-all {
            display: flex;
            align-items: center;
            padding: 5px 9px;
            color: var(--error-color);
            font-size: 12px;
            gap: 4px;

            .button-icon {
                width: 17px;
                height: 17px;
                stroke-width: 1.75;
            }
        }
    }

    .empty-list-container {
        display: flex;
        align-items: center;
        padding: 18px;
        border-radius: 10px;
        background-color: var(--trans-light-background);
        color: var(--minimal-fore);
        gap: 10px;

        > .empty-icon {
            width: 28px;
            height: 28px;
            flex: 0 0 28px;
            stroke-width: 1.5;
        }

        strong {
            color: var(--light-fore);
            font-size: 14px;
        }

        p {
            margin: 3px 0 0;
            font-size: 12px;
        }
    }

    .rule-grid {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(2, minmax(0, 1fr));

        .rule-card {
            display: flex;
            min-width: 0;
            flex-direction: column;
            align-items: stretch;
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            box-shadow: none;
            gap: 8px;
            text-align: left;

            &.disabled {
                opacity: 0.55;
            }

            .rule-card-heading {
                display: flex;
                align-items: center;
                gap: 6px;

                .rule-type,
                .rule-status {
                    padding: 2px 6px;
                    border-radius: 999px;
                    background-color: var(--trans-light-background);
                    color: var(--minimal-fore);
                    font-size: 11px;
                }

                .rule-status {
                    color: var(--error-color);
                }

                .edit-icon {
                    width: 16px;
                    height: 16px;
                    margin-left: auto;
                    color: var(--minimal-fore);
                    stroke-width: 1.75;
                }
            }

            .rule-content {
                overflow: hidden;
                margin: 0;
                color: var(--default-fore);
                font-family: var(--user-font-mono);
                font-size: 14px;
                font-weight: var(--font-weight-bold);
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .scope-badges {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;

                .scope-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 2px 6px;
                    border-radius: 6px;
                    background-color: var(--trans-light-background);
                    color: var(--light-fore);
                    font-size: 11px;
                    gap: 3px;

                    .scope-icon {
                        width: 14px;
                        height: 14px;
                        color: var(--tieba-theme-color);
                        stroke-width: 1.75;
                    }
                }
            }
        }
    }
}

@media (width <= 720px) {
    .shield-container {
        .section-heading,
        .scope-heading,
        .compose-footer {
            flex-direction: column;
            align-items: stretch;
        }

        .rule-grid {
            grid-template-columns: 1fr;
        }

        .rules-heading .remove-all,
        .compose-footer .submit-button {
            justify-content: center;
        }
    }
}
</style>
