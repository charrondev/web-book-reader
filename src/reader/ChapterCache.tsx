/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import type { Html } from "../Types";
import { sanitizeHtml } from "../ui/HtmlContent.sanitizeHtml";
import { PageSplitter } from "./PageSplitter";
import type { Page, PageDimensions } from "./PageSplitter.types";

type ChapterID = string;
export type ChapterCacheItem = {
    pages: Page[];
    pageOffset: number;
    pageCount: number;
};

export class ChapterCache {
    #cache: Map<ChapterID, ChapterCacheItem> = new Map();

    public constructor(
        private pageDimensions: PageDimensions,
        private templateElement: HTMLElement,
    ) {}

    public getPageCount(): number {
        return this.currentOffset() + 1;
    }

    public getChapterFirstPageOffset(chapterID: ChapterID): number | null {
        return this.#cache.get(chapterID)?.pageOffset ?? null;
    }

    public getChapterIDForPageOffset(pageOffset: number): ChapterID | null {
        for (const [chapterID, item] of this.#cache.entries()) {
            if (
                pageOffset >= item.pageOffset &&
                pageOffset < item.pageOffset + item.pageCount
            ) {
                return chapterID;
            }
        }
        return null;
    }

    public addChapter(chapterID: ChapterID, chapterContents: Html) {
        const fullContents = this.templateElement.cloneNode(
            false,
        ) as HTMLElement;
        fullContents.innerHTML = "";
        const sanitized = sanitizeHtml(chapterContents, { trimEmpty: true });
        fullContents.append(...sanitized.childNodes);

        const pages = PageSplitter.splitPages(
            fullContents,
            this.pageDimensions,
        );
        const item: ChapterCacheItem = {
            pages,
            pageOffset: this.currentOffset(),
            pageCount: pages.length,
        };
        this.#cache.set(chapterID, item);
    }

    public getPages(pagesOffsets: number[]): Page[] {
        console.log("Selecting from cache", this.#cache, pagesOffsets);
        const pages: Page[] = [];

        for (const item of this.#cache.values()) {
            for (const offset of pagesOffsets) {
                if (
                    offset >= item.pageOffset &&
                    offset < item.pageOffset + item.pageCount
                ) {
                    pages.push(item.pages[offset - item.pageOffset]);
                }
            }
        }

        return pages;
    }

    private currentOffset(): number {
        let acc = 0;
        this.#cache.forEach((item) => {
            acc += item.pageCount;
        });
        return acc;
    }
}
