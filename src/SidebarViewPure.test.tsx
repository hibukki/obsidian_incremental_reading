import React from "react";
import { render } from "@testing-library/react";
import { Rating, State } from "ts-fsrs";
import { SidebarViewPure, SidebarViewPureProps } from "./SidebarViewPure";

// Mock handlers
const mockHandlers = {
	onShowNext: jest.fn(),
	onAddToQueue: jest.fn(),
	onShowQueue: jest.fn(),
	onMarkAgain: jest.fn(),
	onMarkHard: jest.fn(),
	onMarkGood: jest.fn(),
	onMarkEasy: jest.fn(),
};

describe("SidebarViewPure", () => {
	describe("Snapshot Tests", () => {
		test("renders correctly when there are due notes and user is reviewing one", () => {
			const props: SidebarViewPureProps = {
				dueNowCount: 5,
				dueTodayCount: 12,
				totalCount: 25,
				status: "How was this note? (Use commands or click below)",
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
				...mockHandlers,
			};

			const { container } = render(<SidebarViewPure {...props} />);
			expect(container).toMatchSnapshot();
		});

		test("renders correctly when there are no notes to review", () => {
			const props: SidebarViewPureProps = {
				dueNowCount: 0,
				dueTodayCount: 0,
				totalCount: 15,
				status: "🎉 Done for today! All caught up!",
				statusHappy: true,
				showDifficultyButtons: false,
				cardStats: null,
				intervalPreviews: null,
				...mockHandlers,
			};

			const { container } = render(<SidebarViewPure {...props} />);
			expect(container).toMatchSnapshot();
		});
	});

	describe("Additional Scenarios", () => {
		test("renders correctly when there are notes due later today", () => {
			const props: SidebarViewPureProps = {
				dueNowCount: 0,
				dueTodayCount: 8,
				totalCount: 20,
				status: "",
				statusHappy: false,
				showDifficultyButtons: false,
				cardStats: null,
				intervalPreviews: null,
				...mockHandlers,
			};

			const { container } = render(<SidebarViewPure {...props} />);
			expect(container).toMatchSnapshot();
		});

		test("renders correctly with status message after rating", () => {
			const props: SidebarViewPureProps = {
				dueNowCount: 3,
				dueTodayCount: 7,
				totalCount: 18,
				status: "Scheduled for 2 hours",
				statusHappy: false,
				showDifficultyButtons: false,
				cardStats: null,
				intervalPreviews: null,
				...mockHandlers,
			};

			const { container } = render(<SidebarViewPure {...props} />);
			expect(container).toMatchSnapshot();
		});
	});
});
