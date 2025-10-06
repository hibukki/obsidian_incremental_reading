import { selectNextNote } from "./nextNoteSelector";
import { QueueData } from "./types";

function test(name: string, fn: () => void) {
	try {
		fn();
		console.log(`✓ ${name}`);
	} catch (error) {
		console.error(`✗ ${name}`);
		console.error(error);
	}
}

function assertEquals(actual: any, expected: any, message?: string) {
	if (actual !== expected) {
		throw new Error(
			`${message || "Assertion failed"}: expected ${expected}, got ${actual}`,
		);
	}
}

function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

// Test: Returns null when queue is empty
test("returns null when queue is empty", () => {
	const queue: QueueData = { notes: [] };
	const next = selectNextNote(queue);
	assertEquals(next, null, "Should return null when queue is empty");
});

// Test: Returns note due today
test("returns note due today", () => {
	const today = new Date();
	const queue: QueueData = {
		notes: [
			{
				path: "due-today.md",
				dueDate: today.toISOString(),
				intervalDays: 1,
			},
		],
	};

	const next = selectNextNote(queue);
	assertEquals(next, "due-today.md", "Should return note due today");
});

// Test: Returns overdue note
test("returns overdue note", () => {
	const yesterday = addDays(new Date(), -1);
	const queue: QueueData = {
		notes: [
			{
				path: "overdue.md",
				dueDate: yesterday.toISOString(),
				intervalDays: 1,
			},
		],
	};

	const next = selectNextNote(queue);
	assertEquals(next, "overdue.md", "Should return overdue note");
});

// Test: Does NOT return future notes
test("does not return future notes", () => {
	const tomorrow = addDays(new Date(), 1);
	const queue: QueueData = {
		notes: [
			{
				path: "future.md",
				dueDate: tomorrow.toISOString(),
				intervalDays: 1,
			},
		],
	};

	const next = selectNextNote(queue);
	assertEquals(next, null, "Should not return future notes");
});

// Test: Returns most overdue note when multiple are due
test("returns most overdue note first", () => {
	const threeDaysAgo = addDays(new Date(), -3);
	const oneDayAgo = addDays(new Date(), -1);

	const queue: QueueData = {
		notes: [
			{
				path: "recent-overdue.md",
				dueDate: oneDayAgo.toISOString(),
				intervalDays: 1,
			},
			{
				path: "very-overdue.md",
				dueDate: threeDaysAgo.toISOString(),
				intervalDays: 1,
			},
		],
	};

	const next = selectNextNote(queue);
	assertEquals(
		next,
		"very-overdue.md",
		"Should return most overdue note first",
	);
});

// Test: Returns null when all notes are scheduled for future
test("returns null when all notes are in future", () => {
	const tomorrow = addDays(new Date(), 1);
	const nextWeek = addDays(new Date(), 7);

	const queue: QueueData = {
		notes: [
			{
				path: "future1.md",
				dueDate: tomorrow.toISOString(),
				intervalDays: 1,
			},
			{
				path: "future2.md",
				dueDate: nextWeek.toISOString(),
				intervalDays: 7,
			},
		],
	};

	const next = selectNextNote(queue);
	assertEquals(
		next,
		null,
		"Should return null when all notes are in future (done for today)",
	);
});

// Run all tests
console.log("\nRunning nextNoteSelector tests...\n");
