# Signalwerk CMS

A React-based content management system that processes JSON page files into static HTML.

## Features

- 🔥 **Hot Reload**: Automatically rebuilds pages when JSON files change
- 📄 **Static Generation**: Generates static HTML files from JSON content
- 🎨 **Component System**: Extensible React component system for different content types
- 📱 **Responsive**: Mobile-friendly responsive design
- 🖼️ **Image Handling**: Automatic image placeholder generation for missing images

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   This will:
   - Process all JSON files in `collections/pages/`
   - Watch for file changes and auto-rebuild
   - Start a dev server at http://localhost:3000

3. **Build for production:**
   ```bash
   npm run build
   ```
   This generates static HTML files in the `dist/` folder.

## Project Structure

```
signalwerk.cms/
├── collections/pages/          # JSON page content files
│   └── *.json                 # Page definitions
├── src/
│   ├── components/            # React components
│   │   ├── types/            # Component types (text, image, grid, etc.)
│   │   └── index.jsx         # Main typeProcessor
│   ├── main.jsx              # React entry point
│   └── style.css             # Main stylesheet
├── build-pages.js            # Server-side rendering script
├── vite.config.js            # Vite configuration
└── dist/                     # Generated HTML files
```

## Content Types

The system supports these content types in JSON files:

### Page Structure
```json
{
  "draft": false,
  "title": "Page Title",
  "path": "/page-path/",
  "children": [
    // Content nodes...
  ]
}
```

### Text Content
```json
{
  "type": "text",
  "body": "## Heading\n\nParagraph with **bold** and *italic* text."
}
```

### Grid Layout
```json
{
  "type": "grid",
  "children": [
    {
      "cols": 6,
      "children": [
        { "type": "text", "body": "Left column" }
      ]
    },
    {
      "cols": 6,
      "children": [
        { "type": "text", "body": "Right column" }
      ]
    }
  ]
}
```

### Images
```json
{
  "type": "image",
  "filename": "image.jpg",
  "caption": "Image caption"
}
```

### Box Container
```json
{
  "type": "box",
  "preset": "example",
  "title": "Box Title",
  "children": [
    // Content...
  ]
}
```

## Available Scripts

- `npm run dev` - Start development server with file watching
- `npm run build` - Build all pages and assets for production
- `npm run build:pages` - Build only the HTML pages (no Vite build)
- `npm run preview` - Preview the production build
- `npm run clean` - Clean the dist directory

## Development Workflow

1. Add or edit JSON files in `collections/pages/`
2. The system automatically detects changes and rebuilds affected pages
3. View changes in your browser (auto-reloads)
4. Generated HTML files appear in `dist/`

## Extending the System

### Adding New Component Types

1. Create a new component in `src/components/types/`
2. Add the type to the switch statement in `src/components/index.jsx`
3. Add corresponding CSS styles in `src/style.css`

### Customizing Styles

Edit `src/style.css` to customize the appearance. The system uses a CSS Grid layout and CSS custom properties for theming.

## Deployment

The `dist/` folder contains static HTML files that can be deployed to any web server or CDN:

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## Troubleshooting

- **Images not loading**: Make sure image files are accessible or check the placeholder fallbacks
- **Build errors**: Check the console for detailed error messages
- **Missing content**: Verify JSON file structure matches the expected format 