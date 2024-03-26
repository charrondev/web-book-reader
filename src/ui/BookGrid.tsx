import { Link } from "@tanstack/react-router";
import { Book } from "../Types";
import { isDbBook } from "../storage/DatabaseClient";
import { BookCover } from "./BookCover";
import { BookCoverLoader } from "./BookCover.Loader";
import { Colors } from "./Colors";
import { Placeholder } from "./SkeletonContext";
import { ContentContainer } from "./ContentContainer";
import { DateTime } from "./DateTime";
import { CiCalendarDate } from "react-icons/ci";
import { useBookDownloader } from "../downloader/Downloader.context";

interface IProps {
    books: Book[];
}

export function BookGrid(props: IProps) {
    const { activeDownloads } = useBookDownloader();

    return (
        <ContentContainer>
            <div
                css={{
                    "--auto-grid-min-size": "140px",
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(var(--auto-grid-min-size), 1fr))",
                    gap: 16,
                    maxWidth: "100%",
                    overflow: "hidden",
                }}
            >
                {props.books.map((book, i) => {
                    let isDownloading = true;
                    if (
                        isDbBook(book) &&
                        activeDownloads?.bookIDsDownloading?.includes(
                            book.bookID,
                        )
                    ) {
                        isDownloading = true;
                    }
                    return (
                        <Link
                            key={i}
                            to={book.url}
                            css={{
                                textDecoration: "none",
                                color: "inherit",
                            }}
                        >
                            <div
                                css={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Placeholder skeleton={<BookCoverLoader />}>
                                    <BookCover
                                        book={book}
                                        css={{
                                            width: "100%",
                                        }}
                                    />
                                </Placeholder>

                                <div css={{ marginTop: 8, width: "100%" }}>
                                    <div
                                        css={{
                                            fontWeight: 600,
                                            width: "100%",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            fontSize: 13,
                                            textDecoration: "none",
                                            color: Colors.Light.slate12,
                                        }}
                                        title={book.title}
                                    >
                                        <Placeholder>{book.title}</Placeholder>
                                    </div>
                                </div>
                                <div
                                    css={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        marginTop: -2,
                                        width: "100%",
                                    }}
                                >
                                    <CiCalendarDate
                                        css={{
                                            position: "relative",
                                            top: -1,
                                            color: Colors.Light.slate11,
                                            fontSize: 16,
                                        }}
                                    />
                                    <Placeholder>
                                        <DateTime
                                            css={{
                                                color: Colors.Light.slate11,
                                                fontSize: 12,
                                            }}
                                            date={book.dateLastChapter}
                                        />
                                    </Placeholder>
                                    {isDbBook(book) && (
                                        <>
                                            <span css={{ flex: 1 }}></span>
                                            <Placeholder>
                                                <span
                                                    css={{
                                                        color: Colors.Light
                                                            .slate11,
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    {progressPercent(
                                                        book.countChapters,
                                                        book.currentChapter,
                                                    )}
                                                    %
                                                </span>
                                            </Placeholder>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </ContentContainer>
    );
}

function progressPercent(total: number, completed: number): number {
    return Math.min(
        Math.round((Math.max(completed, 0) / Math.max(total, 1)) * 100),
        100,
    );
}
