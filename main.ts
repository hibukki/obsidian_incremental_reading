import { ItemView, WorkspaceLeaf, Plugin, TFile, Notice } from "obsidian";
import { QueueManager } from "./src/queueManager";
import { selectNextNote } from "./src/nextNoteSelector";
import { Root, createRoot } from "react-dom/client";
import { SidebarView } from "./src/SidebarView";
import React from "react";
import { Rating } from "ts-fsrs";

const VIEW_TYPE_INCREMENTAL = "incremental-reading-view";

interface IncrementalReadingSettings {
	// Add settings here later if needed
}

const DEFAULT_SETTINGS: IncrementalReadingSettings = {};

class IncrementalReadingView extends ItemView {
	plugin: IncrementalReadingPlugin;
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: IncrementalReadingPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_INCREMENTAL;
	}

	getDisplayText() {
		return "Incremental Reading";
	}

	getIcon() {
		return "book-open";
	}

	async onOpen() {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();

		this.root = createRoot(container);
		this.root.render(
			React.createElement(SidebarView, {
				app: this.app,
				plugin: this.plugin,
			}),
		);
	}

	async onClose() {
		if (this.root) {
			this.root.unmount();
		}
	}
}

export default class IncrementalReadingPlugin extends Plugin {
	settings: IncrementalReadingSettings;
	queueManager: QueueManager;
	currentNoteInReview: string | null = null;

	// Callbacks for React to hook into
	onUpdateUI?: (message: string, isHappy: boolean) => void;
	onShowDifficultyPrompt?: () => void;
	onHideDifficultyPrompt?: () => void;
	onCountersChanged?: () => void;

	async onload() {
		await this.loadSettings();

		this.queueManager = new QueueManager(this.app);

		this.registerView(VIEW_TYPE_INCREMENTAL, (leaf) => {
			return new IncrementalReadingView(leaf, this);
		});

		this.addRibbonIcon("book-open", "Incremental Reading", () => {
			this.activateView();
		});

		this.addCommand({
			id: "open-incremental-reading",
			name: "Open Incremental Reading",
			callback: () => {
				this.activateView();
			},
		});

		this.addCommand({
			id: "show-next-note",
			name: "Show Next Note",
			callback: () => {
				this.showNextNote();
			},
		});

		this.addCommand({
			id: "mark-again",
			name: "Mark Current as Again",
			callback: () => {
				this.markRating(Rating.Again);
			},
		});

		this.addCommand({
			id: "mark-hard",
			name: "Mark Current as Hard",
			callback: () => {
				this.markRating(Rating.Hard);
			},
		});

		this.addCommand({
			id: "mark-good",
			name: "Mark Current as Good",
			callback: () => {
				this.markRating(Rating.Good);
			},
		});

		this.addCommand({
			id: "mark-easy",
			name: "Mark Current as Easy",
			callback: () => {
				this.markRating(Rating.Easy);
			},
		});

		// Optionally activate view on startup
		this.app.workspace.onLayoutReady(() => {
			this.activateView();
		});
	}

	async openQueueFile() {
		const file = this.app.vault.getAbstractFileByPath("queue.md");
		if (file instanceof TFile) {
			await this.app.workspace.getLeaf(false).openFile(file);
		} else {
			new Notice("Queue file not found");
		}
	}

	updateStatus(message: string, isHappy: boolean = false) {
		if (this.onUpdateUI) {
			this.onUpdateUI(message, isHappy);
		}
	}

	async showNextNote() {
		// Load due notes (no cache - we need accurate data for decision-making)
		const dueNotes = await this.queueManager.getDueNotes(false);
		const nextPath = selectNextNote(dueNotes);

		if (!nextPath) {
			this.updateStatus("🎉 Done for today! All caught up!", true);
			new Notice("🎉 Done for today!");
			this.currentNoteInReview = null;
			if (this.onHideDifficultyPrompt) {
				this.onHideDifficultyPrompt();
			}
			return;
		}

		// Open the note
		const file = this.app.vault.getAbstractFileByPath(nextPath);
		if (file instanceof TFile) {
			await this.app.workspace.getLeaf(false).openFile(file);
			this.currentNoteInReview = nextPath;
			if (this.onShowDifficultyPrompt) {
				this.onShowDifficultyPrompt();
			}
		} else {
			new Notice(`Could not open note: ${nextPath}`);
			this.currentNoteInReview = null;
		}
	}

	async markRating(rating: Rating) {
		if (!this.currentNoteInReview) {
			new Notice("No note currently in review");
			return;
		}

		const nextDue = await this.queueManager.scheduleNext(
			this.currentNoteInReview,
			rating,
		);

		// Format the due date nicely
		let message = "Scheduled";
		if (nextDue) {
			const now = new Date();
			const diffMs = nextDue.getTime() - now.getTime();
			const diffMins = Math.round(diffMs / (1000 * 60));
			const diffHours = Math.round(diffMs / (1000 * 60 * 60));
			const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

			if (diffMins < 60) {
				message = `Scheduled for ${diffMins} min${diffMins !== 1 ? "s" : ""}`;
			} else if (diffHours < 24) {
				message = `Scheduled for ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
			} else {
				message = `Scheduled for ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
			}
		}

		new Notice(message);
		this.updateStatus(message);

		this.currentNoteInReview = null;

		// Hide difficulty buttons
		if (this.onHideDifficultyPrompt) {
			this.onHideDifficultyPrompt();
		}

		// Update counters
		if (this.onCountersChanged) {
			this.onCountersChanged();
		}

		// Auto-show next note
		setTimeout(() => this.showNextNote(), 500);
	}

	async addCurrentNoteToQueue() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("No active note");
			return;
		}

		await this.queueManager.addToQueue(activeFile.path, 0);
		new Notice(`Added "${activeFile.basename}" to queue (due now)`);

		// Update counters
		if (this.onCountersChanged) {
			this.onCountersChanged();
		}
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_INCREMENTAL);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
			}
		}

		if (leaf) {
			await leaf.setViewState({
				type: VIEW_TYPE_INCREMENTAL,
				active: true,
			});
			workspace.revealLeaf(leaf);
		}
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_INCREMENTAL);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
