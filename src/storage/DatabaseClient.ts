/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import React, { useContext } from "react";
import { Author, Book, BookCover, Html } from "../Types";
import Database, { QueryResult } from "@tauri-apps/plugin-sql";
import { invoke } from "@tauri-apps/api/core";
import knex from "knex";
import type { ReaderSettings } from "../ui/reader/ReaderSettings.types";

export interface DBChapterContents {
    text: Html;
    noteBefore: Html | null;
    noteAfter: Html | null;
}

export interface DBChapterStub {
    chapterID: string;
    bookID: string;
    title: string;
    datePublished: Date;
}

export interface DbChapter extends DBChapterStub {
    contents: DBChapterContents;
}

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
}

export type DbBookRow = Omit<DbBookStub, "tags" | keyof DbBookProgress>;

export function isDbBook(book: Book): book is DbBookStub {
    return "bookID" in book;
}

export interface DbBook extends DbBookStub {
    countReaders: number;
    countStars: number;
    chapters: DBChapterStub[];
}

export type DbResult<TSuccess, TError = { message: string }> =
    | {
          status: "success";
          result: TSuccess;
      }
    | {
          status: "error";
          error: TError;
      };

export type QueryBuilderCallback<T> = (
    db: knex.Knex,
) => knex.Knex.QueryBuilder<any, T>;

export type ResolveKnexRowType<T> = T extends { _base: infer I }
    ? I
    : T extends Array<{ _base: infer I }>
      ? I[]
      : T;

export interface IDatabaseClient {
    getBooks(): Promise<DbResult<DbBookStub[]>>;
    getBookDetails(bookID: string): Promise<DbResult<DbBook>>;
    getChapters(bookID: string): Promise<DbResult<DbChapter[]>>;
    setBookProgress(
        bookID: string,
        progress: DbBookProgress,
    ): Promise<DbResult<null>>;
    getReaderSettings(): Promise<DbResult<ReaderSettings>>;
    setReaderSettings(settings: ReaderSettings): Promise<DbResult<null>>;
    getDbPath(): Promise<string>;
    execute(callback: QueryBuilderCallback<any>): Promise<QueryResult>;
    fetch<T extends object>(
        callback: QueryBuilderCallback<T>,
    ): Promise<ResolveKnexRowType<T>>;
    resetTables(): Promise<void>;
}

export class DatabaseClient implements IDatabaseClient {
    public async db() {
        return Database.load("sqlite:application.db");
    }

    public async resetTables() {
        console.log("resetting tables");
        const tables = await this.fetch((query) =>
            query
                .from("sqlite_schema")
                .select("name")
                .where("name", "NOT LIKE", "sqlite_%"),
        );

        for (const table of tables) {
            await this.execute({
                sql: `DROP TABLE IF EXISTS ${table.name}`,
                bindings: [],
            });
        }

        // Reload the DB.
        const db = await this.db();
        await db.close();
        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
        // Reload the db.
        await this.db();
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
        const result = await db.select<T>(sql.sql, Object.values(sql.bindings));
        return result as any;
    }

    public async getBooks(): Promise<
        DbResult<DbBookStub[], { message: string }>
    > {
        const db = await this.db();
        return db.select(`
SELECT * FROM WBR_book
`);
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
        const result = await db.execute(
            sql.sql,
            Object.values(sql.bindings ?? {}),
        );
        return result;
    }

    public async addDummyBook(): Promise<DbResult<{ bookID: string }>> {
        const db = await this.db();
        const result = await db.execute(`
INSERT INTO WBR_book (title)
VALUES ('A book title')
`);
        return {
            result: { bookID: result.lastInsertId.toString() },
            status: "success",
        };
    }
    getBookDetails(
        bookID: string,
    ): Promise<DbResult<DbBook, { message: string }>> {
        throw new Error("Method not implemented.");
    }
    getChapters(
        bookID: string,
    ): Promise<DbResult<DbChapter[], { message: string }>> {
        throw new Error("Method not implemented.");
    }
    setBookProgress(
        bookID: string,
        progress: DbBookProgress,
    ): Promise<DbResult<null, { message: string }>> {
        throw new Error("Method not implemented.");
    }
    getReaderSettings(): Promise<
        DbResult<ReaderSettings, { message: string }>
    > {
        throw new Error("Method not implemented.");
    }
    setReaderSettings(
        settings: ReaderSettings,
    ): Promise<DbResult<null, { message: string }>> {
        throw new Error("Method not implemented.");
    }
    async getDbPath(): Promise<string> {
        const path = await invoke<string>("get_db_path");
        return JSON.parse(path);
    }
}

export const DatabaseContext = React.createContext<IDatabaseClient>({} as any);

export function useDatabaseClient(): IDatabaseClient {
    return useContext(DatabaseContext);
}
