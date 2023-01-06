import { join, toFileUrl } from "@std/path/mod.ts";
import { Helmet, renderSSR } from "@jsx";
import { Context, helpers } from "@oak";
import { error } from "./logger.ts";

let routesDir: URL;
let staticDir: URL;

interface Route {
	name: string;
	special: boolean;
	// deno-lint-ignore no-explicit-any
	module: () => Promise<any>;
	dirs: string[];
}

const validExtensions = ["tsx", "ts", "jsx", "js"];

async function traverseRoutes(curr: Route[], dirs: string[]) {
	const directory = toFileUrl(join(routesDir.toString(), dirs.join("/")));

	for await (const entry of Deno.readDir(directory)) {
		if (
			entry.isFile && validExtensions.includes(entry.name.split(".")[1])
		) {
			curr.push({
				name: entry.name.split(".")[0],
				special: entry.name.startsWith("+"),
				module: async () =>
					await import(
						join(directory.toString(), entry.name) +
							`?update=${Date.now()}`
					),
				dirs: dirs,
			});
		} else if (entry.isDirectory) {
			await traverseRoutes(curr, [...dirs, entry.name]);
		}
	}

	return curr;
}

function makeHTML(body: string, head: string[], footer: string[]) {
	const html = `<!DOCTYPE html>
<html>
  <head>
    ${head.join("\n")}
  </head>
  <body>
    ${body}
    ${footer.join("\n")}
		</body>
		</html>`;

	return html;
}

async function notFound(ctx: Context, routes: Route[]) {
	const notFound = routes.find((obj) => obj.special && obj.name === "+404");

	if (notFound) {
		const mod = await notFound.module();

		if (mod.render) {
			const rendered = renderSSR(() => mod.render());
			const { body, head, footer } = Helmet.SSR(rendered);

			ctx.response.headers.append("content-type", "text/html");
			ctx.response.status = 404;
			ctx.response.body = makeHTML(body, head, footer);
		} else {
			error("404 page is invalid!");
		}
	} else {
		ctx.response.status = 404;
	}
}

async function tryHandleStatic(
	ctx: Context,
	requested: string[],
	routes: Route[],
) {
	try {
		const file = await Deno.readFile(
			toFileUrl(join(staticDir.toString(), requested.join("/"))),
		);

		ctx.response.body = file.buffer;
	} catch (e) {
		if (e instanceof Deno.errors.NotFound) await notFound(ctx, routes);
	}
}

async function handle(
	ctx: Context,
	route: Route,
	requested: string[],
	dynamic: boolean,
	routes: Route[],
) {
	const mod = await route.module();

	if (mod.render) {
		const rendered = renderSSR(() =>
			mod.render(dynamic ? requested.at(-1) : helpers.getQuery(ctx))
		);

		if (!dynamic || rendered) {
			const { body, head, footer } = Helmet.SSR(rendered);

			ctx.response.headers.append("content-type", "text/html");
			ctx.response.body = makeHTML(body, head, footer);
		} else await tryHandleStatic(ctx, requested, routes);
	} else if (mod.respond) {
		const respond = await mod.respond(
			...(dynamic ? [requested.at(-1), ctx] : [ctx]),
		);

		if (dynamic && !respond) await tryHandleStatic(ctx, requested, routes);
	} else {
		error(
			dynamic
				? `Dynamic route for ${route.dirs.at(-1) ?? "/"} is invalid!`
				: `Route ${route.name} is invalid!`,
		);
	}
}

/**
 * The route handler for use with oak, not recommended for basic use
 * @param ctx - The oak context
 * @param options - Options
 * @param options.routesDir - The file URL of the routes directory
 */
export async function routeHandler(
	ctx: Context,
	options: {
		routesDir: URL;
		staticDir: URL;
	},
) {
	routesDir = options.routesDir;
	staticDir = options.staticDir;

	const requested = ctx.request.url.pathname.split("/").slice(1);
	const routes = await traverseRoutes([], []);

	const route = routes.find((obj) => (
		obj.dirs.toString() === requested.slice(0, -1).toString() &&
		obj.name ===
			(requested.at(-1) === "" ? "index" : requested.at(-1)) &&
		!obj.special
	));

	const dynamic = routes.find((obj) => (
		obj.special &&
		obj.dirs.toString() === requested.slice(0, -1).toString() &&
		obj.name === "+dynamic"
	));

	if (route) await handle(ctx, route, requested, false, routes);
	else if (dynamic) await handle(ctx, dynamic, requested, true, routes);
	else await tryHandleStatic(ctx, requested, routes);
}
