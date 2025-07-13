import React from 'react';
import ReactDOM from 'react-dom/client';
import { typeProcessor } from './components/index.jsx';
import './style.css';

function App() {
  // Get page data from window (injected by the build process)
  const pageData = window.pageData || {
    type: 'page',
    title: 'No Page Data',
    children: [
      {
        type: 'text',
        body: 'No page data found. Please check your JSON file.'
      }
    ]
  };

  // If pageData has the page structure, render it directly
  // Otherwise wrap it in a page structure
  const processedData = pageData.title && pageData.children 
    ? { type: ':root', children: [pageData] }
    : { type: ':root', children: [{ type: 'page', ...pageData }] };

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
          stylesheets: [],
          js: []
        }
      }
    }
  };

  try {
    return typeProcessor(processedData, configuration);
  } catch (error) {
    console.error('Error processing page data:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error Processing Page</h1>
        <p>{error.message}</p>
        <pre>{JSON.stringify(pageData, null, 2)}</pre>
      </div>
    );
  }
}

// Only render if we're in the browser
if (typeof window !== 'undefined') {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
} 