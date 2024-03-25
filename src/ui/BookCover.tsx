import { css } from "@emotion/react";
import type { Book, BookCover } from "../Types";
import SpineOverlay from "./coverLayers/book_cover_spine_linearburnblend.png";
import EdgesOverlay from "./coverLayers/book_cover_edges_overlay.png";
import SoftLightSpine from "./coverLayers/book_cover_overlay_softlightspine.png";
import NormalBlendSpine from "./coverLayers/book_cover_spine_normalblend.png";
import Shadow from "./coverLayers/book_cover_shadow.png";

import styled from "@emotion/styled";
import { Colors } from "./Colors";
interface IProps {
    book: Book;
    className?: string;
    height?: number;
}

const BgOverlay = styled.div(
    {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundSize: "100% 100%",
        borderRadius: 3,
    },
    (props: { bg?: string }) => ({
        backgroundImage: props.bg ? `url(${props.bg})` : undefined,
    }),
);

export function BookCover(props: IProps) {
    const { book, className } = props;
    const coverStyles = css({
        borderRadius: 3,
        position: "relative",
        ...(props.height
            ? { height: props.height, width: "auto" }
            : {
                  width: "100%",
                  height: "auto",
              }), // if height is passed, use it, otherwise use 100% (default behavior
    });
    return (
        <div
            className={className}
            css={{
                position: "relative",
                borderRadius: 2,
                display: "inline-block",
                flexShrink: 0,
            }}
        >
            <BgOverlay
                bg={Shadow}
                css={{
                    height: "116.6%",
                    width: "121.8%",
                    top: "-4.7%",
                    left: "-10.9%",
                    opacity: "0.6",
                }}
            />
            {book.coverUrl ? (
                <img src={book.coverUrl} css={coverStyles} />
            ) : (
                <div
                    css={[
                        coverStyles,
                        {
                            aspectRatio: "2 / 3",
                            background: Colors.Light.violet12,
                            padding: "3em 1em",
                            display: "flex",
                            justifyContent: "center",
                        },
                    ]}
                >
                    <h3
                        css={{
                            textAlign: "center",
                            textWrap: "balance",
                            color: "#fff",
                        }}
                    >
                        {book.title}
                    </h3>
                </div>
            )}

            <BgOverlay bg={NormalBlendSpine} />
            <BgOverlay
                bg={SoftLightSpine}
                css={{
                    backgroundColor: "transparent",
                    mixBlendMode: "soft-light",
                }}
            />
            <BgOverlay bg={SpineOverlay} css={{ mixBlendMode: "multiply" }} />
            <BgOverlay bg={EdgesOverlay} css={{ mixBlendMode: "multiply" }} />
        </div>
    );
}
