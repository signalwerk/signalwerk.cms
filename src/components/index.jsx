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
    if (typeof component === "function") {
      return component(data, { typeProcessor });
    } else {
      console.warn(
        `Component for type '${data.type}' is not a function:`,
        component,
      );
      return (
        <div>
          <p>!!! ERROR Component for type '{data.type}' is not a function.</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
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
