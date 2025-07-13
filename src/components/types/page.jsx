import React from "react";
import { Helmet } from "react-helmet";
import { typeProcessor } from "../index.jsx";

export function page(node, configuration) {
  if (!node) return null;
  
  // Ensure footnotes is an array
  const footnotes = node.footnotes || [];
  
  return (
    <>
      {/* <pre>{JSON.stringify(node, null, 2)}</pre> */}
      <Helmet>
        <title>{node.title}</title>
        <meta name="description" content={node.description} />
      </Helmet>
      <div className={`node-page ${node.class || ""}`}>
        <>{node.children && typeProcessor(node.children, configuration)}</>
        {footnotes.length > 0 && (
          <ol className="node-page__footnotes">
            {footnotes.map((footnote, index) => (
              <li key={index} id={`fn-def-${footnote.identifier || index}`}>
                <>{typeProcessor(footnote, configuration)}</>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
