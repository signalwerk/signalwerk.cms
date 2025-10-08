import React from "react";

/**
 * Type processor that renders components based on data type
 * @param {Object|Array} data - The data to process
 * @param {Object} options - Options object
 * @param {Map} options.components - Component registry Map
 * @returns {React.Element|Array} Rendered component(s)
 */
export function typeProcessor(data, { components }) {
  if (!data) return null;

  // if data is an array, process each item
  if (Array.isArray(data)) {
    return data.map((item) => typeProcessor(item, { components }));
  }

  if (!data.type) {
    console.warn("typeProcessor: Data is missing a type property:", data);
    return (
      <div>
        <p>!!! ERROR Data is missing a type property.</p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  if (components.has(data.type)) {
    const component = components.get(data.type);
    if (typeof component.render === "function") {
      console.log("now rendering component:", data.type);
      // Create a bound typeProcessor that already has components
      const boundTypeProcessor = (childData) =>
        typeProcessor(childData, { components });
      return component.render(data, {
        typeProcessor: boundTypeProcessor,
        components,
      });
    } else {
      console.warn(
        `Component for type '${data.type}' does not have a render function:`,
        component.render,
      );
      return (
        <div>
          <p>!!! ERROR Component for type '{data.type}' is not a function.</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
    }
  }

  const availableTypes = Array.from(components.keys()).join(", ");
  return (
    <div>
      <p>!!! ERROR Component for type '{data.type}' is not registered.</p>
      <p>Available types: {availableTypes || "none"}</p>
      <p>Data:</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
