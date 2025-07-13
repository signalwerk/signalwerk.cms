import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { typeProcessor } from './components/index.jsx';
import './style.css';

function App() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to get page data from window first (for built pages)
    if (window.pageData) {
      setPageData(window.pageData);
      setLoading(false);
      return;
    }

    // In dev mode, load data based on URL
    const loadPageData = async () => {
      try {
        const path = window.location.pathname;
        
        // Handle different URL patterns
        if (path === '/' || path === '/index.html' || path === '/pages/' || path === '/pages') {
          // Load overview of pages collection
          const response = await fetch('/api/collections/pages');
          if (response.ok) {
            const data = await response.json();
            setPageData({
              type: 'overview',
              title: 'Pages',
              description: 'Welcome to the pages collection. Here you can find all available pages.',
              collection: data.collection,
              items: data.items
            });
          } else {
            throw new Error(`Failed to load collection overview: ${response.status}`);
          }
        } else {
          // Handle individual page requests
          let filename = '';
          
          if (path.startsWith('/pages/')) {
            // Format: /pages/filename or /pages/filename.html
            filename = path.replace(/^\/pages\//, '').replace(/\.html$/, '');
          } else {
            // Format: /filename or /filename.html (backwards compatibility)
            filename = path.replace(/^\//, '').replace(/\.html$/, '');
          }
          
          if (filename) {
            const jsonFile = `${filename}.json`;
            const response = await fetch(`/api/pages/${jsonFile}`);
            if (response.ok) {
              const data = await response.json();
              setPageData(data);
            } else {
              throw new Error(`Page "${filename}" not found: ${response.status}`);
            }
          } else {
            throw new Error('Invalid URL format');
          }
        }
      } catch (err) {
        console.error('Error loading page data:', err);
        setError(err.message);
        // Fallback to error page
        setPageData({
          type: 'page',
          title: 'Page Not Found',
          children: [
            {
              type: 'text',
              body: `## Page Not Found\n\nCould not load page data. Error: ${err.message}\n\n[← Back to Overview](/)`
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
        <p>Loading page content...</p>
      </div>
    );
  }

  // Process the page data
  const processedData = pageData.type === 'overview'
    ? { type: ':root', children: [pageData] }
    : pageData.title && pageData.children 
      ? { type: ':root', children: [pageData] }
      : { type: ':root', children: [{ type: 'page', ...pageData }] };

  const configuration = {
    config: {
      env: import.meta.env.MODE
    },
    settings: {
      page: {
        html: {
          lang: 'en'
        },
        head: {
          stylesheets: [],
          js: []
        }
      }
    }
  };

  try {
    return typeProcessor(processedData, configuration);
  } catch (renderError) {
    console.error('Error processing page data:', renderError);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
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
if (typeof window !== 'undefined') {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
} 