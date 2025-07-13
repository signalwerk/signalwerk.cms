import { text } from "./text.jsx";

export function image(node, { alt } = {}) {
  if (!node) return null;
  if (!node.path) return null;
  return (
    <div className={`node-image ${node.class || ""}`}>
      <img src={node.path} alt={node.alt || node.caption || alt || "picture"} />
      {node.caption && <div className="node-image__caption">{text(node)}</div>}
    </div>
  );
}
