import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest/presets/default-esm",
	testEnvironment: "node",
	setupFiles: ["dotenv/config"],
	testMatch: ["**/tests/**/*.test.ts"],
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	extensionsToTreatAsEsm: [".ts"],
	transform: {},
};

export default config;
