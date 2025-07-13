import { typeProcessor } from "../index.jsx";

export function box(node, configuration) {
  // Construct the className string
  const baseClass = "nodebox";
  const nodeClass = node.class ? ` ${node.class}` : "";
  const presetClass = ` nodebox--${node.preset || "default"}`;

  // Combine all class names
  const className = baseClass + nodeClass + presetClass;

  return (
    <>
      <div className={className}>
        <>{node.children && typeProcessor(node.children, configuration)}</>
      </div>
    </>
  );
}
