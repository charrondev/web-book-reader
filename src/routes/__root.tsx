import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useMediaQuery } from "@uidotdev/usehooks";
import { ErrorHandler } from "../ui/ErrorHandler";
import { TitleBar } from "../ui/TitleBar";

export const Route = createRootRoute({
    component: RootLayout,
    notFoundComponent: NotFoundPage,
});

function RootLayout() {
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <ErrorHandler>
            <Outlet />
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
