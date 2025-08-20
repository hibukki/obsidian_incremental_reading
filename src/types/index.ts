export interface ClaudeCopilotSettings {
	apiKey: string;
	model: string;
	debounceDelay: number;
}

export interface AnthropicClientConfig {
	apiKey: string;
	model: string;
}

export interface AnthropicMessage {
	role: "user" | "assistant";
	content: string;
}

export interface AnthropicRequestBody {
	model: string;
	max_tokens: number;
	messages: AnthropicMessage[];
}

export interface AnthropicResponse {
	content: Array<{
		text: string;
		type: string;
	}>;
	id: string;
	model: string;
	role: string;
	stop_reason: string;
	stop_sequence: null;
	type: string;
	usage: {
		input_tokens: number;
		output_tokens: number;
	};
}

export interface AnthropicErrorResponse {
	error: {
		message: string;
		type: string;
	};
}
