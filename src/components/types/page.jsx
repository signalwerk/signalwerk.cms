import React from "react";
import { Helmet } from "react-helmet";

export function page(node, { typeProcessor }) {
  if (!node) return null;

  const lang = node.attributes?.lang || "en";
  const head = node.attributes?.head;

  return (
    <>
      <Helmet htmlAttributes={{ lang }}>
        {head?.stylesheets?.map((stylesheet) => (
          <link href={stylesheet.path} rel="stylesheet" />
        ))}
        {head?.js?.map((js) => (
          <script src={js.path} />
        ))}
        <title>{node.attributes?.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charset="utf-8" />
      </Helmet>
      <div className={`node-page ${node.class || ""}`}>
        <>{node.children && typeProcessor(node.children)}</>
      </div>
    </>
  );
}
