/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { Colors } from "./Colors";

type IProps = {
    title: string;
};

export function TitleBar(props: IProps) {
    const { scrollY } = useScroll({
        container: {
            current: document.getElementById("root"),
        },
    });

    const [isScrolledAway, setIsScrolledAway] = useState(false);

    useEffect(() => {
        scrollY.on("change", (val) => {
            console.log(val);
            setIsScrolledAway(val > 20);
        });
    });

    const navVariants = {
        active: {
            background: "rgba(240, 240, 240, 0.8)",
            borderColor: Colors.Light.slate6,
            opacity: 1,
        },
        inactive: {
            background: "rgba(255, 255, 255, 1)",
            borderColor: "rgba(255, 255, 255, 0)",
            opacity: 0,
        },
    };

    const navTitleVariants = {
        visible: { opacity: 1 },
        hidden: { opacity: 0 },
    };

    return (
        <header data-tauri-drag-region>
            <motion.nav
                data-tauri-drag-region
                variants={navVariants}
                animate={isScrolledAway ? "active" : "inactive"}
                css={{
                    opacity: 0,
                    height: 50,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    backdropFilter: "blur(20px) saturate(180%)",
                    borderBottom: `1px solid ${Colors.Light.slate3}`,
                }}
            >
                <motion.h1
                    data-tauri-drag-region
                    variants={navTitleVariants}
                    animate={isScrolledAway ? "visible" : "hidden"}
                    css={{
                        fontSize: 14,
                    }}
                >
                    {props.title}
                </motion.h1>
            </motion.nav>
            <div data-tauri-drag-region css={{ height: 50 }}></div>
            <h1
                data-tauri-drag-region
                css={{ padding: "0 16px", fontWeight: 900, fontSize: 28 }}
            >
                {props.title}
            </h1>
        </header>
    );
}
