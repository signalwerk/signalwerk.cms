import React from "react";
import { mediaItems } from "./types/mediaItems.jsx";
import { image } from "./types/image.jsx";
import { page } from "./types/page.jsx";
import { text } from "./types/text.jsx";
import { markdown } from "./types/markdown.jsx";
import { gridColumn } from "./types/gridColumn.jsx";
import { grid } from "./types/grid.jsx";
import { box } from "./types/box.jsx";

export function typeProcessor(data) {
  if (!data) return null;

  // if data is an array, process each item
  if (Array.isArray(data)) {
    return data.map((item) => typeProcessor(item));
  }

  switch (data.type) {
    case "page": {
      return page(data);
    }
    case "text": {
      return <>{text(data)}</>;
    }
    case "grid": {
      return <>{grid(data)}</>;
    }
    case "box": {
      return <>{box(data)}</>;
    }
    case "grid-column": {
      return gridColumn(data);
    }
    case "mediaItems": {
      return mediaItems(data);
    }
    case "image": {
      return image(data);
    }
    case "markdown": {
      return markdown(data);
    }
    case "overview": {
      return (
        <div className="overview">
          <h1>{data.title || `${data.collection} Overview`}</h1>
          {data.description && (
            <div className="overview-description">
              {typeProcessor({ type: "text", body: data.description })}
            </div>
          )}

          <div className="overview-items">
            {data.items && data.items.length > 0 ? (
              data.items
                .filter((item) => !item.draft) // Filter out draft items
                .map((item, index) => (
                  <article
                    key={item.filename || index}
                    className="overview-item"
                  >
                    <h2>
                      <a href={`/${item.filename}`}>{item.title}</a>
                    </h2>
                    {item.date && (
                      <time className="overview-date">
                        {new Date(parseInt(item.date)).toLocaleDateString()}
                      </time>
                    )}
                    {item.excerpt && (
                      <p className="overview-excerpt">{item.excerpt}</p>
                    )}
                  </article>
                ))
            ) : (
              <p className="overview-empty">
                No items found in this collection.
              </p>
            )}
          </div>
        </div>
      );
    }

    default:
      console.warn("Unsupported data type: ", data.type);
      return (
        <>
          <p>!!! ERROR Unsupported data type: {data.type}</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
      );
  }
}
