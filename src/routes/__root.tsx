import { createRootRoute, Outlet } from "@tanstack/react-router";
import { DesktopNavBar, MobileNavBar } from "../ui/NavBar";
import { ErrorHandler } from "../ui/ErrorHandler";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { TitleBar } from "../ui/TitleBar";
import { DebugMenu } from "../DebugMenu";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Colors } from "../ui/Colors";

export const Route = createRootRoute({
    component: RootLayout,
    notFoundComponent: NotFoundPage,
});

function RootLayout() {
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <div
            css={{
                display: isMobile ? "block" : "flex",
                // height: "100vh",
                // overflow: "auto",
                // width: "100%",
                // overflow: "hidden",
            }}
        >
            <div
                css={{
                    background: "#fff",
                    position: "fixed",
                    left: 200,
                    top: 0,
                    bottom: 0,
                    right: 0,
                    zIndex: -1,
                }}
            ></div>
            {!isMobile && <DesktopNavBar />}
            <div css={{ flex: "1", background: "#fff" }}>
                <ErrorHandler>
                    <Outlet />
                </ErrorHandler>
            </div>
            {isMobile && <MobileNavBar />}
        </div>
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
