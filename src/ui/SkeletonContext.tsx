/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import { keyframes } from "@emotion/react";
import React from "react";
import { useContext } from "react";
import { Colors } from "./Colors";

export const SkeletonContext = React.createContext({
    isLoading: false,
});

const pulseKeyframe = keyframes`
from {
    opacity: 0.7;
}
to {
    opacity: 1,
}
`;

export function CirclePlaceholder(props: { size: number }) {
    return (
        <div
            css={{
                backgroundColor: Colors.Light.slate4,
                animation: `${pulseKeyframe} 1.5s ease-in-out 0.5s infinite alternate`,
                height: props.size,
                width: props.size,
                borderRadius: props.size,
            }}
        ></div>
    );
}

export function Placeholder(props: {
    className?: string;
    children: React.ReactNode;
    skeleton?: React.ReactNode;
    as?: keyof JSX.IntrinsicAttributes;
}) {
    const { isLoading } = useContext(SkeletonContext);

    if (isLoading && props.skeleton) {
        return <>{props.skeleton}</>;
    } else if (isLoading) {
        const Element = (props.as ?? "div") as "div";
        return (
            <Element
                className={props.className}
                css={{
                    display: "inline-block",
                    backgroundColor: Colors.Light.slate4,
                    marginTop: 0,
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                    transformOrigin: "0 55%",
                    transform: "scale(1, 0.5)",
                    borderRadius: 4,
                    maxWidth: "100%",
                    "&:empty:before": {
                        content: `"\\00a0"`,
                    },
                    height: "1.2em",
                    color: "transparent !important",
                    "& *": {
                        color: "transparent !important",
                    },
                    animation: `${pulseKeyframe} 1.5s ease-in-out 0.5s infinite alternate`,
                }}
            >
                {props.children}
            </Element>
        );
    } else {
        return <>{props.children}</>;
    }
}
