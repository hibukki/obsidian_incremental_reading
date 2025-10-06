import { App, TFile } from "obsidian";
import { QueueData, NoteEntry } from "./types";

const QUEUE_FILE_PATH = "queue.md";

function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

export class QueueManager {
	private cachedQueue: QueueData | null = null;
	private cacheTimestamp: number = 0;
	private readonly CACHE_TTL_MS = 1000; // 1 second cache

	constructor(private app: App) {}

	async loadQueue(allowCache: boolean = false): Promise<QueueData> {
		// Check if we can use cache
		if (allowCache && this.cachedQueue) {
			const now = Date.now();
			if (now - this.cacheTimestamp < this.CACHE_TTL_MS) {
				return this.cachedQueue;
			}
		}

		// Load fresh data
		const file = this.app.vault.getAbstractFileByPath(QUEUE_FILE_PATH);

		if (!file || !(file instanceof TFile)) {
			// Return empty queue if file doesn't exist
			const emptyQueue = { notes: [] };
			this.updateCache(emptyQueue);
			return emptyQueue;
		}

		const content = await this.app.vault.read(file);

		try {
			const parsed = JSON.parse(content);
			// Basic validation
			if (!parsed || !Array.isArray(parsed.notes)) {
				throw new Error("Invalid queue format");
			}
			const queue = parsed as QueueData;
			this.updateCache(queue);
			return queue;
		} catch (error) {
			console.error("Failed to parse queue.md:", error);
			const emptyQueue = { notes: [] };
			this.updateCache(emptyQueue);
			return emptyQueue;
		}
	}

	private updateCache(queue: QueueData): void {
		this.cachedQueue = queue;
		this.cacheTimestamp = Date.now();
	}

	invalidateCache(): void {
		this.cachedQueue = null;
		this.cacheTimestamp = 0;
	}

	async saveQueue(data: QueueData): Promise<void> {
		const content = JSON.stringify(data, null, 2);
		const file = this.app.vault.getAbstractFileByPath(QUEUE_FILE_PATH);

		if (file instanceof TFile) {
			await this.app.vault.modify(file, content);
		} else {
			await this.app.vault.create(QUEUE_FILE_PATH, content);
		}

		// Invalidate cache after save
		this.invalidateCache();
	}

	/**
	 * Get notes that are due today or earlier.
	 * @param allowCache If true, may return cached data (for UI display).
	 *                   If false, always loads fresh data (for decision-making).
	 */
	async getDueNotes(allowCache: boolean = false): Promise<NoteEntry[]> {
		const queue = await this.loadQueue(allowCache);
		const now = new Date();
		const todayEnd = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			23,
			59,
			59,
			999,
		);

		return queue.notes.filter((note) => {
			const dueDate = new Date(note.dueDate);
			return dueDate <= todayEnd;
		});
	}

	/**
	 * Get queue statistics.
	 * @param allowCache If true, may return cached data (for UI display).
	 *                   If false, always loads fresh data (for accuracy).
	 */
	async getQueueStats(
		allowCache: boolean = false,
	): Promise<{ dueToday: number; total: number }> {
		const queue = await this.loadQueue(allowCache);
		const dueNotes = await this.getDueNotes(allowCache);

		return {
			dueToday: dueNotes.length,
			total: queue.notes.length,
		};
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
