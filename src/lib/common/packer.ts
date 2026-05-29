import _ from "@/lib/utils/_";
import { currentPageType } from "../api/remixed";
import { afterHead } from "../elemental";
import { disabledModules } from "../user-values";

export async function parseUserModules(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    glob: Record<string, () => Promise<any>>,
    callbackfn?: ((module: UserModule) => void)
): Promise<UserModule[]> {
    const modules: UserModule[] = [];

    await Promise.all(_.map(glob, async (moduleExport, modulePath) => {
        let currentModule: UserModule;
        try {
            currentModule = (await moduleExport()).default as UserModule;
        } catch (error) {
            console.error(`[Tieba Remix] 模块导入失败: ${modulePath}`, error);
            return;
        }

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

        const runEntry = () => {
            try {
                const result = currentModule.entry() as unknown;
                if (result instanceof Promise) {
                    return result.catch(error => {
                        console.error(`[Tieba Remix] 模块执行失败: ${currentModule.id}`, error);
                    });
                }
                return result;
            } catch (error) {
                console.error(`[Tieba Remix] 模块执行失败: ${currentModule.id}`, error);
            }
        };

        const runModule = {
            "immediately": () => runEntry(),
            "afterHead": () => { afterHead(() => runEntry()); },
            "DOMLoaded": () => {
                if (document.readyState !== "loading") {
                    return runEntry();
                }
                document.addEventListener("DOMContentLoaded", () => runEntry(), { once: true });
            },
            "loaded": () => {
                if (document.readyState === "complete") {
                    return runEntry();
                }
                window.addEventListener("load", () => runEntry(), { once: true });
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

