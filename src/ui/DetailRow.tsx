import styled from "@emotion/styled";
import React, { useId } from "react";
import { Colors } from "./Colors";
import { Placeholder } from "./SkeletonContext";
import { Separator } from "./Separator";

interface IContainerProps {
    children: React.ReactNode;
    className?: string;
}

function ContainerImpl(props: IContainerProps) {
    return (
        <div className={props.className}>
            <Separator.Horizontal />
            <div
                css={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                }}
            >
                {React.Children.map(props.children, (child, i) => {
                    const isLast =
                        i === React.Children.count(props.children) - 1;
                    return (
                        <>
                            <div
                                css={{
                                    flex: 1,
                                }}
                            >
                                {child}
                            </div>
                            {!isLast && <Separator.Vertical height={40} />}
                        </>
                    );
                })}
            </div>
            <Separator.Horizontal />
        </div>
    );
}

interface IItemProps {
    label: React.ReactNode;
    value: number;
}

function ItemImpl(props: IItemProps) {
    const id = `detailItem` + useId();

    const valueFormatter = new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
    });

    return (
        <div
            css={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <span
                id={id}
                css={{
                    fontSize: 20,
                    fontFamily: "var(--font-family-serif)",
                    fontWeight: "bold",
                    lineHeight: 1,
                }}
            >
                <Placeholder>{valueFormatter.format(props.value)}</Placeholder>
            </span>
            <label
                css={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: Colors.Light.slate10,
                }}
                htmlFor={id}
            >
                {props.label}
            </label>
        </div>
    );
}

export const DetailRow = {
    Container: ContainerImpl,
    Item: ItemImpl,
};
