/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import { Link } from "@tanstack/react-router";
import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { Colors } from "./Colors";
import { ContentContainer } from "./ContentContainer";
import { useNavBarContext } from "./NavBar.Context";
import { Placeholder } from "./SkeletonContext";
import { useMediaQuery } from "@uidotdev/usehooks";

type IProps = {
    title: string;
    compact?: boolean;
    hideHeading?: boolean;
    back?: {
        label: string;
        url: string;
    };
};

export function TitleBar(props: IProps) {
    const { scrollY } = useScroll({
        container: {
            current: document.getElementById("root"),
        },
    });
    const isMobile = useMediaQuery("(max-width: 768px)");

    const navBarContext = useNavBarContext();

    const [isScrolledAway, setIsScrolledAway] = useState(false);

    useEffect(() => {
        scrollY.on("change", (val) => {
            setIsScrolledAway(val > 20);
        });
    });

    const navVariants = {
        active: {
            background: "rgba(240, 240, 240, 0.8)",
            borderColor: Colors.Light.slate6,
        },
        inactive: {
            background: "rgba(255, 255, 255, 1)",
            borderColor: "rgba(255, 255, 255, 0)",
        },
    };

    const navTitleVariants = {
        visible: { opacity: 1 },
        hidden: { opacity: 0 },
    };

    const navBarHeight = 50;

    return (
        <header data-tauri-drag-region>
            <motion.nav
                data-tauri-drag-region
                variants={navVariants}
                animate={isScrolledAway ? "active" : "inactive"}
                css={{
                    height: navBarHeight,

                    position: "fixed",
                    top: 0,
                    right: 0,
                    zIndex: 100,
                    background: "rgba(255, 255, 255, 1)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    borderBottom: `1px solid ${Colors.Light.slate3}`,
                    left: navBarContext.leftInset,
                }}
            >
                <ContentContainer
                    data-tauri-drag-region
                    css={{
                        paddingLeft: isMobile ? "80px !important" : undefined,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: navBarHeight,
                    }}
                >
                    {props.back && (
                        <Link
                            to={props.back.url}
                            css={{
                                display: "flex",
                                alignItems: "center",
                                textDecoration: "none",
                                color: Colors.Light.violet11,
                                fontSize: 14,
                            }}
                        >
                            <IoChevronBack css={{ fontSize: 24 }} />{" "}
                            {props.back.label}
                        </Link>
                    )}
                    <span css={{ flex: 1 }}></span>
                    <motion.h1
                        data-tauri-drag-region
                        variants={navTitleVariants}
                        animate={
                            isScrolledAway || props.compact
                                ? "visible"
                                : "hidden"
                        }
                        css={{
                            fontSize: 14,
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            maxWidth: "calc(100% - 200px)",
                            width: "100%",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",

                            opacity: 0,
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        <Placeholder>{props.title}</Placeholder>
                    </motion.h1>
                </ContentContainer>
            </motion.nav>
            <div data-tauri-drag-region css={{ height: navBarHeight }}></div>
            <ContentContainer>
                <h1
                    css={{
                        fontWeight: 900,
                        fontSize: 28,
                        display:
                            props.compact || props.hideHeading
                                ? "none"
                                : "block",
                        paddingBottom: 16,
                        fontFamily: "var(--font-family-serif)",
                    }}
                >
                    <Placeholder>{props.title}</Placeholder>
                </h1>
            </ContentContainer>
        </header>
    );
}
