import { createFileRoute } from "@tanstack/react-router";
import { TitleBar } from "../ui/TitleBar";
import { useEffect } from "react";
import { DatabaseClient } from "../storage/DatabaseClient";

export const Route = createFileRoute("/settings")({
    component: () => <SettingsPage />,
});

function SettingsPage() {
    useEffect(() => {
        testBed();
    });

    return (
        <div>
            <TitleBar title="Settings" />
        </div>
    );
}

async function testBed() {
    const dbclient = new DatabaseClient();
    const newBook = await dbclient.addDummyBook();
    console.log({ newBook });

    const books = await dbclient.getBooks();
    console.log({ books });
}
