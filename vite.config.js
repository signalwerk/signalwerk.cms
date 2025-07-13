import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs-extra";
import path from "path";
import chokidar from "chokidar";
import { glob } from "glob";

// Import for SSR - will be loaded dynamically to avoid issues
async function getTypeProcessor() {
  try {
    const { typeProcessor } = await import("./src/components/index.jsx");
    return typeProcessor;
  } catch (error) {
    console.warn("Could not load typeProcessor for SSR:", error.message);
    return null;
  }
}

// Server-side rendering function
async function generateStaticHTML(processedData) {
  try {
    // Dynamic import to avoid issues during config loading
    const React = (await import("react")).default;
    const { renderToString } = await import("react-dom/server");
    const { Helmet } = (await import("react-helmet")).default;

    const typeProcessor = await getTypeProcessor();
    if (!typeProcessor) {
      throw new Error("TypeProcessor not available");
    }

    const configuration = {
      config: { env: "production" },
      settings: {
        page: {
          html: { lang: "en" },
          head: { stylesheets: [{ path: "/style.css" }], js: [] },
        },
      },
    };

    const appHtml = renderToString(typeProcessor(processedData, configuration));
    const helmet = Helmet.renderStatic();

    return `<!DOCTYPE html>
<html ${helmet.htmlAttributes.toString()}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div id="root">${appHtml}</div>
    <script>
        console.log('Static page loaded: ${processedData.title || "Untitled"}');
    </script>
</body>
</html>`;
  } catch (error) {
    console.error("SSR Error:", error);
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Error - ${processedData.title || "Unknown Page"}</title>
</head>
<body>
    <h1>Build Error</h1>
    <p>${error.message}</p>
</body>
</html>`;
  }
}

async function processPageFile(filePath) {
  try {
    const pageData = await fs.readJson(filePath);
    const filename = path.basename(filePath, ".json");
    const outputPath = path.join("dist", `${filename}.html`);

    await fs.ensureDir("dist");
    const html = await generateStaticHTML(pageData);
    await fs.writeFile(outputPath, html);

    console.log(`✅ Generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return null;
  }
}

async function generateOverviewPage(collectionName) {
  try {
    const collectionPath = path.join("collections", collectionName);
    if (!(await fs.pathExists(collectionPath))) {
      return null;
    }

    const files = await glob(`${collectionPath}/**/*.json`);
    const items = [];

    for (const filePath of files) {
      try {
        const data = await fs.readJson(filePath);
        const filename = path.basename(filePath, ".json");
        items.push({
          filename,
          title: data.title || filename,
          path: data.path || `/${filename}/`,
          date: data.date,
          draft: data.draft || false,
          type: data.type || "page"
        });
      } catch (fileError) {
        console.warn(`Warning: Could not read ${filePath}:`, fileError.message);
      }
    }

    // Sort by date (newest first) or title
    items.sort((a, b) => {
      if (a.date && b.date) {
        return parseInt(b.date) - parseInt(a.date);
      }
      return a.title.localeCompare(b.title);
    });

    const overviewData = {
      type: "overview",
      title: collectionName.charAt(0).toUpperCase() + collectionName.slice(1),
      description: `Welcome to the ${collectionName} collection. Here you can find all available ${collectionName}.`,
      collection: collectionName,
      items
    };

    await fs.ensureDir("dist");
    const html = await generateStaticHTML(overviewData);
    
    // Generate both index.html and collection index
    await fs.writeFile(path.join("dist", "index.html"), html);
    await fs.writeFile(path.join("dist", `${collectionName}.html`), html);
    
    console.log(`✅ Generated overview: dist/index.html and dist/${collectionName}.html`);
    return `dist/index.html`;
  } catch (error) {
    console.error(`❌ Error generating overview for ${collectionName}:`, error.message);
    return null;
  }
}

async function processAllPages() {
  try {
    const pageFiles = await glob("collections/pages/**/*.json");
    console.log(`📄 Found ${pageFiles.length} page files to process`);

    const results = [];
    
    // Process individual pages
    for (const filePath of pageFiles) {
      const result = await processPageFile(filePath);
      if (result) results.push(result);
    }

    // Generate overview page for pages collection
    const overviewResult = await generateOverviewPage("pages");
    if (overviewResult) results.push(overviewResult);

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

// Custom plugin for page processing and API
function pagesPlugin() {
  return {
    name: "pages-plugin",
    configureServer(server) {
      // API middleware for collection overviews
      server.middlewares.use("/api/collections", async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const collectionName = url.pathname.slice(1); // Remove leading /
        const collectionPath = path.join("collections", collectionName);

        try {
          if (await fs.pathExists(collectionPath)) {
            const files = await glob(`${collectionPath}/**/*.json`);
            const items = [];

            for (const filePath of files) {
              try {
                const data = await fs.readJson(filePath);
                const filename = path.basename(filePath, ".json");
                items.push({
                  filename,
                  title: data.title || filename,
                  path: data.path || `/${filename}/`,
                  date: data.date,
                  draft: data.draft || false,
                  type: data.type || "page"
                });
              } catch (fileError) {
                console.warn(`Warning: Could not read ${filePath}:`, fileError.message);
              }
            }

            // Sort by date (newest first) or title
            items.sort((a, b) => {
              if (a.date && b.date) {
                return parseInt(b.date) - parseInt(a.date);
              }
              return a.title.localeCompare(b.title);
            });

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ collection: collectionName, items }));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "Collection not found" }));
          }
        } catch (error) {
          console.error(`❌ Error serving collection ${collectionName}:`, error.message);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Server error" }));
        }
      });

      // API middleware to serve JSON files
      server.middlewares.use("/api/pages", async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filename = url.pathname.slice(1); // Remove leading /
        const filePath = path.join("collections/pages", filename);

        try {
          if (await fs.pathExists(filePath)) {
            const data = await fs.readJson(filePath);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "Page not found" }));
          }
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      // Watch for changes
      const watcher = chokidar.watch("collections/pages/**/*.json", {
        ignored: /node_modules/,
        persistent: true,
      });

      watcher.on("change", async (filePath) => {
        console.log(`\n📄 Processing changed file: ${filePath}`);
        await processPageFile(filePath);
        // Regenerate overview page when any page changes
        await generateOverviewPage("pages");
        server.ws.send({ type: "full-reload" });
      });

      watcher.on("add", async (filePath) => {
        console.log(`\n📄 Processing new file: ${filePath}`);
        await processPageFile(filePath);
        // Regenerate overview page when a new page is added
        await generateOverviewPage("pages");
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
