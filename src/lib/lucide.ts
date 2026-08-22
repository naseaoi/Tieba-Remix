import type { LucideIcon, LucideProps } from "@lucide/vue";
import { h, render } from "vue";

export type { LucideIcon } from "@lucide/vue";

export function createLucideIconElement(
    icon: LucideIcon,
    props: LucideProps = {},
): SVGSVGElement {
    const host = document.createElement("span");
    render(h(icon, {
        "aria-hidden": "true",
        ...props,
    }), host);

    const element = host.firstElementChild;
    if (!(element instanceof SVGSVGElement)) {
        throw new TypeError("Lucide icon did not render an SVG element");
    }

    element.remove();
    return element;
}

export function setLucideIcon(
    target: Element,
    icon: LucideIcon,
    props: LucideProps = {},
): SVGSVGElement {
    const element = createLucideIconElement(icon, props);
    target.replaceChildren(element);
    return element;
}
