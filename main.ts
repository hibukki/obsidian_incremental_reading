import { App, ItemView, WorkspaceLeaf, Plugin, Notice, TFile, debounce, MarkdownView, Editor, requestUrl } from 'obsidian';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { CopilotPanel } from './src/components/CopilotPanel';
import { ClaudeCopilotSettingTab } from './src/components/SettingsTab';

interface ClaudeCopilotSettings {
	apiKey: string;
	model: string;
	debounceDelay: number;
	promptTemplate: string;
}

const DEFAULT_SETTINGS: ClaudeCopilotSettings = {
	apiKey: '',
	model: 'claude-3-5-haiku-latest',
	debounceDelay: 2000,
	promptTemplate: `Please see what the user is writing, try inferring their intent, and suggest one short thing for them, which will be presented for them on a sidebar in Obsidian. Here is the current user document, with <cursor/> marking their current cursor, so you can see what specifically they are working on right now. Below is their open doc:

{{doc}}`
}

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

const VIEW_TYPE_CLAUDE_COPILOT = "claude-copilot-view";

class ClaudeCopilotView extends ItemView {
	plugin: ClaudeCopilotPlugin;
	root: Root | null = null;
	state = {
		feedback: 'Waiting for document changes...',
		isThinking: false,
		documentPreview: '',
		error: null as string | null
	};

	constructor(leaf: WorkspaceLeaf, plugin: ClaudeCopilotPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_CLAUDE_COPILOT;
	}

	getDisplayText() {
		return "Claude Copilot";
	}

	getIcon() {
		return "bot";
	}

	async onOpen() {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		
		this.root = createRoot(container);
		this.renderComponent();
		this.addStyles();
	}

	renderComponent() {
		if (!this.root) return;
		
		this.root.render(
			React.createElement(CopilotPanel, {
				feedback: this.state.feedback,
				isThinking: this.state.isThinking,
				documentPreview: this.state.documentPreview,
				error: this.state.error
			})
		);
	}

	updateState(updates: Partial<typeof this.state>) {
		this.state = { ...this.state, ...updates };
		this.renderComponent();
	}

	addStyles() {
		const styleEl = document.createElement("style");
		styleEl.textContent = `
			.claude-copilot-container {
				padding: 16px;
				height: 100%;
				overflow-y: auto;
			}
			
			.claude-feedback {
				margin: 16px 0;
				padding: 12px;
				background: var(--background-secondary);
				border-radius: 8px;
				min-height: 100px;
			}
			
			.placeholder-text {
				color: var(--text-muted);
				font-style: italic;
			}
			
			.debug-section {
				margin-top: 20px;
				border-top: 1px solid var(--background-modifier-border);
				padding-top: 12px;
			}
			
			.debug-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				cursor: pointer;
				user-select: none;
			}
			
			.debug-toggle {
				background: none;
				border: none;
				cursor: pointer;
				font-size: 12px;
				padding: 4px;
			}
			
			.debug-details {
				margin-top: 12px;
			}
			
			.document-preview, .error-log {
				margin: 12px 0;
			}
			
			.preview-content {
				background: var(--code-background);
				padding: 8px;
				border-radius: 4px;
				font-size: 12px;
				white-space: pre-wrap;
				word-wrap: break-word;
				max-height: 200px;
				overflow-y: auto;
			}
			
			.error-content {
				color: var(--text-error);
				font-size: 12px;
				padding: 8px;
				background: var(--background-primary);
				border-radius: 4px;
				margin-top: 8px;
			}
			
			.claude-thinking {
				animation: pulse 1.5s ease-in-out infinite;
			}
			
			@keyframes pulse {
				0% { opacity: 0.6; }
				50% { opacity: 1; }
				100% { opacity: 0.6; }
			}
		`;
		document.head.appendChild(styleEl);
	}

	updateDocumentPreview(content: string, cursorPos?: number) {
		let preview = content;
		if (cursorPos !== undefined && cursorPos >= 0 && cursorPos <= content.length) {
			const beforeCursor = content.substring(0, cursorPos);
			const afterCursor = content.substring(cursorPos);
			preview = beforeCursor + "<cursor/>" + afterCursor;
		}
		this.updateState({ documentPreview: preview });
	}

	updateFeedback(feedback: string) {
		this.updateState({ feedback, isThinking: false });
	}

	showThinking() {
		this.updateState({ isThinking: true });
	}

	showError(error: string) {
		this.updateState({ error });
		new Notice(`Claude Copilot Error: ${error.substring(0, 100)}...`);
	}

	clearError() {
		this.updateState({ error: null });
	}

	async onClose() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
	}
}

export default class ClaudeCopilotPlugin extends Plugin {
	settings: ClaudeCopilotSettings;
	copilotView: ClaudeCopilotView;
	debouncedUpdate: (content: string, cursorPos: number) => void;
	lastActiveEditor: Editor | null = null;

	async onload() {
		console.log("Claude Copilot: Starting plugin load...");
		try {
			await this.loadSettings();
			console.log("Claude Copilot: Settings loaded");
		
		this.registerView(
			VIEW_TYPE_CLAUDE_COPILOT,
			(leaf) => {
				this.copilotView = new ClaudeCopilotView(leaf, this);
				return this.copilotView;
			}
		);

		this.addRibbonIcon("bot", "Claude Copilot", () => {
			this.activateView();
		});

		this.addCommand({
			id: "open-claude-copilot",
			name: "Open Claude Copilot",
			callback: () => {
				this.activateView();
			}
		});

		this.addSettingTab(new ClaudeCopilotSettingTab(this.app, this));
		
		this.debouncedUpdate = debounce(
			this.queryClaudeForFeedback.bind(this),
			this.settings.debounceDelay,
			true
		);
		
		this.registerEvent(
			this.app.workspace.on("editor-change", (editor: Editor, info: MarkdownView) => {
				this.handleDocumentChange(editor, info);
			})
		);
		
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					this.lastActiveEditor = view.editor;
					this.handleDocumentChange(view.editor, view);
				}
			})
		);
		
			await this.ensurePromptFile();
			console.log("Claude Copilot: Prompt file ensured");
			
			this.app.workspace.onLayoutReady(() => {
				setTimeout(() => {
					this.activateView();
				}, 100);
			});
			console.log("Claude Copilot: Plugin loaded successfully");
		} catch (error) {
			console.error("Claude Copilot: Error during plugin load:", error);
			throw error;
		}
	}

	async activateView() {
		const { workspace } = this.app;
		
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_CLAUDE_COPILOT);
		
		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
			}
		}
		
		if (leaf) {
			await leaf.setViewState({
				type: VIEW_TYPE_CLAUDE_COPILOT,
				active: true,
			});
			workspace.revealLeaf(leaf);
		}
	}

	handleDocumentChange(editor: Editor, _view: MarkdownView) {
		if (!this.copilotView) return;
		
		const content = editor.getValue();
		const cursor = editor.getCursor();
		const cursorPos = editor.posToOffset(cursor);
		
		this.copilotView.updateDocumentPreview(content, cursorPos);
		
		if (this.settings.apiKey) {
			this.debouncedUpdate(content, cursorPos);
		} else {
			this.copilotView.updateFeedback("Please configure your Claude API key in settings.");
		}
	}

	async queryClaudeForFeedback(content: string, cursorPos: number) {
		if (!this.copilotView) return;
		
		this.copilotView.showThinking();
		this.copilotView.clearError();
		
		try {
			const promptTemplate = await this.loadPromptTemplate();
			
			let documentWithCursor = content;
			if (cursorPos >= 0 && cursorPos <= content.length) {
				documentWithCursor = content.substring(0, cursorPos) + "<cursor/>" + content.substring(cursorPos);
			}
			
			const prompt = promptTemplate.replace("{{doc}}", documentWithCursor);
			
			const requestBody = {
				model: this.settings.model,
				max_tokens: 500,
				messages: [
					{
						role: "user",
						content: prompt
					}
				]
			};
			
			// Log the curl command for debugging
			const curlCommand = `curl https://api.anthropic.com/v1/messages \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${this.settings.apiKey.substring(0, 10)}..." \\
  -H "anthropic-version: 2023-06-01" \\
  -d '${JSON.stringify(requestBody, null, 2)}'`;
			
			console.log("Claude API Request (as curl):", curlCommand);
			console.log("Full request body:", requestBody);
			
			const response = await requestUrl({
				url: "https://api.anthropic.com/v1/messages",
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": this.settings.apiKey,
					"anthropic-version": "2023-06-01"
				},
				body: JSON.stringify(requestBody)
			});
			
			if (response.status !== 200) {
				console.error("Claude API Error - Full Response:");
				console.error("Status:", response.status);
				console.error("Response Headers:", response.headers);
				console.error("Response Body (raw):", response.text);
				
				let errorData;
				try {
					errorData = JSON.parse(response.text);
					console.error("Response Body (parsed):", errorData);
				} catch {
					errorData = { error: { message: response.text } };
					console.error("Failed to parse response as JSON");
				}
				
				const errorMessage = errorData.error?.message || errorData.message || response.text || `API Error: ${response.status}`;
				throw new Error(`HTTP ${response.status}: ${errorMessage}`);
			}
			
			const data = JSON.parse(response.text);
			console.log("Claude API Success Response:", data);
			const feedback = data.content[0]?.text || "No feedback available";
			
			this.copilotView.updateFeedback(feedback);
			
		} catch (error) {
			console.error("Claude API Error:", error);
			let errorMessage = "Unknown error occurred";
			
			if (error instanceof Error) {
				errorMessage = error.message;
				if (error.message === "Failed to fetch") {
					errorMessage = "Failed to fetch - This could be a CORS issue. Check console for details.";
					console.error("Fetch failed - possible causes:");
					console.error("1. CORS blocking (Obsidian may need to whitelist api.anthropic.com)");
					console.error("2. Network connectivity issue");
					console.error("3. Invalid API endpoint");
				}
			}
			
			this.copilotView.showError(errorMessage);
			this.copilotView.updateFeedback("Error getting feedback from Claude. Check debug section for details.");
		}
	}

	async loadPromptTemplate(): Promise<string> {
		const promptPath = ".claude_copilot/prompt.md";
		const promptFile = this.app.vault.getAbstractFileByPath(promptPath);
		
		if (promptFile instanceof TFile) {
			try {
				const content = await this.app.vault.read(promptFile);
				return content;
			} catch (error) {
				console.error("Error reading prompt file:", error);
			}
		}
		
		return this.settings.promptTemplate;
	}

	async ensurePromptFile() {
		try {
			const folderPath = ".claude_copilot";
			const promptPath = ".claude_copilot/prompt.md";
			
			const folder = this.app.vault.getAbstractFileByPath(folderPath);
			if (!folder) {
				await this.app.vault.createFolder(folderPath);
			}
			
			const promptFile = this.app.vault.getAbstractFileByPath(promptPath);
			if (!promptFile) {
				await this.app.vault.create(promptPath, this.settings.promptTemplate);
			}
		} catch (error) {
			console.error("Claude Copilot: Error ensuring prompt file:", error);
		}
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_CLAUDE_COPILOT);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		
		// Re-create debounced function if delay changed
		if (this.debouncedUpdate) {
			this.debouncedUpdate = debounce(
				this.queryClaudeForFeedback.bind(this),
				this.settings.debounceDelay,
				true
			);
		}
	}
}

