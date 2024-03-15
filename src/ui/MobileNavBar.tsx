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
};

function NavItem(props: ItemProps) {
    const { icon, iconActive, label, ...rest } = props;
    return (
        <Link
            onDragStart={(e) => {
                e.preventDefault();
            }}
            data-tauri-drag-region
            {...rest}
            activeProps={{ className: "active" }}
            css={{
                textDecoration: "none",
                color: Colors.Light.slate11,
                fontSize: "20px",
                flex: 1,
                "&.active": {
                    color: Colors.Light.violet12,
                },
            }}
        >
            <li
                data-tauri-drag-region
                css={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
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
                    css={{
                        color: "inherit",
                        fontSize: "10px",
                        fontWeight: 600,
                    }}
                >
                    {label}
                </span>
            </li>
        </Link>
    );
}
