import { createFileRoute } from "@tanstack/react-router";
import { TitleBar } from "../ui/TitleBar";
import { IDatabaseClient, useDatabaseClient } from "../storage/DatabaseClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as shell from "@tauri-apps/plugin-shell";
import { DbUtils } from "../utils";

export const Route = createFileRoute("/_layout/settings")({
    component: () => <SettingsPage />,
});

function SettingsPage() {
    const db = useDatabaseClient();
    const currentPathQuery = useQuery({
        queryKey: ["db-path"],
        queryFn: async () => {
            const path = await db.getDbPath();
            return { path };
        },
    });

    return (
        <div>
            <TitleBar title="Settings" />
            <div>
                <h2>Database Path</h2>
                <p>{currentPathQuery.data?.path ?? "Loading"}</p>
                <button
                    type="button"
                    onClick={() => {
                        shell.open("file://" + currentPathQuery.data?.path);
                    }}
                >
                    Open
                </button>
            </div>
        </div>
    );
}

// async function testBed(db: IDatabaseClient) {
//     const insertResult = await db.execute((query) =>
//         query.table("WBR_book").insert({
//             bookID: DbUtils.uuidv4(),
//             dateFirstChapter: null,
//             dateLastChapter: null,
//             dateInserted: DbUtils.currentDate(),
//             dateLastRead: null,
//             countPages: 0,
//             countChapters: 0,
//             coverUrl: "https://example.com",
//             title: "Test Book",
//             aboutHtml: "Test book",
//         }),
//     );
// }
