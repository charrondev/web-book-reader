/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import { createRootRoute, Outlet } from "@tanstack/react-router";
import { DebugMenu } from "../DebugMenu";
import { ErrorHandler } from "../ui/ErrorHandler";
import { TitleBar } from "../ui/TitleBar";
import { useOnHistoryEvent } from "../History";

export const Route = createRootRoute({
    component: RootLayout,
    notFoundComponent: NotFoundPage,
});

function resetAppScrollPosition() {
    window.scrollTo(0, 0);
    document.getElementById("root")?.scrollTo(0, 0);
}

function RootLayout() {
    useOnHistoryEvent("push", resetAppScrollPosition);
    return (
        <ErrorHandler>
            <Outlet />
            <DebugMenu />
        </ErrorHandler>
    );
}

function NotFoundPage() {
    return (
        <div>
            <TitleBar title="Not Found" />
            <div>Page Not Found</div>
        </div>
    );
}
