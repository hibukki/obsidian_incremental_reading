export interface NoteEntry {
	path: string;
	dueDate: string; // ISO datetime - when the note should be reviewed next
	intervalDays: number; // Number of days to wait before next review (for spaced repetition)
}

export interface QueueData {
	notes: NoteEntry[];
}
