import { userModuleManifests } from "@/modules/manifest";
import { renderDialog } from "../render";
import { ensureUserModulesLoaded } from "./packer";
import { ensureSettingsCSS } from "../theme";

export async function openSettingsDialog() {
    await Promise.all([
        ensureUserModulesLoaded(userModuleManifests),
        ensureSettingsCSS(),
    ]);
    const { default: Settings } = await import("@/components/settings.vue");
    renderDialog(Settings);
}
