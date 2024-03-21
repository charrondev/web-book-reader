/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import styled from "@emotion/styled";
import { Link } from "@tanstack/react-router";
import React from "react";
import {
    IoLibrary,
    IoLibraryOutline,
    IoSearch,
    IoSettings,
    IoSettingsOutline,
} from "react-icons/io5";
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
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    width: 200,
                    maxWidth: 200,
                    overflowX: "hidden",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    padding: "56px 12px",
                    overflowY: "scroll",
                    "-webkit-overflow-scrolling": "touch",
                    overscrollBehavior: "contain",
                    zIndex: 5,
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
            </nav>
            <div css={{ width: "200px", height: "100vh" }}></div>
        </>
    );
}

function SearchBar() {
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
                css={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.08)",
                    borderRadius: 6,
                    outline: "none",
                    border: "2px solid transparent",
                    fontSize: 13,
                    padding: "3px 8px",
                    paddingLeft: 24,
                    "&::placeholder": {
                        color: Colors.Light.slate10,
                    },
                    "&:focus": {
                        borderColor: Colors.Light.violet11,
                    },
                }}
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
                    borderRadius: 6,
                    fontSize: 14,
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
