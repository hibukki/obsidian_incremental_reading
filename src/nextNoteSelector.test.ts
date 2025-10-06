import { describe, it, expect } from "vitest";
import { createEmptyCard } from "ts-fsrs";
import { selectNextNote } from "./nextNoteSelector";
import { NoteEntry } from "./types";

// Helper function to add/subtract days from a date
function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

// Helper to create a note entry with a specific due date
function createNote(path: string, dueDate: Date): NoteEntry {
	return {
		path,
		fsrsCard: createEmptyCard(dueDate),
	};
}

describe("selectNextNote", () => {
	describe("empty queue", () => {
		it("returns null when no notes provided", () => {
			expect(selectNextNote([])).toBe(null);
		});
	});

	describe("single note scheduling", () => {
		it("returns note due today", () => {
			const today = new Date();
			const notes = [createNote("due-today.md", today)];

			expect(selectNextNote(notes)).toBe("due-today.md");
		});

		it("returns overdue note", () => {
			const yesterday = addDays(new Date(), -1);
			const notes = [createNote("overdue.md", yesterday)];

			expect(selectNextNote(notes)).toBe("overdue.md");
		});

		it("returns future note (if provided in due list)", () => {
			const tomorrow = addDays(new Date(), 1);
			const notes = [createNote("future.md", tomorrow)];

			// The function just sorts - filtering is done by caller
			expect(selectNextNote(notes)).toBe("future.md");
		});
	});

	describe("multiple notes prioritization", () => {
		it("returns most overdue note first", () => {
			const threeDaysAgo = addDays(new Date(), -3);
			const oneDayAgo = addDays(new Date(), -1);

			const notes = [
				createNote("recent-overdue.md", oneDayAgo),
				createNote("very-overdue.md", threeDaysAgo),
			];

			expect(selectNextNote(notes)).toBe("very-overdue.md");
		});

		it("handles mixed due dates correctly", () => {
			const threeDaysAgo = addDays(new Date(), -3);
			const tomorrow = addDays(new Date(), 1);
			const today = new Date();

			const notes = [
				createNote("future.md", tomorrow),
				createNote("very-overdue.md", threeDaysAgo),
				createNote("due-today.md", today),
			];

			expect(selectNextNote(notes)).toBe("very-overdue.md");
		});
	});
});
