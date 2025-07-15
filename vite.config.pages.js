import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import {
  processPageFile,
  BuildError,
} from "./src/processor/generateStaticHTML.js";

import { registerComponents } from "./src/components/index.jsx";

import config from "./cms.config.jsx";

const BASE_DIR = config.content.base || "pages";
const PATTERN = config.content.pattern || "**/*.json";
const PAGE_FILES_PATTERN = `${BASE_DIR}/${PATTERN}`;

registerComponents(config);

async function processAllPages() {
  const pageFiles = await glob(PAGE_FILES_PATTERN);
  console.log(`📄 Found ${pageFiles.length} page files to process`);

  if (pageFiles.length === 0) {
    console.warn("⚠️  No page files found to process");
    return [];
  }

  const results = [];
  const errors = [];

  // Process individual pages and collect both results and errors
  for (const filePath of pageFiles) {
    try {
      const result = await processPageFile(filePath);
      if (result) results.push(result);
    } catch (error) {
      // Collect errors but continue processing other files to show all issues
      errors.push({
        filePath,
        error:
          error instanceof BuildError
            ? error
            : new BuildError(
                `Unexpected error during page processing`,
                filePath,
                error,
                "Page Processing",
              ),
      });
    }
  }

  // Copy CSS
  try {
    await fs.copy("src/style.css", "dist/style.css");
    console.log("✅ Copied CSS file to dist/");
  } catch (cssError) {
    const buildError = new BuildError(
      `Failed to copy CSS file`,
      "src/style.css",
      cssError,
      "Asset Copying",
    );
    errors.push({
      filePath: "src/style.css",
      error: buildError,
    });
  }

  // If there were any errors, report them all and throw
  if (errors.length > 0) {
    console.error(`\n💀 BUILD FAILED WITH ${errors.length} ERROR(S):\n`);

    errors.forEach((errorInfo, index) => {
      console.error(`\n--- ERROR ${index + 1}/${errors.length} ---`);
      console.error(errorInfo.error.toString());
    });

    console.error(
      `\n🚨 Build process stopped due to ${errors.length} error(s). Please fix the issues above and try again.\n`,
    );

    // Throw the first error to fail the build
    throw errors[0].error;
  }

  console.log(`✅ All ${pageFiles.length} pages processed successfully`);
  return results;
}

// Plugin that only processes pages without building the main app
function pagesOnlyPlugin() {
  return {
    name: "pages-only-plugin",
    async buildStart() {
      console.log("🔨 Building pages only...");

      try {
        await processAllPages();
        console.log("🎉 All pages built successfully!");
      } catch (error) {
        console.error("\n💀 PAGE BUILD FAILED:");

        if (error instanceof BuildError) {
          console.error(error.toString());
        } else {
          console.error("Unexpected build error:", error);
        }

        console.error("\n🛑 Build process terminated due to errors.\n");

        // This will cause the build to fail
        throw error;
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), pagesOnlyPlugin()],
  build: {
    // Don't actually build anything - we just want the plugins to run
    ssr: true,
    outDir: "dist",
    emptyOutDir: false,
    write: false, // Don't write any Vite build output
    rollupOptions: {
      // Use a minimal entry point
      input: "pages-only-entry.js",
      external: (id) => {
        // Don't mark the entry file as external, but mark everything else
        return (
          id !== "pages-only-entry.js" &&
          !id.startsWith("/") &&
          !id.startsWith("./")
        );
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
