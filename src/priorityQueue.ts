/**
 * A generic min-heap priority queue implementation.
 * Items are ordered by a numeric priority value (lower values = higher priority).
 *
 * Time complexities:
 * - peek(): O(1)
 * - push(): O(log n)
 * - pop(): O(log n)
 * - size(): O(1)
 */
export class PriorityQueue<T> {
	private heap: Array<{ item: T; priority: number }> = [];

	/**
	 * Create a new priority queue.
	 * @param items Optional array of items with priorities to initialize the queue
	 */
	constructor(items?: Array<{ item: T; priority: number }>) {
		if (items && items.length > 0) {
			this.heap = [...items];
			this.heapify();
		}
	}

	/**
	 * Get the number of items in the queue.
	 */
	get size(): number {
		return this.heap.length;
	}

	/**
	 * Check if the queue is empty.
	 */
	isEmpty(): boolean {
		return this.heap.length === 0;
	}

	/**
	 * Add an item to the queue with the given priority.
	 * Lower priority values come first.
	 */
	push(item: T, priority: number): void {
		this.heap.push({ item, priority });
		this.bubbleUp(this.heap.length - 1);
	}

	/**
	 * View the highest priority item without removing it.
	 * Returns undefined if the queue is empty.
	 */
	peek(): T | undefined {
		return this.heap[0]?.item;
	}

	/**
	 * Remove and return the highest priority item.
	 * Returns undefined if the queue is empty.
	 */
	pop(): T | undefined {
		if (this.heap.length === 0) {
			return undefined;
		}

		if (this.heap.length === 1) {
			const last = this.heap.pop();
			return last ? last.item : undefined;
		}

		const top = this.heap[0];
		const last = this.heap.pop();
		if (last) {
			this.heap[0] = last;
			this.bubbleDown(0);
		}

		return top.item;
	}

	/**
	 * Remove all items from the queue.
	 */
	clear(): void {
		this.heap = [];
	}

	/**
	 * Convert queue to array (does not preserve heap order).
	 */
	toArray(): T[] {
		return this.heap.map((node) => node.item);
	}

	/**
	 * Build heap from existing array (Floyd's algorithm).
	 * Time complexity: O(n)
	 */
	private heapify(): void {
		// Start from the last parent node and bubble down
		for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
			this.bubbleDown(i);
		}
	}

	/**
	 * Move item up the heap to restore heap property.
	 */
	private bubbleUp(index: number): void {
		while (index > 0) {
			const parentIndex = Math.floor((index - 1) / 2);

			if (this.heap[index].priority >= this.heap[parentIndex].priority) {
				break;
			}

			this.swap(index, parentIndex);
			index = parentIndex;
		}
	}

	/**
	 * Move item down the heap to restore heap property.
	 */
	private bubbleDown(index: number): void {
		const heapSize = this.heap.length;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const leftChild = 2 * index + 1;
			const rightChild = 2 * index + 2;
			let smallest = index;

			if (
				leftChild < heapSize &&
				this.heap[leftChild].priority < this.heap[smallest].priority
			) {
				smallest = leftChild;
			}

			if (
				rightChild < heapSize &&
				this.heap[rightChild].priority < this.heap[smallest].priority
			) {
				smallest = rightChild;
			}

			if (smallest === index) {
				break;
			}

			this.swap(index, smallest);
			index = smallest;
		}
	}

	/**
	 * Swap two elements in the heap.
	 */
	private swap(i: number, j: number): void {
		[this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
	}
}
