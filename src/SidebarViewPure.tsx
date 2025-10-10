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
	onShowNext,
	onAddToQueue,
	onShowQueue,
	onMarkAgain,
	onMarkHard,
	onMarkGood,
	onMarkEasy,
	onSetPriority,
}) => {
	return (
		<div>
			<h4>Incremental Reading</h4>

			{/* Queue stats - always visible at top */}
			<div
				style={{
					marginBottom: "15px",
					padding: "10px",
					backgroundColor: "var(--background-secondary)",
					borderRadius: "5px",
				}}
			>
				<div style={{ marginBottom: "5px" }}>Due: {dueCount}</div>
				<div>Total in queue: {totalCount}</div>
			</div>

			{/* When NOT reviewing: Show queue management actions */}
			{!showDifficultyButtons && (
				<>
					{/* Show Next button - primary action when there are notes due */}
					<button
						className={dueCount > 0 ? "mod-cta" : ""}
						style={{ marginBottom: "10px", width: "100%" }}
						onClick={onShowNext}
					>
						Show Next
					</button>

					{/* Add to Queue button - only show if current note is NOT in queue */}
					{!isCurrentNoteInQueue && (
						<button
							style={{ marginBottom: "10px", width: "100%" }}
							onClick={onAddToQueue}
						>
							Add Current Note to Queue
						</button>
					)}

					{/* Already in queue indicator - show when current note IS in queue */}
					{isCurrentNoteInQueue && (
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
							✓ Current note is in queue
						</div>
					)}
				</>
			)}

			{/* When reviewing: Show difficulty buttons prominently at top */}
			{showDifficultyButtons && (
				<>
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

					{/* Status message */}
					{status && (
						<div
							style={{
								marginBottom: "10px",
								padding: "8px",
								textAlign: "center",
								fontSize: "0.9em",
								color: statusHappy
									? "var(--text-success)"
									: "var(--text-normal)",
							}}
						>
							{status}
						</div>
					)}

					{/* Debug section: Card Statistics */}
					{cardStats && (
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
								Debug: Card Stats
							</summary>
							<div
								style={{
									padding: "10px",
									backgroundColor:
										"var(--background-secondary)",
									borderRadius: "5px",
								}}
							>
								<div style={{ marginBottom: "2px" }}>
									Memory: {cardStats.stability}d | Difficulty:{" "}
									{cardStats.difficulty}/10
								</div>
								<div
									style={{ fontSize: "0.9em", opacity: 0.8 }}
								>
									Reviews: {cardStats.reps} | Forgotten:{" "}
									{cardStats.lapses}
								</div>
							</div>
						</details>
					)}
				</>
			)}

			{/* Status message when NOT reviewing */}
			{!showDifficultyButtons && status && (
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

			{/* Show Queue button - debug feature, kept at bottom */}
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
