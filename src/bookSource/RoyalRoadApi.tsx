import * as cheerio from "cheerio";
import { Book, type Chapter, type ChapterStub } from "../Types";
import { fetch } from "@tauri-apps/plugin-http";
import { NetworkError } from "../Errors";
import { RateLimiter } from "./RateLimiter";

export interface RoyalRoadItem {
    rrSlug: string;
}

export type RoyalRoadBook = Book & RoyalRoadItem;
export type RoyalRoadChapterStub = ChapterStub & RoyalRoadItem;
export type RoyalRoadChapter = Chapter & RoyalRoadItem;

export interface RoyalRoadBookDetails extends RoyalRoadBook {
    chapters: RoyalRoadChapterStub[];
    tags: string[];
    warningTags: string[];
    countStars: number;
    countChapters: number;
    countPages: number;
    countReaders: number;
    countViews: number;
    aboutHtml: string;
    authorName: string;
    authorUrl: string;
    authorAvatarUrl: string;
}

export const RoyalRoadSort = {
    "best-rated": "Best Rated",
    trending: "Trending",
    new: "Newest",
};

type UrlAble = RoyalRoadItem | string;

export class RoyalRoadApi {
    public static readonly BASE_URL = "https://www.royalroad.com";

    public static rateLimiter = new RateLimiter(300);

    public static rrSlug(urlable: UrlAble): string {
        const urlPiece = typeof urlable === "string" ? urlable : urlable.rrSlug;
        const urlPath = urlPiece.replace(this.BASE_URL, "").replace(/^\//, "");
        return urlPath;
    }

    public static rrUrl(urlable: UrlAble): string {
        const urlPath = this.rrSlug(urlable);
        return [this.BASE_URL, urlPath].map((piece) => piece.trim()).join("/");
    }

    public static async getHtml(urlable: UrlAble): Promise<string> {
        await this.rateLimiter.wait();
        const url = this.rrUrl(urlable);
        const response = await fetch(url);
        if (!response.ok) {
            throw new NetworkError(
                response.statusText,
                "GET",
                url,
                {},
                response.status,
            );
        }

        const html = await response.text();
        return html;
    }

    public static async searchFictions(
        query: string,
    ): Promise<RoyalRoadBook[]> {
        const html = await this.getHtml(
            `/fictions/search?title=${encodeURIComponent(query)}`,
        );
        const books = RoyalRoadParser.parseBookList(html);
        return books;
    }

    public static async listFictions(
        sort: keyof typeof RoyalRoadSort,
    ): Promise<RoyalRoadBook[]> {
        const html = await this.getHtml(`/fictions/${sort}`);

        const books = RoyalRoadParser.parseBookList(html);
        return books;
    }

    public static async fictionDetails(
        urlable: UrlAble,
    ): Promise<RoyalRoadBookDetails> {
        const html = await this.getHtml(urlable);
        const book = RoyalRoadParser.parseDetails(this.rrSlug(urlable), html);
        return book;
    }

    public static async chapter(urlable: UrlAble): Promise<RoyalRoadChapter> {
        const html = await this.getHtml(urlable);
        const chapter = RoyalRoadParser.parseChapter(html);
        return chapter;
    }
}

class RoyalRoadParser {
    public static parseDetails(
        rrUrlPath: string,
        html: string,
    ): RoyalRoadBookDetails {
        const $ = cheerio.load(html);
        const title = $("div.fic-title").find("h1").text();
        const coverUrl = $("div.fic-header").find("img").attr("src") ?? "";

        const tags = $(".tags .fiction-tag")
            .map((i, el) => $(el).text())
            .get();

        const warningTags = $(".font-red-sunglo .list-inline li")
            .map((i, el) => $(el).text())
            .get();

        const description = $(".description .hidden-content").html() ?? "";

        const authorEl = $(".portlet-body").first();

        const authorName = authorEl
            .find(".mt-card-content")
            .find("a")
            .text()
            .trim();
        const authorUrl = RoyalRoadApi.rrUrl(
            authorEl.find(".mt-card-content").find("a").attr("href")!,
        );
        const authorAvatarUrl = authorEl
            .find('img[data-type="avatar"]')
            .attr("src")!;

        const statEls = $(".stats-content li");
        const statsByName: Record<string, number> = {};

        statEls.each((i, el) => {
            if (i % 2 === 1) {
                // Skip odds, we select forward for them.
            }
            const label = $(el).text().toLowerCase().replace(":", "").trim();
            const $valueNode = $(el).next();

            const $starElem = $valueNode.find(".star");
            if ($starElem.length > 0) {
                // We are parsing a float of the number of stars.
                const countStars = Number.parseFloat(
                    $starElem
                        .first()
                        .attr("aria-label")
                        ?.replace("stars", "")
                        ?.trim() ?? "0",
                );
                statsByName[label] = countStars;
            } else {
                // We are a normal number.
                const text = $valueNode.text().replaceAll(",", "");
                const value = Number.parseInt(text, 10);
                statsByName[label] = value;
            }
        });

        const chapters = this.parseChapters(html);

        return {
            url: `/discover/royalroad/${rrUrlPath}`,
            foreignUrl: RoyalRoadApi.rrUrl(rrUrlPath),
            rrSlug: RoyalRoadApi.rrSlug(rrUrlPath),
            title,
            coverUrl: coverUrl.startsWith("https://") ? coverUrl : null,
            authorName,
            authorUrl,
            authorAvatarUrl,
            aboutHtml: description.trim(),
            tags,
            warningTags,
            countStars: statsByName["overall score"],
            countChapters: statsByName["chapters"],
            countViews: statsByName["total views"],
            countPages: statsByName["pages"],
            countReaders: statsByName["followers"],
            chapters,
            dateLastChapter:
                chapters[chapters.length - 1]?.datePublished ?? null,
        };
    }

    public static parseChapter(html: string): RoyalRoadChapter {
        const $ = cheerio.load(html);

        const title = $(".fic-header h1").text();
        const noteBefore = $(".chapter-note-before").html() ?? null;
        const noteAfter = $(".chapter-note-after").html() ?? null;
        const datePublished = new Date(
            $(".fa-calendar[title='Published'] + time").attr("datetime")!,
        );

        const $chapterContent = $(".chapter-content");

        // Try to find the "stolen" warnings from the content.
        let stolenSelectors: string[] = [];
        $("style").each((i, el) => {
            const html = $(el).html();
            if (!html) {
                return;
            }

            stolenSelectors = [
                ...stolenSelectors,
                ...parseHiddenCssSelectors(html),
            ];
        });

        const combinedStolenSelector = stolenSelectors.join(", ");
        const stolenWarnings = $chapterContent.find(combinedStolenSelector);
        if (stolenWarnings.length > 0) {
            stolenWarnings.remove();
        }

        const contentHtml = $chapterContent.html() ?? "";

        const href = $("link[rel='canonical']").attr("href")!;
        return {
            rrSlug: RoyalRoadApi.rrSlug(href),
            foreignUrl: RoyalRoadApi.rrUrl(href),
            title,
            datePublished,
            content: contentHtml.trim(),
            noteBefore,
            noteAfter,
        };
    }

    public static parseChapters(html: string): RoyalRoadChapterStub[] {
        const $ = cheerio.load(html);
        const chapters: RoyalRoadChapterStub[] = [];

        $(".chapter-row").each((i, el) => {
            const href = $(el).find("a").first().attr("href")!;
            chapters.push({
                title: $(el).find("td").eq(0).find("a").text().trim(),
                rrSlug: RoyalRoadApi.rrSlug(href),
                foreignUrl: RoyalRoadApi.rrUrl(href),
                datePublished: new Date(
                    $(el).find("td").eq(1).find("time").attr("datetime")!,
                ),
            });
        });
        return chapters.sort(
            (a, b) => b.datePublished.getTime() - a.datePublished.getTime(),
        );
    }

    public static parseBookList(html: string): RoyalRoadBook[] {
        const $ = cheerio.load(html);

        const books: RoyalRoadBook[] = [];

        $(".fiction-list-item").each((i, el) => {
            const common = RoyalRoadParser.parseCommon($, el);

            const dateLastChapter = $(el)
                .find(".fa-calendar + span > time, .fa-calendar + time")
                .attr("datetime")!;
            const countChapters = parseInt(
                $(el)
                    .find(".fa-list + span")
                    .text()
                    .replace("Chapters", "")
                    .trim(),
                10,
            );

            books.push({
                ...common,
                url: `/discover/royalroad/${RoyalRoadApi.rrSlug(common.rrSlug)}`,
                dateLastChapter: new Date(dateLastChapter),
                countChapters: Number.isNaN(countChapters) ? 0 : countChapters,
            });
        });

        return books;
    }

    // public static parsePopular(html: string): PopularBlurb[] {
    //     const $ = cheerio.load(html);

    //     const fictions: PopularBlurb[] = [];

    //     $('.fiction-list-item').each((i, el) => {
    //         let description = '';

    //         $(el).find('.margin-top-10.col-xs-12').find('p').each((j, para) => {
    //             description += $(para).text() + '\n';
    //         });

    //         // Dangerous. But due to RRL site design there's few ways around
    //         // this.
    //         const stats: any = {};

    //         stats.latest = date($(el).find('time').attr('datetime')).getTime();
    //         stats.rating = parseFloat($(el).find('.star').attr('title'));

    //         $(el).find('span').each((j, stat) => {
    //             const text = $(stat).text().toLowerCase();
    //             const key = text.split(' ')[1];
    //             const value = parseInt(text.split(' ')[0].replace(/,/gi, ''), 10);

    //             if (!key || !value) { return; }

    //             stats[key] = value;
    //         });

    //         fictions.push(Object.assign(
    //             FictionsParser.parseBlurb($, el),
    //             { description },
    //             { stats },
    //         ));
    //     });

    //     return fictions;
    // }

    // public static parseSearch(html: string): SearchBlurb[] {
    //     const $ = cheerio.load(html);

    //     const fictions: SearchBlurb[] = [];

    //     $('.search-item').each((i, el) => {
    //         const image = $(el).find('img').attr('src');

    //         const titleEl = $(el).find('h2.margin-bottom-10').children('a');

    //         const title = $(titleEl).text();
    //         const id = parseInt($(titleEl).attr('href').split('/')[2], 10);

    //         const pages = parseInt($(el).find('span.page-count').text(), 10);
    //         const author = $(el).find('span.author').text()
    //             .replace('by', '').trim();

    //         let description = '';
    //         $(el).find('div.fiction-description').find('p').each((j, para) => {
    //             description += $(para).text() + '\n';
    //         });

    //         fictions.push({ id, title, pages, author, image, description });
    //     });

    //     return fictions;
    // }

    // public static parseNewReleases(html: string): NewReleaseBlurb[] {
    //     const $ = cheerio.load(html);

    //     const fictions: NewReleaseBlurb[] = [];

    //     $('div.fiction-list-item').each((i, el) => {
    //         let description = '';
    //         $(el).find('div.hidden-content').find('p')
    //             .each((j, p) => description += $(p).text().trim() + '\n');
    //         description = description.trim();

    //         fictions.push(Object.assign(
    //             FictionsParser.parseBlurb($, el), { description },
    //         ));
    //     });

    //     return fictions;
    // }

    private static parseCommon(
        $: cheerio.CheerioAPI,
        el: cheerio.Element,
    ): Pick<
        RoyalRoadBook,
        "title" | "coverUrl" | "tags" | "rrSlug" | "foreignUrl"
    > {
        const titleEl = $(el).find(".fiction-title").children("a");

        const title = $(titleEl).text();
        const coverUrl = $(el).find("img").attr("src") ?? "";
        const rrUrl = $(titleEl).attr("href")!;

        const tags = $(el)
            .find("span.label.bg-blue-dark")
            .map((i, tag) => $(tag).text())
            .get();

        return {
            tags,
            title,
            coverUrl: coverUrl.startsWith("https://") ? coverUrl : null,
            rrSlug: RoyalRoadApi.rrSlug(rrUrl),
            foreignUrl: RoyalRoadApi.rrUrl(rrUrl),
        };
    }
}

function parseHiddenCssSelectors(css: string): string[] {
    const ruleMatches = [...css.matchAll(/(\..*)({[^}]*?})/gm)];

    const matchedSelectors = [];
    for (const match of ruleMatches) {
        const [rawMatch, selectorName, rule] = match;
        if (
            rule.match(/display:(\s*)?none/) ||
            rule.match(/speak:(\s*)?never/) ||
            rule.match(/visibility:(\s*)?hidden/)
        ) {
            matchedSelectors.push(selectorName);
        }
    }
    return matchedSelectors;
}
