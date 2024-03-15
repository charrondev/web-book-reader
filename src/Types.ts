export interface Author {
    name: string;
    url?: string;
}

export interface BookCover {
    url: string;
}

export interface Html {
    __unsafeHtml: string;
}

export interface Book {
    title: string;
    author?: Author;
    tags: string[];
    dateLastChapter: string | null;
    cover: BookCover;
    countChapters: number;
}
