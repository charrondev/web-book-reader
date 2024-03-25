import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import "./Global.css";
import "./storage/Database.types";
// Import the generated route tree
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { attachConsole } from "@tauri-apps/plugin-log";
import { routeTree } from "./routeTree.gen";
import { DatabaseClient, DatabaseContext } from "./storage/DatabaseClient";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { SearchContextProvider } from "./search/Search.Context";
import { applyHistoryKludge } from "./History";

applyHistoryKludge();
attachConsole();

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchInterval: false,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        },
    },
});

const db = new DatabaseClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Theme
            accentColor={"violet"}
            grayColor="slate"
            radius="medium"
            scaling="90%"
        >
            <SearchContextProvider router={router}>
                <DatabaseContext.Provider value={db}>
                    <QueryClientProvider client={queryClient}>
                        <RouterProvider router={router} />
                    </QueryClientProvider>
                </DatabaseContext.Provider>
            </SearchContextProvider>
        </Theme>
    </React.StrictMode>,
);
