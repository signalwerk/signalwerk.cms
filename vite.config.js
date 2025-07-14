import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs-extra";
import path from "path";
import chokidar from "chokidar";
import { glob } from "glob";
import {
  generateStaticHTML,
  processPageFile,
} from "./src/processor/generateStaticHTML.js";

async function processAllPages() {
  try {
    const pageFiles = await glob("collections/**/*.json");
    console.log(`📄 Found ${pageFiles.length} page files to process`);

    const results = [];

    // Process individual pages
    for (const filePath of pageFiles) {
      const result = await processPageFile(filePath);
      if (result) results.push(result);
    }

    // Copy CSS
    await fs.copy("src/style.css", "dist/style.css");
    console.log("✅ Copied CSS file to dist/");

    console.log("✅ All pages processed successfully");
    return results;
  } catch (error) {
    console.error("❌ Error processing pages:", error.message);
    return [];
  }
}

// Helper function to resolve API paths to actual JSON files
// the request to return /collections/pages/test-page.json
// can handle the following paths:
// /api/pages/test-page
// /api/pages/test-page.json
// /api/pages/test-page/
// /api/pages/test-page/index.html
// /api/pages/test-page/index.json
async function resolveApiPath(requestUrl) {
  // Clean up the URL - remove leading slash and decode
  const cleanUrl = decodeURIComponent(
    requestUrl.startsWith("/") ? requestUrl.slice(1) : requestUrl,
  );

  // Try different path variations
  const pathsToTry = [
    // Direct path as provided
    cleanUrl,
    // Add .json if not present
    cleanUrl.endsWith(".json") ? cleanUrl : `${cleanUrl}.json`,
    // Remove trailing slash and add .json
    cleanUrl.endsWith("/") ? `${cleanUrl.slice(0, -1)}.json` : null,
    // Handle index variations
    cleanUrl.endsWith("/index.html") ? `${cleanUrl.slice(0, -11)}.json` : null,
    cleanUrl.endsWith("/index.json") ? `${cleanUrl.slice(0, -11)}.json` : null,
    cleanUrl.endsWith("index.html") ? `${cleanUrl.slice(0, -10)}.json` : null,
    cleanUrl.endsWith("index.json") ? `${cleanUrl.slice(0, -10)}.json` : null,
  ].filter(Boolean); // Remove null values

  // Try each path variation
  for (const pathVariant of pathsToTry) {
    const fullPath = path.join("collections", pathVariant);
    try {
      if (await fs.pathExists(fullPath)) {
        return fullPath;
      }
    } catch (error) {
      // Continue to next path variant
      continue;
    }
  }

  return null;
}

// Custom plugin for page processing and API
function pagesPlugin() {
  return {
    name: "pages-plugin",
    configureServer(server) {
      // API middleware to serve JSON files
      server.middlewares.use("/api/", async (req, res, next) => {
        try {
          const resolvedPath = await resolveApiPath(req.url);

          if (resolvedPath) {
            const data = await fs.readJson(resolvedPath);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "Page not found" }));
          }
        } catch (error) {
          console.error(
            `❌ Error serving API request ${req.url}:`,
            error.message,
          );
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      // Watch for changes
      const watcher = chokidar.watch("collections/**/*.json", {
        ignored: /node_modules/,
        persistent: true,
      });

      watcher.on("change", async (filePath) => {
        console.log(`\n📄 Processing changed file: ${filePath}`);
        await processPageFile(filePath);
        server.ws.send({ type: "full-reload" });
      });

      watcher.on("add", async (filePath) => {
        console.log(`\n📄 Processing new file: ${filePath}`);
        await processPageFile(filePath);
        server.ws.send({ type: "full-reload" });
      });

      // Process all pages on startup
      console.log("🚀 Processing all pages on server start...");
      processAllPages().catch(console.error);
    },

    async buildStart() {
      console.log("🔨 Building all pages for production...");
      await processAllPages();
    },
  };
}

export default defineConfig({
  plugins: [react(), pagesPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: ["..", "dist", "collections"],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
