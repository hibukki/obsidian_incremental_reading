// Core types for the refactored React state management

export interface Settings {
	apiKey: string;
	model: string;
	debounceDelayMs: number;
	promptTemplate: string;
}

// Discriminated union for query state - prevents invalid state combinations
export type QueryState = 
	| { status: 'idle' }
	| { status: 'querying' }
	| { status: 'success'; feedback: string }
	| { status: 'error'; error: string; occurredAt: Date };

export interface CopilotAppState {
	settings: Settings;
	queryState: QueryState;
}

// API contract between Obsidian and React
export interface CopilotReactAPI {
	updateSettings: (settings: Partial<Settings>) => void;
	onEditorContentChanged: (content: string, cursorPosition: number) => void;
	cancelPendingQueries: () => void;
}

// Derived value functions (computed, not stored)
export const hasValidApiKey = (settings: Settings): boolean => 
	settings.apiKey.length > 0;

export const canRetryError = (error: string): boolean => 
	!error.toLowerCase().includes('invalid api key') && 
	!error.toLowerCase().includes('authentication');