import { NoteEntry, DEFAULT_PRIORITY } from "./types";

/**
 * Selects the next note to read based on priority first, then spaced repetition.
 * Takes a list of due notes (already filtered) and returns the highest priority,
 * most overdue note.
 * Returns null if no notes are provided.
 */
export function selectNextNote(dueNotes: NoteEntry[]): string | null {
	if (dueNotes.length === 0) {
		return null; // No notes due today
	}

	// Sort by priority first (lower number = higher priority),
	// then by due date (oldest first)
	const sorted = [...dueNotes].sort((a, b) => {
		const priorityA = a.priority ?? DEFAULT_PRIORITY;
		const priorityB = b.priority ?? DEFAULT_PRIORITY;

		// First compare by priority
		if (priorityA !== priorityB) {
			return priorityA - priorityB;
		}

		// If same priority, compare by due date (oldest first)
		return (
			new Date(a.fsrsCard.due).getTime() -
			new Date(b.fsrsCard.due).getTime()
		);
	});

	return sorted[0].path;
}
