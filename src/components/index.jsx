import React from "react";
import { mediaItems } from "./types/mediaItems.jsx";
import { image } from "./types/image.jsx";
import { page } from "./types/page.jsx";
import { text } from "./types/text.jsx";
import { markdown } from "./types/markdown.jsx";
import { gridColumn } from "./types/gridColumn.jsx";
import { grid } from "./types/grid.jsx";
import { box } from "./types/box.jsx";
import { Helmet } from "react-helmet";

export function typeProcessor(data, configuration = {}) {
  if (!data) return null;

  // if data is an array, process each item
  if (Array.isArray(data)) {
    return data.map((item) => typeProcessor(item, configuration));
  }

  const { config, settings } = configuration;

  if (config?.types?.[data.type]) {
    const currentProcessor = config.types?.[data.type];
    const content = currentProcessor(data, {
      Helmet,
      processor: {
        run: (item) => typeProcessor(item, configuration),
      },
    });

    if (config.env === "admin" && config?.admin?.callback?.[data.type]) {
      config?.admin?.callback?.[data.type]({ CMS: config.context?.CMS });
    }

    return content;
  }

  switch (data.type) {
    case ":root": {
      const lang = settings?.page?.html?.lang || "en";
      return (
        <>
          <Helmet htmlAttributes={{ lang }}>
            {settings?.page?.head?.stylesheets?.map((stylesheet) => (
              <link href={stylesheet.path} rel="stylesheet" />
            ))}
            {/* <link
              rel="stylesheet"
              href="data:text/css;base64,LyogQ1NTIGZvciBQYWdlZC5qcyBpbnRlcmZhY2Ug4oCTIHYwLjQgKi8KCi8qIENoYW5nZSB0aGUgbG9vayAqLwo6cm9vdCB7CiAgICAtLWNvbG9yLWJhY2tncm91bmQ6IHdoaXRlc21va2U7CiAgICAtLWNvbG9yLXBhZ2VTaGVldDogI2NmY2ZjZjsKICAgIC0tY29sb3ItcGFnZUJveDogdmlvbGV0OwogICAgLS1jb2xvci1wYXBlcjogd2hpdGU7CiAgICAtLWNvbG9yLW1hcmdpbkJveDogdHJhbnNwYXJlbnQ7CiAgICAtLXBhZ2VkanMtY3JvcC1jb2xvcjogYmxhY2s7CiAgICAtLXBhZ2VkanMtY3JvcC1zaGFkb3c6IHdoaXRlOwogICAgLS1wYWdlZGpzLWNyb3Atc3Ryb2tlOiAxcHg7Cn0KCi8qIFRvIGRlZmluZSBob3cgdGhlIGJvb2sgbG9vayBvbiB0aGUgc2NyZWVuOiAqLwpAbWVkaWEgc2NyZWVuLCBwYWdlZGpzLWlnbm9yZSB7CiAgICBib2R5IHsKICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1iYWNrZ3JvdW5kKTsKICAgIH0KCiAgICAucGFnZWRqc19wYWdlcyB7CiAgICAgICAgZGlzcGxheTogZmxleDsKICAgICAgICB3aWR0aDogY2FsYyh2YXIoLS1wYWdlZGpzLXdpZHRoKSAqIDIpOwogICAgICAgIGZsZXg6IDA7CiAgICAgICAgZmxleC13cmFwOiB3cmFwOwogICAgICAgIG1hcmdpbjogMCBhdXRvOwogICAgfQoKICAgIC5wYWdlZGpzX3BhZ2UgewogICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLXBhcGVyKTsKICAgICAgICBib3gtc2hhZG93OiAwIDAgMCAxcHggdmFyKC0tY29sb3ItcGFnZVNoZWV0KTsKICAgICAgICBtYXJnaW46IDA7CiAgICAgICAgZmxleC1zaHJpbms6IDA7CiAgICAgICAgZmxleC1ncm93OiAwOwogICAgICAgIG1hcmdpbi10b3A6IDEwbW07CiAgICB9CgogICAgLnBhZ2VkanNfZmlyc3RfcGFnZSB7CiAgICAgICAgbWFyZ2luLWxlZnQ6IHZhcigtLXBhZ2VkanMtd2lkdGgpOwogICAgfQoKICAgIC5wYWdlZGpzX3BhZ2U6bGFzdC1vZi10eXBlIHsKICAgICAgICBtYXJnaW4tYm90dG9tOiAxMG1tOwogICAgfQoKICAgIC5wYWdlZGpzX3BhZ2Vib3h7CiAgICAgICAgYm94LXNoYWRvdzogMCAwIDAgMXB4IHZhcigtLWNvbG9yLXBhZ2VCb3gpOwogICAgfQoKICAgIC5wYWdlZGpzX2xlZnRfcGFnZXsKICAgICAgICB6LWluZGV4OiAyMDsKICAgICAgICB3aWR0aDogY2FsYyh2YXIoLS1wYWdlZGpzLWJsZWVkLWxlZnQpICsgdmFyKC0tcGFnZWRqcy1wYWdlYm94LXdpZHRoKSkhaW1wb3J0YW50OwogICAgfQoKICAgIC5wYWdlZGpzX2xlZnRfcGFnZSAucGFnZWRqc19ibGVlZC1yaWdodCAucGFnZWRqc19tYXJrcy1jcm9wIHsKICAgICAgICBib3JkZXItY29sb3I6IHRyYW5zcGFyZW50OwogICAgfQogICAgCiAgICAucGFnZWRqc19sZWZ0X3BhZ2UgLnBhZ2VkanNfYmxlZWQtcmlnaHQgLnBhZ2VkanNfbWFya3MtbWlkZGxlewogICAgICAgIHdpZHRoOiAwOwogICAgfSAKCiAgICAucGFnZWRqc19yaWdodF9wYWdlewogICAgICAgIHotaW5kZXg6IDEwOwogICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsKICAgICAgICBsZWZ0OiBjYWxjKHZhcigtLXBhZ2VkanMtYmxlZWQtbGVmdCkqLTEpOwogICAgfQoKICAgIC8qIHNob3cgdGhlIG1hcmdpbi1ib3ggKi8KCiAgICAucGFnZWRqc19tYXJnaW4tdG9wLWxlZnQtY29ybmVyLWhvbGRlciwKICAgIC5wYWdlZGpzX21hcmdpbi10b3AsCiAgICAucGFnZWRqc19tYXJnaW4tdG9wLWxlZnQsCiAgICAucGFnZWRqc19tYXJnaW4tdG9wLWNlbnRlciwKICAgIC5wYWdlZGpzX21hcmdpbi10b3AtcmlnaHQsCiAgICAucGFnZWRqc19tYXJnaW4tdG9wLXJpZ2h0LWNvcm5lci1ob2xkZXIsCiAgICAucGFnZWRqc19tYXJnaW4tYm90dG9tLWxlZnQtY29ybmVyLWhvbGRlciwKICAgIC5wYWdlZGpzX21hcmdpbi1ib3R0b20sCiAgICAucGFnZWRqc19tYXJnaW4tYm90dG9tLWxlZnQsCiAgICAucGFnZWRqc19tYXJnaW4tYm90dG9tLWNlbnRlciwKICAgIC5wYWdlZGpzX21hcmdpbi1ib3R0b20tcmlnaHQsCiAgICAucGFnZWRqc19tYXJnaW4tYm90dG9tLXJpZ2h0LWNvcm5lci1ob2xkZXIsCiAgICAucGFnZWRqc19tYXJnaW4tcmlnaHQsCiAgICAucGFnZWRqc19tYXJnaW4tcmlnaHQtdG9wLAogICAgLnBhZ2VkanNfbWFyZ2luLXJpZ2h0LW1pZGRsZSwKICAgIC5wYWdlZGpzX21hcmdpbi1yaWdodC1ib3R0b20sCiAgICAucGFnZWRqc19tYXJnaW4tbGVmdCwKICAgIC5wYWdlZGpzX21hcmdpbi1sZWZ0LXRvcCwKICAgIC5wYWdlZGpzX21hcmdpbi1sZWZ0LW1pZGRsZSwKICAgIC5wYWdlZGpzX21hcmdpbi1sZWZ0LWJvdHRvbSB7CiAgICAgICAgYm94LXNoYWRvdzogMCAwIDAgMXB4IGluc2V0IHZhcigtLWNvbG9yLW1hcmdpbkJveCk7CiAgICB9CgogICAgLyogdW5jb21tZW50IHRoaXMgcGFydCBmb3IgcmVjdG8vdmVyc28gYm9vayA6IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqLwoKICAgIC8qCiAgICAucGFnZWRqc19wYWdlcyB7CiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICAgICAgICB3aWR0aDogMTAwJTsKICAgIH0KCiAgICAucGFnZWRqc19maXJzdF9wYWdlIHsKICAgICAgICBtYXJnaW4tbGVmdDogMDsKICAgIH0KCiAgICAucGFnZWRqc19wYWdlIHsKICAgICAgICBtYXJnaW46IDAgYXV0bzsKICAgICAgICBtYXJnaW4tdG9wOiAxMG1tOwogICAgfSAKCiAgICAucGFnZWRqc19sZWZ0X3BhZ2V7CiAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tcGFnZWRqcy1ibGVlZC1sZWZ0KSArIHZhcigtLXBhZ2VkanMtcGFnZWJveC13aWR0aCkgKyB2YXIoLS1wYWdlZGpzLWJsZWVkLWxlZnQpKSFpbXBvcnRhbnQ7CiAgICB9CgogICAgLnBhZ2VkanNfbGVmdF9wYWdlIC5wYWdlZGpzX2JsZWVkLXJpZ2h0IC5wYWdlZGpzX21hcmtzLWNyb3B7CiAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1wYWdlZGpzLWNyb3AtY29sb3IpOwogICAgfQoKICAgIC5wYWdlZGpzX2xlZnRfcGFnZSAucGFnZWRqc19ibGVlZC1yaWdodCAucGFnZWRqc19tYXJrcy1taWRkbGV7CiAgICAgICAgd2lkdGg6IHZhcigtLXBhZ2VkanMtY3Jvc3Mtc2l6ZSkhaW1wb3J0YW50OwogICAgfSAKCiAgICAucGFnZWRqc19yaWdodF9wYWdlewogICAgICAgIGxlZnQ6IDA7IAogICAgfSAKICAgICovCiAgICAKICAgIAoKICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qLwoKCgogICAgLyogdW5jb21tZW50IHRoaXMgcGFyIHRvIHNlZSB0aGUgYmFzZWxpbmUgOiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi8KCiAgICAKICAgIC8qIC5wYWdlZGpzX3BhZ2Vib3ggewogICAgICAgIC0tcGFnZWRqcy1iYXNlbGluZTogMjJweDsKICAgICAgICAtLXBhZ2VkanMtYmFzZWxpbmUtcG9zaXRpb246IDVweDsKICAgICAgICAtLXBhZ2VkanMtYmFzZWxpbmUtY29sb3I6IGN5YW47CiAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRyYW5zcGFyZW50IDAlLCB0cmFuc3BhcmVudCBjYWxjKHZhcigtLXBhZ2VkanMtYmFzZWxpbmUpIC0gMXB4KSwgdmFyKC0tcGFnZWRqcy1iYXNlbGluZS1jb2xvcikgY2FsYyh2YXIoLS1wYWdlZGpzLWJhc2VsaW5lKSAtIDFweCksIHZhcigtLXBhZ2VkanMtYmFzZWxpbmUtY29sb3IpIHZhcigtLXBhZ2VkanMtYmFzZWxpbmUpKSwgdHJhbnNwYXJlbnQ7CiAgICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIHZhcigtLXBhZ2VkanMtYmFzZWxpbmUpOwogICAgICAgIGJhY2tncm91bmQtcmVwZWF0OiByZXBlYXQteTsKICAgICAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uLXk6IHZhcigtLXBhZ2VkanMtYmFzZWxpbmUtcG9zaXRpb24pOwogICAgfSAgKi8KICAgCgogICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovCn0KCgoKCgovKiBNYXJrcyAodG8gZGVsZXRlIHdoZW4gbWVyZ2UgaW4gcGFnZWQuanMpICovCgoucGFnZWRqc19tYXJrcy1jcm9wewogICAgei1pbmRleDogOTk5OTk5OTk5OTk5OwogIAp9CgoucGFnZWRqc19ibGVlZC10b3AgLnBhZ2VkanNfbWFya3MtY3JvcCwgCi5wYWdlZGpzX2JsZWVkLWJvdHRvbSAucGFnZWRqc19tYXJrcy1jcm9wewogICAgYm94LXNoYWRvdzogMXB4IDBweCAwcHggMHB4IHZhcigtLXBhZ2VkanMtY3JvcC1zaGFkb3cpOwp9ICAKCi5wYWdlZGpzX2JsZWVkLXRvcCAucGFnZWRqc19tYXJrcy1jcm9wOmxhc3QtY2hpbGQsCi5wYWdlZGpzX2JsZWVkLWJvdHRvbSAucGFnZWRqc19tYXJrcy1jcm9wOmxhc3QtY2hpbGR7CiAgICBib3gtc2hhZG93OiAtMXB4IDBweCAwcHggMHB4IHZhcigtLXBhZ2VkanMtY3JvcC1zaGFkb3cpOwp9IC AKCi5wYWdlZGpzX2JsZWVkLWxlZnQgLnBhZ2VkanNfbWFya3MtY3JvcCwKLnBhZ2VkanNfYmxlZWQtcmlnaHQgLnBhZ2VkanNfbWFya3MtY3JvcHsKICAgIGJveC1zaGFkb3c6IDBweCAxcHggMHB4IDBweCB2YXIoLS1wYWdlZGpzLWNyb3Atc2hhZG93KTsKfQoKLnBhZ2VkanNfYmxlZWQtbGVmdCAucGFnZWRqc19tYXJrcy1jcm9wOmxhc3QtY2hpbGQsCi5wYWdlZGpzX2JsZWVkLXJpZ2h0IC5wYWdlZGpzX21hcmtzLWNyb3A6bGFzdC1jaGlsZHsKICAgIGJveC1zaGFkb3c6IDBweCAtMXB4IDBweCAwcHggdmFyKC0tcGFnZWRqcy1jcm9wLXNoYWRvdyk7Cn0="
              type="text/css"
            />
            <body className="pagedjs--print" />
            <script
              src="https://unpkg.com/pagedjs@0.5.0-beta.0/dist/paged.polyfill.js"
              type="text/javascript"
            ></script> */}
            {settings?.page?.head?.js?.map((js) => (
              <script src={js.path} />
            ))}
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <meta charset="utf-8" />
          </Helmet>

          <>{data.children && typeProcessor(data.children, configuration)}</>
        </>
      );
    }

    case "page": {
      return page(data, configuration);
    }
    case "text": {
      return <>{text(data, configuration)}</>;
    }
    case "grid": {
      return <>{grid(data, configuration)}</>;
    }
    case "box": {
      return <>{box(data, configuration)}</>;
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
              {typeProcessor(
                { type: "text", body: data.description },
                configuration,
              )}
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
