/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMeasure } from "@uidotdev/usehooks";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { RoyalRoadApi } from "../bookSource/RoyalRoadApi";
import { DEFAULT_READER_SETTINGS } from "../storage/ReaderSettings";
import { Colors } from "../ui/Colors";
import { HtmlContent } from "../ui/HtmlContent";
import { Offscreen } from "../ui/Offscreen";
import { READER_SETTINGS_DEFAULTS } from "../reader/ReaderSettings.defaults";
import { SkeletonContext } from "../ui/SkeletonContext";
import { TitleBar } from "../ui/TitleBar";
import { PageSplitter } from "../reader/PageSplitter";
import { ReaderPage } from "../reader/ReaderPage";
import { PagedReaderView } from "../reader/PagedReaderView";

export const Route = createFileRoute("/discover/royalroad/chapter/$")({
    component: () => {
        return <RoyalRoadChapter />;
    },
});

function RoyalRoadChapter() {
    const { _splat } = Route.useParams();

    const query = useQuery({
        queryKey: ["chapter", _splat],
        queryFn: async () => {
            const bookUrl = _splat.split("/chapter/")[0];
            const book = await RoyalRoadApi.fictionDetails(bookUrl);
            const chapter = await RoyalRoadApi.chapter(_splat);
            return { book, chapter };
        },
        throwOnError: true,
    });

    return (
        <PagedReaderView
            book={query.data?.book ?? null}
            chapters={query.data?.chapter ? [query.data.chapter] : null}
        />
    );
}
