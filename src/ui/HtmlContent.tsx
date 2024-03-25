import DOMPurify from "dompurify";
import React, { useLayoutEffect, useMemo, useState } from "react";
import { Placeholder } from "./SkeletonContext";
import { HtmlContentLoader } from "./HtmlContent.Loader";
import type { ReaderSettings } from "../reader/ReaderSettings.types";
import { DEFAULT_READER_SETTINGS } from "../storage/ReaderSettings";
import { Colors } from "./Colors";
import { useMeasure } from "@uidotdev/usehooks";

interface IProps {
    html: string | HTMLElement;
    rawHtmlPrefix?: string;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
    maxLines?: number;
    readerSettings?: ReaderSettings;
    id?: string;
    collapse?: {
        countLines: number;
        maxHeight?: number;
    };
    trimEmpty?: boolean;
}

export const HtmlContent = React.forwardRef(function HtmlContent(
    props: IProps,
    ref?: React.ForwardedRef<HTMLDivElement | null>,
) {
    const Element = (props.as ?? "div") as "div";
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [measureRef, measure] = useMeasure();
    const [didCalcInitialState, setDidCalcInitialState] = useState(false);

    const purified: string = useMemo(() => {
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
            element.removeAttribute("class");
            element.removeAttribute("height");
            element.removeAttribute("width");
            if (
                props.trimEmpty &&
                element.textContent?.trim() === "" &&
                element.tagName !== "BR" &&
                element.tagName !== "hr" &&
                element.tagName !== "img"
            ) {
                element.remove();
            }

            // Wrap tables
            if (element instanceof HTMLTableElement) {
                const wrapper = document.createElement("div");
                wrapper.classList.add("table-wrap");
                element.replaceWith(wrapper);
                wrapper.appendChild(element);
            }
        });

        const result = purified.innerHTML;
        if (props.rawHtmlPrefix) {
            return props.rawHtmlPrefix! + result;
        } else {
            return result;
        }
    }, [props.html, props.rawHtmlPrefix, props.trimEmpty]);

    useLayoutEffect(() => {
        if (didCalcInitialState) {
            return;
        }
        if (!measure.height) {
            return;
        }
        if (!props.collapse?.maxHeight) {
            return;
        }

        const isCollapsed = measure.height > props.collapse.maxHeight;
        setIsCollapsed(isCollapsed);
        setDidCalcInitialState(true);
    });

    const readerSettings: ReaderSettings = props.readerSettings ?? {
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
                ref={(refValue) => {
                    measureRef(refValue);
                    if (typeof ref === "function") {
                        ref(refValue);
                    } else if (ref) {
                        ref.current = refValue;
                    }
                }}
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
                        hyphens: readerSettings.isJustified
                            ? "auto"
                            : "initial",
                        fontWeight: readerSettings.isBold ? "bold" : "normal",
                        "& h1, & h2, & h3, & h4, & h5, & h6": {
                            textAlign: "left",
                            fontSize: "1.1em",
                        },
                        "& .title": {
                            // This is a real title
                            fontSize: readerSettings.headingFontSize,
                            textAlign: "center",
                            "&:after": {
                                content: "''",
                                display: "block",
                                width: 60,
                                height: 2,
                                backgroundColor: Colors.Light.violet10,
                                margin: "auto",
                                marginTop: 20,
                                marginBottom: 20,
                                textWrap: "balance",
                            },
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
                            marginRight: "auto",
                            backgroundColor: Colors.Light.slate5,
                            height: 1,
                            display: "block",
                        },
                        ".table-wrap": {
                            overflowX: "auto",
                            width: "100%",
                        },
                        "& table": {
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "0.8em",
                        },
                        // Rest of the table styles
                        "& .table-wrap th": {
                            whiteSpace: "nowrap",
                            fontWeight: 600,
                        },
                        "& .table-wrap td, & .table-wrap th": {
                            overflowWrap: "break-word",
                            minWidth: 80,
                            padding: "4px 8px",
                            textAlign: "left",
                            border: `1px solid ${Colors.Light.slate5}`,
                            "& > *:not(ul):not(ol)": {
                                margin: 0,
                            },
                        },
                    },
                    props.collapse && {
                        textAlign: "initial",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                    },
                    props.collapse &&
                        isCollapsed && {
                            WebkitLineClamp: props.collapse.countLines,
                            overflow: "hidden",
                        },
                ]}
                dangerouslySetInnerHTML={{
                    __html: purified,
                }}
            />
            {isCollapsed && (
                <button
                    onClick={() => {
                        setIsCollapsed(false);
                    }}
                    type="button"
                    css={{
                        appearance: "none",
                        border: "none",
                        outline: "none",
                        padding: 0,
                        background: "none",
                        fontWeight: "bold",
                        fontSize: 14,
                        color: Colors.Light.violet11,
                    }}
                >
                    Expand
                </button>
            )}
        </Placeholder>
    );
});

function walkChildElements(node: Element, handler: (element: Element) => void) {
    const childNodes = Array.from(node.childNodes);
    for (const child of childNodes) {
        if (child instanceof Element) {
            handler(child);
            if (child.childElementCount > 0) {
                walkChildElements(child, handler);
            }
        }
    }
}
