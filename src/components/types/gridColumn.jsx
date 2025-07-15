import React from "react";
// import "./column.css";

export function gridColumn(data, { typeProcessor }) {
  return (
    <>
      <div
        className={`node-grid-column ${data.class || ""}`}
        style={{ "--node-grid-column--count": data.cols || 12 }}
      >
        {data?.children?.map((item, index) => (
          <>{typeProcessor(item)}</>
        ))}
      </div>
    </>
  );
}

gridColumn.type = "grid-column";
