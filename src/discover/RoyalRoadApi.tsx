import * as cheerio from "cheerio";
import { Book } from "../Types";
import { fetch } from "@tauri-apps/plugin-http";

interface RoyalRoadBook extends Book {
    rrUrl: string;
}

interface RoyalRoadChapterStub {
    rrUrl: string;
    title: string;
    datePublished: Date;
}

interface RoyalRoadBookDetails extends RoyalRoadBook {
    chapters: RoyalRoadChapterStub[];
    tags: string[];
    warningTags: string[];
    countStars: number;
    countChapters: number;
    countPages: number;
    countReaders: number;
    countViews: number;
    descriptionHtml: string;
    authorName: string;
    authorUrl: string;
    authorAvatarUrl: string;
}

const BASE_URL = "https://www.royalroad.com";

const RoyalRoadSort = {
    "best-rated": "Best Rated",
    trending: "Trending",
    new: "Newest",
};

type UrlAble = { rrUrl: string } | string;

export class RoyalRoadApi {
    public static rrUrlPath(urlable: UrlAble): string {
        const urlPiece = typeof urlable === "string" ? urlable : urlable.rrUrl;
        const urlPath = urlPiece.replace(BASE_URL, "").replace(/^\//, "");
        return urlPath;
    }

    public static rrUrl(urlable: UrlAble): string {
        const urlPath = this.rrUrlPath(urlable);
        return [BASE_URL, urlPath].map((piece) => piece.trim()).join("/");
    }

    public static async getHtml(urlable: UrlAble): Promise<string> {
        const url = this.rrUrl(urlable);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Request failed");
        }

        const html = await response.text();
        return html;
    }

    public static async listFictions(
        sort: keyof typeof RoyalRoadSort,
    ): Promise<RoyalRoadBook[]> {
        const html = await this.getHtml(`/fictions/${sort}`);

        const books = RoyalRoadParser.parseLatest(html);
        return books;
    }

    public static async fictionDetails(
        urlable: UrlAble,
    ): Promise<RoyalRoadBookDetails> {
        const html = await this.getHtml(urlable);
        const book = RoyalRoadParser.parseDetails(
            this.rrUrlPath(urlable),
            html,
        );
        return book;
    }
}

class RoyalRoadParser {
    public static parseDetails(
        rrUrlPath: string,
        html: string,
    ): RoyalRoadBookDetails {
        const $ = cheerio.load(html);
        const title = $("div.fic-title").find("h1").text();
        const coverUrl = $("div.fic-header").find("img").attr("src")!;

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
        const authorUrl = authorEl
            .find(".mt-card-content")
            .find("a")
            .attr("href")!;
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
            if ($valueNode.hasClass("star")) {
                // We are parsing a float of the number of stars.
                const countStars = Number.parseFloat(
                    $valueNode
                        .attr("aria-label")
                        ?.replace("stars", "")
                        ?.trim() ?? "0",
                );
                statsByName[label] = countStars;
            } else {
                // We are a normal number.
                const value = Number.parseInt(
                    $valueNode.text().replace(",", ""),
                    10,
                );
                statsByName[label] = value;
            }
        });

        const chapters = this.parseChapters(html);

        return {
            url: `/discover/royalroad/${rrUrlPath}`,
            rrUrl: RoyalRoadApi.rrUrl(rrUrlPath),
            title,
            coverUrl,
            authorName,
            authorUrl,
            authorAvatarUrl,
            descriptionHtml: description,
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

    public static parseChapters(html: string): RoyalRoadChapterStub[] {
        const $ = cheerio.load(html);
        const chapters: RoyalRoadChapterStub[] = [];

        $(".chapter-row").each((i, el) => {
            chapters.push({
                title: $(el).find("td").eq(0).find("a").text().trim(),
                rrUrl: $(el).find("a").first().attr("href")!,
                datePublished: new Date(
                    $(el).find("td").eq(1).find("time").attr("datetime")!,
                ),
            });
        });
        return chapters.sort(
            (a, b) => b.datePublished.getTime() - a.datePublished.getTime(),
        );
    }

    public static parseLatest(html: string): RoyalRoadBook[] {
        const $ = cheerio.load(html);

        const books: RoyalRoadBook[] = [];

        // Using .each instead of the more concise .map because the typings are
        // suboptimal. (TODO, maybe)
        $(".fiction-list-item").each((i, el) => {
            const common = RoyalRoadParser.parseCommon($, el);

            const dateLastChapter = $(el)
                .find(".fa-calendar + span > time")
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
                url: `/discover/royalroad/${RoyalRoadApi.rrUrlPath(common.rrUrl)}`,
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
    ): Pick<RoyalRoadBook, "title" | "coverUrl" | "tags" | "rrUrl"> {
        const titleEl = $(el).find(".fiction-title").children("a");

        const title = $(titleEl).text();
        const imageSrc = $(el).find("img").attr("src")!;
        const rrUrl = $(titleEl).attr("href")!;

        const tags = $(el)
            .find("span.label.bg-blue-dark")
            .map((i, tag) => $(tag).text())
            .get();

        return {
            tags,
            title,
            coverUrl: imageSrc,
            rrUrl,
        };
    }
}
