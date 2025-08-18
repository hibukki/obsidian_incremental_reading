import React, { useState, useEffect, useMemo, useRef } from 'react';
import { debounce } from 'obsidian';
import { Settings, QueryState, CopilotReactAPI, hasValidApiKey } from '../types/copilotState';
import { SettingsProvider } from '../contexts/SettingsContext';
import { CopilotPanel } from './CopilotPanel';
import { AnthropicClient } from '../services/anthropicClient';
import { insertCursorMarker } from '../utils/cursor';

interface CopilotAppProps {
	initialSettings: Settings;
	onApiReady: (api: CopilotReactAPI) => void;
}

export const CopilotApp: React.FC<CopilotAppProps> = ({ 
	initialSettings, 
	onApiReady 
}) => {
	const [settings, setSettings] = useState<Settings>(initialSettings);
	const [queryState, setQueryState] = useState<QueryState>({ status: 'idle' });
	
	// Keep reference to anthropic client
	const anthropicClientRef = useRef<AnthropicClient | null>(null);
	
	// Create/update AnthropicClient when settings change
	useEffect(() => {
		if (hasValidApiKey(settings)) {
			anthropicClientRef.current = new AnthropicClient({
				apiKey: settings.apiKey,
				model: settings.model
			});
		} else {
			anthropicClientRef.current = null;
		}
	}, [settings.apiKey, settings.model]);
	
	// Debounced query function - recreated when settings change
	const debouncedQuery = useMemo(
		() => debounce(async (content: string, cursorPosition: number) => {
			if (!hasValidApiKey(settings)) {
				setQueryState({ 
					status: 'error', 
					error: 'No API key configured',
					occurredAt: new Date()
				});
				return;
			}
			
			if (!anthropicClientRef.current) {
				setQueryState({ 
					status: 'error', 
					error: 'Anthropic client not initialized',
					occurredAt: new Date()
				});
				return;
			}
			
			setQueryState({ status: 'querying' });
			
			try {
				const documentWithCursor = insertCursorMarker(content, cursorPosition);
				const prompt = settings.promptTemplate.replace("{{doc}}", documentWithCursor);
				
				const feedback = await anthropicClientRef.current.queryForFeedback(prompt);
				setQueryState({ status: 'success', feedback });
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				setQueryState({ 
					status: 'error', 
					error: errorMessage,
					occurredAt: new Date()
				});
			}
		}, settings.debounceDelayMs),
		[settings.debounceDelayMs, settings.apiKey, settings.model, settings.promptTemplate]
	);
	
	// Handle retry for failed queries
	const handleRetry = () => {
		if (queryState.status === 'error') {
			setQueryState({ status: 'idle' });
		}
	};
	
	// Expose API to Obsidian
	useEffect(() => {
		const api: CopilotReactAPI = {
			updateSettings: (updates) => {
				setSettings(prev => ({ ...prev, ...updates }));
			},
			onEditorContentChanged: debouncedQuery,
			cancelPendingQueries: () => {
				debouncedQuery.cancel();
				if (queryState.status === 'querying') {
					setQueryState({ status: 'idle' });
				}
			}
		};
		
		onApiReady(api);
	}, [debouncedQuery, queryState.status]);
	
	// Cleanup on unmount
	useEffect(() => {
		return () => {
			debouncedQuery.cancel();
		};
	}, [debouncedQuery]);
	
	return (
		<SettingsProvider settings={settings}>
			<CopilotPanel 
				queryState={queryState}
				onRetry={handleRetry}
			/>
		</SettingsProvider>
	);
};