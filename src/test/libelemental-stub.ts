export function findParent(element: Element, className: string): Element | undefined {
    return element.parentElement?.closest(`.${className}`) ?? undefined;
}
