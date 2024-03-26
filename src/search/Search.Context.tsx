/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import { useRouter, type Router } from "@tanstack/react-router";
import React, { createContext, useCallback, useContext, useState } from "react";

interface ISearchContext {
    query: string;
    setQuery: (query: string) => void;
}

const SearchContext = createContext<ISearchContext>({
    query: "",
    setQuery: () => {},
});

export function SearchContextProvider(props: {
    children: React.ReactNode;
    router: Router;
}) {
    const [query, _setQuery] = useState("");
    const { router } = props;

    const setQuery = useCallback(
        (newQuery: string) => {
            _setQuery((existing) => {
                if (
                    existing.trim().length === 0 &&
                    newQuery.trim().length > 0
                ) {
                    // Navigate into search
                    router.navigate({ to: "/search" });
                }

                return newQuery;
            });
        },
        [router],
    );

    return (
        <SearchContext.Provider value={{ query, setQuery }}>
            {props.children}
        </SearchContext.Provider>
    );
}

export function useSearchContext() {
    return useContext(SearchContext);
}
