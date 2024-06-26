/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import { createFileRoute } from "@tanstack/react-router";
import { useSearchContext } from "../search/Search.Context";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RoyalRoadApi } from "../bookSource/RoyalRoadApi";
import { TitleBar } from "../ui/TitleBar";
import { BookGrid } from "../ui/BookGrid";
import { BookGridLoader } from "../ui/BookGrid.Loader";

export const Route = createFileRoute("/_layout/search")({
    component: SearchPage,
});

function SearchPage() {
    const searchContext = useSearchContext();

    const [renderCount, setRenderCount] = useState(0);

    useEffect(() => {
        setRenderCount((count) => count + 1);
    }, [searchContext.query]);

    const searchQuery = useQuery({
        queryKey: ["search", searchContext.query],
        queryFn: async () => {
            return await RoyalRoadApi.searchFictions(searchContext.query);
        },
    });

    return (
        <div>
            <TitleBar title={`Searching "${searchContext.query}"`} />
            {searchQuery.data ? (
                <BookGrid books={searchQuery.data} />
            ) : (
                <BookGridLoader />
            )}
        </div>
    );
}
