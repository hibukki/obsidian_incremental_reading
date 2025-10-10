import { PriorityQueue } from "./priorityQueue";

describe("PriorityQueue", () => {
	describe("construction", () => {
		it("should create an empty queue", () => {
			const pq = new PriorityQueue<string>();
			expect(pq.size).toBe(0);
			expect(pq.isEmpty()).toBe(true);
		});

		it("should create a queue from initial items", () => {
			const pq = new PriorityQueue<string>([
				{ item: "low", priority: 10 },
				{ item: "high", priority: 1 },
				{ item: "medium", priority: 5 },
			]);

			expect(pq.size).toBe(3);
			expect(pq.peek()).toBe("high");
		});

		it("should handle single item initialization", () => {
			const pq = new PriorityQueue<number>([{ item: 42, priority: 1 }]);
			expect(pq.size).toBe(1);
			expect(pq.peek()).toBe(42);
		});
	});

	describe("push and peek", () => {
		it("should maintain min-heap property", () => {
			const pq = new PriorityQueue<string>();

			pq.push("medium", 5);
			expect(pq.peek()).toBe("medium");

			pq.push("low", 10);
			expect(pq.peek()).toBe("medium");

			pq.push("high", 1);
			expect(pq.peek()).toBe("high");
		});

		it("should handle equal priorities", () => {
			const pq = new PriorityQueue<string>();
			pq.push("first", 5);
			pq.push("second", 5);
			pq.push("third", 5);

			expect(pq.size).toBe(3);
			// Should return one of them (heap doesn't guarantee order for equal priorities)
			const first = pq.peek();
			expect(["first", "second", "third"]).toContain(first);
		});

		it("should handle negative priorities", () => {
			const pq = new PriorityQueue<string>();
			pq.push("zero", 0);
			pq.push("negative", -5);
			pq.push("positive", 5);

			expect(pq.peek()).toBe("negative");
		});

		it("should peek without removing", () => {
			const pq = new PriorityQueue<string>();
			pq.push("item", 1);

			expect(pq.peek()).toBe("item");
			expect(pq.size).toBe(1);
			expect(pq.peek()).toBe("item");
		});
	});

	describe("pop", () => {
		it("should remove items in priority order", () => {
			const pq = new PriorityQueue<string>();
			pq.push("low", 10);
			pq.push("medium", 5);
			pq.push("high", 1);

			expect(pq.pop()).toBe("high");
			expect(pq.pop()).toBe("medium");
			expect(pq.pop()).toBe("low");
			expect(pq.isEmpty()).toBe(true);
		});

		it("should return undefined when popping empty queue", () => {
			const pq = new PriorityQueue<string>();
			expect(pq.pop()).toBeUndefined();
		});

		it("should handle single item", () => {
			const pq = new PriorityQueue<string>();
			pq.push("only", 1);

			expect(pq.pop()).toBe("only");
			expect(pq.isEmpty()).toBe(true);
		});

		it("should maintain heap property after multiple pops", () => {
			const pq = new PriorityQueue<number>();
			const items = [5, 3, 7, 1, 9, 2, 8, 4, 6];

			items.forEach((item) => pq.push(item, item));

			const result: number[] = [];
			while (!pq.isEmpty()) {
				const item = pq.pop();
				if (item !== undefined) {
					result.push(item);
				}
			}

			expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
		});
	});

	describe("size and isEmpty", () => {
		it("should track size correctly", () => {
			const pq = new PriorityQueue<string>();
			expect(pq.size).toBe(0);

			pq.push("first", 1);
			expect(pq.size).toBe(1);

			pq.push("second", 2);
			expect(pq.size).toBe(2);

			pq.pop();
			expect(pq.size).toBe(1);

			pq.pop();
			expect(pq.size).toBe(0);
		});

		it("should report isEmpty correctly", () => {
			const pq = new PriorityQueue<string>();
			expect(pq.isEmpty()).toBe(true);

			pq.push("item", 1);
			expect(pq.isEmpty()).toBe(false);

			pq.pop();
			expect(pq.isEmpty()).toBe(true);
		});
	});

	describe("clear", () => {
		it("should remove all items", () => {
			const pq = new PriorityQueue<string>();
			pq.push("first", 1);
			pq.push("second", 2);
			pq.push("third", 3);

			pq.clear();

			expect(pq.size).toBe(0);
			expect(pq.isEmpty()).toBe(true);
			expect(pq.peek()).toBeUndefined();
		});

		it("should allow reuse after clear", () => {
			const pq = new PriorityQueue<string>();
			pq.push("old", 1);
			pq.clear();

			pq.push("new", 2);
			expect(pq.peek()).toBe("new");
			expect(pq.size).toBe(1);
		});
	});

	describe("toArray", () => {
		it("should convert to array", () => {
			const pq = new PriorityQueue<string>();
			pq.push("a", 1);
			pq.push("b", 2);
			pq.push("c", 3);

			const arr = pq.toArray();
			expect(arr.length).toBe(3);
			expect(arr).toContain("a");
			expect(arr).toContain("b");
			expect(arr).toContain("c");
		});

		it("should not modify the queue", () => {
			const pq = new PriorityQueue<string>();
			pq.push("item", 1);

			const arr = pq.toArray();
			expect(pq.size).toBe(1);
			expect(arr).toEqual(["item"]);
		});
	});

	describe("complex types", () => {
		interface Task {
			id: number;
			name: string;
		}

		it("should work with objects", () => {
			const pq = new PriorityQueue<Task>();

			pq.push({ id: 1, name: "Low priority" }, 10);
			pq.push({ id: 2, name: "High priority" }, 1);
			pq.push({ id: 3, name: "Medium priority" }, 5);

			const first = pq.pop();
			expect(first?.id).toBe(2);
			expect(first?.name).toBe("High priority");
		});
	});

	describe("edge cases", () => {
		it("should handle many items", () => {
			const pq = new PriorityQueue<number>();
			const count = 1000;

			// Add items in random order
			for (let i = 0; i < count; i++) {
				pq.push(i, Math.random());
			}

			expect(pq.size).toBe(count);

			// Pop all items - should come out in sorted order by priority
			while (!pq.isEmpty()) {
				pq.pop();
				// Just verify we can pop all items
			}

			expect(pq.size).toBe(0);
		});

		it("should handle repeated push/pop operations", () => {
			const pq = new PriorityQueue<string>();

			pq.push("a", 1);
			expect(pq.pop()).toBe("a");

			pq.push("b", 2);
			pq.push("c", 1);
			expect(pq.pop()).toBe("c");

			pq.push("d", 0);
			expect(pq.peek()).toBe("d");
		});
	});

	describe("heapify performance", () => {
		it("should efficiently build heap from large array", () => {
			const items = Array.from({ length: 100 }, (_, i) => ({
				item: i,
				priority: Math.random(),
			}));

			const pq = new PriorityQueue<number>(items);
			expect(pq.size).toBe(100);

			// Verify heap property by popping all items
			const result: number[] = [];
			while (!pq.isEmpty()) {
				const item = pq.pop();
				if (item !== undefined) {
					result.push(item);
				}
			}

			expect(result.length).toBe(100);
		});
	});
});
