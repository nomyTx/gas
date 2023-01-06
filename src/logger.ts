import * as colors from "@std/fmt/colors.ts";

export function log(...data: unknown[]) {
	console.log(`${colors.blue("gas")} | ${colors.gray("log")} | ${data}`);
}

export function warn(...data: unknown[]) {
	console.warn(`${colors.blue("gas")} | ${colors.yellow("warn")} | ${data}`);
}

export function info(...data: unknown[]) {
	console.info(`${colors.blue("gas")} | ${colors.cyan("info")} | ${data}`);
}

export function error(...data: unknown[]) {
	console.error(`${colors.blue("gas")} | ${colors.red("error")} | ${data}`);
}
