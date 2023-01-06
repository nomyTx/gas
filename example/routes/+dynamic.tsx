import { h } from "../../jsx.ts";

export function render(param: string) {
  if (param === "hello") {
    return <h1>World!</h1>;
  } else {
    return false;
  }
}
