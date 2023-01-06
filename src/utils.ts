import callsites from "https://raw.githubusercontent.com/kt3k/callsites/v1.0.0/mod.ts";
import { dirname, join } from "@std/path/mod.ts";
import { withStyles } from "@jsx";

/**
 * Wraps a component with CSS (wrapper around nano_jsx's withStyles)
 * @param path - Path to CSS file relative to the current file
 * @param comp - The component to wrap
 * @returns Wrapped component
 */
export function useCSS(path: string, comp: unknown) {
	const importeePath = callsites()[1].getFileName() as string;

	const cssPath = new URL(join(dirname(importeePath), path));
	const css = Deno.readTextFileSync(cssPath);

	return withStyles(css)(comp);
}
