/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

import { Link } from "@tanstack/react-router";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Effect } from "@tauri-apps/api/window";
import { hashString } from "../utils";

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
        const windowLabel = label ?? hashString(url);

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
