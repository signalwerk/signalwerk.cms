import React from "react";
// import "./column.css";

export function gridItem(node, { typeProcessor }) {
  return (
    <>
      <div
        className={`node-grid-item ${node.attributes?.class || ""}`}
        style={{
          "--node-grid-item--column-span": node.attributes?.columnSpan || 6,
        }}
      >
        <>
          {node.attributes?.content && typeProcessor(node.attributes?.content)}
        </>
      </div>
    </>
  );
}

export default {
  type: "grid-item",
  render: gridItem,
};
