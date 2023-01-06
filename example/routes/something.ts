import { Context } from "../../oak.ts";

export function respond(ctx: Context) {
  ctx.response.body = "Hello from something!";
}
