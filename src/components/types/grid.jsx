import React from "react";
import { typeProcessor } from "../index.jsx";

export function grid(data) {
  return (
    <>
      {/* <pre>{JSON.stringify({ grid: data }, null, 2)}</pre> */}
      <div className={`node-grid ${data.class || ""}`}>
        {data?.children?.map((item, index) => (
          <>{typeProcessor({ type: "grid-column", ...item })}</>
        ))}
      </div>
    </>
  );
}
