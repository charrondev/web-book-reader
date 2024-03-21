import { createFileRoute } from "@tanstack/react-router";
import { TitleBar } from "../ui/TitleBar";
import { useQuery } from "@tanstack/react-query";
import { RoyalRoadApi } from "../discover/RoyalRoadApi";
import { Placeholder, SkeletonContext } from "../ui/SkeletonContext";
import { BookCover } from "../ui/BookCover";
import { BookCoverLoader } from "../ui/BookCover.Loader";
import { ContentContainer } from "../ui/ContentContainer";

export const Route = createFileRoute("/discover/royalroad/$")({
    component: () => {
        return <RoyalRoadDetails />;
    },
});

function RoyalRoadDetails() {
    const { _splat } = Route.useParams();
    const book = useQuery({
        queryKey: ["rr-fictions", _splat],
        queryFn: async () => {
            const fiction = await RoyalRoadApi.fictionDetails(_splat);
            return fiction;
        },
    });

    return (
        <div>
            <SkeletonContext.Provider value={{ isLoading: book.isLoading }}>
                <TitleBar
                    compact
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
                            paddingTop: 24,
                        }}
                    >
                        {book.data ? (
                            <BookCover height={220} cover={book.data} />
                        ) : (
                            <BookCoverLoader height={220} />
                        )}

                        <div css={{ flex: 1 }}>
                            <Placeholder>
                                <h1
                                    css={{
                                        fontFamily: "var(--font-family-serif)",
                                        fontSize: 24,
                                    }}
                                >
                                    {book.data?.title ??
                                        "Potential Book Title Here"}
                                </h1>
                            </Placeholder>
                            <Placeholder>
                                <p>{book.data?.authorName ?? "Author Name"}</p>
                            </Placeholder>
                        </div>
                    </div>
                    <div css={{ marginTop: 24 }}>
                        <h2>Description</h2>
                        <Placeholder>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html:
                                        book.data?.descriptionHtml ??
                                        "Loading...",
                                }}
                            ></div>
                        </Placeholder>
                    </div>
                    Hello rr details {_splat}
                </ContentContainer>
            </SkeletonContext.Provider>
        </div>
    );
}
