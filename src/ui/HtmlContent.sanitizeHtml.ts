/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import DOMPurify from "dompurify";

export function sanitizeHtml(
    raw: string,
    options: { trimEmpty?: boolean },
): HTMLElement {
    const purified = DOMPurify.sanitize(raw, {
        FORBID_TAGS: ["style"],
        RETURN_DOM: true,
        KEEP_CONTENT: true,
    });

    // Now lets remove some attributes we absolutely don't want.
    walkChildElements(purified, (element) => {
        element.removeAttribute("style");
        element.removeAttribute("class");
        element.removeAttribute("height");
        element.removeAttribute("width");
        if (
            options.trimEmpty &&
            element.textContent?.trim() === "" &&
            element.tagName !== "BR" &&
            element.tagName !== "hr" &&
            element.tagName !== "img"
        ) {
            element.remove();
        }

        // Wrap tables
        if (element instanceof HTMLTableElement) {
            const wrapper = document.createElement("div");
            wrapper.classList.add("table-wrap");
            element.replaceWith(wrapper);
            wrapper.appendChild(element);
        }
    });

    return purified;
}

function walkChildElements(node: Element, handler: (element: Element) => void) {
    const childNodes = Array.from(node.childNodes);
    for (const child of childNodes) {
        if (child instanceof Element) {
            handler(child);
            if (child.childElementCount > 0) {
                walkChildElements(child, handler);
            }
        }
    }
}
