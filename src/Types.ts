export interface Author {
    name: string;
    url?: string;
}

export interface BookCover {
    coverUrl: string;
}

export type Html = string;

export interface ChapterStub {
    title: string;
    datePublished: Date;
}

export interface Chapter extends ChapterStub {
    title: string;
    datePublished: Date;
    contentHtml: string;
    noteBefore: Html | null;
    noteAfter: Html | null;
}

export interface Book extends BookCover {
    url: string;
    title: string;
    authorName?: string | null;
    tags: string[];
    dateLastChapter: Date | null;
    coverUrl: string;
    countChapters: number;
}
