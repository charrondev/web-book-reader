import * as cheerio from "cheerio";
import { Book } from "../Types";
import { fetch } from "@tauri-apps/plugin-http";

interface RoyalRoadBook extends Book {
    rrUrl: string;
}

const BASE_URL = "https://www.royalroad.com";

const RoyalRoadSort = {
    "best-rated": "Best Rated",
    trending: "Trending",
    new: "Newest",
};

export class RoyalRoadApi {
    public static async listFictions(
        sort: keyof typeof RoyalRoadSort,
    ): Promise<RoyalRoadBook[]> {
        const response = await fetch(
            `https://www.royalroad.com/fictions/${sort}`,
        );
        if (!response.ok) {
            throw new Error("Request failed");
        }

        const html = await response.text();
        const books = FictionsParser.parseLatest(html);
        return books;
    }
}

class FictionsParser {
    public static parseLatest(html: string): RoyalRoadBook[] {
        const $ = cheerio.load(html);

        const books: RoyalRoadBook[] = [];

        // Using .each instead of the more concise .map because the typings are
        // suboptimal. (TODO, maybe)
        $(".fiction-list-item").each((i, el) => {
            const common = FictionsParser.parseCommon($, el);

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
                dateLastChapter,
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
    ): Pick<RoyalRoadBook, "title" | "cover" | "tags" | "rrUrl"> {
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
            cover: {
                url: imageSrc,
            },
            rrUrl,
        };
    }
}
