import { Command } from "https://deno.land/x/cliffy@v0.25.6/mod.ts";
import { routeHandler } from "./src/routeHandler.ts";
import { join, toFileUrl } from "@std/path/mod.ts";
import { Config } from "./src/config.ts";
import { info } from "./src/logger.ts";
import { Application } from "@oak";
import { VERSION } from "./mod.ts";

const { options } = await new Command()
	.name("gas")
	.version(VERSION)
	.option("-c, --config [config]", `The gas config file`, {
		default: "./gas.config.ts",
	})
	.parse(Deno.args);

// TODO: Check for config file and show error message if it doesn't exist instead of the import erroring
const { default: config }: { default: Config } = await import(
	toFileUrl(join(Deno.cwd(), options.config.toString())).toString()
);

const app = new Application();

app.use(async (ctx) => {
	await routeHandler(ctx, {
		routesDir: new URL(join(Deno.cwd(), config.routesDir || "routes")),
		staticDir: new URL(join(Deno.cwd(), config.staticDir || "static")),
	});
});

app.addEventListener("listen", (event) => {
	// TODO: Change this to a more sane method
	if (event.hostname === "0.0.0.0" || "::1") event.hostname = "localhost";

	info(`Listening on ${event.hostname}:${event.port}!`);
});

await app.listen({
	port: config.port || 3000,
	hostname: config.hostname || "0.0.0.0",
});
