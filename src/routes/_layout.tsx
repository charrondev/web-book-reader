import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useMediaQuery } from "@uidotdev/usehooks";
import { ErrorHandler } from "../ui/ErrorHandler";
import { DesktopNavBar, MobileNavBar } from "../ui/NavBar";
import { TitleBar } from "../ui/TitleBar";
import { NavBarContextProvider } from "../ui/NavBar.Context";

export const Route = createFileRoute("/_layout")({
    component: RootLayout,
    notFoundComponent: NotFoundPage,
});

const DESKTOP_NAVBAR_WIDTH = 200;

function RootLayout() {
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <div
            css={{
                display: isMobile ? "block" : "flex",
            }}
        >
            <NavBarContextProvider
                leftInset={isMobile ? 0 : DESKTOP_NAVBAR_WIDTH}
            >
                <div
                    css={{
                        background: "#fff",
                        position: "fixed",
                        left: DESKTOP_NAVBAR_WIDTH,
                        top: 0,
                        bottom: 0,
                        right: 0,
                        zIndex: -1,
                    }}
                ></div>
                {!isMobile && <DesktopNavBar />}
                <div
                    css={[
                        { flex: "1", background: "#fff" },
                        !isMobile && {
                            width: `calc(100% - ${DESKTOP_NAVBAR_WIDTH}px)`,
                            maxWidth: `calc(100% - ${DESKTOP_NAVBAR_WIDTH}px)`,
                            overflowX: "hidden",
                        },
                    ]}
                >
                    <ErrorHandler>
                        <Outlet />
                    </ErrorHandler>
                </div>
                {isMobile && <MobileNavBar />}
            </NavBarContextProvider>
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
