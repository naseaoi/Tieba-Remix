import { defineComponent } from "vue";
import { vi } from "vitest";

const component = defineComponent({ template: "<div><slot /></div>" });

export const UserButton = component;
export const UserCheck = component;
export const UserDialog = component;
export const UserDialogAbnormal = component;
export const UserSelectItem = component;
export const UserTextbox = component;
export const messageBox = vi.fn();
export const toast = vi.fn();
