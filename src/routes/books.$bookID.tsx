/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useDatabaseClient } from "../storage/DatabaseClient";
import { spaceshipCompare } from "../utils";
import { PagedReaderView } from "../reader/PagedReaderView";

export const Route = createFileRoute("/books/$bookID")({
    component: () => {
        return <BookReader />;
    },
});

function BookReader() {
    const { bookID } = Route.useParams();
    const db = useDatabaseClient();

    const query = useQuery({
        queryKey: ["bookReader", bookID],
        queryFn: async () => {
            const book = await db.fetchBookWhere({ bookID: bookID });
            if (!book) {
                throw new Error("Book not found");
            }

            const chapters = (
                await db.getChaptersWhere({
                    bookID: bookID,
                    status: "downloaded",
                })
            ).sort((a, b) =>
                spaceshipCompare(a.datePublished, b.datePublished),
            );
            return {
                book,
                chapters,
            };
        },
        throwOnError: true,
    });

    return (
        <PagedReaderView
            book={query.data?.book ?? null}
            chapters={query.data?.chapters ?? null}
        />
    );
}
