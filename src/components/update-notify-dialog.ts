import { renderDialog } from "@/lib/render";
import UpdateNotifyDialog, {
    UpdateNotifyDialogProps,
} from "./update-notify-dialog.vue";

export type { UpdateNotifyAction, UpdateNotifyDialogProps } from "./update-notify-dialog.vue";

export function updateNotifyDialog(opts: UpdateNotifyDialogProps): Promise<string> {
    return new Promise<string>((resolve) => {
        let resolved = false;
        renderDialog(UpdateNotifyDialog, {
            ...opts,
            onUnload(payload: string) {
                if (resolved) return;
                resolved = true;
                resolve(payload ?? "");
            },
        });
    });
}
