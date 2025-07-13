import fs from "fs-extra";
import path from "path";
import React from "react";
import { renderToString } from "react-dom/server";
import { Helmet } from "react-helmet";
import { typeProcessor } from "../components/index.jsx";

// Server-side rendering function
export async function generateStaticHTML(processedData) {
  try {
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
export async function processPageFile(filePath) {
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
// Import for SSR - will be loaded dynamically to avoid issues

// async function getTypeProcessor() {
//   try {
//     const { typeProcessor } = await import("../components/index.jsx");
//     return typeProcessor;
//   } catch (error) {
//     console.warn("Could not load typeProcessor for SSR:", error.message);
//     return null;
//   }
// }
