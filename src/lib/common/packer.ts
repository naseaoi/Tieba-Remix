import _ from "lodash";
import { currentPageType } from "../api/remixed";
import { afterHead } from "../elemental";
import { disabledModules } from "../user-values";

export async function parseUserModules(
    glob: Record<string, () => Promise<any>>,
    callbackfn?: ((module: UserModule) => void)
): Promise<UserModule[]> {
    const modules: UserModule[] = [];

    await Promise.all(_.map(glob, async moduleExport => {
        const currentModule = (await moduleExport()).default as UserModule;
        const disabledSet = new Set(disabledModules.get());

        const runnable = (() => {
            if (currentModule.switch || currentModule.switch === undefined) {
                if (currentModule.id !== "remixed-theme" && disabledSet.has(currentModule.id)) {
                    return false;
                }

                if (currentModule.scope === true) return true;

                if (Array.isArray(currentModule.scope)) {
                    for (const scope of currentModule.scope) {
                        if (currentPageType() === scope) return true;
                    }
                }

                if (currentModule.scope instanceof RegExp) {
                    if (currentModule.scope.test(location.href)) return true;
                }
            }

            return false;
        })();

        const runModule = {
            "immediately": () => currentModule.entry(),
            "afterHead": () => { afterHead(() => currentModule.entry()); },
            "DOMLoaded": () => {
                if (document.readyState !== "loading") {
                    return currentModule.entry();
                }
                document.addEventListener("DOMContentLoaded", () => currentModule.entry(), { once: true });
            },
            "loaded": () => {
                if (document.readyState === "complete") {
                    return currentModule.entry();
                }
                window.addEventListener("load", () => currentModule.entry(), { once: true });
            },
        };

        currentModule.runnable = runnable;
        if (runnable) {
            const result = runModule[currentModule.runAt]() as unknown;
            if (result instanceof Promise) await result;
        }

        modules.push(currentModule);
        if (callbackfn) callbackfn(currentModule);
    }));

    return modules;
}

