import chokidar from "chokidar";
// import { glob } from "glob";
import { processAllPages } from "./processAllPages.js"; // Import the function to process all pages

import { processPageFile, BuildError } from "./generateStaticHTML.js";

// import { markdownToJson } from "./packages/signalwerk.cms/src/processor/markdownToJson.js";

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
      // API middleware to serve JSON files
      server.middlewares.use("/api/", async (req, res, next) => {
        try {
          const resolvedPath = await resolveApiPath(req.url);

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
      const watcher = chokidar.watch(watchPattern, {
        ignored: /node_modules/,
        persistent: true,
      });

      watcher.on("change", async (filePath) => {
        console.log(`\n📄 Processing changed file: ${filePath}`);
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
        console.log(`\n📄 Processing new file: ${filePath}`);
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
