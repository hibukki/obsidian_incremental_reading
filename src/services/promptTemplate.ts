import { App, TFile } from "obsidian";
import { CLAUDE_COPILOT_FOLDER, CLAUDE_COPILOT_PROMPT_FILE } from "../consts";
import defaultPromptTemplate from "../templates/default_prompt.md";

export function getDefaultPromptTemplate(): string {
	return defaultPromptTemplate;
}

export async function getPromptTemplate(app: App): Promise<string> {
	await ensurePromptFile(app);

	const promptPath = CLAUDE_COPILOT_PROMPT_FILE;
	const promptFile = app.vault.getAbstractFileByPath(promptPath);

	if (!(promptFile instanceof TFile)) {
		throw new Error(`Prompt file not found: ${promptPath}`);
	}

	try {
		const content = await app.vault.read(promptFile);
		return content;
	} catch (error) {
		throw new Error(`Error reading prompt file: ${error}`);
	}
}

export async function restoreDefaultPrompt(app: App): Promise<void> {
	try {
		await ensurePromptFile(app);
		const promptPath = CLAUDE_COPILOT_PROMPT_FILE;
		const defaultContent = getDefaultPromptTemplate();

		// Overwrite the existing file with default content
		await app.vault.adapter.write(promptPath, defaultContent);
	} catch (error) {
		console.error("Claude Copilot: Error restoring default prompt:", error);
		throw error;
	}
}

export async function openPromptFile(app: App): Promise<void> {
	try {
		await ensurePromptFile(app);
		const promptPath = CLAUDE_COPILOT_PROMPT_FILE;

		// Open the file in Obsidian
		await app.workspace.openLinkText(promptPath, "", false);
	} catch (error) {
		console.error("Claude Copilot: Error opening prompt file:", error);
		throw error;
	}
}

async function ensurePromptFile(app: App): Promise<void> {
	try {
		const folderPath = CLAUDE_COPILOT_FOLDER;
		const promptPath = CLAUDE_COPILOT_PROMPT_FILE;

		const folder = app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await app.vault.createFolder(folderPath);
		}

		const promptFile = app.vault.getAbstractFileByPath(promptPath);
		if (!promptFile) {
			const defaultContent = getDefaultPromptTemplate();
			await app.vault.create(promptPath, defaultContent);
		}
	} catch (error) {
		console.error("Claude Copilot: Error ensuring prompt file:", error);
		throw error;
	}
}
