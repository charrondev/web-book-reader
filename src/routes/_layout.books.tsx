import { createFileRoute } from "@tanstack/react-router";
import { BookGrid } from "../ui/BookGrid";
import { MOCK_BOOKS } from "../storage/MockDatabaseClient";
import { TitleBar } from "../ui/TitleBar";
import { useQuery } from "@tanstack/react-query";
import { useDatabaseClient } from "../storage/DatabaseClient";
import { BookGridLoader } from "../ui/BookGrid.Loader";

type BookSearchSortOptions =
    | "recently-added"
    | "recently-updated"
    | "recently-read";

type BooksSearch = {
    sort?: BookSearchSortOptions;
};
export const Route = createFileRoute("/_layout/books")({
    component: BooksPage,
    validateSearch: (search: Record<string, unknown>): BooksSearch => {
        return {
            sort: search.sort as BookSearchSortOptions,
        };
    },
});

function BooksPage() {
    const { sort } = Route.useSearch();

    const dbClient = useDatabaseClient();
    const booksQuery = useQuery({
        queryKey: ["books", { sort }],
        queryFn: async () => {
            const books = await dbClient.fetchBooksWhere({});
            return books;
        },
        throwOnError: true,
    });

    return (
        <div>
            <TitleBar title="My Books" />
            {/* <p>Hello /books!</p>
            <p>
                <strong>Sort: </strong>
                {sort ?? "recently-read"}
            </p> */}
            {booksQuery.isLoading ? (
                <BookGridLoader />
            ) : (
                <BookGrid books={booksQuery.data!} />
            )}
        </div>
    );
}
