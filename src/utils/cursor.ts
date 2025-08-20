/**
 * Inserts a cursor marker into text content at the specified position
 * @param content The original text content
 * @param position The position where to insert the cursor marker (0-based index)
 * @returns Content with <cursor/> marker inserted at the specified position
 */
export function insertCursorMarker(content: string, position: number): string {
	// Validate position bounds
	if (position < 0 || position > content.length) {
		return content;
	}

	const beforeCursor = content.substring(0, position);
	const afterCursor = content.substring(position);
	return beforeCursor + "<cursor/>" + afterCursor;
}
