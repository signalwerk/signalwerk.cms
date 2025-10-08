import chokidar from "chokidar";
// import { glob } from "glob";
import { processAllPages } from "./processAllPages.js"; // Import the function to process all pages

import { processPageFile, BuildError } from "./generateStaticHTML.js";
import fs from "fs-extra";
import path from "path";

import { markdownToJson } from "./markdownToJson.js";

/**
 * Resolves API request URLs to actual filesystem paths (.json or .md files)
 *
 * Request variants (all resolve to same file):
 *   /api/pages/test-page                    → pages/test-page.{json,md}
 *   /api/pages/test-page.json               → pages/test-page.json
 *   /api/pages/test-page.md                 → pages/test-page.md
 *   /api/pages/test-page/                   → pages/test-page.{json,md}
 *   /api/pages/test-page/index.{html,json}  → pages/test-page.{json,md}
 *
 */
async function resolveApiPath({ requestUrl, baseDir }) {
  // Strip leading slash and decode URL
  let cleanPath = decodeURIComponent(
    requestUrl.startsWith("/") ? requestUrl.slice(1) : requestUrl,
  );

  // Normalize path: remove index.html and index.json patterns
  cleanPath = cleanPath
    .replace(/\/index\.(html|json)$/, "")
    .replace(/index\.(html|json)$/, "");

  // Remove trailing slash
  if (cleanPath.endsWith("/")) {
    cleanPath = cleanPath.slice(0, -1);
  }

  // Extract base path without extension
  let basePath = cleanPath;
  if (cleanPath.endsWith(".json") || cleanPath.endsWith(".md")) {
    basePath = cleanPath.slice(0, cleanPath.lastIndexOf("."));
  }

  // Try to find file in order of preference: .json first, then .md
  const extensions = [".json", ".md"];

  for (const ext of extensions) {
    const fullPath = path.join(baseDir, basePath + ext);
    try {
      if (await fs.pathExists(fullPath)) {
        return fullPath;
      }
    } catch (error) {
      // Continue to next extension
      continue;
    }
  }

  return null;
}

export function pagesPlugin({ baseDir = "pages", pattern = "**/*.json" }) {
  if (!baseDir) {
    throw new Error("pagesPlugin: 'baseDir' option is required");
  }
  if (!pattern) {
    throw new Error("pagesPlugin: 'pattern' option is required");
  }

  return {
    name: "pages-plugin",
    configureServer(server) {
      console.log(
        `🔍 [pagesPlugin] Configured with baseDir="${baseDir}", pattern="${pattern}"`,
      );

      // API middleware to serve JSON files
      server.middlewares.use("/api/", async (req, res, next) => {
        try {
          const resolvedPath = await resolveApiPath({
            requestUrl: req.url,
            baseDir,
          });

          if (resolvedPath) {
            let data;
            const fileExtension = path.extname(resolvedPath);

            if (fileExtension === ".md") {
              // Convert markdown to JSON structure
              data = await markdownToJson(resolvedPath);
            } else if (fileExtension === ".json") {
              // Read JSON directly
              data = await fs.readJson(resolvedPath);
            } else {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Unsupported file type" }));
              return;
            }

            const response = { data };
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(response));
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

      // Watch for changes - scope pattern to baseDir
      const watchPattern = `${baseDir}/${pattern}`;
      console.log(`🔍 [pagesPlugin] Watch pattern: "${watchPattern}"`);
      console.log(
        `🔍 [pagesPlugin] Ignored pattern: /(^|[\/\\])node_modules([\/\\]|$)/`,
      );

      const watcher = chokidar.watch(watchPattern, {
        ignored: /(^|[\/\\])node_modules([\/\\]|$)/,
        persistent: true,
      });

      watcher.on("ready", () => {
        console.log("🔍 [pagesPlugin] Watcher is ready. Watched files:");
        console.log(watcher.getWatched());
      });

      watcher.on("change", async (filePath) => {
        console.log(
          `\n📄 [watcher.change] Processing changed file: ${filePath}`,
        );
        try {
          await processPageFile(filePath, { baseDir });
          server.ws.send({ type: "full-reload" });
        } catch (error) {
          console.error(
            `\n🚨 Error processing ${filePath} during development:`,
          );
          if (error instanceof BuildError) {
            console.error(error.toString());
          } else {
            console.error(error);
          }
          // In dev mode, we don't want to crash the server, just show the error
        }
      });

      watcher.on("add", async (filePath) => {
        console.log(`\n📄 [watcher.add] Processing new file: ${filePath}`);
        try {
          await processPageFile(filePath, { baseDir });
          server.ws.send({ type: "full-reload" });
        } catch (error) {
          console.error(
            `\n🚨 Error processing new file ${filePath} during development:`,
          );
          if (error instanceof BuildError) {
            console.error(error.toString());
          } else {
            console.error(error);
          }
          // In dev mode, we don't want to crash the server, just show the error
        }
      });

      // Process all pages on startup
      console.log("🚀 Processing all pages on server start...");
      console.log(
        `🔍 [processAllPages] Called with pattern="${pattern}", baseDir="${baseDir}"`,
      );
      processAllPages({ pattern, baseDir }).catch((error) => {
        console.error("\n🚨 Failed to process pages on server startup:");
        if (error instanceof BuildError) {
          console.error(error.toString());
        } else {
          console.error(error);
        }
        // In dev mode, continue despite errors
      });
    },

    async buildStart() {
      console.log("🔨 Building all pages for production...");
      console.log(
        `🔍 [buildStart] Called with pattern="${pattern}", baseDir="${baseDir}"`,
      );

      try {
        await processAllPages({
          pattern,
          baseDir,
        });
        console.log("🎉 All pages built successfully for production!");
      } catch (error) {
        console.error("\n💀 PRODUCTION BUILD FAILED:");

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
