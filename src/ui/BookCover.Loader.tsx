import { BookCover } from "./BookCover";
import { Colors } from "./Colors";
import { keyframes } from "@emotion/react";

const backgroundShimmerAnimation = keyframes({
    "0%": { backgroundPosition: "-1000px 0" },
    "100%": { backgroundPosition: "1000px 0" },
});

export function BookCoverLoader(props: { height?: number }) {
    const colorStart = Colors.Light.slate3; // "rgba(0, 0, 0, 0.04)";
    const colorEnd = Colors.Light.slate4; // "rgba(0, 0, 0, 0.09)";

    return (
        <div
            css={{
                flexShrink: 0,
                position: "relative",
                boxShadow: "var(--shadow-elevation-low)",
                borderRadius: 6,
                ...(props.height
                    ? { height: props.height }
                    : {
                          width: "100%",
                      }),

                aspectRatio: "2 / 3",
                background: `linear-gradient(to right, ${colorStart} 6%, ${colorEnd} 25%, ${colorStart} 34%)`,
                backgroundSize: "1000px 100%",
                animationName: backgroundShimmerAnimation,
                animationDuration: "3s",
                animationIterationCount: "infinite",
            }}
        >
            <div
                css={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    borderRadius: 6,
                    border: "2px solid rgba(255, 255, 255, 0.25)",
                }}
            ></div>
        </div>
    );
}
