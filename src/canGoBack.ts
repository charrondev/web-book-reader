import { useState } from "react";
import { historyCounter } from "./History";

export function canGoBack() {
    const [canGoBack, setCanGoBack] = useState(historyCounter > 0);
}
