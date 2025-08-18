import React, { useState } from "react";
import { XMLContentRenderer } from "./XMLContentRenderer";

interface CopilotPanelProps {
	feedback: string;
	isThinking: boolean;
	documentPreview: string;
	error: string | null;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({
	feedback,
	isThinking,
	documentPreview,
	error,
}) => {
	const [isDebugOpen, setIsDebugOpen] = useState(false);

	return (
		<div className="claude-copilot-container">
			<h4>Claude Copilot</h4>

			<FeedbackSection feedback={feedback} isThinking={isThinking} />

			<DebugSection
				isOpen={isDebugOpen}
				onToggle={() => setIsDebugOpen(!isDebugOpen)}
				documentPreview={documentPreview}
				error={error}
			/>
		</div>
	);
};

interface FeedbackSectionProps {
	feedback: string;
	isThinking: boolean;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({
	feedback,
	isThinking,
}) => {
	return (
		<div
			className={`claude-feedback ${isThinking ? "claude-thinking" : ""}`}
		>
			{isThinking ? (
				<div className="placeholder-text">Claude is thinking...</div>
			) : feedback ? (
				<XMLContentRenderer content={feedback} />
			) : (
				<div className="placeholder-text">
					Waiting for document changes...
				</div>
			)}
		</div>
	);
};

interface DebugSectionProps {
	isOpen: boolean;
	onToggle: () => void;
	documentPreview: string;
	error: string | null;
}

const DebugSection: React.FC<DebugSectionProps> = ({
	isOpen,
	onToggle,
	documentPreview,
	error,
}) => {
	return (
		<div className="debug-section">
			<div className="debug-header" onClick={onToggle}>
				<span>Debug</span>
				<button className="debug-toggle">{isOpen ? "▼" : "▶"}</button>
			</div>

			<div
				className="debug-details"
				style={{ display: isOpen ? "block" : "none" }}
			>
				<DocumentPreview content={documentPreview} />
				<ErrorLog error={error} />
			</div>
		</div>
	);
};

interface DocumentPreviewProps {
	content: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ content }) => {
	return (
		<div className="document-preview">
			<h5>Document Preview:</h5>
			<pre className="preview-content">{content}</pre>
		</div>
	);
};

interface ErrorLogProps {
	error: string | null;
}

const ErrorLog: React.FC<ErrorLogProps> = ({ error }) => {
	const timestamp = error ? new Date().toLocaleTimeString() : "";

	return (
		<div className="error-log">
			<h5>Errors:</h5>
			<div className="error-content">
				{error && `[${timestamp}] ${error}`}
			</div>
			<h5>Developer tools:</h5>
			<p>View {"-->"} Toggle Developer Tools (⌥+⌘+I)</p>
		</div>
	);
};
