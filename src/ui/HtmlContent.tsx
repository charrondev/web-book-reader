/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import React, { useLayoutEffect, useMemo, useState } from "react";
import { Placeholder } from "./SkeletonContext";
import { HtmlContentLoader } from "./HtmlContent.Loader";
import type { ReaderSettings } from "../reader/ReaderSettings.types";
import { DEFAULT_READER_SETTINGS } from "../storage/ReaderSettings";
import { Colors } from "./Colors";
import { useMeasure } from "@uidotdev/usehooks";
import { sanitizeHtml } from "./HtmlContent.sanitizeHtml";
import { contentStyles } from "./HtmlContent.contentStyles";

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
        const sanitized = sanitizeHtml(props.html, {
            trimEmpty: props.trimEmpty,
        });
        const result = sanitized.innerHTML;
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
                    contentStyles(readerSettings),
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
