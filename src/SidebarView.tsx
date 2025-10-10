import React, { useState, useEffect } from "react";
import { App } from "obsidian";
import IncrementalReadingPlugin from "../main";
import { Rating } from "ts-fsrs";
import { SidebarViewPure } from "./SidebarViewPure";
import { CardStats, IntervalPreviews, Priority } from "./types";

interface SidebarViewProps {
	app: App;
	plugin: IncrementalReadingPlugin;
}

/**
 * Container component that manages state and connects to the plugin.
 * Renders the pure SidebarViewPure component with data.
 */
export const SidebarView: React.FC<SidebarViewProps> = ({ app, plugin }) => {
	const [dueCount, setDueCount] = useState<number>(0);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [status, setStatus] = useState<string>("");
	const [statusHappy, setStatusHappy] = useState<boolean>(false);
	const [showDifficultyButtons, setShowDifficultyButtons] =
		useState<boolean>(false);
	const [cardStats, setCardStats] = useState<CardStats | null>(null);
	const [intervalPreviews, setIntervalPreviews] =
		useState<IntervalPreviews | null>(null);
	const [currentPriority, setCurrentPriority] = useState<Priority | null>(
		null,
	);
	const [isCurrentNoteInQueue, setIsCurrentNoteInQueue] =
		useState<boolean>(false);

	const updateCounters = async () => {
		// Use cache for UI display - it's okay if it's slightly stale
		const stats = await plugin.queueManager.getQueueStats(true);
		setDueCount(stats.due);
		setTotalCount(stats.total);
	};

	const checkIfCurrentNoteInQueue = async () => {
		const activeFile = app.workspace.getActiveFile();
		if (!activeFile) {
			setIsCurrentNoteInQueue(false);
			return;
		}
		const inQueue = await plugin.queueManager.isNoteInQueue(
			activeFile.path,
			true,
		);
		setIsCurrentNoteInQueue(inQueue);
	};

	useEffect(() => {
		updateCounters();
		checkIfCurrentNoteInQueue();

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
			setCurrentPriority(null);
		};

		plugin.onCountersChanged = () => {
			updateCounters();
			checkIfCurrentNoteInQueue(); // Queue changed, recheck current note
		};

		plugin.onCardStatsChanged = (
			stats: CardStats,
			intervals: IntervalPreviews,
		) => {
			setCardStats(stats);
			setIntervalPreviews(intervals);
		};

		plugin.onPriorityChanged = (priority: Priority) => {
			setCurrentPriority(priority);
		};

		// Listen for active file changes
		const activeFileChangeHandler = app.workspace.on(
			"active-leaf-change",
			() => {
				checkIfCurrentNoteInQueue();
			},
		);

		// Auto-refresh counters every 30 seconds
		// (to catch notes that become due, like "Again" rated notes)
		const refreshInterval = setInterval(() => {
			updateCounters();
			checkIfCurrentNoteInQueue();
		}, 30000); // 30 seconds

		return () => {
			plugin.onUpdateUI = undefined;
			plugin.onShowDifficultyPrompt = undefined;
			plugin.onHideDifficultyPrompt = undefined;
			plugin.onCountersChanged = undefined;
			plugin.onCardStatsChanged = undefined;
			plugin.onPriorityChanged = undefined;
			app.workspace.offref(activeFileChangeHandler);
			clearInterval(refreshInterval);
		};
	}, [plugin, app]);

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

	const handleSetPriority = (priority: Priority) => {
		plugin.setPriority(priority);
	};

	return (
		<SidebarViewPure
			dueCount={dueCount}
			totalCount={totalCount}
			status={status}
			statusHappy={statusHappy}
			showDifficultyButtons={showDifficultyButtons}
			cardStats={cardStats}
			intervalPreviews={intervalPreviews}
			currentPriority={currentPriority}
			isCurrentNoteInQueue={isCurrentNoteInQueue}
			onShowNext={handleShowNext}
			onAddToQueue={handleAddToQueue}
			onShowQueue={handleShowQueue}
			onMarkAgain={handleMarkAgain}
			onMarkHard={handleMarkHard}
			onMarkGood={handleMarkGood}
			onMarkEasy={handleMarkEasy}
			onSetPriority={handleSetPriority}
		/>
	);
};
