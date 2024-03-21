import { Book } from "../Types";
import { BookGrid } from "./BookGrid";
import { SkeletonContext } from "./SkeletonContext";

export function BookGridLoader() {
    return (
        <SkeletonContext.Provider value={{ isLoading: true }}>
            <BookGrid
                books={[
                    dummyBook("Book #1 Here OMG"),
                    dummyBook("Book Here Title"),
                    dummyBook("Also a book title here"),
                    dummyBook("Also a book title here"),
                    dummyBook("Book Here Title"),
                    dummyBook("Also a book title here"),
                ]}
            ></BookGrid>
        </SkeletonContext.Provider>
    );
}

function dummyBook(title: string): Book {
    return {
        url: "#",
        coverUrl: "#",
        countChapters: 42,
        dateLastChapter: new Date(),
        tags: [],
        title,
    };
}
