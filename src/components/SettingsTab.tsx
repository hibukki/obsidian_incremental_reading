import React, { useState } from 'react';
import { App, PluginSettingTab } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import type ClaudeCopilotPlugin from '../../main';
import { CLAUDE_COPILOT_PROMPT_FILE } from '../consts';

const CLAUDE_MODELS = [
	'claude-3-5-haiku-latest',
	'claude-3-5-haiku-20241022',
	'claude-3-7-sonnet-latest',
	'claude-3-7-sonnet-20250219',
	'claude-sonnet-4-0',
	'claude-sonnet-4-20250514',
	'claude-opus-4-0',
	'claude-opus-4-20250514',
	'claude-opus-4-1',
	'claude-opus-4-1-20250805'
];

interface SettingsProps {
	plugin: ClaudeCopilotPlugin;
	onModelChanged?: (model: string) => void;
}

const SettingsComponent: React.FC<SettingsProps> = ({ plugin, onModelChanged }) => {
	const [apiKey, setApiKey] = useState(plugin.settings.apiKey);
	const [model, setModel] = useState(plugin.settings.model);
	const [debounceDelay, setDebounceDelay] = useState(plugin.settings.debounceDelay.toString());
	const [promptTemplate, setPromptTemplate] = useState(plugin.settings.promptTemplate);

	const handleApiKeyChange = async (value: string) => {
		setApiKey(value);
		plugin.settings.apiKey = value;
		await plugin.saveSettings();
	};

	const handleModelChange = async (value: string) => {
		setModel(value);
		plugin.settings.model = value;
		await plugin.saveSettings();
		onModelChanged?.(value);
	};

	const handleDebounceDelayChange = async (value: string) => {
		setDebounceDelay(value);
		const delay = parseInt(value);
		if (!isNaN(delay) && delay > 0) {
			plugin.settings.debounceDelay = delay;
			await plugin.saveSettings();
		}
	};

	const handlePromptTemplateChange = async (value: string) => {
		setPromptTemplate(value);
		plugin.settings.promptTemplate = value;
		await plugin.saveSettings();
	};

	return (
		<div className="claude-copilot-settings">
			<h2>Claude Copilot Settings</h2>
			
			<div className="setting-item">
				<div className="setting-item-info">
					<div className="setting-item-name">Claude API Key</div>
					<div className="setting-item-description">
						Enter your Claude API key. Get one from console.anthropic.com
					</div>
				</div>
				<div className="setting-item-control">
					<input
						type="password"
						placeholder="sk-ant-..."
						value={apiKey}
						onChange={(e) => handleApiKeyChange(e.target.value)}
						spellCheck={false}
					/>
				</div>
			</div>

			<div className="setting-item">
				<div className="setting-item-info">
					<div className="setting-item-name">Claude Model</div>
					<div className="setting-item-description">
						Select which Claude model to use
					</div>
				</div>
				<div className="setting-item-control">
					<select
						className="dropdown"
						value={model}
						onChange={(e) => handleModelChange(e.target.value)}
					>
						{CLAUDE_MODELS.map(modelOption => (
							<option key={modelOption} value={modelOption}>
								{modelOption}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="setting-item">
				<div className="setting-item-info">
					<div className="setting-item-name">Debounce Delay (ms)</div>
					<div className="setting-item-description">
						How long to wait after typing stops before querying Claude (in milliseconds)
					</div>
				</div>
				<div className="setting-item-control">
					<input
						type="text"
						placeholder="2000"
						value={debounceDelay}
						onChange={(e) => handleDebounceDelayChange(e.target.value)}
					/>
				</div>
			</div>

			<div className="setting-item">
				<div className="setting-item-info">
					<div className="setting-item-name">Default Prompt Template</div>
					<div className="setting-item-description">
						Default prompt template (can be overridden by {CLAUDE_COPILOT_PROMPT_FILE})
					</div>
				</div>
				<div className="setting-item-control">
					<textarea
						placeholder="Enter prompt template..."
						value={promptTemplate}
						onChange={(e) => handlePromptTemplateChange(e.target.value)}
						rows={10}
						spellCheck={false}
					/>
				</div>
			</div>

			<p className="setting-item-description">
				To customize the prompt, create or edit the file: {CLAUDE_COPILOT_PROMPT_FILE}
			</p>
		</div>
	);
};

export class ClaudeCopilotSettingTab extends PluginSettingTab {
	plugin: ClaudeCopilotPlugin;
	root: Root | null = null;
	onModelChanged?: (model: string) => void;

	constructor(app: App, plugin: ClaudeCopilotPlugin, onModelChanged?: (model: string) => void) {
		super(app, plugin);
		this.plugin = plugin;
		this.onModelChanged = onModelChanged;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.root = createRoot(containerEl);
		this.root.render(
			React.createElement(SettingsComponent, {
				plugin: this.plugin,
				onModelChanged: this.onModelChanged
			})
		);
	}

	hide(): void {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
	}
}