import { Card, ReviewLog } from "ts-fsrs";

export interface NoteEntry {
	path: string;
	// FSRS card data (tracks scheduling, difficulty, stability)
	fsrsCard: Card;
	// Review history for analytics and undo functionality
	reviewLogs?: ReviewLog[];
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
