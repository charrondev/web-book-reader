import { BookCover } from "../Types";

interface IProps {
    cover: BookCover;
    className?: string;
    constrain?: "height" | "width";
}

export function BookCover(props: IProps) {
    const { cover, constrain = "width", className } = props;
    if (constrain === "width") {
        return (
            <div
                className={className}
                css={{
                    position: "relative",
                    borderRadius: 6,
                    boxShadow: "var(--shadow-elevation-low)",
                }}
            >
                <img
                    src={cover.url}
                    css={{
                        width: "100%",
                        borderRadius: 6,
                    }}
                />
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
    } else {
        return (
            <div
                className={className}
                css={{
                    width: "100%",
                    aspectRatio: "3 / 4",
                    position: "relative",
                }}
            >
                <img
                    src={cover.url}
                    css={{
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        objectFit: "contain",
                        objectPosition: "bottom",
                    }}
                />
            </div>
        );
    }
}
