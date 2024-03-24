import { createFileRoute } from "@tanstack/react-router";
import { BookGrid } from "../ui/BookGrid";
import { MOCK_BOOKS } from "../storage/MockDatabaseClient";
import { TitleBar } from "../ui/TitleBar";

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

    return (
        <div>
            <TitleBar title="My Books" />
            {/* <p>Hello /books!</p>
            <p>
                <strong>Sort: </strong>
                {sort ?? "recently-read"}
            </p> */}
            <BookGrid
                books={[
                    ...Object.values(MOCK_BOOKS),
                    ...Object.values(MOCK_BOOKS),
                ]}
            />
        </div>
    );
}
