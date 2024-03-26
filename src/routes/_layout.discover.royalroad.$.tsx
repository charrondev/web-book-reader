/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2024 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

import styled from "@emotion/styled";
import { Select } from "@radix-ui/themes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
    RoyalRoadApi,
    type RoyalRoadBookDetails,
} from "../bookSource/RoyalRoadApi";
import { BookCover } from "../ui/BookCover";
import { BookCoverLoader } from "../ui/BookCover.Loader";
import { Button } from "../ui/Button";
import { Colors } from "../ui/Colors";
import { ContentContainer } from "../ui/ContentContainer";
import { DateTime } from "../ui/DateTime";
import { DetailRow } from "../ui/DetailRow";
import { HtmlContent } from "../ui/HtmlContent";
import {
    CirclePlaceholder,
    Placeholder,
    SkeletonContext,
} from "../ui/SkeletonContext";
import { openUrlInWindow } from "../ui/SmartLink";
import { Tags } from "../ui/Tags";
import { TitleBar } from "../ui/TitleBar";
import { spaceshipCompare } from "../utils";
import { useDatabaseClient } from "../storage/DatabaseClient";
import { Spinner } from "@radix-ui/themes";

export const Route = createFileRoute("/_layout/discover/royalroad/$")({
    component: () => {
        return <RoyalRoadDetails />;
    },
});

function RoyalRoadDetails() {
    const { _splat } = Route.useParams();
    const dbClient = useDatabaseClient();

    const addBookMutation = useMutation({
        mutationFn: async (book: RoyalRoadBookDetails) => {
            await dbClient.addBook({
                ...book,
            });
        },
    });

    const bookQuery = useQuery({
        queryKey: ["rr-fictions", _splat],
        queryFn: async () => {
            const fiction = await RoyalRoadApi.fictionDetails(_splat);
            const dbBook = await dbClient.fetchBookWhere({
                foreignUrl: fiction.foreignUrl,
            });
            return {
                ...fiction,
                dbBook,
            };
        },
    });

    const [chapterSort, setChapterSort] = useState<"newest" | "oldest">(
        "newest",
    );

    return (
        <div
            css={{
                paddingTop: 24,
                paddingBottom: 24,
            }}
        >
            <SkeletonContext.Provider
                value={{ isLoading: bookQuery.isLoading }}
            >
                <TitleBar
                    hideHeading
                    title={bookQuery.data?.title ?? "Placeholder title"}
                    back={{
                        url: "/discover",
                        label: "Discover",
                    }}
                />
                <ContentContainer>
                    <div
                        css={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 24,
                        }}
                    >
                        {bookQuery.data ? (
                            <BookCover height={220} book={bookQuery.data} />
                        ) : (
                            <BookCoverLoader height={220} />
                        )}

                        <div
                            css={{
                                flex: 1,
                                height: 220,
                                display: "flex",
                                flexDirection: "column",
                                minWidth: 0,
                            }}
                        >
                            <h1
                                css={{
                                    fontFamily: "var(--font-family-serif)",
                                    fontSize: 24,
                                }}
                            >
                                <Placeholder>
                                    {bookQuery.data?.title ??
                                        "Potential Book Title Here"}
                                </Placeholder>
                            </h1>

                            <div css={{ marginTop: 4 }}>
                                <a
                                    href={bookQuery.data?.authorUrl}
                                    target="_blank"
                                    css={{
                                        display: "flex",
                                        alignItems: "center",
                                        textDecoration: "none",
                                        fontSize: 14,
                                        gap: 8,
                                        color: Colors.Light.slate11,
                                        fontWeight: "bold",
                                    }}
                                >
                                    <Placeholder
                                        skeleton={
                                            <CirclePlaceholder size={24} />
                                        }
                                    >
                                        <img
                                            css={{
                                                height: 24,
                                                width: 24,
                                                borderRadius: 9,
                                            }}
                                            src={
                                                bookQuery.data?.authorAvatarUrl
                                            }
                                        ></img>
                                    </Placeholder>
                                    <Placeholder>
                                        {bookQuery.data?.authorName ??
                                            "Author Name"}
                                    </Placeholder>
                                </a>
                            </div>
                            <div
                                css={{ display: "flex", gap: 6, marginTop: 12 }}
                            >
                                <Button
                                    type="button"
                                    primary
                                    onClick={() => {
                                        if (bookQuery.data) {
                                            addBookMutation.mutate(
                                                bookQuery.data,
                                            );
                                        }
                                    }}
                                >
                                    {/* TODO: Should show "Read" based on download status */}
                                    {addBookMutation.isSuccess ||
                                    bookQuery.data?.dbBook
                                        ? "Read"
                                        : "Add to Library"}
                                    {addBookMutation.isPending && <Spinner />}
                                </Button>
                                <Button type="button">Preview</Button>
                            </div>
                            <div css={{ flex: 1 }}></div>
                            <DetailRow.Container css={{ marginTop: 18 }}>
                                <DetailRow.Item
                                    label={"Star Rating"}
                                    value={bookQuery.data?.countStars ?? 5}
                                />
                                <DetailRow.Item
                                    label={"Chapters"}
                                    value={bookQuery.data?.countChapters ?? 142}
                                />
                                <DetailRow.Item
                                    label={"Pages"}
                                    value={bookQuery.data?.countPages ?? 2424}
                                />
                                <DetailRow.Item
                                    label={"Readers"}
                                    value={
                                        bookQuery.data?.countReaders ?? 42442
                                    }
                                />
                                <DetailRow.Item
                                    label={"Views"}
                                    value={bookQuery.data?.countViews ?? 42442}
                                />
                            </DetailRow.Container>
                        </div>
                    </div>
                    <div css={{ marginTop: 24 }}>
                        <Heading>Tags</Heading>
                        <Tags.Cloud css={{ marginTop: 12 }}>
                            {bookQuery?.data?.warningTags?.map((tag, i) => (
                                <Tags.Item color="ruby" key={`warning${i}`}>
                                    {tag}
                                </Tags.Item>
                            ))}
                            {bookQuery?.data?.tags?.map((tag, i) => (
                                <Tags.Item color="violet" key={`tag${i}`}>
                                    {tag}
                                </Tags.Item>
                            ))}
                        </Tags.Cloud>
                        <Heading>Description</Heading>
                        <HtmlContent
                            collapse={{
                                countLines: 3,
                                maxHeight: 200,
                            }}
                            key={bookQuery.isLoading ? "loading" : "loaded"}
                            trimEmpty
                            html={bookQuery.data?.aboutHtml ?? "Loading..."}
                        />
                        <div
                            css={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                            }}
                        >
                            <Heading>Chapters</Heading>
                            <Select.Root
                                defaultValue="newest"
                                value={chapterSort}
                                onValueChange={(newVal) =>
                                    setChapterSort(newVal as any)
                                }
                            >
                                <Select.Trigger variant="ghost" />
                                <Select.Content variant="soft">
                                    <Select.Item value="newest">
                                        Newest
                                    </Select.Item>
                                    <Select.Item value="oldest">
                                        Oldest
                                    </Select.Item>
                                </Select.Content>
                            </Select.Root>
                        </div>
                        <div
                            css={{
                                display: "flex",
                                flexDirection: "column",
                                width: "calc(100% + 16px)",
                                marginLeft: -8,
                                borderTop: `1px solid ${Colors.Light.slate4}`,
                                marginTop: 8,
                            }}
                        >
                            {bookQuery.data?.chapters
                                .sort((a, b) => {
                                    if (chapterSort === "oldest") {
                                        return spaceshipCompare(
                                            a.datePublished,
                                            b.datePublished,
                                        );
                                    } else {
                                        return spaceshipCompare(
                                            b.datePublished,
                                            a.datePublished,
                                        );
                                    }
                                })
                                .map((chapter, i) => {
                                    return (
                                        <div
                                            key={i}
                                            css={{
                                                padding: "8px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: 24,
                                                borderBottom: `1px solid ${Colors.Light.slate4}`,
                                            }}
                                        >
                                            <div>
                                                <h3
                                                    css={{
                                                        fontSize: 14,
                                                        marginBottom: 4,
                                                        lineHeight: 1,
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {chapter.title}
                                                </h3>
                                                <div
                                                    css={{
                                                        lineHeight: 1,
                                                        fontSize: 12,
                                                        color: Colors.Light
                                                            .slate10,
                                                    }}
                                                >
                                                    <DateTime
                                                        date={
                                                            chapter.datePublished
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    openUrlInWindow(
                                                        "/discover/royalroad/chapter/" +
                                                            chapter.rrSlug,
                                                    );
                                                }}
                                            >
                                                Preview
                                            </Button>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </ContentContainer>
            </SkeletonContext.Provider>
        </div>
    );
}

const Heading = styled.h2({
    fontFamily: "var(--font-family-serif)",
    marginTop: 12,
});
