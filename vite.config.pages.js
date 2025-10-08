import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { processAllPages } from "./processAllPages.js"; // Import the function to process all pages

import {
  processPageFile,
  BuildError,
} from "./src/processor/generateStaticHTML.js";

import config from "./cms.config.jsx";

const BASE_DIR = config.content.base || "pages";
const PATTERN = config.content.pattern || "**/*.json";
const PAGE_FILES_PATTERN = `${BASE_DIR}/${PATTERN}`;



export default defineConfig({
  plugins: [react(), pagesOnlyPlugin()],
  publicDir: "public", // Copy public folder during build
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      // Use a minimal entry point that imports CSS
      input: "pages-only-entry.js",
      output: {
        // Only output CSS, skip JS bundle
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "assets/styles.css";
          }
          return assetInfo.name || "assets/[name].[ext]";
        },
        entryFileNames: () => {
          // We don't want the JS bundle, but Vite requires this
          return "empty.js";
        },
      },
      //   external: (id) => {
      //     // Don't mark the entry file or CSS as external
      //     return (
      //       id !== "pages-only-entry.js" &&
      //       !id.endsWith(".css") &&
      //       !id.startsWith("/") &&
      //       !id.startsWith("./")
      //     );
      //   },
    },
  },
});
