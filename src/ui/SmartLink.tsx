/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import { Link } from "@tanstack/react-router";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Effect } from "@tauri-apps/api/window";

type Props = React.ComponentProps<typeof Link> & {
    newWindow?: boolean;
};

export function SmartLink(props: Props) {
    const { newWindow, ...rest } = props;
    return (
        <Link
            {...rest}
            onClick={(e) => {
                if (newWindow) {
                    e.preventDefault();
                    openUrlInWindow(props.to as string);
                }
            }}
        />
    );
}

export async function openUrlInWindow(
    url: string,
    label?: string,
): Promise<WebviewWindow> {
    return new Promise((resolve) => {
        const windowLabel = label ?? cyrb53(url).toString();

        // Currently there's a bug preventing window events.
        // https://github.com/tauri-apps/tauri/pull/9211
        const existingWindow = WebviewWindow.getByLabel(windowLabel);
        if (existingWindow) {
            existingWindow
                .show()
                .then(() => {
                    return existingWindow.setFocus();
                })
                .then(() => {
                    resolve(existingWindow);
                });
            return;
        }

        const newWindow = new WebviewWindow(windowLabel, {
            url,
            decorations: true,
            titleBarStyle: "overlay",
            acceptFirstMouse: true,
            hiddenTitle: true,
            transparent: false,
            theme: "light",
            height: 600,
            width: 900,
        });
        newWindow.once("tauri://created", () => {
            console.log("window created");
            newWindow.setEffects({ effects: [Effect.HudWindow] });
            resolve(newWindow);
        });
    });

    // newWindow.show();
}

function cyrb53(str: string, seed = 0) {
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
