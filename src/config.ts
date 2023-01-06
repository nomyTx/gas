export interface Config {
	/**
	 * The port number to host on, defaults to `3000`
	 */
	port?: number;
	/**
	 * The hostname to host on, defaults to `0.0.0.0` (`localhost`)
	 */
	hostname?: string;
	/**
	 * The path to the routes directory relative to the current directory, defaults to `routes`
	 */
	routesDir?: string;
	/**
	 * The path to the static file directory relative to the current directory, defaults to `static`
	 */
	staticDir?: string;
}

/**
 * Helper function for defining the config, not recommended over using the type
 */
export function config(config: Config) {
	return config;
}
