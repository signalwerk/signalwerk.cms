import fs from "fs-extra";
import path from "path";
import { mdToAstSync } from "../../../signalwerk.md/src/index.js";

/**
 * Converts a markdown file to the JSON page structure
 * @param {string} filePath - Path to the markdown file
 * @returns {Object} - JSON page structure
 */
export async function markdownToJson(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  const filename = path.basename(filePath, ".md");
  
  // Extract frontmatter-like metadata if present
  // For now, we'll create a basic structure
  const stats = await fs.stat(filePath);
  const date = stats.mtime.getTime().toString();
  
  // Extract title from filename (convert hyphens to spaces and capitalize)
  const title = filename
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  // Generate path from filename
  const pagePath = `/${filename}/`;
  
  return {
    type: "page",
    attributes: {
      draft: false,
      lang: "en",
      path: pagePath,
      date: date,
      title: title,
      main: [
        {
          type: "markdown",
          attributes: {
            content: content.trim()
          }
        }
      ]
    }
  };
}
