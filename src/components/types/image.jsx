import React from "react";
import { markdown } from "./markdown.jsx";

export function image(node) {
  if (!(node && node?.attributes)) return null;

  const { configuration, hash, filename, caption, alt } = node.attributes;

  const config = [];
  if (configuration) {
    config.push(configuration);
  }

  config.push("resize@width:1500;");

  const path = [
    "./assets/media",
    hash,
    config.join(""),
    `${filename}.jpg`,
  ].join("/");

  return (
    <div className={`node-image ${node.class || ""}`}>
      <img src={path} alt={alt || caption || "picture"} />
      {caption && (
        <div className="node-image__caption">
          {markdown({ attributes: { content: caption } })}
        </div>
      )}
    </div>
  );
}

export default {
  type: "image",
  render: image,
};
