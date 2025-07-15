import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { typeProcessor } from "./components/index.jsx";
import "./styles.css";

import { registerComponents } from "./components/index.jsx";

import config from "../cms.config.jsx";

registerComponents(config);

function App() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In dev mode, load data based on URL
    const loadPageData = async () => {
      try {
        const path = window.location.pathname;

        if (path) {
          const response = await fetch(`/api/${path}.json`);
          if (response.ok) {
            const data = await response.json();
            setPageData(data.data);
          } else {
            throw new Error(`Page "${path}" not found: ${response.status}`);
          }
        } else {
          throw new Error("Invalid URL format");
        }
      } catch (err) {
        console.error("Error loading page data:", err);
        setError(err.message);
        // Fallback to error page
        setPageData({
          type: "page",
          title: "Page Not Found",
          children: [
            {
              type: "markdown",
              content: `## Page Not Found\n\nCould not load page data. Error: ${err.message}\n\n[← Back to Overview](/)`,
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading...</h2>
        <p>Loading page content...</p>
      </div>
    );
  }

  try {
    return typeProcessor(pageData);
  } catch (renderError) {
    console.error("Error processing page data:", renderError);
    return (
      <div style={{ color: "red" }}>
        <h1>Error Processing Page</h1>
        <p>{renderError.message}</p>
        <details>
          <summary>Page Data</summary>
          <pre>{JSON.stringify(pageData, null, 2)}</pre>
        </details>
      </div>
    );
  }
}

// Only render if we're in the browser
if (typeof window !== "undefined") {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
}
