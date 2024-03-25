import React, { useEffect } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { TitleBar } from "./TitleBar";
import { ContentContainer } from "./ContentContainer";
import { DbError } from "../Errors";

export function ErrorView(props: { error: any }) {
    const { error } = props;
    const title = error instanceof Error ? error.message : "An error occurred";
    return (
        <div role="alert">
            <TitleBar title={title} />
            <ContentContainer>
                {error instanceof DbError && <p>{error.description}</p>}
                {error instanceof DbError && <pre>{error.query}</pre>}
                {error instanceof DbError && (
                    <pre>{JSON.stringify(error.params)}</pre>
                )}
                {error instanceof Error && <pre>{error.stack}</pre>}
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
