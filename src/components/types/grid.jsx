import React from "react";

export function grid(data, { typeProcessor }) {
  return (
    <>
      <div className={`node-grid ${data.class || ""}`}>
        {data?.children?.map((item, index) => (
          <>{typeProcessor({ type: "grid-column", ...item })}</>
        ))}
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
