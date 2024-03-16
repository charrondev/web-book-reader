import { createFileRoute } from "@tanstack/react-router";
import { TitleBar } from "../ui/TitleBar";
import { useQuery } from "@tanstack/react-query";
import { RoyalRoadApi } from "../discover/RoyalRoadApi";
import { BookGrid } from "../ui/BookGrid";
import { BookGridLoader } from "../ui/BookGrid.Loader";

export const Route = createFileRoute("/discover")({
    component: () => {
        return <DiscoverPage />;
    },
});

function DiscoverPage() {
    const booksQuery = useQuery({
        queryKey: ["rr-fictions"],
        queryFn: async () => {
            return await RoyalRoadApi.listFictions("best-rated");
        },
    });

    return (
        <div>
            <TitleBar title={"Discover"} />
            {booksQuery.isLoading && !booksQuery.data ? (
                <BookGridLoader />
            ) : (
                <BookGrid books={booksQuery.data!} />
            )}
        </div>
    );
}
