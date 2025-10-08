import fs from "fs-extra";
import path from "path";
import React from "react";
import { renderToString } from "react-dom/server";
import { Helmet } from "react-helmet";
import { typeProcessor } from "../components/index.jsx";
import { markdownToJson } from "./markdownToJson.js";

// Enhanced error class for better error reporting
class BuildError extends Error {
  constructor(message, filePath, originalError = null, phase = null) {
    super(message);
    this.name = "BuildError";
    this.filePath = filePath;
    this.originalError = originalError;
    this.phase = phase;
    this.timestamp = new Date().toISOString();

    // Preserve original stack trace if available
    if (originalError && originalError.stack) {
      this.stack = `${this.stack}\n\nOriginal Error:\n${originalError.stack}`;
    }
  }

  toString() {
    const parts = [
      `🚨 BUILD ERROR in ${this.filePath || "unknown file"}`,
      `📍 Phase: ${this.phase || "unknown"}`,
      `⏰ Time: ${this.timestamp}`,
      `💥 Message: ${this.message}`,
    ];

    if (this.originalError) {
      parts.push(`🔍 Original Error: ${this.originalError.message}`);
      if (this.originalError.stack) {
        parts.push(`📚 Stack Trace:\n${this.originalError.stack}`);
      }
    }

    return parts.join("\n");
  }
}

// Server-side rendering function
export async function generateStaticHTML(processedData, { filePath = "unknown", components }) {
  if (!components) {
    throw new BuildError(
      `Components registry is required for rendering`,
      filePath,
      null,
      "Configuration",
    );
  }

  try {
    let appHtml;
    try {
      appHtml = renderToString(typeProcessor(processedData, { components }));
    } catch (renderError) {
      throw new BuildError(
        `Failed to render React component`,
        filePath,
        renderError,
        "SSR Rendering",
      );
    }

    let helmet;
    try {
      helmet = Helmet.renderStatic();
    } catch (helmetError) {
      throw new BuildError(
        `Failed to render Helmet meta tags`,
        filePath,
        helmetError,
        "Helmet Processing",
      );
    }

    return `<!DOCTYPE html>
<html ${helmet.htmlAttributes.toString()}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
    <div id="root">${appHtml}</div>
</body>
</html>`;
  } catch (error) {
    // If it's already a BuildError, re-throw it
    if (error instanceof BuildError) {
      throw error;
    }

    // Otherwise, wrap it in a BuildError
    throw new BuildError(
      `HTML generation failed`,
      filePath,
      error,
      "HTML Generation",
    );
  }
}

export async function processPageFile(filePath, { baseDir, components }) {
  console.log(`🔄 Processing: ${filePath}`);

  if (!components) {
    throw new BuildError(
      `Components registry is required for processing`,
      filePath,
      null,
      "Configuration",
    );
  }

  try {
    const fileExtension = path.extname(filePath);
    let pageData;

    // Handle different file types
    if (fileExtension === ".md") {
      // Convert markdown to JSON structure
      try {
        pageData = await markdownToJson(filePath);
      } catch (mdError) {
        throw new BuildError(
          `Failed to convert markdown file to JSON structure`,
          filePath,
          mdError,
          "Markdown Conversion",
        );
      }
    } else if (fileExtension === ".json") {
      // Read and validate JSON file
      try {
        pageData = await fs.readJson(filePath);
      } catch (jsonError) {
        throw new BuildError(
          `Failed to read or parse JSON file`,
          filePath,
          jsonError,
          "JSON Parsing",
        );
      }
    } else {
      throw new BuildError(
        `Unsupported file type: ${fileExtension}. Only .json and .md files are supported.`,
        filePath,
        null,
        "File Type Validation",
      );
    }

    // Validate required data structure
    if (!pageData || typeof pageData !== "object") {
      throw new BuildError(
        `Invalid page data structure - expected object, got ${typeof pageData}`,
        filePath,
        null,
        "Data Validation",
      );
    }

    const filename = path.basename(filePath, fileExtension);

    // Get the relative directory structure from the source file
    const relativePath = path.relative(baseDir, filePath);
    const relativeDir = path.dirname(relativePath);

    // Create output path preserving directory structure
    const outputDir = path.join("dist", relativeDir);
    const outputPath = path.join(outputDir, `${filename}.html`);

    // Ensure output directory exists (with full path structure)
    try {
      await fs.ensureDir(outputDir);
    } catch (dirError) {
      throw new BuildError(
        `Failed to create output directory: ${outputDir}`,
        filePath,
        dirError,
        "Directory Creation",
      );
    }

    // Generate HTML
    const html = await generateStaticHTML(pageData, { filePath, components });

    // Write output file
    try {
      await fs.writeFile(outputPath, html);
    } catch (writeError) {
      throw new BuildError(
        `Failed to write output file to ${outputPath}`,
        filePath,
        writeError,
        "File Writing",
      );
    }

    console.log(`✅ Generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    // If it's already a BuildError, just log and re-throw
    if (error instanceof BuildError) {
      console.error("\n" + error.toString() + "\n");
      throw error;
    }

    // Otherwise, wrap and throw
    const buildError = new BuildError(
      `Page processing failed`,
      filePath,
      error,
      "Page Processing",
    );
    console.error("\n" + buildError.toString() + "\n");
    throw buildError;
  }
}

// Export the BuildError class for use in other modules
export { BuildError };
