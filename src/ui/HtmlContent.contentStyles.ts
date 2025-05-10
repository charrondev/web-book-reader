/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license GPL-3.0-only
 */

import { css } from "@emotion/react";
import type { ReaderSettings } from "../reader/ReaderSettings.types";
import { Colors } from "./Colors";

export function contentStyles(readerSettings?: ReaderSettings) {
    return css([
        {
            wordBreak: "break-word",
        },
        readerSettings && {
            padding: 0,
            fontSize: readerSettings.fontSize,
            lineHeight: readerSettings.lineHeight,
            fontFamily: readerSettings.fontFamily,
            textAlign: readerSettings.isJustified ? "justify" : "start",
            hyphens: readerSettings.isJustified ? "auto" : "initial",
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
    ]);
}
