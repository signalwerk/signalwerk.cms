import React from "react";

export function text(node) {
  if (!node) return null;
  if (!node.attributes?.content) return null;

  return (
    <div className={`node-text ${node.attributes?.class || ""}`}>
      {node.attributes?.content}
    </div>
  );
}

export default {
  type: "text",
  render: text,
};
