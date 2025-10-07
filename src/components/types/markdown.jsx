import React from "react";
import { renderNode } from "../../../packages/signalwerk.md/src/render.jsx";
import {
  mdToAstSync,
  mdToHtmlSync,
} from "../../../packages/signalwerk.md/src/index.js";

import {
  htmlProcessor,
  astProcessor,
} from "../../../packages/signalwerk.md/src/processor.js";

import { toHtml } from "hast-util-to-html";
const processor = astProcessor();

export function markdown(node) {
  if (!node) return null;

  // const { html } = mdToHtmlSync(node.attributes?.content);
  // const { ast } = mdToAstSync("## test");

  const mdast = processor.parse(node.attributes?.content); // Parse to MDAST
  const hast = processor.runSync(mdast); // Transform MDAST → HAST
  const html = toHtml(hast); // Transform HAST → HTML

  return (
    <div
      className="node-markdown"
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
}

export default {
  type: "markdown",
  render: markdown,
};
