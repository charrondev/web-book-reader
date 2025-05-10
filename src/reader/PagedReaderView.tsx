/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import { Button, Popover } from "@radix-ui/themes";
import { useDebounce, useMeasure, useThrottle } from "@uidotdev/usehooks";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MdOutlineList } from "react-icons/md";
import { ReaderPage } from "./ReaderPage";
import { READER_SETTINGS_DEFAULTS } from "./ReaderSettings.defaults";
import { DEFAULT_READER_SETTINGS } from "../storage/ReaderSettings";
import type { Book, Chapter } from "../Types";
import { Colors } from "../ui/Colors";
import { HtmlContent } from "../ui/HtmlContent";
import { Offscreen } from "../ui/Offscreen";
import { SkeletonContext } from "../ui/SkeletonContext";
import { TitleBar } from "../ui/TitleBar";
import { ChapterCache } from "./ChapterCache";
import { HtmlContentLoader } from "../ui/HtmlContent.Loader";
import { throttle } from "lodash-es";
import styled from "@emotion/styled";
import { ReaderPageLoader } from "./ReaderPage.loader";
import { asyncAnimationFrame } from "../utils";

interface IProps {
    book: Book | null;
    chapters: Array<Chapter> | null;
}

export function PagedReaderView(props: IProps) {
    const templateRef = useRef<HTMLDivElement | null>(null);
    const [contentSizeRef, contentMeasure] = useMeasure();

    const [chapterCache, setChapterCache] = useState<ChapterCache | null>(null);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [shouldRecalculate, _setShouldRecalculate] = useState(true);
    const setShouldRecalculate = useMemo(() => {
        return throttle(_setShouldRecalculate, 1000);
    }, []);
    const [currentPagesOffsets, setCurrentPageOffsets] = useState<number[]>([]);
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

    useEffect(() => {
        function handleResize() {
            setIsRecalculating(true);
            setShouldRecalculate(true);
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [setIsRecalculating, setShouldRecalculate]);

    useLayoutEffect(() => {
        if (chapterCache === null) {
            return;
        }

        setIsRecalculating(true);
        setShouldRecalculate(true);
    }, [targetPageHeight, targetPageWidth, countColumns]);

    const { chapters } = props;
    useLayoutEffect(() => {
        const templateEl = templateRef.current;
        if (
            chapters === null ||
            targetPageHeight === 0 ||
            targetPageWidth === 0 ||
            templateEl === null
        ) {
            console.log("not ready", {
                chapters,
                targetPageHeight,
                targetPageWidth,
                templateEl,
                shouldRecalculate,
            });
            return;
        }

        if (!shouldRecalculate) {
            console.log("not recaulcating because shouldRecalculate is false");
            return;
        }

        setShouldRecalculate(false);

        async function createChapterCache(
            templateEl: HTMLElement,
            chapters: Chapter[],
        ) {
            console.log("doing calculations");
            const chapterCache = new ChapterCache(
                {
                    targetHeight: targetPageHeight,
                    targetWidth: targetPageWidth,
                },
                templateEl,
            );
            for (const chapter of chapters) {
                await asyncAnimationFrame(() => {
                    const prefixHtml = `<h2 class="title">${chapter?.title}</h2>`;
                    chapterCache.addChapter(
                        chapter.foreignUrl,
                        prefixHtml + chapter.content,
                    );
                });
            }
            setChapterCache(chapterCache);
            setCurrentPageOffsets(countColumns === 1 ? [0] : [0, 1]);
            setIsRecalculating(false);
        }

        createChapterCache(templateEl, chapters);
    }, [
        targetPageHeight,
        targetPageWidth,
        countColumns,
        chapters,
        shouldRecalculate,
        templateRef.current,
    ]);
    const [isChapterListOpen, setIsChapterListOpen] = useState(false);

    // const [visiblePageGroupIndex, setVisiblePageGroupIndex] = useState(0);
    // const visiblePageGroup = pageGroups[visiblePageGroupIndex] ?? null;
    const currentPages = chapterCache?.getPages(currentPagesOffsets) ?? [];
    const lastCurrentPageOffset =
        currentPagesOffsets[currentPagesOffsets.length - 1];
    const currentChapterForeignUrl =
        lastCurrentPageOffset != null
            ? chapterCache?.getChapterIDForPageOffset(lastCurrentPageOffset) ??
              null
            : null;

    return (
        <div
            css={[
                {
                    height: "100%",
                    width: "100%",
                    background: "#fff",
                    maxHeight: "100%",
                    overflow: "auto",
                },
                isRecalculating && {
                    filter: "blur(5px)",
                },
            ]}
        >
            <SkeletonContext.Provider
                value={{ isLoading: chapterCache === null }}
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
                        title={props.book?.title ?? "Book Title Here"}
                        actions={
                            <Popover.Root
                                open={isChapterListOpen}
                                onOpenChange={setIsChapterListOpen}
                            >
                                <Popover.Trigger>
                                    <Button
                                        variant="surface"
                                        onClick={() => {
                                            setIsChapterListOpen(
                                                (prev) => !prev,
                                            );
                                        }}
                                    >
                                        <MdOutlineList css={{ fontSize: 20 }} />
                                    </Button>
                                </Popover.Trigger>
                                <Popover.Content
                                    css={{
                                        maxHeight: 400,
                                        overflow: "auto",
                                        maxWidth: 300,
                                    }}
                                >
                                    <div>
                                        <h2>Chapters</h2>
                                        <ul
                                            css={{
                                                padding: 0,
                                                margin: 0,
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 4,
                                            }}
                                        >
                                            {props.chapters?.map(
                                                (chapter, i) => {
                                                    const isActive =
                                                        currentChapterForeignUrl ===
                                                        chapter.foreignUrl;
                                                    return (
                                                        <li
                                                            key={i}
                                                            css={[
                                                                {
                                                                    appearance:
                                                                        "none",
                                                                    listStyle:
                                                                        "none",
                                                                    padding:
                                                                        "0px 8px",
                                                                },
                                                                isActive && {
                                                                    background:
                                                                        Colors
                                                                            .Light
                                                                            .slate5,
                                                                },
                                                            ]}
                                                            onClick={() => {
                                                                const offset =
                                                                    chapterCache?.getChapterFirstPageOffset(
                                                                        chapter.foreignUrl,
                                                                    );
                                                                if (
                                                                    offset ==
                                                                    null
                                                                ) {
                                                                    return;
                                                                }
                                                                if (
                                                                    offset %
                                                                        2 ===
                                                                    0
                                                                ) {
                                                                    setCurrentPageOffsets(
                                                                        countColumns ===
                                                                            1
                                                                            ? [
                                                                                  offset,
                                                                              ]
                                                                            : [
                                                                                  offset,
                                                                                  offset +
                                                                                      1,
                                                                              ],
                                                                    );
                                                                } else {
                                                                    setCurrentPageOffsets(
                                                                        countColumns ===
                                                                            1
                                                                            ? [
                                                                                  offset,
                                                                              ]
                                                                            : [
                                                                                  offset -
                                                                                      1,
                                                                                  offset,
                                                                              ],
                                                                    );
                                                                }
                                                                setIsChapterListOpen(
                                                                    false,
                                                                );
                                                            }}
                                                        >
                                                            {chapter.title}
                                                        </li>
                                                    );
                                                },
                                            )}
                                        </ul>
                                    </div>
                                </Popover.Content>
                            </Popover.Root>
                        }
                    />
                    <Offscreen.Container>
                        <SkeletonContext.Provider value={{ isLoading: false }}>
                            <HtmlContent
                                ref={templateRef}
                                html={"<p>Hello world</p>"}
                                trimEmpty
                                readerSettings={READER_SETTINGS_DEFAULTS}
                            />
                        </SkeletonContext.Provider>
                    </Offscreen.Container>
                    {chapterCache === null && (
                        <PageContainer gap={columnGap}>
                            <ReaderPageLoader
                                height={targetPageHeight}
                                width={targetPageWidth}
                            />
                            <ReaderPageLoader
                                height={targetPageHeight}
                                width={targetPageWidth}
                            />
                        </PageContainer>
                    )}
                    {currentPages.length > 0 && (
                        <PageContainer gap={columnGap}>
                            {currentPages.map((page, i) => {
                                const isFirst = i === 0;
                                const isLast = i === currentPages.length - 1;
                                return (
                                    <ReaderPage
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
                                        pageNumber={currentPagesOffsets[i] + 1}
                                        height={targetPageHeight}
                                        width={targetPageWidth}
                                        onClick={() => {
                                            setCurrentPageOffsets((prev) => {
                                                const prevFirstPageOffset =
                                                    prev[0];
                                                if (prev == null) {
                                                    return prev;
                                                }

                                                if (isFirst) {
                                                    let newFirstPageOffset =
                                                        Math.max(
                                                            prevFirstPageOffset -
                                                                countColumns,
                                                            0,
                                                        );
                                                    return [
                                                        newFirstPageOffset,
                                                        newFirstPageOffset + 1,
                                                    ];
                                                } else if (isLast) {
                                                    let newFirstPageOffset =
                                                        Math.min(
                                                            prevFirstPageOffset +
                                                                countColumns,
                                                            chapterCache?.getPageCount() ??
                                                                0,
                                                        );
                                                    return [
                                                        newFirstPageOffset,
                                                        newFirstPageOffset + 1,
                                                    ];
                                                }
                                                return prev;
                                            });
                                        }}
                                    />
                                );
                            })}
                        </PageContainer>
                    )}
                </div>
            </SkeletonContext.Provider>
        </div>
    );
}

const PageContainer = styled.div(
    {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: DEFAULT_READER_SETTINGS.contentPadding,
        paddingTop: 0,
    },
    (props: { gap: number }) => {
        return {
            gap: props.gap,
        };
    },
);
