/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2024 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

import { RoyalRoadBookSource } from "./RoyalRoadBookSource";

const royalRoadSource = new RoyalRoadBookSource();

const BOOK_SOURCES = {
    [royalRoadSource.sourceType]: royalRoadSource,
} as const;

type SourceType = keyof typeof BOOK_SOURCES;
type ResolveSource<T extends SourceType> = (typeof BOOK_SOURCES)[T];

export class BookSourceService {
    static getSource<T extends SourceType>(sourceType: T): ResolveSource<T> {
        return BOOK_SOURCES[sourceType] as ResolveSource<T>;
    }

    static getSourceForForeignUrl(
        foreignUrl: string,
    ): (typeof BOOK_SOURCES)[SourceType] {
        for (const source of Object.values(BOOK_SOURCES)) {
            if (source.canHandleForeignUrl(foreignUrl)) {
                return source;
            }
        }
        throw new Error(`No source found for book foreignUrl '${foreignUrl}'`);
    }
}
