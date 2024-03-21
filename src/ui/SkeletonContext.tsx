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

export function Placeholder(props: {
    children: React.ReactNode;
    skeleton?: React.ReactNode;
}) {
    const { isLoading } = useContext(SkeletonContext);

    if (isLoading && props.skeleton) {
        return <>{props.skeleton}</>;
    } else if (isLoading) {
        return (
            <div
                css={{
                    backgroundColor: Colors.Light.slate4,
                    marginTop: 0,
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    transformOrigin: "0 55%",
                    transform: "scale(1, 0.5)",
                    borderRadius: 4,
                    "&:empty:before": {
                        content: `"\\00a0"`,
                    },
                    height: "1.2em",
                    color: "transparent",
                    animation: `${pulseKeyframe} 1.5s ease-in-out 0.5s infinite alternate`,
                }}
            >
                {props.children}
            </div>
        );
    } else {
        return <>{props.children}</>;
    }
}
