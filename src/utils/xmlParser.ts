export interface ParsedXMLTag {
	tagName: string;
	content: string;
	startIndex: number;
	endIndex: number;
}

export interface ParsedContent {
	textBefore: string;
	xmlTags: ParsedXMLTag[];
	textAfter: string;
}

function stripBackticks(text: string): string {
	// Remove code blocks with optional "xml" language identifier
	// Patterns to match:
	// ```xml ... ```
	// ``` ... ```
	const codeBlockRegex = /^```(?:xml)?\s*\n?([\s\S]*?)\n?```$/;
	const match = text.trim().match(codeBlockRegex);

	if (match) {
		return match[1].trim();
	}

	return text;
}

export function parseXMLTags(text: string): ParsedContent {
	// Strip backticks and optional "xml" language identifier
	const cleanedText = stripBackticks(text);

	const xmlTags: ParsedXMLTag[] = [];
	const xmlTagRegex = /<(\w+)>([\s\S]*?)<\/\1>/g;
	let match;

	while ((match = xmlTagRegex.exec(cleanedText)) !== null) {
		const [fullMatch, tagName, content] = match;
		const startIndex = match.index;
		const endIndex = match.index + fullMatch.length;

		xmlTags.push({
			tagName,
			content: content.trim(),
			startIndex,
			endIndex,
		});
	}

	if (xmlTags.length === 0) {
		return {
			textBefore: cleanedText,
			xmlTags: [],
			textAfter: "",
		};
	}

	// Get text before first XML tag
	const textBefore = cleanedText.substring(0, xmlTags[0].startIndex);

	// Get text after last XML tag
	const textAfter = cleanedText.substring(
		xmlTags[xmlTags.length - 1].endIndex,
	);

	return {
		textBefore,
		xmlTags,
		textAfter,
	};
}

export function getTagColor(tagName: string): string {
	// Generate consistent colors for different tag names
	const colors = [
		"#3b82f6", // blue
		"#10b981", // emerald
		"#f59e0b", // amber
		"#ef4444", // red
		"#8b5cf6", // violet
		"#06b6d4", // cyan
		"#84cc16", // lime
		"#f97316", // orange
		"#ec4899", // pink
		"#6366f1", // indigo
	];

	// Simple hash function to consistently map tag names to colors
	let hash = 0;
	for (let i = 0; i < tagName.length; i++) {
		hash = ((hash << 5) - hash + tagName.charCodeAt(i)) & 0xffffffff;
	}

	return colors[Math.abs(hash) % colors.length];
}
