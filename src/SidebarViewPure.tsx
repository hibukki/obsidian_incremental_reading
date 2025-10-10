import React from "react";
import { Rating } from "ts-fsrs";
import { CardStats, IntervalPreviews, Priority } from "./types";

export interface SidebarViewPureProps {
	dueCount: number;
	totalCount: number;
	status: string;
	statusHappy: boolean;
	showDifficultyButtons: boolean;
	cardStats: CardStats | null;
	intervalPreviews: IntervalPreviews | null;
	currentPriority: Priority | null;
	isCurrentNoteInQueue: boolean;
	currentNoteName: string | null;
	currentNoteDueDate: Date | null;
	isCurrentNoteTheNextNote: boolean;
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
	dueCount,
	totalCount,
	status,
	statusHappy,
	showDifficultyButtons,
	cardStats,
	intervalPreviews,
	currentPriority,
	isCurrentNoteInQueue,
	currentNoteName,
	currentNoteDueDate,
	isCurrentNoteTheNextNote,
	onShowNext,
	onAddToQueue,
	onShowQueue,
	onMarkAgain,
	onMarkHard,
	onMarkGood,
	onMarkEasy,
	onSetPriority,
}) => {
	// Helper function to format due date
	const formatDueDate = (dueDate: Date): string => {
		const now = new Date();
		const diffMs = dueDate.getTime() - now.getTime();
		const diffMins = Math.round(diffMs / (1000 * 60));
		const diffHours = Math.round(diffMs / (1000 * 60 * 60));
		const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 60) {
			return `${diffMins} min${diffMins !== 1 ? "s" : ""}`;
		} else if (diffHours < 24) {
			return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
		} else {
			return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
		}
	};
	return (
		<div>
			<h4>Incremental Reading</h4>

			{/* Show Next button - always visible at top */}
			<button
				className={dueCount > 0 ? "mod-cta" : ""}
				style={{ marginBottom: "10px", width: "100%" }}
				onClick={onShowNext}
				disabled={isCurrentNoteTheNextNote}
			>
				{dueCount > 0
					? `Show next (${dueCount} left)`
					: "Show next (none due)"}
			</button>

			{/* When current note is in queue but not due */}
			{isCurrentNoteInQueue &&
				!showDifficultyButtons &&
				currentNoteDueDate && (
					<div
						style={{
							marginBottom: "10px",
							padding: "10px",
							backgroundColor: "var(--background-secondary)",
							borderRadius: "5px",
							textAlign: "center",
							opacity: 0.8,
						}}
					>
						Note in queue (due in{" "}
						{formatDueDate(currentNoteDueDate)})
					</div>
				)}

			{/* Add to Queue button - only show if current note is NOT in queue */}
			{!isCurrentNoteInQueue && (
				<button
					style={{ marginBottom: "10px", width: "100%" }}
					onClick={onAddToQueue}
				>
					Add Current Note to Queue
				</button>
			)}

			{/* When reviewing: Show difficulty buttons prominently at top */}
			{showDifficultyButtons && (
				<>
					{/* Prompt text above difficulty buttons */}
					<div
						style={{
							marginBottom: "10px",
							textAlign: "center",
							fontSize: "0.9em",
							fontWeight: "bold",
						}}
					>
						How was this note?
					</div>

					{/* Difficulty buttons - primary action, minimal text */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "8px",
							marginBottom: "15px",
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

					{/* Priority selector - secondary action */}
					{currentPriority !== null && (
						<div
							style={{
								marginBottom: "15px",
								padding: "10px",
								backgroundColor: "var(--background-secondary)",
								borderRadius: "5px",
							}}
						>
							<div
								style={{
									marginBottom: "8px",
									fontWeight: "bold",
									fontSize: "0.9em",
								}}
							>
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
									onClick={() =>
										onSetPriority(Priority.Normal)
									}
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
				</>
			)}

			{/* Status message */}
			{status && (
				<div
					style={{
						marginTop: "10px",
						padding: "10px",
						textAlign: "center",
						color: statusHappy
							? "var(--text-success)"
							: "var(--text-normal)",
					}}
				>
					{status}
				</div>
			)}

			{/* Collapsible Debug section */}
			<details
				style={{
					marginTop: "20px",
					fontSize: "0.85em",
					opacity: 0.7,
				}}
			>
				<summary
					style={{
						cursor: "pointer",
						marginBottom: "8px",
						fontSize: "0.9em",
					}}
				>
					Debug
				</summary>
				<div
					style={{
						padding: "10px",
						backgroundColor: "var(--background-secondary)",
						borderRadius: "5px",
					}}
				>
					{/* Current note */}
					<div style={{ marginBottom: "8px" }}>
						<strong>Current note:</strong>{" "}
						{currentNoteName || "(no active note)"}
					</div>

					{/* Total in queue */}
					<div style={{ marginBottom: "8px" }}>
						<strong>Total in queue:</strong> {totalCount}
					</div>

					{/* Show Queue button */}
					<button
						style={{
							width: "100%",
							fontSize: "0.9em",
						}}
						onClick={onShowQueue}
					>
						Show Queue File
					</button>

					{/* Card Statistics (if available) */}
					{cardStats && (
						<div
							style={{
								marginTop: "10px",
								paddingTop: "10px",
								borderTop:
									"1px solid var(--background-modifier-border)",
							}}
						>
							<div style={{ marginBottom: "4px" }}>
								<strong>Card Stats:</strong>
							</div>
							<div style={{ marginBottom: "2px" }}>
								Memory: {cardStats.stability}d | Difficulty:{" "}
								{cardStats.difficulty}/10
							</div>
							<div style={{ fontSize: "0.9em", opacity: 0.8 }}>
								Reviews: {cardStats.reps} | Forgotten:{" "}
								{cardStats.lapses}
							</div>
						</div>
					)}
				</div>
			</details>
		</div>
	);
};
