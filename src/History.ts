/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import { useState } from "react";

let historyCounter = 0;

export function applyHistoryKludge() {
    const pushState = history.pushState;
    window.history.pushState = function () {
        historyCounter++;
        pushState.apply(history, arguments as any);
        window.dispatchEvent(new Event("x-history-push"));
    };

    const replaceState = history.replaceState;
    window.history.replaceState = function () {
        replaceState.apply(history, arguments as any);
        window.dispatchEvent(new Event("x-history-replace"));
    };

    const goBack = history.back;
    history.back = function () {
        historyCounter--;
        goBack.apply(history, arguments as any);
        window.dispatchEvent(new Event("x-history-pop"));
    };
}

export function useCanGoBack() {
    const [canGoBack, setCanGoBack] = useState(historyCounter > 0);
    useOnHistoryEvent("pop", () => setCanGoBack(historyCounter > 0));
    useOnHistoryEvent("push", () => setCanGoBack(historyCounter > 0));
    return canGoBack;
}

export function useOnHistoryEvent(
    event: "push" | "replace" | "pop",
    callback: () => void,
) {
    window.addEventListener(`x-history-${event}`, callback);
    return () => window.removeEventListener(`x-history-${event}`, callback);
}
