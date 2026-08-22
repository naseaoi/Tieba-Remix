<template>
    <div class="shield-scope-selector" role="group" aria-label="应用范围">
        <div v-for="option in shieldScopeOptions" :key="option.value" class="scope-option"
            :class="{ selected: modelValue.includes(option.value) }">
            <component :is="option.icon" class="scope-option-icon" aria-hidden="true" />
            <div class="scope-option-content">
                <UserCheck :id="`${idPrefix}-${option.value}`" :model-value="modelValue.includes(option.value)"
                    :text="option.label" @update:model-value="toggleScope(option.value, $event)" />
                <p>{{ option.description }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { UserCheck } from "user-view";
import { ShieldScope, shieldScopeOptions } from "./shield";

interface Props {
    modelValue: ShieldScope[];
    idPrefix: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    "update:modelValue": [value: ShieldScope[]];
}>();

function toggleScope(scope: ShieldScope, enabled: boolean) {
    const selectedScopes = new Set(props.modelValue);
    if (enabled) selectedScopes.add(scope);
    else selectedScopes.delete(scope);

    emit("update:modelValue", shieldScopeOptions
        .map(option => option.value)
        .filter(optionScope => selectedScopes.has(optionScope)));
}
</script>

<style lang="scss" scoped>
.shield-scope-selector {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(3, minmax(0, 1fr));

    .scope-option {
        display: flex;
        min-width: 0;
        align-items: flex-start;
        padding: 10px;
        border: 1px solid var(--border-color);
        border-radius: 10px;
        background-color: var(--trans-light-background);
        gap: 8px;
        transition: var(--default-duration);

        &.selected {
            border-color: var(--tieba-theme-color);
            background-color: var(--tieba-theme-background);
        }

        .scope-option-icon {
            width: 20px;
            height: 20px;
            flex: 0 0 20px;
            padding-top: 1px;
            color: var(--minimal-fore);
            stroke-width: 1.75;
        }

        .scope-option-content {
            min-width: 0;

            p {
                margin: 5px 0 0;
                color: var(--minimal-fore);
                font-size: 12px;
                line-height: 1.5;
            }
        }
    }
}

@media (width <= 720px) {
    .shield-scope-selector {
        grid-template-columns: 1fr;
    }
}
</style>
