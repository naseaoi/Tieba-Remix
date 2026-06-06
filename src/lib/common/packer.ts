import { currentPageType } from "../api/remixed";
import { afterHead } from "../elemental";
import { disabledModules } from "../user-values";

export interface UserModuleManifest {
    id: string;
    scope: UserModule["scope"];
    runAt: UserModule["runAt"];
    loader: () => Promise<{ default: UserModule }>;
}

const moduleById = new Map<string, UserModule>();

export async function parseUserModules(
    manifests: UserModuleManifest[],
    callbackfn?: ((module: UserModule) => void)
): Promise<UserModule[]> {
    const modules: UserModule[] = [];

    await Promise.all(manifests.map(async manifest => {
        const currentModule = registerManifestModule(manifest);
        const runnable = canRunModule(manifest);

        currentModule.runnable = runnable;
        modules.push(currentModule);
        callbackfn?.(currentModule);

        if (!runnable) return;

        try {
            Object.assign(currentModule, (await manifest.loader()).default, { runnable });
        } catch (error) {
            console.error(`[Tieba Remix] 模块导入失败: ${manifest.id}`, error);
            return;
        }

        const result = runModule(currentModule) as unknown;
        if (result instanceof Promise) await result;
    }));

    return modules;
}

export async function ensureUserModulesLoaded(manifests: UserModuleManifest[]): Promise<UserModule[]> {
    await Promise.all(manifests.map(async manifest => {
        const currentModule = registerManifestModule(manifest);
        if (currentModule.entry !== placeholderEntry) return;

        try {
            Object.assign(currentModule, (await manifest.loader()).default, {
                runnable: currentModule.runnable ?? canRunModule(manifest),
            });
        } catch (error) {
            console.error(`[Tieba Remix] 模块导入失败: ${manifest.id}`, error);
        }
    }));

    return [...moduleById.values()];
}

function canRunModule(module: Pick<UserModule, "id" | "scope" | "switch">): boolean {
    if (!module.switch && module.switch !== undefined) return false;
    if (module.id !== "remixed-theme" && disabledModules.get().includes(module.id)) return false;
    if (module.scope === true) return true;
    if (Array.isArray(module.scope)) return module.scope.includes(currentPageType());
    return module.scope.test(location.href);
}

function runModule(currentModule: UserModule) {
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

    const runAt = {
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

    return runAt[currentModule.runAt]();
}

function registerManifestModule(manifest: UserModuleManifest): UserModule {
    const cached = moduleById.get(manifest.id);
    if (cached) return cached;

    const module = {
        id: manifest.id,
        name: manifest.id,
        author: "",
        version: "",
        brief: "",
        description: "",
        switch: true,
        scope: manifest.scope,
        runAt: manifest.runAt,
        entry: placeholderEntry,
    } as UserModule;

    moduleById.set(manifest.id, module);
    return module;
}

function placeholderEntry(): void {}
