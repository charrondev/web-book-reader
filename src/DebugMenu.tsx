/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2024 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

import { DropdownMenu, Button } from "@radix-ui/themes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect, useState } from "react";
import { VscDebugConsole } from "react-icons/vsc";

export function DebugMenu() {
    const [showDevTools, setShowDevtools] = useState(false);

    useEffect(() => {
        document.addEventListener("click", (e) => {
            if (
                e.target instanceof HTMLElement &&
                e.target.matches(".tsqd-minimize-btn")
            ) {
                setShowDevtools(false);
            }
        });
    }, []);
    return (
        <div css={{ position: "fixed", top: 9, right: 18, zIndex: 1000 }}>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Button variant="soft">
                        Debug
                        <VscDebugConsole />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <DropdownMenu.Item
                        shortcut="⌘ E"
                        onClick={() => {
                            document
                                .querySelector<HTMLDivElement>(
                                    ".TanStackRouterDevtools > button",
                                )
                                ?.click();
                        }}
                    >
                        Routing
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                        onClick={() => {
                            document
                                .querySelector<HTMLButtonElement>(
                                    ".tsqd-open-btn",
                                )
                                ?.click();
                        }}
                        shortcut="⌘ D"
                        css={{
                            position: "relative",
                        }}
                    >
                        State{" "}
                    </DropdownMenu.Item>
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
