/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import { Offscreen } from "../ui/Offscreen";
import type { PageDimensions, PageGroup } from "./PageSplitter.types";

/**
 * Class to split a single HTML element into multiple pages based on a target height and width.
 */
export class PageSplitter {
    private pages: HTMLElement[] = [];
    private currentPageNumber = 1;
    private currentPage!: HTMLElement;
    private nextPage!: HTMLElement;
    private shouldDebug = false;
    private debugPageStart = 1;
    private debugPageEnd = 5;

    public constructor(
        private rootElement: HTMLElement,
        private targetDimensions: { height: number; width: number },
        private scratchElement: HTMLElement,
    ) {}

    /**
     * Given an HTML element split it into multiple distinct pages of specified dimensions.
     *
     * It will split up the structure while preserving all existing HTML.
     *
     * @param contents The HTML element to split up. Make sure it is attached to the DOM and has all of the CSS for the content applied to it. This method relies on the calculating the actual height of each element.
     * @param dimensions Options for the dimensions of a target page.
     * @returns
     */
    public static calculatePages(
        contents: HTMLElement | null,
        dimensions: PageDimensions,
    ): PageGroup[] | null {
        const { targetHeight, targetWidth, groupSize } = dimensions;
        if (!contents || targetHeight <= 0 || targetWidth <= 0) {
            return null;
        }

        // Clean out the scratch ref
        const scratchElement = document.createElement("div");
        for (const [key, value] of Object.entries(Offscreen.Styles)) {
            scratchElement.style[key as any] = value;
        }
        document.body.appendChild(scratchElement);

        const clonedContent = contents.cloneNode(true) as HTMLElement;
        scratchElement.appendChild(clonedContent);

        const splitter = new PageSplitter(
            clonedContent as HTMLElement,
            {
                height: targetHeight,
                width: targetWidth,
            },
            scratchElement,
        );

        const pages = splitter.calculatePages();
        document.body.removeChild(scratchElement);

        const pageGroups: Array<Array<HTMLElement>> = [];
        let currentGroup: Array<HTMLElement> = [];
        for (const page of pages) {
            currentGroup.push(page);
            if (currentGroup.length === groupSize) {
                pageGroups.push(currentGroup);
                currentGroup = [];
            }
        }
        if (currentGroup.length > 0) {
            pageGroups.push(currentGroup);
        }
        return pageGroups;
    }

    /**
     * Calculate the pages based on the root element group them into groups of `groupSize`.
     */
    private calculatePages(): HTMLElement[] {
        if (this.shouldDebug) {
            console.clear();
        }

        this.currentPage = this.createPage();
        this.nextPage = this.createPage();

        for (const child of Array.from(this.rootElement.childNodes)) {
            if (
                this.shouldDebug &&
                this.currentPageNumber > this.debugPageEnd
            ) {
                continue;
            }
            const didOverflow = this.splitNode(
                child,
                this.currentPage,
                this.nextPage,
            );
            if (!didOverflow) {
                // Move to the next element
                continue;
            }

            this.finishCurrentPage();

            // We had some overflow. It's possible that the element was so large that it overflowed multiple pages.
            let currentLastNode = this.currentPage.lastChild;
            while (
                currentLastNode &&
                this.didCurrentPageOverflow(currentLastNode)
            ) {
                this.currentPage.removeChild(currentLastNode);
                const didOverflow = this.splitNode(
                    currentLastNode,
                    this.currentPage,
                    this.nextPage,
                );
                if (didOverflow) {
                    this.finishCurrentPage();
                    currentLastNode = this.currentPage.lastElementChild;
                } else {
                    break;
                }
            }
        }

        if (this.currentPage.hasChildNodes()) {
            this.pages.push(this.currentPage);
        }

        return this.pages;
    }

    /**
     * Useful for debugging. Enables a bunch of console log statements and limits the pages calculated to the given range.
     *
     * @param pageStart
     * @param pageEnd
     */
    public enableDebug(pageStart: number = 1, pageEnd: number = 5) {
        this.shouldDebug = true;
        this.debugPageStart = pageStart;
        this.debugPageEnd = pageEnd;
    }

    /**
     * Finish the current page and start a new one.
     */
    private finishCurrentPage() {
        this.pages.push(this.currentPage);
        this.currentPage = this.nextPage;
        this.nextPage = this.createPage();
        this.debugLog("finishing page", this.currentPageNumber);
        this.currentPageNumber++;
        this.debugLog("start page", this.currentPageNumber);
    }

    /**
     * Log something if we are in debug mode.
     * @param args
     */
    private debugLog(...args: any) {
        if (!this.shouldDebug) {
            return;
        }

        if (
            this.currentPageNumber < this.debugPageStart ||
            this.currentPageNumber > this.debugPageEnd
        ) {
            return;
        }

        console.log(...args);
    }

    /**
     * Check if our current page overflowed it's container.
     *
     * @param contextNode Log this HTML node if we overflowed.
     * @param context Log this string if we overflowed.
     */
    private didCurrentPageOverflow(
        contextNode: Node,
        context?: string,
    ): boolean {
        const currentHeight = this.currentPage.getBoundingClientRect().height;
        const didOverflow = currentHeight > this.targetDimensions.height;

        if (didOverflow) {
            this.debugLog(
                `${context ?? "Check Overflow"} - Current page overflowed at node ${contextNode.nodeName} - ${contextNode.textContent?.trim()}`,
                `${currentHeight}px / ${this.targetDimensions.height}px`,
            );
        }
        return didOverflow;
    }

    /**
     * Create a new page from our template. Append it to the scratch element.
     * @returns The element.
     */
    private createPage(): HTMLElement {
        const cloned = this.rootElement.cloneNode(false) as HTMLElement;
        cloned.style.width = `${this.targetDimensions.width}px`;
        this.scratchElement.appendChild(cloned);
        const pageRect = cloned.getBoundingClientRect();
        this.debugLog(
            `Created page ${this.currentPageNumber} - ${pageRect.width}px / ${pageRect.height}px`,
        );
        return cloned;
    }

    /**
     * Given an HTML Node, traverse it recursively and split it into two elements while preserving all HTML structure
     *
     * @param node The element to split.
     * @param currentTarget The area we want to append the element to.
     * @param overflowTarget The area to append any parts of the element that didn't fit.
     *
     * @returns Whether we overflowed or not.
     */
    private splitNode(
        node: Node,
        currentTarget: Element,
        overflowTarget: Element,
    ): boolean {
        if (node instanceof Text) {
            return this.splitText(node, currentTarget, overflowTarget);
        } else if (node instanceof Element) {
            return this.splitElement(node, currentTarget, overflowTarget);
        } else {
            console.error("Skipping unknown node type", node.nodeName, node);
            return false;
        }
    }

    /**
     * Given an HTML Element, traverse it's children and split it into two elements while preserving all HTML structure
     *
     * @param element The element to split.
     * @param currentTarget The area we want to append the element to.
     * @param overflowTarget The area to append any parts of the element that didn't fit.
     *
     * @returns Whether we overflowed or not.
     */
    private splitElement(
        element: Element,
        currentTarget: Element,
        overflowTarget: Element,
    ): boolean {
        // First try to just append directly
        // Try to append our child element.
        currentTarget.appendChild(element);
        if (!this.didCurrentPageOverflow(element)) {
            const textContent = element.textContent?.trim();
            if (textContent) {
                this.debugLog(
                    `Appended whole element ${element.nodeName} - ${element.textContent?.trim()}`,
                );
            }
            // No overflow, keep going.
            return false;
        }

        // We just overflowed so we need to take back the child and split it.
        currentTarget.removeChild(element);

        // Make a candidate empty element for the split target
        const currentChildTarget = element.cloneNode(false) as Element;
        currentChildTarget.textContent = "";

        currentTarget.appendChild(currentChildTarget);

        // We need a candidate empty element in the overflow target as well.
        const overflowChildTarget = element.cloneNode(false) as Element;
        overflowChildTarget.textContent = "";

        let didOverflow = false;
        for (const child of Array.from(element.childNodes)) {
            if (didOverflow) {
                // No need to calculate further. Everything is going into the second.
                overflowChildTarget.appendChild(child);
                continue;
            }

            didOverflow = this.splitNode(
                child,
                currentChildTarget,
                overflowChildTarget,
            );
        }

        if (
            (didOverflow && !currentChildTarget.hasChildNodes()) ||
            currentChildTarget.textContent?.trim() === ""
        ) {
            currentTarget.removeChild(currentChildTarget);
        }

        if (overflowChildTarget.hasChildNodes()) {
            overflowTarget.appendChild(overflowChildTarget);
        }

        return didOverflow;
    }

    /**
     * Given an HTML Text, traverse it's children and split it into two elements while preserving all HTML structure
     *
     * @param text The HTML Text to split.
     * @param currentTarget The area we want to append the element to.
     * @param overflowTarget The area to append any parts of the element that didn't fit.
     *
     * @return If we overflowed or not.
     */
    private splitText(
        text: Text,
        currentTarget: Element,
        overflowTarget: Element,
    ): boolean {
        let didOverflow = false;
        // We have to split up text. Lets go word by word.
        const words = text.textContent?.replaceAll("\n", "").split(" ") ?? [];
        words.forEach((word, i) => {
            const isFirstWord = i === 0;
            // if (isFirstWord && word === "") {
            //     return; // Nothing to do here.
            // }
            // Make sure we add a space after the first word because we split on spaces.
            const textNode = document.createTextNode(
                isFirstWord ? word : ` ${word}`,
            );

            if (didOverflow) {
                overflowTarget.appendChild(textNode);
                return;
            }

            // Push the word in.
            currentTarget.appendChild(textNode);

            // Check if we've gone over our height.
            if (this.didCurrentPageOverflow(textNode)) {
                // We just overflowed. We need to remove the last word and push it into the overflow element.
                currentTarget.removeChild(textNode);
                didOverflow = true;
                overflowTarget.appendChild(textNode);
            }
        });
        this.condenseTextNodes(currentTarget);
        this.condenseTextNodes(overflowTarget);

        return didOverflow;
    }

    /**
     * Join together all adjacent text nodes.
     *
     * @param element The element to walk.
     */
    private condenseTextNodes(element: Element) {
        for (const child of Array.from(element.childNodes)) {
            if (child instanceof Text) {
                const prev = child.previousSibling;
                if (prev instanceof Text) {
                    // Move it into the previous text node.
                    prev.textContent += child.textContent ?? "";
                    element.removeChild(child);
                }
            }
        }
    }
}
