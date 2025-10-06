import React, { useState, useEffect } from "react";
import { App } from "obsidian";
import IncrementalReadingPlugin from "../main";
import { Rating } from "ts-fsrs";
import { CardStats, IntervalPreviews } from "./types";

interface SidebarViewProps {
	app: App;
	plugin: IncrementalReadingPlugin;
}

export const SidebarView: React.FC<SidebarViewProps> = ({ app, plugin }) => {
	const [dueNowCount, setDueNowCount] = useState<number>(0);
	const [dueTodayCount, setDueTodayCount] = useState<number>(0);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [status, setStatus] = useState<string>("");
	const [statusHappy, setStatusHappy] = useState<boolean>(false);
	const [showDifficultyButtons, setShowDifficultyButtons] =
		useState<boolean>(false);
	const [cardStats, setCardStats] = useState<CardStats | null>(null);
	const [intervalPreviews, setIntervalPreviews] =
		useState<IntervalPreviews | null>(null);

	const updateCounters = async () => {
		// Use cache for UI display - it's okay if it's slightly stale
		const stats = await plugin.queueManager.getQueueStats(true);
		setDueNowCount(stats.dueNow);
		setDueTodayCount(stats.dueToday);
		setTotalCount(stats.total);
	};

	useEffect(() => {
		updateCounters();

		// Register callback for plugin to update UI
		plugin.onUpdateUI = (message: string, isHappy: boolean) => {
			setStatus(message);
			setStatusHappy(isHappy);
		};

		plugin.onShowDifficultyPrompt = () => {
			setShowDifficultyButtons(true);
			setStatus("How was this note? (Use commands or click below)");
		};

		plugin.onHideDifficultyPrompt = () => {
			setShowDifficultyButtons(false);
			setCardStats(null);
			setIntervalPreviews(null);
		};

		plugin.onCountersChanged = () => {
			updateCounters();
		};

		plugin.onCardStatsChanged = (
			stats: CardStats,
			intervals: IntervalPreviews,
		) => {
			setCardStats(stats);
			setIntervalPreviews(intervals);
		};

		// Auto-refresh counters every 30 seconds
		// (to catch notes that become due, like "Again" rated notes)
		const refreshInterval = setInterval(() => {
			updateCounters();
		}, 30000); // 30 seconds

		return () => {
			plugin.onUpdateUI = undefined;
			plugin.onShowDifficultyPrompt = undefined;
			plugin.onHideDifficultyPrompt = undefined;
			plugin.onCountersChanged = undefined;
			plugin.onCardStatsChanged = undefined;
			clearInterval(refreshInterval);
		};
	}, [plugin]);

	const handleShowQueue = async () => {
		await plugin.openQueueFile();
	};

	const handleShowNext = async () => {
		await plugin.showNextNote();
	};

	const handleAddToQueue = async () => {
		await plugin.addCurrentNoteToQueue();
	};

	const handleMarkAgain = () => {
		plugin.markRating(Rating.Again);
	};

	const handleMarkHard = () => {
		plugin.markRating(Rating.Hard);
	};

	const handleMarkGood = () => {
		plugin.markRating(Rating.Good);
	};

	const handleMarkEasy = () => {
		plugin.markRating(Rating.Easy);
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
				onClick={handleShowNext}
			>
				Show Next
			</button>

			{/* Add to Queue button */}
			<button
				style={{ marginBottom: "10px", width: "100%" }}
				onClick={handleAddToQueue}
			>
				Add Current Note to Queue
			</button>

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
						<button style={{ flex: "1" }} onClick={handleMarkAgain}>
							Again
							{intervalPreviews && (
								<div style={{ fontSize: "0.75em", opacity: 0.7 }}>
									{intervalPreviews[Rating.Again]}
								</div>
							)}
						</button>
						<button style={{ flex: "1" }} onClick={handleMarkHard}>
							Hard
							{intervalPreviews && (
								<div style={{ fontSize: "0.75em", opacity: 0.7 }}>
									{intervalPreviews[Rating.Hard]}
								</div>
							)}
						</button>
						<button
							className="mod-cta"
							style={{ flex: "1" }}
							onClick={handleMarkGood}
						>
							Good
							{intervalPreviews && (
								<div style={{ fontSize: "0.75em", opacity: 0.7 }}>
									{intervalPreviews[Rating.Good]}
								</div>
							)}
						</button>
						<button style={{ flex: "1" }} onClick={handleMarkEasy}>
							Easy
							{intervalPreviews && (
								<div style={{ fontSize: "0.75em", opacity: 0.7 }}>
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
				onClick={handleShowQueue}
			>
				Show Queue (debug)
			</button>
		</div>
	);
};
