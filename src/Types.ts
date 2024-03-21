export interface Author {
    name: string;
    url?: string;
}

export interface BookCover {
    coverUrl: string;
}

export type Html = string;

export interface Book extends BookCover {
    url: string;
    title: string;
    authorName?: string | null;
    tags: string[];
    dateLastChapter: Date | null;
    coverUrl: string;
    countChapters: number;
}
