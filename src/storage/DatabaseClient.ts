/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import React, { useContext } from "react";
import { Author, Book, BookCover, Html } from "../Types";

export interface DBChapterContents {
    text: Html;
    noteBefore: Html | null;
    noteAfter: Html | null;
}

export interface DBChapterStub {
    chapterID: string;
    bookID: string;
    title: string;
    datePublished: string;
}

export interface DbChapter extends DBChapterStub {
    contents: DBChapterContents;
}

export interface DbBookProgress {
    currentChapter: number;
    currentPage: number;
    currentOffset: number;
}

export interface DbBookStub extends Book {
    bookID: string;
    title: string;
    author: Author;
    tags: string[];
    dateFirstChapter: string | null;
    dateLastChapter: string | null;
    dateInserted: string;
    dateLastRead: string | null;
    cover: BookCover;
    countChapters: number;
    countPages: number;
    progress: DbBookProgress;
}

export function isDbBook(book: Book): book is DbBookStub {
    return "bookID" in book;
}

export interface DbReaderSettings {
    fontSize: number;
    headingFontSize: number;
    fontFamily: string;
    isBold: boolean;
    lineHeight: number;
    paragraphSpacing: number;
    contentPadding: number;
    isJustified: boolean;
    isIndented: boolean;
}

export interface DbBook extends DbBookStub {
    about: Html;
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

export interface IDatabaseClient {
    getBooks(): Promise<DbResult<DbBookStub[]>>;
    getBookDetails(bookID: string): Promise<DbResult<DbBook>>;
    getChapters(bookID: string): Promise<DbResult<DbChapter[]>>;
    setBookProgress(
        bookID: string,
        progress: DbBookProgress,
    ): Promise<DbResult<null>>;
    getReaderSettings(): Promise<DbResult<DbReaderSettings>>;
    setReaderSettings(settings: DbReaderSettings): Promise<DbResult<null>>;
}

export const DatabaseContext = React.createContext<IDatabaseClient>({} as any);

export function useDatabaseClient(): IDatabaseClient {
    return useContext(DatabaseContext);
}
