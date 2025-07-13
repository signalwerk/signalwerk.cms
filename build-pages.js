import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Helmet } from 'react-helmet';

// Import components - tsx will handle JSX transpilation
const { typeProcessor } = await import('./src/components/index.jsx');

async function generateHTML(pageData) {
  // Create the app structure - pass the page data directly to typeProcessor
  // as it expects a page object, not a root with children
  const processedData = {
    type: 'page',
    ...pageData
  };

  const configuration = {
    config: {
      env: 'production'
    },
    settings: {
      page: {
        html: {
          lang: 'en'
        },
        head: {
          stylesheets: [
            { path: '/style.css' }
          ],
          js: []
        }
      }
    }
  };

  try {
    // Render the React component to string
    const appHtml = renderToString(typeProcessor(processedData, configuration));
    
    // Get helmet data for head tags
    const helmet = Helmet.renderStatic();
    
    const title = pageData.title || 'Untitled Page';
    
    return `<!DOCTYPE html>
<html ${helmet.htmlAttributes.toString()}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    <link rel="stylesheet" href="/style.css">
    <style>
        /* Inline critical CSS */
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
        .node-page { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .node-text { margin-bottom: 1.5rem; }
        .node-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .node-grid-column { grid-column: span var(--node-grid-column--count, 12); }
        .nodebox { margin-bottom: 2rem; padding: 1.5rem; border-radius: 8px; }
        .nodebox--expample { background-color: #fff3cd; border: 1px solid #ffeaa7; border-left: 4px solid #fdcb6e; }
        .node-image img { max-width: 100%; height: auto; border-radius: 4px; }
    </style>
</head>
<body>
    <div id="root">${appHtml}</div>
    <script>
        // Add interactivity if needed
        console.log('Page loaded: ${title}');
    </script>
</body>
</html>`;
  } catch (error) {
    console.error('Error rendering page:', error);
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Error - ${pageData.title || 'Unknown Page'}</title>
    <style>body { font-family: sans-serif; padding: 2rem; color: #d32f2f; }</style>
</head>
<body>
    <h1>Error Processing Page</h1>
    <p>${error.message}</p>
    <pre>${JSON.stringify(pageData, null, 2)}</pre>
</body>
</html>`;
  }
}

export async function processPageFile(filePath) {
  try {
    const pageData = await fs.readJson(filePath);
    const filename = path.basename(filePath, '.json');
    const outputPath = path.join('dist', `${filename}.html`);
    
    // Ensure dist directory exists
    await fs.ensureDir('dist');
    
    // Generate HTML using server-side rendering
    const html = await generateHTML(pageData);
    await fs.writeFile(outputPath, html);
    
    console.log(`✅ Generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    throw error;
  }
}

export async function processAllPages() {
  try {
    const pageFiles = await glob('collections/pages/**/*.json');
    console.log(`📄 Found ${pageFiles.length} page files to process`);
    
    const results = [];
    for (const filePath of pageFiles) {
      const outputPath = await processPageFile(filePath);
      results.push(outputPath);
    }
    
    // Copy CSS file to dist
    await fs.copy('src/style.css', 'dist/style.css');
    console.log('✅ Copied CSS file to dist/');
    
    console.log('✅ All pages processed successfully');
    return results;
  } catch (error) {
    console.error('❌ Error processing pages:', error.message);
    throw error;
  }
}

// CLI support
if (process.argv[2] === 'build') {
  processAllPages().catch(console.error);
} 