import React from "react";

export interface SidebarViewPureProps {
	dueNowCount: number;
	dueTodayCount: number;
	totalCount: number;
	status: string;
	statusHappy: boolean;
	showDifficultyButtons: boolean;
	onShowNext: () => void;
	onAddToQueue: () => void;
	onShowQueue: () => void;
	onMarkAgain: () => void;
	onMarkHard: () => void;
	onMarkGood: () => void;
	onMarkEasy: () => void;
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
	onShowNext,
	onAddToQueue,
	onShowQueue,
	onMarkAgain,
	onMarkHard,
	onMarkGood,
	onMarkEasy,
}) => {
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
						</button>
						<button style={{ flex: "1" }} onClick={onMarkHard}>
							Hard
						</button>
						<button
							className="mod-cta"
							style={{ flex: "1" }}
							onClick={onMarkGood}
						>
							Good
						</button>
						<button style={{ flex: "1" }} onClick={onMarkEasy}>
							Easy
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
