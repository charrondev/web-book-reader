import { Knex } from "knex";
import {
    DbBookRow,
    DbBookProgress,
    type DbTagRow,
    type DbChapterRow,
} from "./DatabaseClient";

declare module "knex/types/tables" {
    type TableTable = {
        name: string;
    };

    type BookTag = {
        bookID: string;
        tagName: string;
    };

    interface Tables {
        // This is same as specifying `knex<User>('users')`
        WBR_book: Knex.CompositeTableType<DbBookRow, DbBookRow>;
        WBR_bookProgress: Knex.CompositeTableType<
            DbBookProgress,
            DbBookProgress
        >;
        WBR_bookTag: Knex.CompositeTableType<DbTagRow, DbTagRow>;
        WBR_chapter: Knex.CompositeTableType<DbChapterRow, DbChapterRow>;
        sqlite_schema: Knex.CompositeTableType<
            TableTable,
            TableTable,
            TableTable
        >;
    }
}
