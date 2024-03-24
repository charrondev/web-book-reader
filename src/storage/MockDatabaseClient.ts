import { DEFAULT_READER_SETTINGS } from "./ReaderSettings";
import {
    IDatabaseClient,
    DbResult,
    DbBook,
    DbBookStub,
    DbChapter,
    DbBookProgress,
    QueryBuilderCallback,
    ResolveKnexRowType,
} from "./DatabaseClient";
import { Html } from "../Types";
import { QueryResult } from "@tauri-apps/plugin-sql";
import { QueryBuilder, Knex } from "knex";
import type { ReaderSettings } from "../ui/reader/ReaderSettings.types";

const CHAPTER_TEXT: Html = {
    __unsafeHtml: `
    <p class="cnNjZjM1OGJjYTgzYzRjOTdiNGY2NjMyMjA3OTFhNTA1" style="text-align: center" data-original-margin=""><strong>Chapter 001<br></strong><strong>Good Morning Brother</strong></p>
    <p class="cnNkZGEyYmU3MWJmNzQyZjE4ZjVhYzI4M2ZhZmU2MzUx" data-original-margin="">Zorian’s eyes abruptly shot open as a sharp pain erupted from his stomach. His whole body convulsed, buckling against the object that fell on him, and suddenly he was wide awake, not a trace of drowsiness in his mind.</p>
    <p class="cnMwNTMxYjdkZGM3YTQ2NjdhOWJkMjQzNjMzZTUyZThk" data-original-margin="">“Good morning, brother!” an annoyingly cheerful voice sounded right on top of him. “Morning, morning, <em>MORNING</em>!!!”</p>
    <p class="cnNiMjI2MjQ4NjI5MDQyNGU4NTkzOGYzZGQyMTlmMWFi" data-original-margin="">Zorian glared at his little sister, but she just smiled back at him cheekily, still sprawled across his stomach. She was humming to herself in obvious satisfaction, kicking her feet playfully in the air as she studied the giant world map Zorian had tacked to the wall next to his bed. Or rather, pretended to study – Zorian could see her watching him intently out of the corner of her eyes for a reaction.</p>
    <p class="cnMwNmZlNTRhZWRhZTQ4NjFhYzE4M2E3ODRiZjNhOGU5" data-original-margin="">This was what he got for not arcane-locking the door and setting up a basic alarm perimeter around his bed.</p>
    <p class="cnNjZjM1OGJjYTgzYzRjOTdiNGY2NjMyMjA3OTFhNTA1" style="text-align: center" data-original-margin=""><strong>Chapter 001<br></strong><strong>Good Morning Brother</strong></p>
    <p class="cnNkZGEyYmU3MWJmNzQyZjE4ZjVhYzI4M2ZhZmU2MzUx" data-original-margin="">Zorian’s eyes abruptly shot open as a sharp pain erupted from his stomach. His whole body convulsed, buckling against the object that fell on him, and suddenly he was wide awake, not a trace of drowsiness in his mind.</p>
    <p class="cnMwNTMxYjdkZGM3YTQ2NjdhOWJkMjQzNjMzZTUyZThk" data-original-margin="">“Good morning, brother!” an annoyingly cheerful voice sounded right on top of him. “Morning, morning, <em>MORNING</em>!!!”</p>
    <p class="cnNiMjI2MjQ4NjI5MDQyNGU4NTkzOGYzZGQyMTlmMWFi" data-original-margin="">Zorian glared at his little sister, but she just smiled back at him cheekily, still sprawled across his stomach. She was humming to herself in obvious satisfaction, kicking her feet playfully in the air as she studied the giant world map Zorian had tacked to the wall next to his bed. Or rather, pretended to study – Zorian could see her watching him intently out of the corner of her eyes for a reaction.</p>
    <p class="cnMwNmZlNTRhZWRhZTQ4NjFhYzE4M2E3ODRiZjNhOGU5" data-original-margin="">This was what he got for not arcane-locking the door and setting up a basic alarm perimeter around his bed.</p>
    <p class="cnNjZjM1OGJjYTgzYzRjOTdiNGY2NjMyMjA3OTFhNTA1" style="text-align: center" data-original-margin=""><strong>Chapter 001<br></strong><strong>Good Morning Brother</strong></p>
    <p class="cnNkZGEyYmU3MWJmNzQyZjE4ZjVhYzI4M2ZhZmU2MzUx" data-original-margin="">Zorian’s eyes abruptly shot open as a sharp pain erupted from his stomach. His whole body convulsed, buckling against the object that fell on him, and suddenly he was wide awake, not a trace of drowsiness in his mind.</p>
    <p class="cnMwNTMxYjdkZGM3YTQ2NjdhOWJkMjQzNjMzZTUyZThk" data-original-margin="">“Good morning, brother!” an annoyingly cheerful voice sounded right on top of him. “Morning, morning, <em>MORNING</em>!!!”</p>
    <p class="cnNiMjI2MjQ4NjI5MDQyNGU4NTkzOGYzZGQyMTlmMWFi" data-original-margin="">Zorian glared at his little sister, but she just smiled back at him cheekily, still sprawled across his stomach. She was humming to herself in obvious satisfaction, kicking her feet playfully in the air as she studied the giant world map Zorian had tacked to the wall next to his bed. Or rather, pretended to study – Zorian could see her watching him intently out of the corner of her eyes for a reaction.</p>
    <p class="cnMwNmZlNTRhZWRhZTQ4NjFhYzE4M2E3ODRiZjNhOGU5" data-original-margin="">This was what he got for not arcane-locking the door and setting up a basic alarm perimeter around his bed.</p>
    <p class="cnNjZjM1OGJjYTgzYzRjOTdiNGY2NjMyMjA3OTFhNTA1" style="text-align: center" data-original-margin=""><strong>Chapter 001<br></strong><strong>Good Morning Brother</strong></p>
    <p class="cnNkZGEyYmU3MWJmNzQyZjE4ZjVhYzI4M2ZhZmU2MzUx" data-original-margin="">Zorian’s eyes abruptly shot open as a sharp pain erupted from his stomach. His whole body convulsed, buckling against the object that fell on him, and suddenly he was wide awake, not a trace of drowsiness in his mind.</p>
    <p class="cnMwNTMxYjdkZGM3YTQ2NjdhOWJkMjQzNjMzZTUyZThk" data-original-margin="">“Good morning, brother!” an annoyingly cheerful voice sounded right on top of him. “Morning, morning, <em>MORNING</em>!!!”</p>
    <p class="cnNiMjI2MjQ4NjI5MDQyNGU4NTkzOGYzZGQyMTlmMWFi" data-original-margin="">Zorian glared at his little sister, but she just smiled back at him cheekily, still sprawled across his stomach. She was humming to herself in obvious satisfaction, kicking her feet playfully in the air as she studied the giant world map Zorian had tacked to the wall next to his bed. Or rather, pretended to study – Zorian could see her watching him intently out of the corner of her eyes for a reaction.</p>
    <p class="cnMwNmZlNTRhZWRhZTQ4NjFhYzE4M2E3ODRiZjNhOGU5" data-original-margin="">This was what he got for not arcane-locking the door and setting up a basic alarm perimeter around his bed.</p>
    <p class="cnNjZjM1OGJjYTgzYzRjOTdiNGY2NjMyMjA3OTFhNTA1" style="text-align: center" data-original-margin=""><strong>Chapter 001<br></strong><strong>Good Morning Brother</strong></p>
    <p class="cnNkZGEyYmU3MWJmNzQyZjE4ZjVhYzI4M2ZhZmU2MzUx" data-original-margin="">Zorian’s eyes abruptly shot open as a sharp pain erupted from his stomach. His whole body convulsed, buckling against the object that fell on him, and suddenly he was wide awake, not a trace of drowsiness in his mind.</p>
    <p class="cnMwNTMxYjdkZGM3YTQ2NjdhOWJkMjQzNjMzZTUyZThk" data-original-margin="">“Good morning, brother!” an annoyingly cheerful voice sounded right on top of him. “Morning, morning, <em>MORNING</em>!!!”</p>
    <p class="cnNiMjI2MjQ4NjI5MDQyNGU4NTkzOGYzZGQyMTlmMWFi" data-original-margin="">Zorian glared at his little sister, but she just smiled back at him cheekily, still sprawled across his stomach. She was humming to herself in obvious satisfaction, kicking her feet playfully in the air as she studied the giant world map Zorian had tacked to the wall next to his bed. Or rather, pretended to study – Zorian could see her watching him intently out of the corner of her eyes for a reaction.</p>
    <p class="cnMwNmZlNTRhZWRhZTQ4NjFhYzE4M2E3ODRiZjNhOGU5" data-original-margin="">This was what he got for not arcane-locking the door and setting up a basic alarm perimeter around his bed.</p>
    <p class="cnNjZjM1OGJjYTgzYzRjOTdiNGY2NjMyMjA3OTFhNTA1" style="text-align: center" data-original-margin=""><strong>Chapter 001<br></strong><strong>Good Morning Brother</strong></p>
    <p class="cnNkZGEyYmU3MWJmNzQyZjE4ZjVhYzI4M2ZhZmU2MzUx" data-original-margin="">Zorian’s eyes abruptly shot open as a sharp pain erupted from his stomach. His whole body convulsed, buckling against the object that fell on him, and suddenly he was wide awake, not a trace of drowsiness in his mind.</p>
    <p class="cnMwNTMxYjdkZGM3YTQ2NjdhOWJkMjQzNjMzZTUyZThk" data-original-margin="">“Good morning, brother!” an annoyingly cheerful voice sounded right on top of him. “Morning, morning, <em>MORNING</em>!!!”</p>
    <p class="cnNiMjI2MjQ4NjI5MDQyNGU4NTkzOGYzZGQyMTlmMWFi" data-original-margin="">Zorian glared at his little sister, but she just smiled back at him cheekily, still sprawled across his stomach. She was humming to herself in obvious satisfaction, kicking her feet playfully in the air as she studied the giant world map Zorian had tacked to the wall next to his bed. Or rather, pretended to study – Zorian could see her watching him intently out of the corner of her eyes for a reaction.</p>
    <p class="cnMwNmZlNTRhZWRhZTQ4NjFhYzE4M2E3ODRiZjNhOGU5" data-original-margin="">This was what he got for not arcane-locking the door and setting up a basic alarm perimeter around his bed.</p>
    <p class="cnNjZjM1OGJjYTgzYzRjOTdiNGY2NjMyMjA3OTFhNTA1" style="text-align: center" data-original-margin=""><strong>Chapter 001<br></strong><strong>Good Morning Brother</strong></p>
    <p class="cnNkZGEyYmU3MWJmNzQyZjE4ZjVhYzI4M2ZhZmU2MzUx" data-original-margin="">Zorian’s eyes abruptly shot open as a sharp pain erupted from his stomach. His whole body convulsed, buckling against the object that fell on him, and suddenly he was wide awake, not a trace of drowsiness in his mind.</p>
    <p class="cnMwNTMxYjdkZGM3YTQ2NjdhOWJkMjQzNjMzZTUyZThk" data-original-margin="">“Good morning, brother!” an annoyingly cheerful voice sounded right on top of him. “Morning, morning, <em>MORNING</em>!!!”</p>
    <p class="cnNiMjI2MjQ4NjI5MDQyNGU4NTkzOGYzZGQyMTlmMWFi" data-original-margin="">Zorian glared at his little sister, but she just smiled back at him cheekily, still sprawled across his stomach. She was humming to herself in obvious satisfaction, kicking her feet playfully in the air as she studied the giant world map Zorian had tacked to the wall next to his bed. Or rather, pretended to study – Zorian could see her watching him intently out of the corner of her eyes for a reaction.</p>
    <p class="cnMwNmZlNTRhZWRhZTQ4NjFhYzE4M2E3ODRiZjNhOGU5" data-original-margin="">This was what he got for not arcane-locking the door and setting up a basic alarm perimeter around his bed.</p>
    <p class="cnNjZjM1OGJjYTgzYzRjOTdiNGY2NjMyMjA3OTFhNTA1" style="text-align: center" data-original-margin=""><strong>Chapter 001<br></strong><strong>Good Morning Brother</strong></p>
    <p class="cnNkZGEyYmU3MWJmNzQyZjE4ZjVhYzI4M2ZhZmU2MzUx" data-original-margin="">Zorian’s eyes abruptly shot open as a sharp pain erupted from his stomach. His whole body convulsed, buckling against the object that fell on him, and suddenly he was wide awake, not a trace of drowsiness in his mind.</p>
    <p class="cnMwNTMxYjdkZGM3YTQ2NjdhOWJkMjQzNjMzZTUyZThk" data-original-margin="">“Good morning, brother!” an annoyingly cheerful voice sounded right on top of him. “Morning, morning, <em>MORNING</em>!!!”</p>
    <p class="cnNiMjI2MjQ4NjI5MDQyNGU4NTkzOGYzZGQyMTlmMWFi" data-original-margin="">Zorian glared at his little sister, but she just smiled back at him cheekily, still sprawled across his stomach. She was humming to herself in obvious satisfaction, kicking her feet playfully in the air as she studied the giant world map Zorian had tacked to the wall next to his bed. Or rather, pretended to study – Zorian could see her watching him intently out of the corner of her eyes for a reaction.</p>
    <p class="cnMwNmZlNTRhZWRhZTQ4NjFhYzE4M2E3ODRiZjNhOGU5" data-original-margin="">This was what he got for not arcane-locking the door and setting up a basic alarm perimeter around his bed.</p>
    `,
};

const MOCK_CHAPTERS: DbChapter[] = [
    {
        title: "Good Morning Brother",
        bookID: "mother_of_learning",
        chapterID: "good_morning_brother",
        datePublished: new Date("2022-01-01T00:00:00Z"),
        contents: {
            text: CHAPTER_TEXT,
            noteBefore: null,
            noteAfter: null,
        },
    },
    {
        title: "Life's Little Problems",
        bookID: "mother_of_learning",
        chapterID: "lifes_little_problems",
        datePublished: new Date("2022-01-04T00:00:00Z"),
        contents: {
            text: CHAPTER_TEXT,
            noteBefore: null,
            noteAfter: null,
        },
    },
    {
        title: "Chapter 3",
        bookID: "mother_of_learning",
        chapterID: "chapter3",
        datePublished: new Date("2022-01-07T00:00:00Z"),
        contents: {
            text: CHAPTER_TEXT,
            noteBefore: null,
            noteAfter: null,
        },
    },
];

const MOCK_PROGRESS: DbBookProgress = {
    currentChapter: 2,
    currentPage: 850,
    currentOffset: 424,
};

export const MOCK_BOOKS = {
    MotherOfLearning: {
        url: "/books/mother_of_learning",
        bookID: "mother_of_learning",
        title: "My Awesome Book - Very Very Very Long",
        authorName: "Adam Charron",
        tags: ["Test", "Awesome", "Mock"],
        dateFirstChapter: new Date("2022-01-01T00:00:00Z"),
        dateLastChapter: new Date("2022-01-01T00:00:00Z"),
        dateInserted: new Date("2022-01-01T00:00:00Z"),
        dateLastRead: new Date("2022-01-01T00:00:00Z"),
        coverUrl:
            "https://www.royalroadcdn.com/public/covers-full/21220-mother-of-learning.jpg?time=1637247458",
        countChapters: 242,
        countPages: 11324,
        aboutHtml: `
                <p>Zorian is a teenage mage of humble birth and slightly above-average skill, attending his third year of education at Cyoria's magical academy. He is a driven and irritable young man, consumed by a desire to ensure his own future and free himself of the influence of his family, whom he resents for favoring his brothers over him. Consequently, he has no time for pointless distractions or paying attention to other people's problems. As it happens, time is something he is about to get plenty of. On the eve of the Cyoria's annual summer festival, he is killed and brought back to the beginning of the month, just before he was about to take a train to Cyoria. Suddenly trapped in a time loop with no clear end or exit, Zorian will have to look both within and without to unravel the mystery before him. And he does have to unravel it, for the time loop hadn't been made for his sake and dangers lurk everywhere... Repetition is the mother of learning, but Zorian will have to first make sure he survives to try again - in a world of magic, even a time traveler isn't safe from those who wish him ill.</p>
                <p>**********************************</p>
                <p>Mother of Learning is now <a href="https://www.royalroad.com/amazon/B09M2R6QLF" rel="noopener ugc nofollow">available for sale on Amazon</a>. The story will remain available in full here on Royal Road and on Fictionpress, but if you're more interested to read the story as a Kindle Edition e-book you now have a way to do that.</p>
                <p>The audiobooks can be found <a href="https://www.audible.com/author/Domagoj-Kurmaic/B09M8ZV2J2" rel="noopener ugc nofollow">on this link here</a>. The physical edition is available through a Kickstarter campaign, which <a href="https://www.kickstarter.com/projects/wraithmarked/mol3and4" rel="noopener ugc nofollow">can be found here</a>.</p>
            `,
        countReaders: 24324,
        countStars: 4134,
        chapters: MOCK_CHAPTERS,
        ...MOCK_PROGRESS,
    } as DbBook,
    SuperSupportive: {
        url: "/books/super_supportive",
        bookID: "super_supportive",
        title: "Super Supportive",
        authorName: "Adam Charron",
        tags: ["Original", "LitRPG", "ProgressionFantasy"],
        dateFirstChapter: new Date("2022-01-01T00:00:00Z"),
        dateLastChapter: new Date("2022-01-01T00:00:00Z"),
        dateInserted: new Date("2022-01-01T00:00:00Z"),
        dateLastRead: new Date("2022-01-01T00:00:00Z"),
        coverUrl:
            "https://www.royalroadcdn.com/public/covers-large/63759-super-supportive.jpg?time=1691780497",
        countChapters: 195,
        countPages: 7324,
        aboutHtml: `
                <p>Zorian is a teenage mage of humble birth and slightly above-average skill, attending his third year of education at Cyoria's magical academy. He is a driven and irritable young man, consumed by a desire to ensure his own future and free himself of the influence of his family, whom he resents for favoring his brothers over him. Consequently, he has no time for pointless distractions or paying attention to other people's problems. As it happens, time is something he is about to get plenty of. On the eve of the Cyoria's annual summer festival, he is killed and brought back to the beginning of the month, just before he was about to take a train to Cyoria. Suddenly trapped in a time loop with no clear end or exit, Zorian will have to look both within and without to unravel the mystery before him. And he does have to unravel it, for the time loop hadn't been made for his sake and dangers lurk everywhere... Repetition is the mother of learning, but Zorian will have to first make sure he survives to try again - in a world of magic, even a time traveler isn't safe from those who wish him ill.</p>
                <p>**********************************</p>
                <p>Mother of Learning is now <a href="https://www.royalroad.com/amazon/B09M2R6QLF" rel="noopener ugc nofollow">available for sale on Amazon</a>. The story will remain available in full here on Royal Road and on Fictionpress, but if you're more interested to read the story as a Kindle Edition e-book you now have a way to do that.</p>
                <p>The audiobooks can be found <a href="https://www.audible.com/author/Domagoj-Kurmaic/B09M8ZV2J2" rel="noopener ugc nofollow">on this link here</a>. The physical edition is available through a Kickstarter campaign, which <a href="https://www.kickstarter.com/projects/wraithmarked/mol3and4" rel="noopener ugc nofollow">can be found here</a>.</p>
            `,
        countReaders: 12432,
        countStars: 1413,
        chapters: MOCK_CHAPTERS,
        ...MOCK_PROGRESS,
    } as DbBook,
    ThePerfectRun: {
        url: "/books/perfect_run",
        bookID: "perfect_run",
        title: "The Perfect Run",
        authorName: "Adam Charron",
        tags: ["Original", "LitRPG", "ProgressionFantasy"],
        dateFirstChapter: new Date("2022-01-01T00:00:00Z"),
        dateLastChapter: new Date("2022-01-01T00:00:00Z"),
        dateInserted: new Date("2022-01-01T00:00:00Z"),
        dateLastRead: new Date("2022-01-01T00:00:00Z"),
        coverUrl:
            "https://www.royalroadcdn.com/public/covers-full/36735-the-perfect-run.jpg?time=1604749383",
        countChapters: 195,
        countPages: 724,
        aboutHtml: `
                <p>Zorian is a teenage mage of humble birth and slightly above-average skill, attending his third year of education at Cyoria's magical academy. He is a driven and irritable young man, consumed by a desire to ensure his own future and free himself of the influence of his family, whom he resents for favoring his brothers over him. Consequently, he has no time for pointless distractions or paying attention to other people's problems. As it happens, time is something he is about to get plenty of. On the eve of the Cyoria's annual summer festival, he is killed and brought back to the beginning of the month, just before he was about to take a train to Cyoria. Suddenly trapped in a time loop with no clear end or exit, Zorian will have to look both within and without to unravel the mystery before him. And he does have to unravel it, for the time loop hadn't been made for his sake and dangers lurk everywhere... Repetition is the mother of learning, but Zorian will have to first make sure he survives to try again - in a world of magic, even a time traveler isn't safe from those who wish him ill.</p>
                <p>**********************************</p>
                <p>Mother of Learning is now <a href="https://www.royalroad.com/amazon/B09M2R6QLF" rel="noopener ugc nofollow">available for sale on Amazon</a>. The story will remain available in full here on Royal Road and on Fictionpress, but if you're more interested to read the story as a Kindle Edition e-book you now have a way to do that.</p>
                <p>The audiobooks can be found <a href="https://www.audible.com/author/Domagoj-Kurmaic/B09M8ZV2J2" rel="noopener ugc nofollow">on this link here</a>. The physical edition is available through a Kickstarter campaign, which <a href="https://www.kickstarter.com/projects/wraithmarked/mol3and4" rel="noopener ugc nofollow">can be found here</a>.</p>
            `,
        countReaders: 432,
        countStars: 113,
        chapters: MOCK_CHAPTERS,
        ...MOCK_PROGRESS,
    } as DbBook,
    SuperMinion: {
        url: "/books/superminion",
        bookID: "superminion",
        title: "Super Minion",
        authorName: "Adam Charron",
        tags: ["Original", "LitRPG", "ProgressionFantasy"],
        dateFirstChapter: new Date("2022-01-01T00:00:00Z"),
        dateLastChapter: new Date("2022-01-01T00:00:00Z"),
        dateInserted: new Date("2022-01-01T00:00:00Z"),
        dateLastRead: new Date("2022-01-01T00:00:00Z"),
        coverUrl:
            "https://www.royalroadcdn.com/public/covers-large/21410-super-minion.jpg?time=1679784929",
        countChapters: 195,
        countPages: 724,
        aboutHtml: `
                <p>Zorian is a teenage mage of humble birth and slightly above-average skill, attending his third year of education at Cyoria's magical academy. He is a driven and irritable young man, consumed by a desire to ensure his own future and free himself of the influence of his family, whom he resents for favoring his brothers over him. Consequently, he has no time for pointless distractions or paying attention to other people's problems. As it happens, time is something he is about to get plenty of. On the eve of the Cyoria's annual summer festival, he is killed and brought back to the beginning of the month, just before he was about to take a train to Cyoria. Suddenly trapped in a time loop with no clear end or exit, Zorian will have to look both within and without to unravel the mystery before him. And he does have to unravel it, for the time loop hadn't been made for his sake and dangers lurk everywhere... Repetition is the mother of learning, but Zorian will have to first make sure he survives to try again - in a world of magic, even a time traveler isn't safe from those who wish him ill.</p>
                <p>**********************************</p>
                <p>Mother of Learning is now <a href="https://www.royalroad.com/amazon/B09M2R6QLF" rel="noopener ugc nofollow">available for sale on Amazon</a>. The story will remain available in full here on Royal Road and on Fictionpress, but if you're more interested to read the story as a Kindle Edition e-book you now have a way to do that.</p>
                <p>The audiobooks can be found <a href="https://www.audible.com/author/Domagoj-Kurmaic/B09M8ZV2J2" rel="noopener ugc nofollow">on this link here</a>. The physical edition is available through a Kickstarter campaign, which <a href="https://www.kickstarter.com/projects/wraithmarked/mol3and4" rel="noopener ugc nofollow">can be found here</a>.</p>
            `,
        countReaders: 432,
        countStars: 113,
        chapters: MOCK_CHAPTERS,
        ...MOCK_PROGRESS,
    } as DbBook,
};

export class MockDatabaseClient implements IDatabaseClient {
    async getBooks(): Promise<DbResult<DbBookStub[], { message: string }>> {
        return Promise.resolve({
            status: "success",
            result: Object.values(MOCK_BOOKS),
        });
    }
    async getBookDetails(
        bookID: keyof typeof MOCK_BOOKS,
    ): Promise<DbResult<DbBook, { message: string }>> {
        const book = MOCK_BOOKS[bookID] ?? null;
        if (book) {
            return Promise.resolve({
                status: "success",
                result: book,
            });
        } else {
            return Promise.resolve({
                status: "error",
                error: {
                    message: "Book not found.",
                },
            });
        }
    }
    async getChapters(
        bookID: string,
    ): Promise<DbResult<DbChapter[], { message: string }>> {
        return Promise.resolve({
            status: "success",
            result: MOCK_CHAPTERS,
        });
    }
    async setBookProgress(
        bookID: string,
        progress: DbBookProgress,
    ): Promise<DbResult<null, { message: string }>> {
        return Promise.resolve({
            status: "success",
            result: null,
        });
    }
    async getReaderSettings(): Promise<
        DbResult<ReaderSettings, { message: string }>
    > {
        return Promise.resolve({
            status: "success",
            result: DEFAULT_READER_SETTINGS,
        });
    }
    async setReaderSettings(
        settings: ReaderSettings,
    ): Promise<DbResult<null, { message: string }>> {
        return Promise.resolve({
            status: "success",
            result: null,
        });
    }

    getDbPath(): Promise<string> {
        return Promise.resolve("/path/to/fake/database.db");
    }

    execute(callback: QueryBuilderCallback<any>): Promise<QueryResult> {
        throw new Error("Method not implemented.");
    }

    fetch<T extends object>(
        callback: QueryBuilderCallback<T>,
    ): Promise<ResolveKnexRowType<T>> {
        throw new Error("Method not implemented.");
    }

    public async resetTables() {}
}
