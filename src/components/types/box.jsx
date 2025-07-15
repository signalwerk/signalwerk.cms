import React from "react";

export function box(node, { typeProcessor }) {
  return (
    <div className={`node-box ${node.attributes?.class || ""}`}>
      <>{node.attributes?.content && typeProcessor(node.attributes?.content)}</>
    </div>
  );
}

export default {
  type: "box",
  render: box,
};
