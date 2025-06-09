import { defineConfig } from "vite";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

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
    plugins: [
        {
            name: "copy-localization",
            writeBundle() {
                const outDir = "../../wwwroot/App_Plugins/ExternalLoginProviders";
                const localizationDir = join(outDir, "Localization");
                
                // Create Localization directory if it doesn't exist
                if (!existsSync(localizationDir)) {
                    mkdirSync(localizationDir, { recursive: true });
                }
                
                // Copy localization files
                copyFileSync("src/Localization/en.js", join(localizationDir, "en.js"));
                copyFileSync("src/Localization/da.js", join(localizationDir, "da.js"));
            }
        }
    ]
});