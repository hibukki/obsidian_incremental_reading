import React, { createContext, useContext } from "react";
import { Settings } from "../types/copilotState";

const SettingsContext = createContext<Settings | null>(null);

export const useSettings = (): Settings => {
	const settings = useContext(SettingsContext);
	if (!settings) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return settings;
};

export const SettingsProvider: React.FC<{
	settings: Settings;
	children: React.ReactNode;
}> = ({ settings, children }) => {
	return (
		<SettingsContext.Provider value={settings}>
			{children}
		</SettingsContext.Provider>
	);
};
