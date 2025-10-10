import { Card, ReviewLog, Rating } from "ts-fsrs";

// Priority levels for queue items
export enum Priority {
	High = 0,
	Normal = 1,
	Low = 2,
}

// Default priority for new queue items
export const DEFAULT_PRIORITY = Priority.Normal;

export interface NoteEntry {
	path: string;
	// FSRS card data (tracks scheduling, difficulty, stability)
	fsrsCard: Card;
	// Review history for analytics and undo functionality
	reviewLogs?: ReviewLog[];
	// Priority level (0=high, 1=normal, 2=low)
	priority?: Priority;
}

export interface QueueData {
	notes: NoteEntry[];
}

// Legacy format (for migration)
export interface LegacyNoteEntry {
	path: string;
	dueDate: string;
	intervalDays: number;
}

// Card statistics for UI display
export interface CardStats {
	stability: number;
	difficulty: number;
	reps: number;
	lapses: number;
	state: number;
}

// Interval previews for each rating option
export interface IntervalPreviews {
	[Rating.Again]: string;
	[Rating.Hard]: string;
	[Rating.Good]: string;
	[Rating.Easy]: string;
}
