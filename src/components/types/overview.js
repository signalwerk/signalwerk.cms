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
            type: data.type || "page",
          });
        } catch (fileError) {
          console.warn(
            `Warning: Could not read ${filePath}:`,
            fileError.message,
          );
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
    console.error(
      `❌ Error serving collection ${collectionName}:`,
      error.message,
    );
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Server error" }));
  }
});

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
          type: data.type || "page",
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
      items,
    };

    await fs.ensureDir("dist");
    const html = await generateStaticHTML(overviewData);

    // Generate both index.html and collection index
    await fs.writeFile(path.join("dist", "index.html"), html);
    await fs.writeFile(path.join("dist", `${collectionName}.html`), html);

    console.log(
      `✅ Generated overview: dist/index.html and dist/${collectionName}.html`,
    );
    return `dist/index.html`;
  } catch (error) {
    console.error(
      `❌ Error generating overview for ${collectionName}:`,
      error.message,
    );
    return null;
  }
}
