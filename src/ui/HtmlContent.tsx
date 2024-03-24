import DOMPurify from "dompurify";
import React, { useMemo } from "react";
import { Placeholder } from "./SkeletonContext";
import { HtmlContentLoader } from "./HtmlContent.Loader";
import type { ReaderSettings } from "./reader/ReaderSettings.types";
import { DEFAULT_READER_SETTINGS } from "../storage/ReaderSettings";
import { Colors } from "./Colors";

interface IProps {
    html: string | HTMLElement;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
    maxLines?: number;
    readerSettings?: ReaderSettings;
    id?: string;
}

export const HtmlContent = React.forwardRef(function HtmlContent(
    props: IProps,
    ref: React.ForwardedRef<HTMLDivElement | null>,
) {
    // useClampText()
    const Element = (props.as ?? "div") as "div";

    const purified = useMemo(() => {
        if (props.html instanceof HTMLElement) {
            return props.html.innerHTML;
        }
        const purified = DOMPurify.sanitize(props.html, {
            FORBID_TAGS: ["style"],
            RETURN_DOM: true,
            KEEP_CONTENT: true,
        });

        // Now lets remove some attributes we absolutely don't want.
        walkChildElements(purified, (element) => {
            element.removeAttribute("style");
        });

        return purified.innerHTML;
    }, [props.html]);

    const readerSettings = props.readerSettings ?? {
        ...DEFAULT_READER_SETTINGS,
        fontFamily: "inherit",
        fontSize: 14,
        isJustified: false,
    };

    return (
        <Placeholder
            skeleton={<HtmlContentLoader countWords={30} />}
            className={props.className}
        >
            <Element
                id={props.id}
                ref={ref}
                className={props.className}
                css={[
                    {
                        wordBreak: "break-word",
                    },
                    readerSettings && {
                        padding: 0,
                        fontSize: readerSettings.fontSize,
                        lineHeight: readerSettings.lineHeight,
                        fontFamily: readerSettings.fontFamily,
                        textAlign: readerSettings.isJustified
                            ? "justify"
                            : "start",
                        fontWeight: readerSettings.isBold ? "bold" : "normal",
                        "& h1, & h2, & h3, & h4, & h5, & h6": {
                            fontSize: readerSettings.headingFontSize,
                        },
                        "& > *": {
                            marginBottom: readerSettings.paragraphSpacing,
                            textIndent: readerSettings.isIndented ? "1em" : 0,

                            "&:last-child": {
                                marginBottom: 0,
                            },
                        },
                        "& a": {
                            color: Colors.Light.violet10,
                            textDecoration: "underline",
                            "&:active, &:hover": {
                                color: Colors.Light.violet10,
                            },
                        },
                        "& hr": {
                            outline: "none",
                            border: "none",
                            width: "100%",
                            // maxWidth: "600px",
                            marginRight: "auto",
                            backgroundColor: Colors.Light.slate5,
                            height: 1,
                            display: "block",
                        },
                    },
                ]}
                dangerouslySetInnerHTML={{
                    __html: purified,
                }}
            />
        </Placeholder>
    );
});

function walkChildElements(node: Element, handler: (element: Element) => void) {
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child instanceof Element) {
            handler(child);
            if (child.childElementCount > 0) {
                walkChildElements(child, handler);
            }
        }
    }
}
