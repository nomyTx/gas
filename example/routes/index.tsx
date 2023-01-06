import { h, Helmet } from "../../jsx.ts";

import { Comp } from "../components/Comp.tsx";
import { useCSS } from "../../src/utils.ts";

export const render = () =>
  useCSS(
    "../css/index.css",
    <div>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <h1>{1 + 1}</h1>
      <Comp />
    </div>,
  );
