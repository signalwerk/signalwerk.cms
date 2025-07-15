import React from "react";

export function grid(node, { typeProcessor }) {
  return (
    <>
      <div
        className={`node-grid ${node.attributes?.class || ""}`}
        style={{ "--node-grid--columns": node.attributes?.columns || 12 }}
      >
        <>
          {node.attributes?.content && typeProcessor(node.attributes?.content)}
        </>
      </div>
    </>
  );
}

export default {
  type: "grid",
  render: grid,
  attributes: {
    class: {
      type: "string",
      default: "",
      label: "CSS Class",
      placeholder: "my-grid",
      required: false,
      validation: (input) => {
        const regex = /^[a-zA-Z0-9\-_]+$/;
        return regex.test(input);
      },
      validationError: "Invalid CSS class name",
      helpText: "Optional CSS class for the grid container",
    },
  },
};
