import { App, TFile } from "obsidian";
import { QueueData, NoteEntry } from "./types";

const QUEUE_FILE_PATH = "queue.md";

function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

export class QueueManager {
	constructor(private app: App) {}

	async loadQueue(): Promise<QueueData> {
		const file = this.app.vault.getAbstractFileByPath(QUEUE_FILE_PATH);

		if (!file || !(file instanceof TFile)) {
			// Return empty queue if file doesn't exist
			return { notes: [] };
		}

		const content = await this.app.vault.read(file);

		try {
			const parsed = JSON.parse(content);
			// Basic validation
			if (!parsed || !Array.isArray(parsed.notes)) {
				throw new Error("Invalid queue format");
			}
			return parsed as QueueData;
		} catch (error) {
			console.error("Failed to parse queue.md:", error);
			return { notes: [] };
		}
	}

	async saveQueue(data: QueueData): Promise<void> {
		const content = JSON.stringify(data, null, 2);
		const file = this.app.vault.getAbstractFileByPath(QUEUE_FILE_PATH);

		if (file instanceof TFile) {
			await this.app.vault.modify(file, content);
		} else {
			await this.app.vault.create(QUEUE_FILE_PATH, content);
		}
	}

	async addToQueue(path: string, daysUntilDue: number = 1): Promise<void> {
		const queue = await this.loadQueue();

		// Check if already in queue
		const existingIndex = queue.notes.findIndex((n) => n.path === path);
		if (existingIndex >= 0) {
			// Already in queue, don't add again
			return;
		}

		const dueDate = addDays(new Date(), daysUntilDue);
		queue.notes.push({
			path,
			dueDate: dueDate.toISOString(),
			intervalDays: daysUntilDue,
		});

		await this.saveQueue(queue);
	}

	async scheduleNext(
		path: string,
		difficulty: "easy" | "hard",
	): Promise<void> {
		const queue = await this.loadQueue();
		const noteIndex = queue.notes.findIndex((n) => n.path === path);

		if (noteIndex < 0) {
			// Note not in queue, shouldn't happen
			return;
		}

		const note = queue.notes[noteIndex];

		if (difficulty === "hard") {
			// Hard: reset to 1 day
			note.intervalDays = 1;
		} else {
			// Easy: double the interval
			note.intervalDays = note.intervalDays * 2;
		}

		// Schedule for the future
		const dueDate = addDays(new Date(), note.intervalDays);
		note.dueDate = dueDate.toISOString();

		await this.saveQueue(queue);
	}
}
