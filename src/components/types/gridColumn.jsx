import { typeProcessor } from "../index.jsx";
// import "./column.css";

export function gridColumn(data, configuration) {
  return (
    <>
      {/* <pre>column -- {JSON.stringify({ column: data }, null, 2)}</pre> */}
      <div
        className={`node-grid-column ${data.class || ""}`}
        style={{ "--node-grid-column--count": data.cols || 12 }}
      >
        {data?.children?.map((item, index) => (
          <>{typeProcessor({ type: "column", ...item }, configuration)}</>
        ))}
      </div>
    </>
  );
}
