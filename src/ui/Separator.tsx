import styled from "@emotion/styled";
import { Colors } from "./Colors";

const SeparatorVertical = styled.hr(
    {
        display: "block",
        outline: "none",
        border: "none",
        background: Colors.Light.slate5,
    },
    (props: { height?: string | number }) => {
        return {
            height: props.height ?? "100%",
            width: 1,
            minWidth: 1,
        };
    },
);

const SeparatorHorizontal = styled.hr(
    {
        display: "block",
        outline: "none",
        border: "none",
        background: Colors.Light.slate5,
    },
    (props: { width?: string | number }) => {
        return {
            height: 1,
            minHeight: 1,
            width: props.width ?? "100%",
        };
    },
);

export const Separator = {
    Vertical: SeparatorVertical,
    Horizontal: SeparatorHorizontal,
};
