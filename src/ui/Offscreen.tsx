import styled from "@emotion/styled";
import type React from "react";

const Styles: React.CSSProperties = {
    position: "absolute",
    top: -1,
    left: -1,
    height: 1,
    width: 1,
    visibility: "hidden",
    pointerEvents: "none",
    overflow: "hidden",
    zIndex: -1,
};

const OffScreenContainer = styled.div(Styles as any);

export const Offscreen = {
    Container: OffScreenContainer,
    Styles,
};
