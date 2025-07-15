import React from "react";
import mediaItems from "./types/mediaItems.jsx";
import image from "./types/image.jsx";
import page from "./types/page.jsx";
import text from "./types/text.jsx";
import markdown from "./types/markdown.jsx";
import gridColumn from "./types/gridColumn.jsx";
import grid from "./types/grid.jsx";
import box from "./types/box.jsx";

// Registry to store components by their type
export const componentRegistry = new Map();

export function registerComponent(component) {
  if (!component || !component.type) {
    console.warn(
      "Attempted to register a component without a type:",
      component,
    );
    return;
  }

  if (componentRegistry.has(component.type)) {
    console.warn(
      `Component type '${component.type}' is already registered. Overriding.`,
    );
  }

  componentRegistry.set(component.type, component);
  console.log(`Registered component: ${component.type}`);
}

export function registerComponents(config) {
  for (const [name, component] of Object.entries(config.components)) {
    registerComponent(component);
  }
}

export function typeProcessor(data) {
  if (!data) return null;

  // if data is an array, process each item
  if (Array.isArray(data)) {
    return data.map((item) => typeProcessor(item));
  }

  if (componentRegistry.has(data.type)) {
    const component = componentRegistry.get(data.type);
    if (typeof component.render === "function") {
      console.log("now rendering component:", data.type);
      return component.render(data, { typeProcessor });
    } else {
      console.warn(
        `Component for type '${data.type}' is not a function:`,
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

  switch (data.type) {
    case "page": {
      return page.render(data, { typeProcessor });
    }
    case "text": {
      return text.render(data);
    }
    case "grid": {
      return grid.render(data, { typeProcessor });
    }
    case "box": {
      return box.render(data, { typeProcessor });
    }
    case "grid-column": {
      return gridColumn.render(data, { typeProcessor });
    }
    case "mediaItems": {
      return mediaItems.render(data);
    }
    case "image": {
      return image.render(data);
    }
    case "markdown": {
      return markdown.render(data);
    }
  }

  return (
    <div>
      <p>!!! ERROR Component for type '{data.type}' is not registered.</p>
      <p>Available types: {Array.from(componentRegistry.keys()).join(", ")}</p>
      <p>Data:</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
