import React from "react";

export function overview(data, { typeProcessor }) {
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
              <article key={item.filename || index} className="overview-item">
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
          <p className="overview-empty">No items found in this collection.</p>
        )}
      </div>
    </div>
  );
}

export default {
  type: "overview",
  render: overview,
};
