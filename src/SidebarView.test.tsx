import React from "react";
import { render, waitFor } from "@testing-library/react";
import { SidebarView } from "./SidebarView";
import { Priority } from "./types";

// Create a more complete mock for Obsidian's workspace
const createMockWorkspace = () => {
	const listeners = new Map<string, Function[]>();

	return {
		getActiveFile: jest.fn(),
		on: jest.fn((event: string, callback: Function) => {
			if (!listeners.has(event)) {
				listeners.set(event, []);
			}
			listeners.get(event)?.push(callback);
			return callback; // Return the callback as the event reference
		}),
		offref: jest.fn((eventRef: Function) => {
			// In tests, the eventRef is the callback itself
			listeners.forEach((eventListeners) => {
				const index = eventListeners.indexOf(eventRef);
				if (index > -1) {
					eventListeners.splice(index, 1);
				}
			});
		}),
		// Helper to trigger events in tests
		trigger: (event: string) => {
			const eventListeners = listeners.get(event);
			if (eventListeners) {
				eventListeners.forEach((callback) => callback());
			}
		},
		listeners, // Expose for testing
	};
};

const createMockApp = (workspace: any) => ({
	workspace,
	vault: {
		getAbstractFileByPath: jest.fn(),
	},
});

const createMockPlugin = () => ({
	queueManager: {
		getQueueStats: jest.fn().mockResolvedValue({ due: 0, total: 0 }),
		isNoteInQueue: jest.fn().mockResolvedValue(false),
		loadQueue: jest.fn().mockResolvedValue({ notes: [] }),
		getCardStats: jest.fn(),
		previewIntervals: jest.fn(),
	},
	onUpdateUI: undefined,
	onCountersChanged: undefined,
});

describe("SidebarView - Integration Tests", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("subscribes to active-leaf-change event on mount", () => {
		const mockWorkspace = createMockWorkspace();
		const mockApp = createMockApp(mockWorkspace);
		const mockPlugin = createMockPlugin();

		render(<SidebarView app={mockApp as any} plugin={mockPlugin as any} />);

		// Verify that workspace.on was called with 'active-leaf-change'
		expect(mockWorkspace.on).toHaveBeenCalledWith(
			"active-leaf-change",
			expect.any(Function),
		);
	});

	test("checks if current note is in queue when active file changes", async () => {
		const mockWorkspace = createMockWorkspace();
		const mockApp = createMockApp(mockWorkspace);
		const mockPlugin = createMockPlugin();

		// Mock an active file
		const mockFile = { path: "test-note.md", basename: "test-note" };
		mockWorkspace.getActiveFile.mockReturnValue(mockFile);
		mockPlugin.queueManager.isNoteInQueue.mockResolvedValue(true);

		render(<SidebarView app={mockApp as any} plugin={mockPlugin as any} />);

		// Initial check should happen on mount
		await waitFor(() => {
			expect(mockPlugin.queueManager.isNoteInQueue).toHaveBeenCalledWith(
				"test-note.md",
				true,
			);
		});

		// Clear the mock to verify the event trigger
		mockPlugin.queueManager.isNoteInQueue.mockClear();

		// Trigger the active-leaf-change event
		mockWorkspace.trigger("active-leaf-change");

		// Verify isNoteInQueue is called again
		await waitFor(() => {
			expect(mockPlugin.queueManager.isNoteInQueue).toHaveBeenCalledWith(
				"test-note.md",
				true,
			);
		});
	});

	test("unsubscribes from active-leaf-change event on unmount", () => {
		const mockWorkspace = createMockWorkspace();
		const mockApp = createMockApp(mockWorkspace);
		const mockPlugin = createMockPlugin();

		const { unmount } = render(
			<SidebarView app={mockApp as any} plugin={mockPlugin as any} />,
		);

		// Get the callback that was registered
		const onCall = mockWorkspace.on.mock.calls.find(
			(call) => call[0] === "active-leaf-change",
		);
		expect(onCall).toBeDefined();
		const registeredCallback = onCall![1];

		// Unmount the component
		unmount();

		// Verify that workspace.offref was called with the registered callback
		expect(mockWorkspace.offref).toHaveBeenCalledWith(registeredCallback);
	});

	test("handles case when no active file exists", async () => {
		const mockWorkspace = createMockWorkspace();
		const mockApp = createMockApp(mockWorkspace);
		const mockPlugin = createMockPlugin();

		// No active file
		mockWorkspace.getActiveFile.mockReturnValue(null);

		render(<SidebarView app={mockApp as any} plugin={mockPlugin as any} />);

		// Trigger the active-leaf-change event
		mockWorkspace.trigger("active-leaf-change");

		// Wait a bit to ensure async operations complete
		await waitFor(() => {
			// isNoteInQueue should not be called when there's no active file
			expect(
				mockPlugin.queueManager.isNoteInQueue,
			).not.toHaveBeenCalled();
		});
	});
});
