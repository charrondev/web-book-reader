/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import { Progress } from "@radix-ui/themes";
import { Link, useMatchRoute } from "@tanstack/react-router";
import React, { useEffect } from "react";
import {
    IoLibrary,
    IoLibraryOutline,
    IoSearch,
    IoSettings,
    IoSettingsOutline,
} from "react-icons/io5";
import { useBookDownloader } from "../downloader/Downloader.context";
import { useSearchContext } from "../search/Search.Context";
import { Colors } from "./Colors";

export function DesktopNavBar(props: { className?: string }) {
    return (
        <>
            <nav
                className={props.className}
                data-tauri-drag-region
                css={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 200,
                    minWidth: 200,
                    maxWidth: 200,
                    overflowX: "hidden",
                    zIndex: 5,
                }}
            >
                <div
                    data-tauri-drag-region
                    css={{
                        background: "rgba(255, 255, 255, 0.7)",
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    }}
                ></div>
                <div
                    data-tauri-drag-region
                    css={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        height: "100%",
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        padding: "56px 12px 16px",
                        overflowY: "scroll",
                        overscrollBehavior: "contain",
                        position: "relative",
                    }}
                >
                    <SearchBar />
                    <NavItem
                        isDesktop
                        to="/books"
                        icon={<IoLibraryOutline />}
                        iconActive={<IoLibrary />}
                        label={"Library"}
                    />
                    <NavItem
                        isDesktop
                        to="/discover"
                        icon={<IoSearch />}
                        iconActive={<IoSearch />}
                        label={"Discover"}
                    />
                    <NavItem
                        isDesktop
                        to="/settings"
                        icon={<IoSettingsOutline />}
                        iconActive={<IoSettings />}
                        label={"Settings"}
                    />
                    <div css={{ flex: 1 }}></div>
                    <DownloadNavItem />
                </div>
            </nav>
            <div css={{ width: "200px", height: "100vh" }}></div>
        </>
    );
}

function DownloadNavItem() {
    const { activeDownloads, checkDownloads, errorMessage } =
        useBookDownloader();

    useEffect(() => {
        checkDownloads();
    }, []);

    return (
        <div
            css={{
                padding: "8px 12px",
                background: Colors.Light.slate3,
                border: `1px solid ${Colors.Light.violet11}`,
                width: "100%",
                borderRadius: 9,
            }}
        >
            <div css={{}}>
                {activeDownloads && (
                    <>
                        <div css={{ fontSize: 12, marginBottom: 8 }}>
                            {activeDownloads.currentCheckName}
                        </div>
                        <Progress
                            value={
                                activeDownloads?.currentCheckCompletionPercentage
                            }
                            max={100}
                        />
                    </>
                )}
                {errorMessage && (
                    <span css={{ fontSize: 12, color: Colors.Light.ruby9 }}>
                        {errorMessage}
                    </span>
                )}
            </div>
        </div>
    );
}

function SearchBar() {
    const searchContext = useSearchContext();
    const isMatch = useMatchRoute();
    const isActive = isMatch({ to: "/search" });
    console.log({ isActive });
    return (
        <div
            css={{
                position: "relative",
                width: "100%",
                color: Colors.Light.slate11,
                marginBottom: 12,
            }}
        >
            <IoSearch
                css={{
                    position: "absolute",
                    top: "52%",
                    left: 6,
                    transform: "translateY(-50%)",
                    fontSize: 14,
                }}
            />
            <input
                type="text"
                autoComplete="off"
                value={searchContext.query}
                onChange={(e) => {
                    searchContext.setQuery(e.target.value);
                }}
                spellCheck={false}
                css={[
                    {
                        width: "100%",
                        background: "rgba(0, 0, 0, 0.08)",
                        borderRadius: 6,
                        outline: "none",
                        border: "3px solid transparent",
                        fontSize: 13,
                        padding: "3px 8px",
                        paddingLeft: 24,
                        "&::placeholder": {
                            color: Colors.Light.slate10,
                        },
                        "&:focus": {
                            borderColor: Colors.Light.violet11,
                        },
                    },
                    isActive && {
                        borderColor: Colors.Light.violet11,
                    },
                ]}
                placeholder="Search"
            />
        </div>
    );
}

export function MobileNavBar(props: { className?: string }) {
    return (
        <>
            <div css={{ height: 52 }}></div>
            <nav
                data-tauri-drag-region
                css={[
                    {
                        position: "fixed",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(240, 240, 240, 0.8)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        border: `1px solid ${Colors.Light.slate5}`,
                        padding: "8px 16px",
                        height: 52,
                    },
                    props.className,
                ]}
            >
                <ul
                    data-tauri-drag-region
                    css={{
                        display: "flex",
                        justifyContent: "space-around",
                        padding: 0,
                        margin: 0,
                        gap: 32,
                    }}
                >
                    <NavItem
                        to="/books"
                        icon={<IoLibraryOutline />}
                        iconActive={<IoLibrary />}
                        label={"Library"}
                    />
                    <NavItem
                        to="/discover"
                        icon={<IoSearch />}
                        iconActive={<IoSearch />}
                        label={"Discover"}
                    />
                    <NavItem
                        to="/settings"
                        icon={<IoSettingsOutline />}
                        iconActive={<IoSettings />}
                        label={"Settings"}
                    />
                </ul>
            </nav>
        </>
    );
}

type ItemProps = React.ComponentProps<typeof Link> & {
    icon: React.ReactNode;
    iconActive: React.ReactNode;
    label: string;
    isDesktop?: boolean;
};

function NavItem(props: ItemProps) {
    const { icon, iconActive, label, isDesktop, ...rest } = props;
    return (
        <Link
            onDragStart={(e) => {
                e.preventDefault();
            }}
            data-tauri-drag-region
            {...rest}
            activeProps={{ className: "active" }}
            css={[
                {
                    textDecoration: "none",
                    color: Colors.Light.slate11,
                    fontSize: "20px",
                    flex: 1,
                    "&.active": {
                        color: Colors.Light.violet11,
                    },
                },
                isDesktop && {
                    flex: 0,
                    width: "100%",
                    fontSize: 14,
                    position: "relative",
                    borderRadius: 6,
                    background: "transparent",
                    transition: "transform ease 0.1s",
                    "&:active": {
                        transform: "scale(0.992)",
                    },
                    "&:hover": {
                        background: "rgba(0, 0, 0, 0.08)",
                    },
                    "&.active": {
                        background: "rgba(0, 0, 0, 0.12)",
                    },
                },
            ]}
        >
            <li
                data-tauri-drag-region
                css={[
                    {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    },
                    isDesktop && {
                        flexDirection: "row",
                        padding: "4px 6px",
                        gap: 6,
                        width: "100%",
                        justifyContent: "flex-start",
                    },
                ]}
            >
                <span
                    css={{
                        ".active &": {
                            display: "none",
                        },
                    }}
                >
                    {icon}
                </span>
                <span
                    css={{
                        display: "none",
                        ".active &": {
                            display: "inline-block",
                        },
                    }}
                >
                    {iconActive}
                </span>
                <span
                    css={[
                        {
                            color: "inherit",
                            fontSize: "10px",
                            fontWeight: 600,
                        },
                        isDesktop && {
                            fontSize: 12,
                            fontWeight: 400,
                            color: Colors.Light.slate12,
                        },
                    ]}
                >
                    {label}
                </span>
            </li>
        </Link>
    );
}
