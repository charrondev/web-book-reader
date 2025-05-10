/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import { Colors } from "../ui/Colors";
import { HtmlContent } from "../ui/HtmlContent";
import { READER_SETTINGS_DEFAULTS } from "./ReaderSettings.defaults";

export function ReaderPage(props: {
    className?: string;
    pageNumber: number;
    contents: HTMLElement;
    height: number;
    width: number;
    onClick?: () => void;
}) {
    const { pageNumber, contents, height, width } = props;
    return (
        <div
            id={`page-container-${pageNumber}`}
            onClick={props.onClick}
            className={props.className}
            css={{
                position: "relative",
            }}
        >
            <HtmlContent
                id={`page-${pageNumber}`}
                html={contents}
                css={{
                    height: height,
                    minHeight: height,
                    maxHeight: height,
                    overflow: "hidden",
                    width: width,
                }}
                readerSettings={READER_SETTINGS_DEFAULTS}
            />
            <div
                css={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: Colors.Light.slate9,
                    fontWeight: "bold",
                    fontSize: 12,
                }}
            >
                Page {pageNumber}
            </div>
        </div>
    );
}
