// Using Jest instead of Vitest
import { createEmptyCard } from "ts-fsrs";
import { selectNextNote } from "./nextNoteSelector";
import { NoteEntry, Priority } from "./types";

// Helper function to add/subtract days from a date
function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

// Helper to create a note entry with a specific due date
function createNote(
	path: string,
	dueDate: Date,
	priority?: Priority,
): NoteEntry {
	return {
		path,
		fsrsCard: createEmptyCard(dueDate),
		priority,
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

	describe("priority-based selection", () => {
		it("selects high priority over normal priority", () => {
			const today = new Date();
			const notes = [
				createNote("normal.md", today, Priority.Normal),
				createNote("high.md", today, Priority.High),
			];

			expect(selectNextNote(notes)).toBe("high.md");
		});

		it("selects high priority over low priority", () => {
			const today = new Date();
			const notes = [
				createNote("low.md", today, Priority.Low),
				createNote("high.md", today, Priority.High),
			];

			expect(selectNextNote(notes)).toBe("high.md");
		});

		it("selects normal priority over low priority", () => {
			const today = new Date();
			const notes = [
				createNote("low.md", today, Priority.Low),
				createNote("normal.md", today, Priority.Normal),
			];

			expect(selectNextNote(notes)).toBe("normal.md");
		});

		it("prioritizes high priority even if less overdue", () => {
			const threeDaysAgo = addDays(new Date(), -3);
			const today = new Date();

			const notes = [
				createNote("very-overdue-low.md", threeDaysAgo, Priority.Low),
				createNote("high-priority-today.md", today, Priority.High),
			];

			expect(selectNextNote(notes)).toBe("high-priority-today.md");
		});

		it("uses due date as tiebreaker for same priority", () => {
			const threeDaysAgo = addDays(new Date(), -3);
			const oneDayAgo = addDays(new Date(), -1);

			const notes = [
				createNote("recent-high.md", oneDayAgo, Priority.High),
				createNote("very-overdue-high.md", threeDaysAgo, Priority.High),
			];

			expect(selectNextNote(notes)).toBe("very-overdue-high.md");
		});

		it("handles mixed priorities correctly", () => {
			const threeDaysAgo = addDays(new Date(), -3);
			const yesterday = addDays(new Date(), -1);
			const today = new Date();

			const notes = [
				createNote("very-overdue-low.md", threeDaysAgo, Priority.Low),
				createNote("recent-normal.md", yesterday, Priority.Normal),
				createNote("today-high.md", today, Priority.High),
			];

			// Should pick high priority first, regardless of due date
			expect(selectNextNote(notes)).toBe("today-high.md");
		});

		it("treats undefined priority as Normal", () => {
			const today = new Date();
			const notes = [
				createNote("no-priority.md", today), // undefined priority
				createNote("low-priority.md", today, Priority.Low),
			];

			// undefined should be treated as Normal, which is higher than Low
			expect(selectNextNote(notes)).toBe("no-priority.md");
		});
	});
});
