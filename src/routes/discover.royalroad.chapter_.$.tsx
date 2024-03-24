/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2024 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMeasure } from "@uidotdev/usehooks";
import { useLayoutEffect, useRef, useState } from "react";
import { RoyalRoadApi } from "../discover/RoyalRoadApi";
import { DEFAULT_READER_SETTINGS } from "../storage/ReaderSettings";
import { Colors } from "../ui/Colors";
import { HtmlContent } from "../ui/HtmlContent";
import { Offscreen } from "../ui/Offscreen";
import { READER_SETTINGS_DEFAULTS } from "../ui/reader/ReaderSettings.defaults";
import { SkeletonContext } from "../ui/SkeletonContext";
import { TitleBar } from "../ui/TitleBar";

export const Route = createFileRoute("/discover/royalroad/chapter/$")({
    component: () => {
        return <RoyalRoadChapter />;
    },
});

function RoyalRoadChapter() {
    const { _splat } = Route.useParams();

    const chapterQuery = useQuery({
        queryKey: ["chapter", _splat],
        queryFn: async () => {
            return await RoyalRoadApi.chapter(_splat);
        },
    });

    const contentRef = useRef<HTMLDivElement | null>(null);
    const [contentSizeRef, contentMeasure] = useMeasure();

    const [pageGroups, setPageGroups] = useState<Array<Array<HTMLElement>>>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const columnGap = DEFAULT_READER_SETTINGS.contentPadding * 2 + 1;
    const targetPageHeight =
        (contentMeasure.height ?? 0) -
        DEFAULT_READER_SETTINGS.contentPadding - // There's no top padding.
        // Titlebar height
        50;

    const minPageWidth = Math.max(400, Math.floor(targetPageHeight / 1.5));
    let targetPageWidth =
        (contentMeasure.width ?? 0) -
        DEFAULT_READER_SETTINGS.contentPadding * 2;
    const countColumns = Math.floor(targetPageWidth / minPageWidth);
    targetPageWidth =
        (targetPageWidth - columnGap * (countColumns - 1)) / countColumns;
    useLayoutEffect(() => {
        const pageGroups = calculatePageGroups(contentRef.current, {
            targetHeight: targetPageHeight,
            targetWidth: targetPageWidth,
            groupSize: countColumns,
        });

        if (pageGroups !== null) {
            setPageGroups(pageGroups);
        }
    }, [
        targetPageHeight,
        targetPageWidth,
        countColumns,
        chapterQuery.data?.contentHtml,
    ]);

    const [visiblePageGroupIndex, setVisiblePageGroupIndex] = useState(0);
    const visiblePageGroup = pageGroups[visiblePageGroupIndex] ?? null;

    return (
        <div
            css={{
                height: "100%",
                width: "100%",
                background: "#fff",
                maxHeight: "100%",
                overflow: "auto",
            }}
        >
            <SkeletonContext.Provider
                value={{ isLoading: chapterQuery.isLoading }}
            >
                <div
                    ref={contentSizeRef}
                    css={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100vh",
                        width: "100vw",
                        overflow: "auto",
                    }}
                >
                    <TitleBar
                        compact
                        title={chapterQuery.data?.title ?? "Placeholder loader"}
                    />
                    <Offscreen.Container>
                        <HtmlContent
                            ref={contentRef}
                            html={
                                chapterQuery.data?.contentHtml ??
                                "<p>Hello world</p>"
                            }
                            readerSettings={READER_SETTINGS_DEFAULTS}
                        />
                    </Offscreen.Container>
                    {visiblePageGroup && (
                        <div
                            css={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "flex-start",
                                padding: DEFAULT_READER_SETTINGS.contentPadding,
                                paddingTop: 0,
                                gap: columnGap,
                            }}
                        >
                            {visiblePageGroup.map((page, i) => {
                                const isFirst = i === 0;
                                const isLast =
                                    i === visiblePageGroup.length - 1;
                                return (
                                    <PageView
                                        css={[
                                            !isLast && {
                                                position: "relative",
                                                "&:after": {
                                                    content: "''",
                                                    position: "absolute",
                                                    top: 20,
                                                    bottom: 20,
                                                    left: `calc(100% + ${columnGap / 2}px)`,
                                                    background:
                                                        Colors.Light.slate5,
                                                    width: 1,
                                                },
                                            },
                                        ]}
                                        key={i}
                                        contents={page}
                                        pageNumber={
                                            visiblePageGroupIndex *
                                                countColumns +
                                            i +
                                            1
                                        }
                                        height={targetPageHeight}
                                        width={targetPageWidth}
                                        onClick={() => {
                                            if (isLast) {
                                                setVisiblePageGroupIndex(
                                                    Math.min(
                                                        pageGroups.length - 1,
                                                        visiblePageGroupIndex +
                                                            1,
                                                    ),
                                                );
                                            } else if (isFirst) {
                                                setVisiblePageGroupIndex(
                                                    Math.max(
                                                        0,
                                                        visiblePageGroupIndex -
                                                            1,
                                                    ),
                                                );
                                            }
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </SkeletonContext.Provider>
        </div>
    );
}

function PageView(props: {
    className?: string;
    pageNumber: number;
    contents: HTMLElement;
    height: number;
    width: number;
    onClick?: () => void;
}) {
    const { pageNumber, contents, height, width } = props;
    return (
        <div
            id={`page-container-${pageNumber}`}
            onClick={props.onClick}
            className={props.className}
            css={{
                position: "relative",
            }}
        >
            <HtmlContent
                id={`page-${pageNumber}`}
                html={contents}
                css={{
                    height: height,
                    minHeight: height,
                    maxHeight: height,
                    overflow: "hidden",
                    width: width,
                }}
                readerSettings={READER_SETTINGS_DEFAULTS}
            />
            <div
                css={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: Colors.Light.slate9,
                    fontWeight: "bold",
                    fontSize: 12,
                }}
            >
                Page {pageNumber}
            </div>
        </div>
    );
}

type Page = HTMLElement;
type PageGroup = Array<Page>;

type PageDimensions = {
    targetHeight: number;
    targetWidth: number;
    groupSize: number;
};

function calculatePageGroups(
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

class PageSplitter {
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

    public enableDebug(pageStart: number = 1, pageEnd: number = 5) {
        this.shouldDebug = true;
        this.debugPageStart = pageStart;
        this.debugPageEnd = pageEnd;
    }

    private finishCurrentPage() {
        this.pages.push(this.currentPage);
        this.currentPage = this.nextPage;
        this.nextPage = this.createPage();
        this.debugLog("finishing page", this.currentPageNumber);
        this.currentPageNumber++;
        this.debugLog("start page", this.currentPageNumber);
    }

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

    public calculatePages(): HTMLElement[] {
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
     *
     * @param node
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
     *
     * @param element
     * @returns Whether we overflowed or not.
     */
    private splitElement(
        element: Element,
        currentTarget: Element,
        overflowTarget: Element,
    ): boolean {
        let didOverflow = false;
        for (const child of Array.from(element.childNodes)) {
            if (didOverflow) {
                // No need to calculate further. Everything is going into the second.
                overflowTarget.appendChild(child);
                continue;
            }

            // Try to append our child element.
            currentTarget.appendChild(child);
            if (!this.didCurrentPageOverflow(child)) {
                const textContent = child.textContent?.trim();
                if (textContent) {
                    this.debugLog(
                        `Appended whole element ${child.nodeName} - ${child.textContent?.trim()}`,
                    );
                }
                // No overflow, keep going.
                continue;
            }

            // We just overflowed so we need to take back the child and split it.
            currentTarget.removeChild(child);

            if (child instanceof Text) {
                // We can't make empty clones of text nodes, so we just need to try and split it directly.
                didOverflow = this.splitText(
                    child,
                    currentTarget,
                    overflowTarget,
                );
                continue;
            }
            // Make a candidate empty element for the split target
            const currentChildTarget = child.cloneNode(false) as Element;
            currentTarget.appendChild(currentChildTarget);

            if (
                this.didCurrentPageOverflow(
                    currentChildTarget,
                    "Empty child target",
                )
            ) {
                // If even the empty element overflowed then everything goes to the target
                didOverflow = true;
                currentTarget.removeChild(currentChildTarget);
                // No need to split it.
                overflowTarget.appendChild(child);
                continue;
            }

            // Now we have a candidate empty child target appended to the current target.
            // We'll need and overflow one too, then we can split them.
            const overflowChildTarget = child.cloneNode(false) as Element;

            const didSplitOverflow = this.splitNode(
                child,
                currentChildTarget,
                overflowChildTarget,
            );
            if (!didSplitOverflow) {
                // Technically this branch shouldn't happen.
                continue;
            }

            didOverflow = true;
            // The overflow needs to go on the next target
            overflowTarget.appendChild(overflowChildTarget);
            // And maybe we need to cleanup the current target.
            if (!currentChildTarget.hasChildNodes()) {
                currentTarget.removeChild(currentChildTarget);
            }
        }

        return didOverflow;
    }

    /**
     * Given an HTML Element, traverse it's children and split it into two elements while preserving all HTML structure
     *
     *
     * @param element
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
