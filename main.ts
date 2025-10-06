import { ItemView, WorkspaceLeaf, Plugin } from "obsidian";

const VIEW_TYPE_TEMPLATE = "plugin-template-view";

interface TemplateSettings {
	// Add your settings here
}

const DEFAULT_SETTINGS: TemplateSettings = {
	// Add default settings here
};

class TemplateView extends ItemView {
	plugin: TemplatePlugin;

	constructor(leaf: WorkspaceLeaf, plugin: TemplatePlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_TEMPLATE;
	}

	getDisplayText() {
		return "Plugin Template";
	}

	getIcon() {
		return "layout-template";
	}

	async onOpen() {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.createEl("h4", { text: "Plugin Template" });
	}

	async onClose() {
		// Cleanup if needed
	}
}

export default class TemplatePlugin extends Plugin {
	settings: TemplateSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(VIEW_TYPE_TEMPLATE, (leaf) => {
			return new TemplateView(leaf, this);
		});

		this.addRibbonIcon("layout-template", "Plugin Template", () => {
			this.activateView();
		});

		this.addCommand({
			id: "open-plugin-template",
			name: "Open Plugin Template",
			callback: () => {
				this.activateView();
			},
		});

		// Optionally activate view on startup
		this.app.workspace.onLayoutReady(() => {
			this.activateView();
		});
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_TEMPLATE);

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
				type: VIEW_TYPE_TEMPLATE,
				active: true,
			});
			workspace.revealLeaf(leaf);
		}
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_TEMPLATE);
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
