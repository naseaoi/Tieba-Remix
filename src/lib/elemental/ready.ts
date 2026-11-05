export function onDOMReady(callback: () => void): void {
    if (document.readyState !== "loading") {
        callback();
    } else {
        document.addEventListener("DOMContentLoaded", () => callback(), { once: true });
    }
}

export function onWindowLoaded(callback: () => void): void {
    if (document.readyState === "complete") {
        callback();
    } else {
        window.addEventListener("load", () => callback(), { once: true });
    }
}
