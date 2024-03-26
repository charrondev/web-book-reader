/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import styled from "@emotion/styled";
import { Button, DropdownMenu } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import * as shell from "@tauri-apps/plugin-shell";
import { useMediaQuery } from "@uidotdev/usehooks";
import { CgDatabase } from "react-icons/cg";
import { IoNavigate, IoRefresh, IoTrashBin } from "react-icons/io5";
import { TiFlowChildren } from "react-icons/ti";
import { VscDebugConsole } from "react-icons/vsc";
import { useDatabaseClient } from "./storage/DatabaseClient";

export function DebugMenu() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const db = useDatabaseClient();

    const currentDbPathQuery = useQuery({
        queryKey: ["db-path"],
        queryFn: async () => {
            const path = await db.getDbPath();
            return { path };
        },
    });

    return (
        <div css={{}}>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger
                    css={{
                        position: "fixed",
                        bottom: 10,
                        right: isMobile ? 18 : 40,
                        zIndex: 1000000,
                        background: "white",
                    }}
                >
                    <Button variant="surface">
                        Debug
                        <VscDebugConsole />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                    <CustomDropdownItem
                        onClick={() => {
                            document
                                .querySelector<HTMLDivElement>(
                                    ".TanStackRouterDevtools > button",
                                )
                                ?.click();
                        }}
                    >
                        <span>TanStack Routing</span>
                        <IoNavigate />
                    </CustomDropdownItem>
                    <CustomDropdownItem
                        onClick={() => {
                            document
                                .querySelector<HTMLButtonElement>(
                                    ".tsqd-open-btn",
                                )
                                ?.click();
                        }}
                        css={{
                            position: "relative",
                        }}
                    >
                        <span>TanStack State</span>
                        <TiFlowChildren />
                    </CustomDropdownItem>
                    <CustomDropdownItem
                        onClick={() => {
                            db.ensureSetup().then(() => {
                                const path = currentDbPathQuery.data?.path;
                                if (path) {
                                    shell.open("file://" + path);
                                }
                            });
                        }}
                    >
                        <span>Open Database</span>
                        <CgDatabase />
                    </CustomDropdownItem>
                    <CustomDropdownItem
                        onClick={() => {
                            db.resetDb();
                        }}
                    >
                        <span>Reset Database</span>
                        <IoTrashBin />
                    </CustomDropdownItem>
                    <CustomDropdownItem
                        onClick={() => {
                            window.location.href = window.location.href;
                        }}
                    >
                        <span>Refresh Page</span>
                        <IoRefresh />
                    </CustomDropdownItem>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            <div
                css={{
                    "& .tsqd-open-btn-container": {
                        visibility: "hidden",
                    },
                    "& .TanStackRouterDevtools > button": {
                        visibility: "hidden",
                    },
                }}
            >
                <ReactQueryDevtools
                    buttonPosition="relative"
                    initialIsOpen={true}
                />
                <TanStackRouterDevtools initialIsOpen={false} />
            </div>
        </div>
    );
}

const CustomDropdownItem = styled(DropdownMenu.Item)({
    gap: 12,
    width: "100%",

    "& span": {
        flex: 1,
    },
});
