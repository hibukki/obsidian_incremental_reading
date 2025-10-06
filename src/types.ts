import { Card } from "ts-fsrs";

export interface NoteEntry {
	path: string;
	// FSRS card data (tracks scheduling, difficulty, stability)
	fsrsCard: Card;
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
