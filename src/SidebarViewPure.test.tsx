import React from "react";
import { render } from "@testing-library/react";
import { Rating, State } from "ts-fsrs";
import { SidebarViewPure, SidebarViewPureProps } from "./SidebarViewPure";
import { Priority } from "./types";

// Mock handlers
const mockHandlers = {
	onShowNext: jest.fn(),
	onAddToQueue: jest.fn(),
	onShowQueue: jest.fn(),
	onMarkAgain: jest.fn(),
	onMarkHard: jest.fn(),
	onMarkGood: jest.fn(),
	onMarkEasy: jest.fn(),
	onSetPriority: jest.fn(),
};

describe("SidebarViewPure", () => {
	describe("Snapshot Tests", () => {
		test("renders correctly when there are due notes and user is reviewing one", () => {
			const props: SidebarViewPureProps = {
				dueCount: 5,
				totalCount: 25,
				status: "",
				statusHappy: false,
				showDifficultyButtons: true,
				cardStats: {
					stability: 3.5,
					difficulty: 6.2,
					reps: 4,
					lapses: 1,
					state: State.Review,
				},
				intervalPreviews: {
					[Rating.Again]: "10m",
					[Rating.Hard]: "2h",
					[Rating.Good]: "1d",
					[Rating.Easy]: "3d",
				},
				currentPriority: Priority.Normal,
				isCurrentNoteInQueue: true,
				currentNoteName: "test-note",
				currentNoteDueDate: new Date(Date.now() - 3600000), // Due 1 hour ago
				...mockHandlers,
			};

			const { container } = render(<SidebarViewPure {...props} />);
			expect(container).toMatchSnapshot();
		});

		test("renders correctly when there are no notes to review", () => {
			const props: SidebarViewPureProps = {
				dueCount: 0,
				totalCount: 15,
				status: "🎉 Done for today! All caught up!",
				statusHappy: true,
				showDifficultyButtons: false,
				cardStats: null,
				intervalPreviews: null,
				currentPriority: Priority.Normal,
				isCurrentNoteInQueue: false,
				currentNoteName: "test-note",
				currentNoteDueDate: null,
				...mockHandlers,
			};

			const { container } = render(<SidebarViewPure {...props} />);
			expect(container).toMatchSnapshot();
		});
	});

	describe("Additional Scenarios", () => {
		test("renders correctly when there are notes due later today", () => {
			const props: SidebarViewPureProps = {
				dueCount: 0,
				totalCount: 20,
				status: "",
				statusHappy: false,
				showDifficultyButtons: false,
				cardStats: null,
				intervalPreviews: null,
				currentPriority: Priority.Normal,
				isCurrentNoteInQueue: false,
				currentNoteName: null,
				currentNoteDueDate: null,
				...mockHandlers,
			};

			const { container } = render(<SidebarViewPure {...props} />);
			expect(container).toMatchSnapshot();
		});

		test("renders correctly with status message after rating", () => {
			const props: SidebarViewPureProps = {
				dueCount: 3,
				totalCount: 18,
				status: "Scheduled for 2 hours",
				statusHappy: false,
				showDifficultyButtons: false,
				cardStats: null,
				intervalPreviews: null,
				currentPriority: Priority.Normal,
				isCurrentNoteInQueue: false,
				currentNoteName: "test-note",
				currentNoteDueDate: null,
				...mockHandlers,
			};

			const { container } = render(<SidebarViewPure {...props} />);
			expect(container).toMatchSnapshot();
		});

		test("renders correctly when current note is in queue (not reviewing)", () => {
			const props: SidebarViewPureProps = {
				dueCount: 5,
				totalCount: 20,
				status: "",
				statusHappy: false,
				showDifficultyButtons: false,
				cardStats: null,
				intervalPreviews: null,
				currentPriority: Priority.Normal,
				isCurrentNoteInQueue: true,
				currentNoteName: "queued-note",
				currentNoteDueDate: new Date(Date.now() + 86400000 * 5), // Due in 5 days
				...mockHandlers,
			};

			const { container } = render(<SidebarViewPure {...props} />);
			expect(container).toMatchSnapshot();
		});

		test("renders correctly when current note is not in queue (not reviewing)", () => {
			const props: SidebarViewPureProps = {
				dueCount: 5,
				totalCount: 20,
				status: "",
				statusHappy: false,
				showDifficultyButtons: false,
				cardStats: null,
				intervalPreviews: null,
				currentPriority: Priority.Normal,
				isCurrentNoteInQueue: false,
				currentNoteName: "not-queued-note",
				currentNoteDueDate: null,
				...mockHandlers,
			};

			const { container } = render(<SidebarViewPure {...props} />);
			expect(container).toMatchSnapshot();
		});
	});
});
