export interface Author {
    name: string;
    url?: string;
}

export interface BookCover {
    coverUrl: string | null;
}

export type Html = string;

export interface ChapterStub {
    foreignUrl: string;
    title: string;
    datePublished: Date;
}

export interface Chapter extends ChapterStub {
    foreignUrl: string;
    title: string;
    datePublished: Date;
    content: string;
    noteBefore: Html | null;
    noteAfter: Html | null;
}

export interface Book extends BookCover {
    url: string;
    foreignUrl: string;
    title: string;
    authorName?: string | null;
    tags: string[];
    dateLastChapter: Date;
    coverUrl: string | null;
    countChapters: number;
}
