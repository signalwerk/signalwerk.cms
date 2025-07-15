import React from "react";

export function box(node, { typeProcessor }) {
  // Construct the className string
  const baseClass = "nodebox";
  const nodeClass = node.class ? ` ${node.class}` : "";
  const presetClass = ` nodebox--${node.preset || "default"}`;

  // Combine all class names
  const className = baseClass + nodeClass + presetClass;

  return (
    <>
      <div className={className}>
        <>{node.children && typeProcessor(node.children)}</>
      </div>
    </>
  );
}

box.type = "box";
