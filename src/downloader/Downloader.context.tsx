/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import React, { createContext, useContext, useRef, useState } from "react";
import { BookSourceService } from "../bookSource/BookSource.Service";
import { isDbBook, useDatabaseClient } from "../storage/DatabaseClient";
import type { Book } from "../Types";
import { DbUtils } from "../utils";

type ActiveDownloads = {
    isCheckingDownloads: boolean;
    currentCheckName: string;
    currentCheckCompletionPercentage: number; // Percentage
    bookIDsDownloading: string[];
};

interface IDownloadContext {
    checkDownloads: () => void;
    errorMessage: string | null;
    activeDownloads: ActiveDownloads | null;
}

const DownloadContext = createContext<IDownloadContext>({
    checkDownloads: () => {},
    errorMessage: null,
    activeDownloads: null,
});

export function DownloadContextProvider(props: { children: React.ReactNode }) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeDownloads, _setActiveDownloads] =
        React.useState<ActiveDownloads | null>(null);
    const dbClient = useDatabaseClient();
    const abortControllerRef = useRef(new AbortController());
    const activeDownloadIDRef = useRef<string>(DbUtils.uuidv4());

    async function checkDownloads() {
        // Cancel any current operation.
        abortControllerRef.current.abort();

        // Reset the downloadID and capture it.
        activeDownloadIDRef.current = DbUtils.uuidv4();
        const activeDownloadID = activeDownloadIDRef.current;

        /**
         * Wrapped to prevent updates if the download ID has changed.
         */
        function setActiveDownloads(downloads: any) {
            // If the download ID has changed, don't update.
            if (activeDownloadID !== activeDownloadIDRef.current) {
                return;
            }
            _setActiveDownloads(downloads);
        }

        try {
            checkDownloadsImpl(setActiveDownloads, abortControllerRef.current);
        } catch (e) {
            if (e === "abort") {
                return;
            }
            setErrorMessage(e instanceof Error ? e.message : (e as any));
            _setActiveDownloads(null);
            throw e;
        }
    }

    async function checkDownloadsImpl(
        setActiveDownloads: typeof _setActiveDownloads,
        abortController: AbortController,
    ) {
        abortController.signal.addEventListener("abort", () => {
            throw "abort";
        });
        const initialState: ActiveDownloads = {
            isCheckingDownloads: true,
            currentCheckName: "Checking Books for Updates",
            currentCheckCompletionPercentage: 0,
            bookIDsDownloading: [],
        };
        setActiveDownloads(initialState);

        // Loop through the books and check for updates.
        const booksToDownload = await dbClient.fetchBooksWhere({});
        setActiveDownloads((current) => ({
            ...initialState,
            ...current,
            bookIDsDownloading: booksToDownload.map((book) => book.bookID),
        }));
        const countBooks = booksToDownload.length;
        let i = 0;
        for (const book of booksToDownload) {
            i++;
            setActiveDownloads((current) => ({
                ...initialState,
                ...current,
                currentCheckName: `Checking '${book.title}' for Updates`,
            }));
            try {
                const source = BookSourceService.getSourceForForeignUrl(
                    book.foreignUrl,
                );
                const downloadedBook = await source.getBookDetails(
                    book.foreignUrl,
                );
                await dbClient.updateBook(book.bookID, downloadedBook);
            } catch (e) {
                console.error(e);
            } finally {
                setActiveDownloads((current) => ({
                    ...initialState,
                    ...current,
                    currentCheckCompletionPercentage: Math.round(
                        (i / Math.min(countBooks, 1)) * 100,
                    ),
                }));
            }
        }

        // Loop through the chapters and check for updates.
        setActiveDownloads((current) => ({
            ...initialState,
            ...current,
            currentCheckName: "Downloading Chapters",
        }));
        const chaptersToDownload = await dbClient.getChaptersWhere({
            status: "pending",
        });
        setActiveDownloads((current) => ({
            ...initialState,
            ...current,
            bookIDsDownloading: Array.from(
                new Set(chaptersToDownload.map((chapter) => chapter.bookID)),
            ),
        }));

        setActiveDownloads((current) => ({
            ...initialState,
            ...current,
            currentCheckName: "Downloading Chapters",
            currentCheckProgress: 0,
        }));
        const countChapters = chaptersToDownload.length;
        const finishedChapterIDs: string[] = [];

        let j = 0;
        for (const chapter of chaptersToDownload) {
            j++;
            const book = booksToDownload.find(
                (book) => book.bookID === chapter.bookID,
            );
            setActiveDownloads((current) => ({
                ...initialState,
                ...current,
                currentCheckName: `Downloading Chapters from '${book?.title ?? "Unknown Book"}'`,
            }));
            try {
                const source = BookSourceService.getSourceForForeignUrl(
                    chapter.foreignUrl,
                );
                const downloadedChapter = await source.getChapter(
                    chapter.foreignUrl,
                );
                await dbClient.updateChapter(chapter.chapterID, {
                    ...downloadedChapter,
                    status: "downloaded",
                });
            } catch (e) {
                console.error(e);
                await dbClient.updateChapter(chapter.chapterID, {
                    status: "error",
                });
            } finally {
                finishedChapterIDs.push(chapter.chapterID);
                setActiveDownloads((current) => ({
                    ...initialState,
                    ...current,
                    currentCheckCompletionPercentage: Math.round(
                        (j / Math.max(countChapters, 1)) * 100,
                    ),
                    bookIDsDownloading: Array.from(
                        new Set(
                            chaptersToDownload
                                .filter(
                                    (chapter) =>
                                        !finishedChapterIDs.includes(
                                            chapter.chapterID,
                                        ),
                                )
                                .map((chapter) => chapter.bookID),
                        ),
                    ),
                }));
            }
        }

        setActiveDownloads(null);
    }

    return (
        <DownloadContext.Provider
            value={{
                checkDownloads,
                activeDownloads,
                errorMessage,
            }}
        >
            {props.children}
        </DownloadContext.Provider>
    );
}

export function useBookDownloader() {
    return useContext(DownloadContext);
}

export function useIsBookDownloading(book: Book): boolean {
    const { activeDownloads } = useBookDownloader();
    if (!isDbBook(book)) {
        return false;
    }
    if (!activeDownloads) {
        return false;
    }

    return activeDownloads.bookIDsDownloading.includes(book.bookID);
}
