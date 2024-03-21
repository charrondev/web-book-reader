import { Link } from "@tanstack/react-router";
import { Book } from "../Types";
import { isDbBook } from "../storage/DatabaseClient";
import { BookCover } from "./BookCover";
import { BookCoverLoader } from "./BookCover.Loader";
import { Colors } from "./Colors";
import { Placeholder } from "./SkeletonContext";
import { ContentContainer } from "./ContentContainer";

interface IProps {
    books: Book[];
}

export function BookGrid(props: IProps) {
    return (
        <ContentContainer>
            <div
                css={{
                    "--auto-grid-min-size": "120px",
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(var(--auto-grid-min-size), 1fr))",
                    gap: 16,
                }}
            >
                {props.books.map((book, i) => {
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
                                    <BookCover cover={book} />
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
                                    >
                                        <Placeholder>{book.title}</Placeholder>
                                    </div>
                                </div>
                                {isDbBook(book) && (
                                    <BookProgress
                                        css={{ marginTop: 2 }}
                                        total={book.countPages}
                                        completed={book.currentPage}
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </ContentContainer>
    );
}

function BookProgress(props: {
    total: number;
    completed: number;
    className?: string;
}) {
    const percent = Math.min(
        Math.round(
            (Math.max(props.completed, 0) / Math.max(props.total, 1)) * 100,
        ),
        100,
    );
    return (
        <div
            css={[
                {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                },
            ]}
            className={props.className}
        >
            <div
                css={{
                    flex: 1,
                    position: "relative",
                    background: Colors.Light.slate3,
                    height: 4,
                    width: "100%",
                    borderRadius: 2,
                }}
            >
                <div
                    css={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        width: `${percent}%`,
                        height: "100%",
                        borderRadius: 2,
                        background: Colors.Light.violet11,
                    }}
                ></div>
            </div>
            <span css={{ fontSize: 9, fontWeight: "bold" }}>{percent}%</span>
        </div>
    );
}
