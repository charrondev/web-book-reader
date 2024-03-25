/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import { invoke } from "@tauri-apps/api/core";
import Database, { QueryResult } from "@tauri-apps/plugin-sql";
import knex from "knex";
import React, { useContext } from "react";
import type { ReaderSettings } from "../reader/ReaderSettings.types";
import { Book, Html, type Chapter, type ChapterStub } from "../Types";
import { DbUtils, spaceshipCompare } from "../utils";
import { DbError } from "../Errors";

export interface DBChapterContents {
    text: Html;
    noteBefore: Html | null;
    noteAfter: Html | null;
}

export interface DBChapterStub extends ChapterStub {
    chapterID: string;
    bookID: string;
    title: string;
    datePublished: Date;
    status: "downloaded" | "pending";
    dateInserted: Date;
    dateUpdated: Date;
}

export interface DbChapter extends DBChapterStub, Chapter {}

export interface DbBookProgress {
    currentChapter: number;
    currentPage: number;
    currentOffset: number;
}

export interface DbBookStub extends Book, DbBookProgress {
    bookID: string;
    aboutHtml: Html;
    dateFirstChapter: Date | null;
    dateInserted: Date;
    dateLastRead: Date | null;
    countPages: number;
    countReaders: number;
    countStars: number;
}

type ConvertDatesToStrings<T extends object> = {
    [K in keyof T]: T[K] extends Date
        ? string
        : T[K] extends Date | null
          ? string | null
          : T[K];
};

export type DbBookRow = Omit<
    ConvertDatesToStrings<DbBookStub>,
    "tags" | keyof DbBookProgress | "chapters"
>;
export type DbTagRow = { bookID: string; tagName: string };

export function isDbBook(book: Book): book is DbBookStub {
    return "bookID" in book;
}

export interface DbBook extends DbBookStub {
    chapters: DBChapterStub[];
}

export interface DbChapterRow extends DbChapter {}

export type DbResult<TSuccess> = TSuccess;

export type QueryBuilderCallback<T> = (
    db: knex.Knex,
) => knex.Knex.QueryBuilder<any, T>;

export type ResolveKnexRowType<T> = T extends { _base: infer I }
    ? I
    : T extends Array<{ _base: infer I }>
      ? I[]
      : T;

export class DatabaseClient {
    #dbInstance: Database | null = null;

    public async db() {
        if (this.#dbInstance === null) {
            this.#dbInstance = await Database.load("sqlite:application.db");
        }
        return this.#dbInstance;
    }

    public async ensureSetup() {
        await this.db();
    }

    public async resetDb() {
        console.log("resetting database");
        (await this.db()).close();
        await invoke<string>("reset_db");
        console.log("wiped db");
        this.#dbInstance = null;
        // await this.ensureSetup();
    }

    async fetch<T extends object>(
        callback: QueryBuilderCallback<T>,
    ): Promise<ResolveKnexRowType<T>> {
        const sql = callback(
            knex({
                client: "sqlite3",
                useNullAsDefault: true,
            }),
        ).toSQL();
        const db = await this.db();

        try {
            console.log("Executing db fetch", sql.sql, sql.bindings);
            let result = (await db.select<T>(
                sql.sql,
                Object.values(sql.bindings),
            )) as any[];
            console.log("DB fetch results", result);
            return result as any;
        } catch (e) {
            const error = new DbError(e as string, sql.sql, sql.bindings);
            console.error(error);
            throw error;
        }
    }

    async execute(
        callback: QueryBuilderCallback<any> | { sql: string; bindings: any[] },
    ): Promise<QueryResult> {
        const sql =
            typeof callback === "function"
                ? callback(
                      knex({
                          client: "sqlite3",
                          useNullAsDefault: true,
                      }),
                  ).toSQL()
                : callback;
        const db = await this.db();
        try {
            console.log("Executing query", sql.sql, sql.bindings);
            const result = await db.execute(
                sql.sql,
                Object.values(sql.bindings ?? {}),
            );
            console.log("result");
            return result;
        } catch (e) {
            const error = new DbError(e as string, sql.sql, sql.bindings);
            console.error(error);
            throw error;
        }
    }

    async addBook(
        dbBook: Omit<
            DbBook,
            | "bookID"
            | keyof DbBookProgress
            | "dateInserted"
            | "dateUpdated"
            | "dateLastChapter"
            | "dateLastRead"
            | "dateFirstChapter"
            | "chapters"
        > & {
            chapters: ChapterStub[];
        },
    ): Promise<DbBookStub> {
        const bookID = DbUtils.uuidv4();
        await this.execute((db) =>
            db.into("WBR_book").insert({
                // ...dbBook,
                bookID,
                title: dbBook.title,
                aboutHtml: dbBook.aboutHtml,
                authorName: dbBook.authorName,
                coverUrl: dbBook.coverUrl,
                countChapters: dbBook.countChapters,
                countPages: dbBook.countPages,
                url: dbBook.url,
                foreignUrl: dbBook.foreignUrl,

                dateFirstChapter: dbBook.chapters
                    .sort((a, b) =>
                        spaceshipCompare(a.datePublished, b.datePublished),
                    )[0]
                    .datePublished.toISOString(),
                dateLastChapter: dbBook.chapters
                    .sort((a, b) =>
                        spaceshipCompare(b.datePublished, a.datePublished),
                    )[0]
                    .datePublished.toISOString(),
                dateInserted: DbUtils.currentDate(),
                dateLastRead: null,
                countReaders: dbBook.countReaders,
                countStars: dbBook.countStars,
            }),
        );

        if (dbBook.tags.length > 0) {
            await this.execute((db) => {
                const tagRows = dbBook.tags.map((tag) => ({
                    bookID: bookID,
                    tagName: tag,
                }));
                return db.insert(tagRows).into("WBR_bookTag");
            });
        }

        if (dbBook.chapters.length > 0) {
            await this.execute((db) => {
                const chapterRows = dbBook.chapters.map((chapter) => ({
                    bookID,
                    chapterID: DbUtils.uuidv4(),
                    title: chapter.title,
                    datePublished: chapter.datePublished.toISOString(),
                    status: "pending",
                    content: "",
                    dateInserted: DbUtils.currentDate(),
                    dateUpdated: DbUtils.currentDate(),
                }));
                return db.insert(chapterRows).into("WBR_chapter");
            });
        }

        // Add the chapter stubs.

        const book = await this.fetchBookWhere({ bookID });
        if (!book) {
            throw new Error(`Failed to fetch just-inserted book ${bookID}.`);
        }

        return book;
    }

    async fetchBookWhere(
        where: Partial<DbBookRow>,
    ): Promise<DbBookStub | null> {
        const fetchedBooks = await this.fetchBooksWhere(where);
        return fetchedBooks[0] ?? null;
    }

    async fetchBooksWhere(where: Partial<DbBookRow>): Promise<DbBookStub[]> {
        const fetchedBooks = await this.fetch((db) => {
            let query = db
                .from("WBR_book")
                .leftJoin(
                    "WBR_bookProgress",
                    "WBR_book.bookID",
                    "WBR_bookProgress.bookID",
                );

            for (const [key, value] of Object.entries(where)) {
                query.where(`WBR_book.${key}`, value);
            }

            return query;
        });

        const bookIDs = fetchedBooks.map((book) => book.bookID);

        const fetchedTags = await this.fetch((db) => {
            const query = db.from("WBR_bookTag").where("bookID", bookIDs);
            return query;
        });

        const books: DbBook[] = fetchedBooks.map((row) => {
            const tags = fetchedTags
                .filter((tag) => tag.bookID === row.bookID)
                .map((tag) => tag.tagName);
            return {
                ...row,
                tags,
            };
        });
        return books;
    }

    getBookDetails(bookID: string): Promise<DbBook> {
        throw new Error("Method not implemented.");
    }
    getChapters(bookID: string): Promise<DbChapter[]> {
        throw new Error("Method not implemented.");
    }
    setBookProgress(
        bookID: string,
        progress: DbBookProgress,
    ): Promise<DbBookProgress> {
        throw new Error("Method not implemented.");
    }
    getReaderSettings(): Promise<ReaderSettings> {
        throw new Error("Method not implemented.");
    }
    setReaderSettings(settings: ReaderSettings): Promise<ReaderSettings> {
        throw new Error("Method not implemented.");
    }
    async getDbPath(): Promise<string> {
        const root = await this.getDbRoot();
        return root + "/application.db";
    }

    private async getDbRoot(): Promise<string> {
        const path = await invoke<string>("get_db_root");
        return JSON.parse(path);
    }
}

export const DatabaseContext = React.createContext<DatabaseClient>({} as any);

export function useDatabaseClient(): DatabaseClient {
    return useContext(DatabaseContext);
}
