import { mediaItems } from "./src/components/types/mediaItems.jsx";
import { image } from "./src/components/types/image.jsx";
import { page } from "./src/components/types/page.jsx";
import { text } from "./src/components/types/text.jsx";
import { markdown } from "./src/components/types/markdown.jsx";
import { gridColumn } from "./src/components/types/gridColumn.jsx";
import { grid } from "./src/components/types/grid.jsx";
import { box } from "./src/components/types/box.jsx";
import { overview } from "./src/components/types/overview.jsx";

import { registerComponent } from "./src/components/index.jsx";

export function registerComponents() {
  registerComponent(mediaItems);
  registerComponent(image);
  registerComponent(page);
  registerComponent(text);
  registerComponent(markdown);
  registerComponent(gridColumn);
  registerComponent(grid);
  registerComponent(box);
  registerComponent(overview);
}

export default {
  components: {
    mediaItems,
    image,
    page,
    text,
    markdown,
    gridColumn,
    grid,
    box,
    overview,
  },
};
