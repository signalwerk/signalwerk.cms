import fs from "fs-extra";
import path from "path";
import { extractFrontmatter } from "../../../signalwerk.md/src/processor.js";

/**
 * Converts a markdown file to the JSON page structure
 * @param {string} filePath - Path to the markdown file
 * @returns {Object} - JSON page structure
 */
export async function markdownToJson(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  const filename = path.basename(filePath, ".md");
  
  // Extract frontmatter and body
  const { attributes: frontmatter, body } = extractFrontmatter(content);
  
  // Get file stats for default date
  const stats = await fs.stat(filePath);
  const defaultDate = stats.mtime.getTime().toString();
  
  // Extract title from filename (convert hyphens to spaces and capitalize)
  const defaultTitle = filename
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  // Generate path from filename
  const defaultPath = `/${filename}/`;
  
  return {
    type: "page",
    attributes: {
      // Use frontmatter values with fallbacks
      draft: frontmatter.draft ?? false,
      lang: frontmatter.lang ?? "en",
      path: frontmatter.path ?? defaultPath,
      date: frontmatter.date ?? defaultDate,
      title: frontmatter.title ?? defaultTitle,
      class: frontmatter.class ?? undefined,
      main: [
        {
          type: "markdown",
          attributes: {
            content: body.trim()
          }
        }
      ]
    }
  };
}
