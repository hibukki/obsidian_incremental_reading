import { App, TFile } from "obsidian";
import { CLAUDE_COPILOT_FOLDER, CLAUDE_COPILOT_PROMPT_FILE } from "../consts";

const DEFAULT_PROMPT_TEMPLATE = `Please see what the user is writing, try inferring their intent, and suggest one short thing for them, which will be presented for them on a sidebar in Obsidian. Here is the current user document, with <cursor/> marking their current cursor, so you can see what specifically they are working on right now. Below is their open doc:

{{doc}}`;

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
			await app.vault.create(promptPath, DEFAULT_PROMPT_TEMPLATE);
		}
	} catch (error) {
		console.error("Claude Copilot: Error ensuring prompt file:", error);
		throw error;
	}
}
