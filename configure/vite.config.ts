import path from "node:path";
import { biomePlugin } from "@pbr1111/vite-plugin-biome";
import logPlugin from "@izumiano/vite-plugin-logger";
import { defineConfig, loadEnv } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, path.resolve(path.join(__dirname, "..")));
	const localEnv = loadEnv(mode, path.resolve(__dirname));
	for (const key of Object.keys(localEnv)) {
		const val = localEnv[key];
		env[key] = val;
	}
	const { VITE_TRACE, VITE_DO_SERVER_LOG, VITE_LOG_URL, VITE_DEV_SITE_MATCH } =
		env;

	const isVitest = !!process.env.VITEST;

	const match = [mode === "development" ? VITE_DEV_SITE_MATCH : "*"];

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
							name: "TextReplacer-configure",
							namespace: "izumiano",
							match,
							include: match,
							author: "izumiano",
							description: "Configure TextReplacer",
						},
						server: {
							open: false,
						},
						build: {
							fileName: "textReplacer-configure.user.js",
							autoGrant: true,
						},
					})
				: undefined,
		],
		server: {
			port: 5174,
		},
	};
});
