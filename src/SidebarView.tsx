import React, { useState, useEffect } from "react";
import { App } from "obsidian";
import IncrementalReadingPlugin from "../main";

interface SidebarViewProps {
	app: App;
	plugin: IncrementalReadingPlugin;
}

export const SidebarView: React.FC<SidebarViewProps> = ({ app, plugin }) => {
	const [todayCount, setTodayCount] = useState<number>(0);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [status, setStatus] = useState<string>("");
	const [statusHappy, setStatusHappy] = useState<boolean>(false);
	const [showDifficultyButtons, setShowDifficultyButtons] =
		useState<boolean>(false);

	const updateCounters = async () => {
		const queue = await plugin.queueManager.loadQueue();
		const now = new Date();
		const todayEnd = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			23,
			59,
			59,
			999,
		);

		const dueToday = queue.notes.filter((note) => {
			const dueDate = new Date(note.dueDate);
			return dueDate <= todayEnd;
		}).length;

		setTodayCount(dueToday);
		setTotalCount(queue.notes.length);
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
		};

		plugin.onCountersChanged = () => {
			updateCounters();
		};

		return () => {
			plugin.onUpdateUI = undefined;
			plugin.onShowDifficultyPrompt = undefined;
			plugin.onHideDifficultyPrompt = undefined;
			plugin.onCountersChanged = undefined;
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

	const handleMarkEasy = () => {
		plugin.markDifficulty("easy");
	};

	const handleMarkHard = () => {
		plugin.markDifficulty("hard");
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
					Due today: {todayCount}
				</div>
				<div>Total in queue: {totalCount}</div>
			</div>

			{/* Show Queue button */}
			<button
				style={{ marginBottom: "10px", width: "100%" }}
				onClick={handleShowQueue}
			>
				Show Queue
			</button>

			{/* Show Next button */}
			<button
				className="mod-cta"
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
							display: "flex",
							gap: "10px",
							marginTop: "10px",
						}}
					>
						<button
							className="mod-cta"
							style={{ flex: "1" }}
							onClick={handleMarkEasy}
						>
							Easy
						</button>
						<button style={{ flex: "1" }} onClick={handleMarkHard}>
							Hard
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
