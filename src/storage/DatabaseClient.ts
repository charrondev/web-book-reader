/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import { invoke } from "@tauri-apps/api/core";
import Database, { QueryResult } from "@tauri-apps/plugin-sql";
import knex from "knex";
import React, { useContext, useEffect } from "react";
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
    status: "downloaded" | "pending" | "error";
    dateInserted: Date;
    dateUpdated: Date;
}

export interface DbChapter extends DBChapterStub, Chapter {}

export interface DbBookProgress {
    currentChapter: number;
    currentPage: number;
    currentOffset: number;
}

export interface DbBook extends Book, DbBookProgress {
    bookID: string;
    dateFirstChapter: Date | null;
    dateInserted: Date;
    dateLastRead: Date | null;
}

export type DbBookRow = Omit<DbBook, "tags" | keyof DbBookProgress | "url">;
export interface DbChapterRow extends DbChapter {}
export type DbTagRow = { bookID: string; tagName: string };

export function isDbBook(book: Book): book is DbBook {
    return "bookID" in book;
}

export type DbBookInsert = Omit<
    DbBookRow,
    | "bookID"
    | "dateInserted"
    | "dateUpdated"
    | "dateLastChapter"
    | "dateLastRead"
    | "dateFirstChapter"
    | "countChapters"
> & {
    chapters: ChapterStub[];
    tags: string[];
};

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

    ///
    /// Basic utilities
    ///
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

    ///
    /// Downloading Books
    ///

    async addBook(dbBook: DbBookInsert): Promise<DbBook> {
        const bookID = DbUtils.uuidv4();
        await this.execute((db) =>
            db.into("WBR_book").insert({
                bookID,
                title: dbBook.title,
                authorName: dbBook.authorName,
                coverUrl: dbBook.coverUrl,
                countChapters: dbBook.chapters.length,
                foreignUrl: dbBook.foreignUrl,
                dateFirstChapter: dbBook.chapters.sort((a, b) =>
                    spaceshipCompare(a.datePublished, b.datePublished),
                )[0].datePublished,
                dateLastChapter: dbBook.chapters.sort((a, b) =>
                    spaceshipCompare(b.datePublished, a.datePublished),
                )[0].datePublished,
                dateInserted: DbUtils.currentDate(),
                dateLastRead: null,
            }),
        );

        await this.putBookTags(bookID, dbBook.tags);

        if (dbBook.chapters.length > 0) {
            await this.insertBookChapters(bookID, dbBook.chapters);
        }

        // Add the chapter stubs.

        const book = await this.fetchBookWhere({ bookID });
        if (!book) {
            throw new Error(`Failed to fetch just-inserted book ${bookID}.`);
        }

        fireOnBookAdded();

        return book;
    }

    private async putBookTags(bookID: string, tags: string[]) {
        await this.execute((db) => {
            return db.delete().from("WBR_bookTag").where("bookID", bookID);
        });
        const tagRows = tags.map((tag) => ({
            bookID: bookID,
            tagName: tag,
        }));
        await this.execute((db) =>
            db.insert(tagRows).into("WBR_bookTag").onConflict().ignore(),
        );
    }

    private async insertBookChapters(bookID: string, chapters: ChapterStub[]) {
        await this.execute((db) => {
            const chapterRows = chapters.map((chapter) => ({
                bookID,
                chapterID: DbUtils.uuidv4(),
                foreignUrl: chapter.foreignUrl,
                title: chapter.title,
                datePublished: chapter.datePublished.toISOString(),
                status: "pending",
                content: "",
                dateInserted: DbUtils.currentDate(),
                dateUpdated: DbUtils.currentDate(),
            }));
            return db
                .insert(chapterRows)
                .into("WBR_chapter")
                .onConflict()
                .ignore();
        });
    }

    public async updateBook(
        bookID: string,
        update: Partial<DbBookInsert>,
    ): Promise<void> {
        await this.execute((db) =>
            db
                .from("WBR_book")
                .where("bookID", bookID)
                .update({
                    title: update.title,
                    authorName: update.authorName,
                    coverUrl: update.coverUrl,
                    countChapters: update.chapters?.length,
                    foreignUrl: update.foreignUrl,
                    dateFirstChapter: update.chapters?.sort((a, b) =>
                        spaceshipCompare(a.datePublished, b.datePublished),
                    )?.[0]?.datePublished,
                    dateLastChapter: update.chapters?.sort((a, b) =>
                        spaceshipCompare(b.datePublished, a.datePublished),
                    )?.[0]?.datePublished,
                }),
        );
        if (update.tags) {
            await this.putBookTags(bookID, update.tags);
        }
        if (update.chapters) {
            console.log("updating chapters", update.chapters);
            await this.insertBookChapters(bookID, update.chapters);
        }
    }

    public async updateChapter(
        chapterID: string,
        chapter: Partial<
            Omit<DbChapter, "dateInserted" | "dateUpdated" | "chapterID">
        >,
    ) {
        console.log("updating chapter", { chapter });
        await this.execute((db) =>
            db.from("WBR_chapter").where("chapterID", chapterID).update({
                content: chapter.content,
                status: chapter.status,
                title: chapter.title,
                datePublished: chapter.datePublished,
                dateUpdated: DbUtils.currentDate(),
            }),
        );
    }

    public async getChaptersWhere(
        where: Partial<DbChapter>,
    ): Promise<DbChapter[]> {
        const fetchedChapters = await this.fetch((db) => {
            let query = db.from("WBR_chapter");

            for (const [key, value] of Object.entries(where)) {
                query.where(key, value);
            }

            query.orderBy([
                { column: "bookID", order: "asc" },
                { column: "datePublished", order: "asc" },
            ]);

            return query;
        });

        return fetchedChapters;
    }

    ///
    /// Reading and displaying books.
    ///

    async fetchBookWhere(where: Partial<DbBookRow>): Promise<DbBook | null> {
        const fetchedBooks = await this.fetchBooksWhere(where);
        return fetchedBooks[0] ?? null;
    }

    async fetchBooksWhere(where: Partial<DbBookRow>): Promise<DbBook[]> {
        const fetchedBooks: Array<DbBookRow & DbBookProgress> =
            await this.fetch((db) => {
                let query = db
                    .from("WBR_book")
                    .select("WBR_book.*")
                    .leftJoin(
                        "WBR_bookProgress",
                        "WBR_book.bookID",
                        "WBR_bookProgress.bookID",
                    )
                    .select("WBR_bookProgress.currentChapter")
                    .select("WBR_bookProgress.currentPage")
                    .select("WBR_bookProgress.currentOffset");
                for (const [key, value] of Object.entries(where)) {
                    query.where(`WBR_book.${key}`, value);
                }

                return query;
            });

        const bookIDs = fetchedBooks.map((book) => book.bookID);

        const [fetchedTags, fetchedPendingCounts] = await Promise.all([
            this.fetch((db) => {
                const query = db.from("WBR_bookTag").where("bookID", bookIDs);
                return query;
            }),
            this.fetch((db) =>
                db
                    .from<{
                        bookID: string;
                        countPending: number;
                    }>("WBR_chapter")
                    .select("bookID")
                    .count({ countPending: "chapterID" })
                    .where("bookID", bookIDs)
                    .where("status", "pending")
                    .groupBy("bookID"),
            ),
        ]);

        const books: DbBook[] = fetchedBooks.map((row) => {
            const tags = fetchedTags
                .filter((tag) => tag.bookID === row.bookID)
                .map((tag) => tag.tagName);
            return {
                ...row,
                url: `/books/${row.bookID}`,
                tags,
            } as DbBook;
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

function fireOnBookAdded() {
    document.dispatchEvent(
        new CustomEvent("x-book-added", {
            bubbles: false,
        }),
    );
}

function useOnBookAdded(handler: () => void) {
    useEffect(() => {
        document.addEventListener("x-book-added", handler);
        return () => {
            document.removeEventListener("x-book-added", handler);
        };
    });
}
