import { createFileRoute, useRouter } from "@tanstack/react-router";
import { TitleBar } from "../ui/TitleBar";
import { useQuery } from "@tanstack/react-query";
import { RoyalRoadApi } from "../discover/RoyalRoadApi";
import {
    CirclePlaceholder,
    Placeholder,
    SkeletonContext,
} from "../ui/SkeletonContext";
import { BookCover } from "../ui/BookCover";
import { BookCoverLoader } from "../ui/BookCover.Loader";
import { ContentContainer } from "../ui/ContentContainer";
import { HtmlContent } from "../ui/HtmlContent";
import { DetailRow } from "../ui/DetailRow";
import { Skeleton } from "@radix-ui/themes";
import { Tags } from "../ui/Tags";
import { Colors } from "../ui/Colors";
import { Button } from "../ui/Button";
import styled from "@emotion/styled";
import { DateTime } from "../ui/DateTime";
import { openUrlInWindow } from "../ui/SmartLink";

export const Route = createFileRoute("/_layout/discover/royalroad/$")({
    component: () => {
        return <RoyalRoadDetails />;
    },
});

function RoyalRoadDetails() {
    const router = useRouter();
    const { _splat } = Route.useParams();
    const book = useQuery({
        queryKey: ["rr-fictions", _splat],
        queryFn: async () => {
            const fiction = await RoyalRoadApi.fictionDetails(_splat);
            return fiction;
        },
    });

    return (
        <div
            css={{
                paddingTop: 24,
                paddingBottom: 24,
            }}
        >
            <SkeletonContext.Provider value={{ isLoading: book.isLoading }}>
                <TitleBar
                    hideHeading
                    title={book.data?.title ?? "Placeholder title"}
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
                        {book.data ? (
                            <BookCover height={220} cover={book.data} />
                        ) : (
                            <BookCoverLoader height={220} />
                        )}

                        <div
                            css={{
                                flex: 1,
                                height: 220,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <h1
                                css={{
                                    fontFamily: "var(--font-family-serif)",
                                    fontSize: 24,
                                }}
                            >
                                <Placeholder>
                                    {book.data?.title ??
                                        "Potential Book Title Here"}
                                </Placeholder>
                            </h1>

                            <div css={{ marginTop: 4 }}>
                                <a
                                    href={book.data?.authorUrl}
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
                                            src={book.data?.authorAvatarUrl}
                                        ></img>
                                    </Placeholder>
                                    <Placeholder>
                                        {book.data?.authorName ?? "Author Name"}
                                    </Placeholder>
                                </a>
                            </div>
                            <div
                                css={{ display: "flex", gap: 6, marginTop: 12 }}
                            >
                                <Button type="button" primary>
                                    {/* TODO: Should show "Read" based on download status */}
                                    Add to Library
                                </Button>
                                <Button type="button">Preview</Button>
                            </div>
                            <div css={{ flex: 1 }}></div>
                            <DetailRow.Container css={{ marginTop: 18 }}>
                                <DetailRow.Item
                                    label={"Star Rating"}
                                    value={book.data?.countStars ?? 5}
                                />
                                <DetailRow.Item
                                    label={"Chapters"}
                                    value={book.data?.countChapters ?? 142}
                                />
                                <DetailRow.Item
                                    label={"Pages"}
                                    value={book.data?.countPages ?? 2424}
                                />
                                <DetailRow.Item
                                    label={"Readers"}
                                    value={book.data?.countReaders ?? 42442}
                                />
                                <DetailRow.Item
                                    label={"Views"}
                                    value={book.data?.countViews ?? 42442}
                                />
                            </DetailRow.Container>
                        </div>
                    </div>
                    <div css={{ marginTop: 24 }}>
                        <Heading>Tags</Heading>
                        <Tags.Cloud css={{ marginTop: 12 }}>
                            {book?.data?.warningTags?.map((tag, i) => (
                                <Tags.Item color="ruby" key={`warning${i}`}>
                                    {tag}
                                </Tags.Item>
                            ))}
                            {book?.data?.tags?.map((tag, i) => (
                                <Tags.Item color="violet" key={`tag${i}`}>
                                    {tag}
                                </Tags.Item>
                            ))}
                        </Tags.Cloud>
                        <Heading>Description</Heading>
                        <Skeleton>
                            <HtmlContent
                                html={
                                    book.data?.descriptionHtml ?? "Loading..."
                                }
                            />
                        </Skeleton>
                        <Heading>Chapters</Heading>
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
                            {book.data?.chapters.map((chapter, i) => {
                                return (
                                    <div
                                        key={i}
                                        css={{
                                            padding: "8px",
                                            // background: Colors.Light.slate4,
                                            // borderRadius: 6,
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
                                                }}
                                            >
                                                {chapter.title}
                                            </h3>
                                            <div
                                                css={{
                                                    lineHeight: 1,
                                                    fontSize: 12,
                                                    color: Colors.Light.slate10,
                                                }}
                                            >
                                                <DateTime
                                                    date={chapter.datePublished}
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
