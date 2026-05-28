import { renderDialog } from "@/lib/render";
import UpdateNotifyDialog, {
    UpdateNotifyDialogProps,
} from "./update-notify-dialog.vue";

export type { UpdateNotifyAction, UpdateNotifyDialogProps } from "./update-notify-dialog.vue";

export function updateNotifyDialog(opts: UpdateNotifyDialogProps): Promise<string> {
    return new Promise<string>((resolve) => {
        let resolved = false;
        const settle = (payload: string) => {
            if (resolved) return;
            resolved = true;
            resolve(payload);
        };
        renderDialog<UpdateNotifyDialogProps, string>(UpdateNotifyDialog, opts, {
            unloaded(payload) {
                settle(payload ?? "");
            },
            abnormalUnload() {
                settle("");
            },
        });
    });
}
