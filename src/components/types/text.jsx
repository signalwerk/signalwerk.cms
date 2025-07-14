import React from "react";

export function text(node) {
  if (!node) return null;
  if (!node.content) return null;

  return <div className={`node-text ${node.class || ""}`}>{node.content}</div>;
}

text.type = "text";