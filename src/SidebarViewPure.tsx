import React from "react";
import { Rating } from "ts-fsrs";
import { CardStats, IntervalPreviews, Priority } from "./types";

export interface SidebarViewPureProps {
	dueNowCount: number;
	dueTodayCount: number;
	totalCount: number;
	status: string;
	statusHappy: boolean;
	showDifficultyButtons: boolean;
	cardStats: CardStats | null;
	intervalPreviews: IntervalPreviews | null;
	currentPriority: Priority | null;
	onShowNext: () => void;
	onAddToQueue: () => void;
	onShowQueue: () => void;
	onMarkAgain: () => void;
	onMarkHard: () => void;
	onMarkGood: () => void;
	onMarkEasy: () => void;
	onSetPriority: (priority: Priority) => void;
}

/**
 * Pure presentational component for the Incremental Reading sidebar.
 * All data comes from props, making it easy to test.
 */
export const SidebarViewPure: React.FC<SidebarViewPureProps> = ({
	dueNowCount,
	dueTodayCount,
	totalCount,
	status,
	statusHappy,
	showDifficultyButtons,
	cardStats,
	intervalPreviews,
	currentPriority,
	onShowNext,
	onAddToQueue,
	onShowQueue,
	onMarkAgain,
	onMarkHard,
	onMarkGood,
	onMarkEasy,
	onSetPriority,
}) => {
	const getPriorityLabel = (priority: Priority): string => {
		switch (priority) {
			case Priority.High:
				return "High";
			case Priority.Normal:
				return "Normal";
			case Priority.Low:
				return "Low";
			default:
				return "Normal";
		}
	};
	return (
		<div>
			<h4>Incremental Reading</h4>

			{/* Queue stats */}
			<div
				style={{
					marginBottom: "15px",
					padding: "10px",
					backgroundColor: "var(--background-secondary)",
					borderRadius: "5px",
				}}
			>
				<div style={{ marginBottom: "5px" }}>
					Due now: {dueNowCount}
				</div>
				<div style={{ marginBottom: "5px" }}>
					Due today: {dueTodayCount}
				</div>
				<div>Total in queue: {totalCount}</div>
			</div>

			{/* Show Next button - primary only when there are notes to show */}
			<button
				className={dueNowCount > 0 ? "mod-cta" : ""}
				style={{ marginBottom: "10px", width: "100%" }}
				onClick={onShowNext}
			>
				Show Next
			</button>

			{/* Add to Queue button */}
			<button
				style={{ marginBottom: "10px", width: "100%" }}
				onClick={onAddToQueue}
			>
				Add Current Note to Queue
			</button>

			{/* Priority selector (when reviewing) */}
			{currentPriority !== null && (
				<div
					style={{
						marginTop: "15px",
						padding: "10px",
						backgroundColor: "var(--background-secondary)",
						borderRadius: "5px",
					}}
				>
					<div style={{ marginBottom: "8px", fontWeight: "bold" }}>
						Priority:
					</div>
					<div
						style={{
							display: "flex",
							gap: "6px",
						}}
					>
						<button
							style={{
								flex: "1",
								padding: "6px",
								backgroundColor:
									currentPriority === Priority.High
										? "var(--interactive-accent)"
										: "var(--background-modifier-border)",
								color:
									currentPriority === Priority.High
										? "var(--text-on-accent)"
										: "var(--text-normal)",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
								fontWeight:
									currentPriority === Priority.High
										? "bold"
										: "normal",
							}}
							onClick={() => onSetPriority(Priority.High)}
						>
							High
						</button>
						<button
							style={{
								flex: "1",
								padding: "6px",
								backgroundColor:
									currentPriority === Priority.Normal
										? "var(--interactive-accent)"
										: "var(--background-modifier-border)",
								color:
									currentPriority === Priority.Normal
										? "var(--text-on-accent)"
										: "var(--text-normal)",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
								fontWeight:
									currentPriority === Priority.Normal
										? "bold"
										: "normal",
							}}
							onClick={() => onSetPriority(Priority.Normal)}
						>
							Normal
						</button>
						<button
							style={{
								flex: "1",
								padding: "6px",
								backgroundColor:
									currentPriority === Priority.Low
										? "var(--interactive-accent)"
										: "var(--background-modifier-border)",
								color:
									currentPriority === Priority.Low
										? "var(--text-on-accent)"
										: "var(--text-normal)",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
								fontWeight:
									currentPriority === Priority.Low
										? "bold"
										: "normal",
							}}
							onClick={() => onSetPriority(Priority.Low)}
						>
							Low
						</button>
					</div>
				</div>
			)}

			{/* Card Statistics (when reviewing) */}
			{cardStats && (
				<div
					style={{
						marginTop: "15px",
						padding: "10px",
						backgroundColor: "var(--background-secondary)",
						borderRadius: "5px",
						fontSize: "0.9em",
					}}
				>
					<div style={{ marginBottom: "3px" }}>
						<strong>Card Stats:</strong>
					</div>
					<div style={{ marginBottom: "2px" }}>
						Memory: {cardStats.stability}d | Difficulty:{" "}
						{cardStats.difficulty}/10
					</div>
					<div style={{ fontSize: "0.85em", opacity: 0.8 }}>
						Reviews: {cardStats.reps} | Forgotten:{" "}
						{cardStats.lapses}
					</div>
				</div>
			)}

			{/* Status message area */}
			<div
				style={{
					marginTop: "20px",
					padding: "10px",
					textAlign: "center",
					color: statusHappy
						? "var(--text-success)"
						: "var(--text-normal)",
				}}
			>
				{status}
				{showDifficultyButtons && intervalPreviews && (
					<div
						style={{
							marginTop: "10px",
							marginBottom: "5px",
							fontSize: "0.85em",
							opacity: 0.7,
						}}
					>
						Next review intervals:
					</div>
				)}
				{showDifficultyButtons && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "8px",
							marginTop: "10px",
						}}
					>
						<button style={{ flex: "1" }} onClick={onMarkAgain}>
							Again
							{intervalPreviews && (
								<div
									style={{ fontSize: "0.75em", opacity: 0.7 }}
								>
									{intervalPreviews[Rating.Again]}
								</div>
							)}
						</button>
						<button style={{ flex: "1" }} onClick={onMarkHard}>
							Hard
							{intervalPreviews && (
								<div
									style={{ fontSize: "0.75em", opacity: 0.7 }}
								>
									{intervalPreviews[Rating.Hard]}
								</div>
							)}
						</button>
						<button
							className="mod-cta"
							style={{ flex: "1" }}
							onClick={onMarkGood}
						>
							Good
							{intervalPreviews && (
								<div
									style={{ fontSize: "0.75em", opacity: 0.7 }}
								>
									{intervalPreviews[Rating.Good]}
								</div>
							)}
						</button>
						<button style={{ flex: "1" }} onClick={onMarkEasy}>
							Easy
							{intervalPreviews && (
								<div
									style={{ fontSize: "0.75em", opacity: 0.7 }}
								>
									{intervalPreviews[Rating.Easy]}
								</div>
							)}
						</button>
					</div>
				)}
			</div>

			{/* Show Queue button - less prominent, at the bottom */}
			<button
				style={{
					marginTop: "20px",
					width: "100%",
					fontSize: "0.9em",
					opacity: "0.7",
				}}
				onClick={onShowQueue}
			>
				Show Queue (debug)
			</button>
		</div>
	);
};
