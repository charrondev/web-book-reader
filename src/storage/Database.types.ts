import { Knex } from "knex";
import { DbBookRow, DbBookProgress } from "./DatabaseClient";

declare module "knex/types/tables" {
    type TableTable = {
        name: string;
    };
    interface Tables {
        // This is same as specifying `knex<User>('users')`
        WBR_book: Knex.CompositeTableType<DbBookRow, DbBookRow>;
        WBR_bookProgress: DbBookProgress;
        WBR_bookTag: { bookID: string; tagName: string };
        WBR_chapter: {};
        sqlite_schema: Knex.CompositeTableType<
            TableTable,
            TableTable,
            TableTable
        >;
    }
}
