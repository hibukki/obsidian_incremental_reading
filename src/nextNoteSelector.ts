import { NoteEntry } from "./types";

/**
 * Selects the next note to read based on spaced repetition.
 * Takes a list of due notes (already filtered) and returns the most overdue one.
 * Returns null if no notes are provided.
 */
export function selectNextNote(dueNotes: NoteEntry[]): string | null {
	if (dueNotes.length === 0) {
		return null; // No notes due today
	}

	// Sort by due date (oldest first) and return the most overdue note
	const sorted = [...dueNotes].sort(
		(a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
	);

	return sorted[0].path;
}
