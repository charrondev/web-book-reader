import type React from "react";
import { Placeholder } from "./SkeletonContext";

interface IProps {
    countWords: number;
    className?: string;
}

export function HtmlContentLoader(props: IProps) {
    const WORDS = ["asdf asdf asd", "asdfasd", "asdfasdfff", "asdfasdfasdf"];
    const contents: React.ReactNode[] = [];

    for (let i = 0; i < props.countWords; i++) {
        contents.push(
            <Placeholder key={i} css={{ marginRight: "0.4em" }}>
                {WORDS[Math.floor(Math.random() * WORDS.length)]}
            </Placeholder>,
        );
    }

    return <div className={props.className}>{contents}</div>;
}
