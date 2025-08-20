import React from "react";
import { parseXMLTags, getTagColor } from "../utils/xmlParser";
import { CollapsibleXMLTag } from "./CollapsibleXMLTag";

interface XMLContentRendererProps {
	content: string;
}

export const XMLContentRenderer: React.FC<XMLContentRendererProps> = ({
	content,
}) => {
	const parsedContent = parseXMLTags(content);

	// If no XML tags found, render as plain text
	if (parsedContent.xmlTags.length === 0) {
		return <div>{content}</div>;
	}

	return (
		<div className="xml-content-container">
			{/* Text before first XML tag */}
			{parsedContent.textBefore && (
				<div className="xml-text-section">
					{parsedContent.textBefore.trim()}
				</div>
			)}

			{/* XML tags */}
			{parsedContent.xmlTags.map((xmlTag, index) => (
				<CollapsibleXMLTag
					key={`${xmlTag.tagName}-${index}`}
					xmlTag={xmlTag}
					color={getTagColor(xmlTag.tagName)}
				/>
			))}

			{/* Text after last XML tag */}
			{parsedContent.textAfter && (
				<div className="xml-text-section">
					{parsedContent.textAfter.trim()}
				</div>
			)}
		</div>
	);
};
