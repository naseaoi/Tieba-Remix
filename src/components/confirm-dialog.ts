import { renderDialog } from "@/lib/render";
import ConfirmDialog, {
    ConfirmDialogProps,
    ConfirmDialogResponse,
} from "./confirm-dialog.vue";

export type { ConfirmDialogProps, ConfirmDialogResponse, ConfirmDialogType, ConfirmDialogVariant } from "./confirm-dialog.vue";
export { default as ConfirmDialog } from "./confirm-dialog.vue";

/**
 * 渲染统一风格的确认对话框。
 *
 * 用于替代 `user-view` 的 `messageBox`，提供与项目主题（Remixed / Vercel）一致的视觉。
 *
 * @example
 * const result = await confirmDialog({
 *     title: "重置",
 *     content: "该操作不可逆，是否继续？",
 *     type: "forceTrueFalse",
 *     danger: true,
 * });
 * if (result === "positive") { ... }
 */
export function confirmDialog(opts: ConfirmDialogProps): Promise<ConfirmDialogResponse> {
    return new Promise<ConfirmDialogResponse>((resolve) => {
        let resolved = false;
        renderDialog(ConfirmDialog, {
            ...opts,
            onUnload(payload: ConfirmDialogResponse) {
                if (resolved) return;
                resolved = true;
                resolve(payload ?? "cancel");
            },
        });
    });
}
