import { ItemView, WorkspaceLeaf, Plugin, TFile, Notice } from "obsidian";
import { QueueManager } from "./src/queueManager";
import { selectNextNote } from "./src/nextNoteSelector";

const VIEW_TYPE_INCREMENTAL = "incremental-reading-view";

interface IncrementalReadingSettings {
	// Add settings here later if needed
}

const DEFAULT_SETTINGS: IncrementalReadingSettings = {};

class IncrementalReadingView extends ItemView {
	plugin: IncrementalReadingPlugin;
	todayCountEl: HTMLElement | null = null;
	totalCountEl: HTMLElement | null = null;

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

		container.createEl("h4", { text: "Incremental Reading" });

		// Queue stats
		const statsContainer = container.createDiv();
		statsContainer.style.marginBottom = "15px";
		statsContainer.style.padding = "10px";
		statsContainer.style.backgroundColor = "var(--background-secondary)";
		statsContainer.style.borderRadius = "5px";

		this.todayCountEl = statsContainer.createEl("div", {
			text: "Due today: ...",
		});
		this.todayCountEl.style.marginBottom = "5px";

		this.totalCountEl = statsContainer.createEl("div", {
			text: "Total in queue: ...",
		});

		// Show Queue button
		const queueButton = container.createEl("button", {
			text: "Show Queue",
		});
		queueButton.style.marginBottom = "10px";
		queueButton.style.width = "100%";

		queueButton.addEventListener("click", async () => {
			await this.plugin.openQueueFile();
		});

		// Show Next button
		const nextButton = container.createEl("button", {
			text: "Show Next",
			cls: "mod-cta",
		});
		nextButton.style.marginBottom = "10px";
		nextButton.style.width = "100%";

		nextButton.addEventListener("click", async () => {
			await this.plugin.showNextNote();
		});

		// Add to Queue button
		const addButton = container.createEl("button", {
			text: "Add Current Note to Queue",
		});
		addButton.style.marginBottom = "10px";
		addButton.style.width = "100%";

		addButton.addEventListener("click", async () => {
			await this.plugin.addCurrentNoteToQueue();
		});

		// Status message area
		const statusEl = container.createEl("div", {
			cls: "incremental-reading-status",
		});
		statusEl.style.marginTop = "20px";
		statusEl.style.padding = "10px";
		statusEl.style.textAlign = "center";

		this.plugin.setStatusElement(statusEl);
		this.plugin.setView(this);

		// Initial update of counters
		await this.updateCounters();
	}

	async updateCounters() {
		const queue = await this.plugin.queueManager.loadQueue();
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

		const total = queue.notes.length;

		if (this.todayCountEl) {
			this.todayCountEl.setText(`Due today: ${dueToday}`);
		}

		if (this.totalCountEl) {
			this.totalCountEl.setText(`Total in queue: ${total}`);
		}
	}

	async onClose() {
		// Cleanup if needed
	}
}

export default class IncrementalReadingPlugin extends Plugin {
	settings: IncrementalReadingSettings;
	queueManager: QueueManager;
	statusElement: HTMLElement | null = null;
	currentNoteInReview: string | null = null;
	view: IncrementalReadingView | null = null;

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
			id: "mark-easy",
			name: "Mark Current as Easy (double interval)",
			callback: () => {
				this.markDifficulty("easy");
			},
		});

		this.addCommand({
			id: "mark-hard",
			name: "Mark Current as Hard (reset to 1 day)",
			callback: () => {
				this.markDifficulty("hard");
			},
		});

		// Optionally activate view on startup
		this.app.workspace.onLayoutReady(() => {
			this.activateView();
		});
	}

	setStatusElement(element: HTMLElement) {
		this.statusElement = element;
	}

	setView(view: IncrementalReadingView) {
		this.view = view;
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
		if (this.statusElement) {
			this.statusElement.setText(message);
			this.statusElement.style.color = isHappy
				? "var(--text-success)"
				: "var(--text-normal)";
		}
	}

	async showNextNote() {
		// Load queue and select next note
		const queue = await this.queueManager.loadQueue();
		const nextPath = selectNextNote(queue);

		if (!nextPath) {
			this.updateStatus("🎉 Done for today! All caught up!", true);
			new Notice("🎉 Done for today!");
			this.currentNoteInReview = null;
			return;
		}

		// Open the note
		const file = this.app.vault.getAbstractFileByPath(nextPath);
		if (file instanceof TFile) {
			await this.app.workspace.getLeaf(false).openFile(file);
			this.currentNoteInReview = nextPath;
			this.showDifficultyPrompt(nextPath);
		} else {
			new Notice(`Could not open note: ${nextPath}`);
			this.currentNoteInReview = null;
		}
	}

	showDifficultyPrompt(path: string) {
		this.updateStatus("How was this note? (Use commands or click below)");

		if (this.statusElement) {
			// Clear previous buttons
			this.statusElement.empty();

			const buttonContainer = this.statusElement.createDiv();
			buttonContainer.style.display = "flex";
			buttonContainer.style.gap = "10px";
			buttonContainer.style.marginTop = "10px";

			const easyButton = buttonContainer.createEl("button", {
				text: "Easy",
				cls: "mod-cta",
			});
			easyButton.style.flex = "1";
			easyButton.addEventListener("click", () => {
				this.markDifficulty("easy");
			});

			const hardButton = buttonContainer.createEl("button", {
				text: "Hard",
			});
			hardButton.style.flex = "1";
			hardButton.addEventListener("click", () => {
				this.markDifficulty("hard");
			});
		}
	}

	async markDifficulty(difficulty: "easy" | "hard") {
		if (!this.currentNoteInReview) {
			new Notice("No note currently in review");
			return;
		}

		await this.queueManager.scheduleNext(
			this.currentNoteInReview,
			difficulty,
		);

		const message =
			difficulty === "easy"
				? "Scheduled for later (doubled interval)"
				: "Scheduled for tomorrow";
		new Notice(message);
		this.updateStatus(message);

		this.currentNoteInReview = null;

		// Update counters
		if (this.view) {
			await this.view.updateCounters();
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

		await this.queueManager.addToQueue(activeFile.path, 1);
		new Notice(`Added "${activeFile.basename}" to queue (due tomorrow)`);

		// Update counters
		if (this.view) {
			await this.view.updateCounters();
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
