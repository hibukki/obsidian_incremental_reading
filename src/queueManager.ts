import { App, TFile } from "obsidian";
import { QueueData, NoteEntry, LegacyNoteEntry } from "./types";
import { fsrs, createEmptyCard, Rating, Card } from "ts-fsrs";

const QUEUE_FILE_PATH = "queue.md";

export class QueueManager {
	private cachedQueue: QueueData | null = null;
	private cacheTimestamp: number = 0;
	private readonly CACHE_TTL_MS = 1000; // 1 second cache
	private fsrs = fsrs(); // FSRS instance

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

			// Check if we need to migrate from legacy format
			const notes = parsed.notes.map((note: any) =>
				this.migrateNoteIfNeeded(note),
			);

			const queue = { notes };
			this.updateCache(queue);
			return queue;
		} catch (error) {
			console.error("Failed to parse queue.md:", error);
			const emptyQueue = { notes: [] };
			this.updateCache(emptyQueue);
			return emptyQueue;
		}
	}

	/**
	 * Migrate legacy note format to FSRS format if needed.
	 */
	private migrateNoteIfNeeded(note: any): NoteEntry {
		// Check if it's already in new format (has fsrsCard)
		if (note.fsrsCard) {
			return note as NoteEntry;
		}

		// Legacy format - convert to FSRS
		const legacyNote = note as LegacyNoteEntry;
		console.log(
			`Migrating note ${legacyNote.path} from legacy format to FSRS`,
		);

		// Create a new FSRS card
		const card = createEmptyCard(new Date(legacyNote.dueDate));

		return {
			path: legacyNote.path,
			fsrsCard: card,
		};
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
	 * Get notes that are due now or earlier.
	 * @param allowCache If true, may return cached data (for UI display).
	 *                   If false, always loads fresh data (for decision-making).
	 */
	async getDueNotes(allowCache: boolean = false): Promise<NoteEntry[]> {
		const queue = await this.loadQueue(allowCache);
		const now = new Date();

		return queue.notes.filter((note) => {
			const dueDate = new Date(note.fsrsCard.due);
			return dueDate <= now;
		});
	}

	/**
	 * Get queue statistics.
	 * @param allowCache If true, may return cached data (for UI display).
	 *                   If false, always loads fresh data (for accuracy).
	 */
	async getQueueStats(
		allowCache: boolean = false,
	): Promise<{ due: number; total: number }> {
		const queue = await this.loadQueue(allowCache);
		const due = await this.getDueNotes(allowCache);

		return {
			due: due.length,
			total: queue.notes.length,
		};
	}

	async addToQueue(path: string, daysUntilDue: number = 0): Promise<void> {
		const queue = await this.loadQueue();

		// Check if already in queue
		const existingIndex = queue.notes.findIndex((n) => n.path === path);
		if (existingIndex >= 0) {
			// Already in queue, don't add again
			return;
		}

		// Create a new FSRS card with the specified due date
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + daysUntilDue);
		const card = createEmptyCard(dueDate);

		queue.notes.push({
			path,
			fsrsCard: card,
		});

		await this.saveQueue(queue);
	}

	async scheduleNext(path: string, rating: Rating): Promise<Date | null> {
		const queue = await this.loadQueue();
		const noteIndex = queue.notes.findIndex((n) => n.path === path);

		if (noteIndex < 0) {
			// Note not in queue, shouldn't happen
			return null;
		}

		const note = queue.notes[noteIndex];

		// Use FSRS to schedule the next review
		const now = new Date();
		const schedulingInfo = this.fsrs.repeat(note.fsrsCard, now);

		// Update the card with the new scheduling info
		note.fsrsCard = schedulingInfo[rating].card;

		await this.saveQueue(queue);

		// Return the new due date
		return new Date(note.fsrsCard.due);
	}
}
