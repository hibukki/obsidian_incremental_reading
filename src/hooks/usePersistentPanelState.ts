import { useState, useEffect } from 'react';

const STORAGE_KEY = 'claude-copilot-expanded-panels';

export const usePersistentPanelState = (panelId: string, defaultExpanded = false) => {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);

	useEffect(() => {
		try {
			const storedState = localStorage.getItem(STORAGE_KEY);
			if (storedState) {
				const expandedPanels = JSON.parse(storedState) as Record<string, boolean>;
				if (expandedPanels[panelId] !== undefined) {
					setIsExpanded(expandedPanels[panelId]);
				}
			}
		} catch (error) {
			console.warn('Failed to load panel state from localStorage:', error);
		}
	}, [panelId]);

	const toggleExpanded = () => {
		const newState = !isExpanded;
		setIsExpanded(newState);

		try {
			const storedState = localStorage.getItem(STORAGE_KEY);
			const expandedPanels = storedState ? JSON.parse(storedState) : {};
			
			if (newState) {
				expandedPanels[panelId] = true;
			} else {
				delete expandedPanels[panelId];
			}
			
			localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedPanels));
		} catch (error) {
			console.warn('Failed to save panel state to localStorage:', error);
		}
	};

	return [isExpanded, toggleExpanded] as const;
};