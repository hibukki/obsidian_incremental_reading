module.exports = {
	preset: "ts-jest",
	testEnvironment: "jsdom",
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				tsconfig: {
					jsx: "react",
					esModuleInterop: true,
					allowSyntheticDefaultImports: true,
				},
			},
		],
	},
	testMatch: ["**/__tests__/**/*.test.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	moduleNameMapper: {
		"^obsidian$": "<rootDir>/__mocks__/obsidian.ts",
	},
};
