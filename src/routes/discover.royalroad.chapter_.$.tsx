/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2024 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMeasure } from "@uidotdev/usehooks";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { RoyalRoadApi } from "../bookSource/RoyalRoadApi";
import { DEFAULT_READER_SETTINGS } from "../storage/ReaderSettings";
import { Colors } from "../ui/Colors";
import { HtmlContent } from "../ui/HtmlContent";
import { Offscreen } from "../ui/Offscreen";
import { READER_SETTINGS_DEFAULTS } from "../reader/ReaderSettings.defaults";
import { SkeletonContext } from "../ui/SkeletonContext";
import { TitleBar } from "../ui/TitleBar";
import { PageSplitter } from "../reader/PageSplitter";

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
        throwOnError: true,
    });

    const contentRef = useRef<HTMLDivElement | null>(null);
    const [contentSizeRef, contentMeasure] = useMeasure();

    const [pageGroups, setPageGroups] = useState<Array<Array<HTMLElement>>>([]);
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
        const pageGroups = PageSplitter.calculatePages(contentRef.current, {
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
        chapterQuery.data?.content,
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
                                chapterQuery.data?.content ??
                                "<p>Hello world</p>"
                            }
                            rawHtmlPrefix={`
<h2 class="title">${chapterQuery.data?.title}</h2>
`}
                            trimEmpty
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
                                            if (isFirst) {
                                                setVisiblePageGroupIndex(
                                                    Math.max(
                                                        0,
                                                        visiblePageGroupIndex -
                                                            1,
                                                    ),
                                                );
                                            } else if (isLast) {
                                                setVisiblePageGroupIndex(
                                                    Math.min(
                                                        pageGroups.length - 1,
                                                        visiblePageGroupIndex +
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
