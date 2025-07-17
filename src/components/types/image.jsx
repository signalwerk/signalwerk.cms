import React from "react";
import { text } from "./text.jsx";

export function image(node, { alt } = {}) {
  if (!node) return null;

  // Handle missing path or filename
  let imageSrc = node.path;
  if (!imageSrc && node.filename) {
    // Construct path from filename if path is missing
    imageSrc = `/images/${node.filename}`;
  }
  if (!imageSrc) {
    // Fallback to placeholder
    imageSrc = `https://via.placeholder.com/400x300/cccccc/666666?text=${encodeURIComponent(
      node.caption || "Image",
    )}`;
  }

  return (
    <div className={`node-image ${node.class || ""}`}>
      <img src={imageSrc} alt={node.alt || node.caption || alt || "picture"} />
      {node.caption && (
        <div className="node-image__caption">
          {text({ body: node.caption })}
        </div>
      )}
    </div>
  );
}

export default {
  type: "image",
  render: image,
};
