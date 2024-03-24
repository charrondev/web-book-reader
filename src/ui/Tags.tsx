import styled from "@emotion/styled";
import { Colors } from "./Colors";

const TagCloud = styled.div({
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
});

const TagItem = styled.span(
    {
        padding: "2px 8px",
        borderRadius: 9,
        fontSize: 12,
    },
    (props: { color: "ruby" | "violet" }) => {
        return {
            background: Colors.Light[`${props.color}3`],
            color: Colors.Light[`${props.color}11`],
            border: `1px solid ${Colors.Light[`${props.color}5`]}`,
        };
    },
);

export const Tags = {
    Cloud: TagCloud,
    Item: TagItem,
};
