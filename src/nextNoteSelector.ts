import { QueueData, NoteEntry } from "./types";

/**
 * Selects the next note to read based on spaced repetition:
 * - Only shows notes that are due today or earlier
 * - Returns null if no notes are due (user is done for today)
 * - Does NOT automatically add new notes to queue
 */
export function selectNextNote(queue: QueueData): string | null {
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

	// Filter notes that are due (dueDate is today or in the past)
	const dueNotes = queue.notes.filter((note) => {
		const dueDate = new Date(note.dueDate);
		return dueDate <= todayEnd;
	});

	if (dueNotes.length === 0) {
		return null; // No notes due today
	}

	// Sort by due date (oldest first) and return the most overdue note
	dueNotes.sort(
		(a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
	);

	return dueNotes[0].path;
}
