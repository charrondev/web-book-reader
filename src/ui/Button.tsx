/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2024 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

import styled from "@emotion/styled";
import { Colors } from "./Colors";

export const Button = styled.button(
    {
        fontSize: 13,
        textAlign: "center",
        padding: "3px 12px",
        minWidth: 124,
        borderRadius: 6,
        boxShadow:
            "0px 0.5px 2.5px 0px rgba(0, 0, 0, 0.30), 0px 0px 0px 0.5px rgba(0, 0, 0, 0.05)",
        "&:active": {
            filter: "brightness(0.95)",
        },
    },
    (props: { primary?: boolean }) => {
        const { primary } = props;
        return {
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            justifyContent: "center",
            backgroundColor: primary ? Colors.Light.violet11 : "#fff",
            color: primary ? "#fff" : Colors.Light.slate12,
            border: "none",
        };
    },
);
