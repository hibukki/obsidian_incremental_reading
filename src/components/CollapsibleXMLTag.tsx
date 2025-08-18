import React, { useState } from 'react';
import { ParsedXMLTag } from '../utils/xmlParser';

interface CollapsibleXMLTagProps {
	xmlTag: ParsedXMLTag;
	color: string;
}

export const CollapsibleXMLTag: React.FC<CollapsibleXMLTagProps> = ({ xmlTag, color }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="xml-tag-container" style={{ borderLeftColor: color }}>
			<div 
				className="xml-tag-header" 
				onClick={() => setIsExpanded(!isExpanded)}
				style={{ backgroundColor: `${color}15` }} // 15% opacity
			>
				<span className="xml-tag-name" style={{ color }}>
					{xmlTag.tagName}
				</span>
				<button className="xml-tag-toggle">
					{isExpanded ? '▼' : '▶'}
				</button>
			</div>
			
			{isExpanded && (
				<div className="xml-tag-content">
					{xmlTag.content}
				</div>
			)}
		</div>
	);
};