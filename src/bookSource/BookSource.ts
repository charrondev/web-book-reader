import type { DbBookInsert } from "../storage/DatabaseClient";
import type { Book, Chapter } from "../Types";

export interface BookSource<
    TType extends string,
    TBook extends Book,
    TBookDetails extends Book,
    TSorts extends Record<string, string>,
> {
    name: string;
    sourceType: TType;
    canHandleForeignUrl(foreignUrl: string): boolean;
    getSorts(): TSorts;
    getBookDetails(foreignUrl: string): Promise<TBookDetails>;
    getBookLists(sort: keyof TSorts): Promise<TBook[]>;
    searchBooks(query: string): Promise<TBook[]>;
    prepareForLibrary(bookDetails: TBookDetails): Promise<DbBookInsert>;
    getChapter(foreignUrl: string): Promise<Chapter>;
}
