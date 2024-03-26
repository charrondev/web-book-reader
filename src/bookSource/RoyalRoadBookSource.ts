/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2024 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

import type { DbBookInsert } from "../storage/DatabaseClient";
import type { Chapter } from "../Types";
import type { BookSource } from "./BookSource";
import {
    RoyalRoadApi,
    RoyalRoadBook,
    RoyalRoadBookDetails,
    RoyalRoadSort,
} from "./RoyalRoadApi";

export class RoyalRoadBookSource
    implements
        BookSource<
            "royalroad",
            RoyalRoadBook,
            RoyalRoadBookDetails,
            typeof RoyalRoadSort
        >
{
    public name = "Royal Road";
    public sourceType = "royalroad" as const;

    canHandleForeignUrl(foreignUrl: string): boolean {
        return foreignUrl.startsWith(RoyalRoadApi.BASE_URL);
    }

    getSorts() {
        return RoyalRoadSort;
    }

    async getBookDetails(foreignUrl: string): Promise<RoyalRoadBookDetails> {
        const result = await RoyalRoadApi.fictionDetails(foreignUrl);
        return result;
    }

    async getBookLists(
        sort: keyof typeof RoyalRoadSort,
    ): Promise<RoyalRoadBook[]> {
        const books = await RoyalRoadApi.listFictions(sort);
        return books;
    }

    async searchBooks(query: string): Promise<RoyalRoadBook[]> {
        const books = await RoyalRoadApi.searchFictions(query);
        return books;
    }

    async prepareForLibrary(
        bookDetails: RoyalRoadBookDetails,
    ): Promise<DbBookInsert> {
        return bookDetails;
    }

    async getChapter(foreignUrl: string): Promise<Chapter> {
        const chapter = await RoyalRoadApi.chapter(foreignUrl);
        return chapter;
    }
}
