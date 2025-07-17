import React from "react";

export function box(node, { typeProcessor }) {
  return (
    <div className={`node-box ${node.attributes?.class || ""}`}>
      {node.attributes?.title && (
        <div className="node-box__header">
          <div className="node-box__title">
            <>{node.attributes.title}</>
          </div>
        </div>
      )}
      {node.attributes?.content?.length && (
        <div className="node-box__content">
          {node.attributes.content.map((contentNode, index) => (
            <div
              key={index}
              className={`node-box__item node-box__item--${contentNode.type}`}
            >
              {typeProcessor(contentNode)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default {
  type: "box",
  render: box,
};
