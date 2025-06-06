import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.ts", // main entry point for all web components
            formats: ["es"],
        },
        outDir: "../../wwwroot/App_Plugins/ExternalLoginProviders", // all compiled files will be placed here
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/], // ignore the Umbraco Backoffice package in the build
        },
    },
    base: "/App_Plugins/ExternalLoginProviders/", // the base path of the app in the browser (used for assets)
});