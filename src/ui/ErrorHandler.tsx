import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

function fallbackRender({ error, resetErrorBoundary }: FallbackProps) {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.

    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre style={{ color: "red" }}>{error.message}</pre>
            {error instanceof Error && <pre>{error.stack}</pre>}
            <button
                onClick={() => {
                    resetErrorBoundary();
                }}
            >
                Reset
            </button>
        </div>
    );
}
export function ErrorHandler(props: { children: React.ReactNode }) {
    return (
        <ErrorBoundary
            fallbackRender={fallbackRender}
            onReset={(details) => {
                // Reset the state of your app so the error doesn't happen again
            }}
        >
            {props.children}
        </ErrorBoundary>
    );
}
