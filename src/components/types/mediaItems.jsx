import { image } from "./image";

export function mediaItems(node) {
  return (
    <>
      {/* <pre>{JSON.stringify(node, null, 2)}</pre> */}
      <div className={`node-media-items ${node.class || ""}`}>
        {node?.children?.map((item, index) => (
          <div key={index}>{image(item, { alt: node.caption })}</div>
        ))}
        {node.caption && <p>{node.caption}</p>}
      </div>
    </>
  );
}
