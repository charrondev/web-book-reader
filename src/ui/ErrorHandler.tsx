import styled from "@emotion/styled";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { format as formatSql } from "sql-formatter";
import { DbError } from "../Errors";
import { ContentContainer } from "./ContentContainer";
import { TitleBar } from "./TitleBar";

const CodeBlock = styled(SyntaxHighlighter)({
    fontFamily: "var(--font-family-mono)",
    marginBlock: 12,
    borderRadius: 4,
    padding: "8px 12px !important",
});

export function ErrorView(props: { error: any }) {
    const { error } = props;
    const title = error instanceof Error ? error.message : "An error occurred";
    return (
        <div role="alert">
            <TitleBar title={title} />
            <ContentContainer>
                {error instanceof DbError && <p>{error.description}</p>}
                {error instanceof DbError && (
                    <CodeBlock style={atomOneDark}>
                        {formatSql(error.query, {})}
                    </CodeBlock>
                )}
                {error instanceof DbError && (
                    <CodeBlock style={atomOneDark}>
                        {JSON.stringify(error.params)}
                    </CodeBlock>
                )}
                {error instanceof Error && error.stack && (
                    <CodeBlock style={atomOneDark}>{error.stack}</CodeBlock>
                )}
            </ContentContainer>
        </div>
    );
}

export function ErrorHandler(props: { children: React.ReactNode }) {
    return (
        <ErrorBoundary
            onError={(error, info) => {
                console.error("React on error", error, info);
            }}
            fallbackRender={ErrorView}
            onReset={(details) => {
                // Reset the state of your app so the error doesn't happen again
            }}
        >
            {props.children}
        </ErrorBoundary>
    );
}
