import { createRootRoute, Outlet } from "@tanstack/react-router";
import { MobileNavBar } from "../ui/MobileNavBar";

export const Route = createRootRoute({
    component: () => (
        <>
            <div css={{}}>
                <div css={{ flex: "1 0 auto" }}>
                    <Outlet />
                </div>
                <MobileNavBar />
            </div>
            {/* <TanStackRouterDevtools /> */}
        </>
    ),
});
