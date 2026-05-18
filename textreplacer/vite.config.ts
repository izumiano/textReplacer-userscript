import path from "node:path";
import { biomePlugin } from "@pbr1111/vite-plugin-biome";
import logPlugin from "@izumiano/vite-plugin-logger";
import { defineConfig, loadEnv } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const { VITE_TRACE, VITE_DO_SERVER_LOG, VITE_LOG_URL } = loadEnv(
		mode,
		path.resolve(__dirname),
	);

	const isVitest = !!process.env.VITEST;

	return {
		plugins: [
			!isVitest ? biomePlugin() : undefined,
			!isVitest
				? logPlugin({
						mode,
						traceEnabled: VITE_TRACE === "true",
						doServerLog: VITE_DO_SERVER_LOG === "true",
						logUrl: VITE_LOG_URL,
					})
				: undefined,
			!isVitest
				? monkey({
						entry: "src/main.ts",
						userscript: {
							namespace: "izumiano",
							match: ["*"],
							include: ["*"],
							author: "izumiano",
							description: "Replace arbitrary words with something else",
						},
						server: {
							open: false,
						},
						build: {
							fileName: "textReplacer.user.js",
							autoGrant: true,
						},
					})
				: undefined,
		],
	};
});
