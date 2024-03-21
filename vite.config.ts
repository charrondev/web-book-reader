import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { internalIpV4 } from "internal-ip";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const mobile = !!/android|ios/.exec(process.env.TAURI_ENV_PLATFORM);

// https://vitejs.dev/config/
export default defineConfig(async () => ({
    define: {
        requireFromFile: null,
        "process.platform": null,
        "process.version": null,
        "process.env.NODE_DEBUG": false,
    },
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
            plugins: [
                [
                    "@swc/plugin-emotion",
                    {
                        // default is true. It will be disabled when build type is production.
                        sourceMap: true,
                        // default is 'dev-only'.
                        autoLabel: "dev-only",
                    },
                ],
            ],
        }) as any,
        TanStackRouterVite({
            routesDirectory: "./src/routes",
        }),
        nodePolyfills(),
    ],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
        host: mobile ? "0.0.0.0" : false,
        hmr: mobile
            ? {
                  protocol: "ws",
                  host: await internalIpV4(),
                  port: 1421,
              }
            : undefined,
        watch: {
            // 3. tell vite to ignore watching `src-tauri`
            ignored: ["**/src-tauri/**"],
        },
    },
}));
