import React from "react";
import { renderNode } from "../../../packages/signalwerk.md/src/render.jsx";
import { mdToAstSync } from "../../../packages/signalwerk.md/src/index.js";

export function markdown(node) {
  if (!node) return null;

  const { ast } = mdToAstSync(node.content);

  const content = renderNode(ast);

  return <div className={`node-markdown ${node.class || ""}`}>{content}</div>;
}

export default {
  type: "markdown",
  render: markdown,
};
