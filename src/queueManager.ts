import { App, TFile } from "obsidian";
import {
	QueueData,
	NoteEntry,
	LegacyNoteEntry,
	CardStats,
	IntervalPreviews,
	DEFAULT_PRIORITY,
	Priority,
} from "./types";
import { fsrs, createEmptyCard, Rating, Card } from "ts-fsrs";

const QUEUE_FILE_PATH = "queue.md";

export class QueueManager {
	private cachedQueue: QueueData | null = null;
	private cacheTimestamp = 0;
	private readonly CACHE_TTL_MS = 1000; // 1 second cache
	// FSRS instance with parameters optimized for incremental reading
	private fsrs = fsrs({
		request_retention: 0.85, // Lower retention for reading comprehension vs rote memorization
		maximum_interval: 365, // Max 1 year - reading material can become outdated
		enable_fuzz: true, // Distribute reviews more evenly across days
		enable_short_term: true, // Better for initial learning phase
	});

	constructor(private app: App) {}

	async loadQueue(allowCache = false): Promise<QueueData> {
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
			const notes = parsed.notes.map(
				(note: NoteEntry | LegacyNoteEntry) =>
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
	 * Also ensures priority field exists with default value.
	 */
	private migrateNoteIfNeeded(note: NoteEntry | LegacyNoteEntry): NoteEntry {
		// Check if it's already in new format (has fsrsCard)
		if ("fsrsCard" in note) {
			// Ensure priority field exists
			if (note.priority === undefined) {
				note.priority = DEFAULT_PRIORITY;
			}
			return note;
		}

		// Legacy format - convert to FSRS
		console.log(`Migrating note ${note.path} from legacy format to FSRS`);

		// Create a new FSRS card
		const card = createEmptyCard(new Date(note.dueDate));

		return {
			path: note.path,
			fsrsCard: card,
			priority: DEFAULT_PRIORITY,
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
	async getDueNotes(allowCache = false): Promise<NoteEntry[]> {
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
		allowCache = false,
	): Promise<{ due: number; total: number }> {
		const queue = await this.loadQueue(allowCache);
		const dueNow = await this.getDueNotes(allowCache);

		return {
			due: dueNow.length,
			total: queue.notes.length,
		};
	}

	async addToQueue(path: string, daysUntilDue = 0): Promise<void> {
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
			priority: DEFAULT_PRIORITY,
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

		// Store the review log before updating the card
		const reviewLog = schedulingInfo[rating].log;
		if (!note.reviewLogs) {
			note.reviewLogs = [];
		}
		note.reviewLogs.push(reviewLog);

		// Update the card with the new scheduling info
		note.fsrsCard = schedulingInfo[rating].card;

		await this.saveQueue(queue);

		// Return the new due date
		return new Date(note.fsrsCard.due);
	}

	/**
	 * Get statistics for a specific note's card.
	 */
	getCardStats(card: Card): CardStats {
		return {
			stability: Math.round(card.stability * 10) / 10, // Round to 1 decimal
			difficulty: Math.round(card.difficulty * 10) / 10,
			reps: card.reps,
			lapses: card.lapses,
			state: card.state,
		};
	}

	/**
	 * Preview what the next intervals would be for each rating.
	 * Returns intervals in a human-readable format.
	 */
	previewIntervals(card: Card): IntervalPreviews {
		const now = new Date();
		const schedulingInfo = this.fsrs.repeat(card, now);

		const formatInterval = (dueDate: Date): string => {
			const diffMs = dueDate.getTime() - now.getTime();
			const diffMins = Math.round(diffMs / (1000 * 60));
			const diffHours = Math.round(diffMs / (1000 * 60 * 60));
			const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

			if (diffMins < 1) {
				return "now";
			} else if (diffMins < 60) {
				return `${diffMins}m`;
			} else if (diffHours < 24) {
				return `${diffHours}h`;
			} else if (diffDays === 1) {
				return "1d";
			} else {
				return `${diffDays}d`;
			}
		};

		return {
			[Rating.Again]: formatInterval(
				schedulingInfo[Rating.Again].card.due,
			),
			[Rating.Hard]: formatInterval(schedulingInfo[Rating.Hard].card.due),
			[Rating.Good]: formatInterval(schedulingInfo[Rating.Good].card.due),
			[Rating.Easy]: formatInterval(schedulingInfo[Rating.Easy].card.due),
		};
	}

	/**
	 * Reset a card back to "new" state (useful when note content changes significantly).
	 */
	async forgetCard(path: string): Promise<boolean> {
		const queue = await this.loadQueue();
		const noteIndex = queue.notes.findIndex((n) => n.path === path);

		if (noteIndex < 0) {
			return false;
		}

		const note = queue.notes[noteIndex];

		// Create a new empty card (resets all progress)
		note.fsrsCard = createEmptyCard(new Date());

		// Clear review logs (or keep them for analytics - user preference)
		// For now, we'll keep the logs for history
		// note.reviewLogs = [];

		await this.saveQueue(queue);
		return true;
	}

	/**
	 * Update the priority of a note in the queue.
	 */
	async updatePriority(path: string, priority: Priority): Promise<boolean> {
		const queue = await this.loadQueue();
		const noteIndex = queue.notes.findIndex((n) => n.path === path);

		if (noteIndex < 0) {
			return false;
		}

		queue.notes[noteIndex].priority = priority;
		await this.saveQueue(queue);
		return true;
	}

	/**
	 * Check if a note is in the queue.
	 * @param path The path of the note to check
	 * @param allowCache If true, may use cached data
	 */
	async isNoteInQueue(path: string, allowCache = true): Promise<boolean> {
		const queue = await this.loadQueue(allowCache);
		return queue.notes.some((n) => n.path === path);
	}
}
