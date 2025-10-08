import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import { processPageFile, BuildError } from "./generateStaticHTML.js";

export async function processAllPages({ pattern, baseDir }) {
  const globPattern = `${baseDir}/${pattern}`;
  console.log(`🔍 [processAllPages] baseDir="${baseDir}", pattern="${pattern}"`);
  console.log(`🔍 [processAllPages] Searching for page files matching: ${globPattern}`);
  
  const pageFiles = await glob(globPattern, {
    ignore: ['**/node_modules/**']
  });
  
  console.log(`📄 Found ${pageFiles.length} page files to process`);
  if (pageFiles.length > 0) {
    console.log(`🔍 [processAllPages] Files found:`, pageFiles);
  }

  if (pageFiles.length === 0) {
    console.warn("⚠️  No page files found to process");
    return [];
  }

  const results = [];
  const errors = [];

  // Process individual pages and collect both results and errors
  for (const filePath of pageFiles) {
    try {
      const result = await processPageFile(filePath, { baseDir });
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
  // Note: CSS is now processed by Vite through the entry file import
  // No manual copying needed

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
