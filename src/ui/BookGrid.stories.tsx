import { Meta } from "@storybook/react";
import { BookGrid } from "./BookGrid";
import { MOCK_BOOKS } from "../storage/MockDatabaseClient";

const meta: Meta<typeof BookGrid> = {
    component: BookGrid,
};

export default meta;

export function MultipleBooks() {
    return <BookGrid books={Object.values(MOCK_BOOKS)} />;
}
