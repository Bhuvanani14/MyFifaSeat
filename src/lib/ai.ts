/**
 * Transport-safe message shape shared by the fan and operations assistants.
 * @interface AssistantMessagePayload
 * @property {string} role - The role of the message sender (user, assistant, or model)
 * @property {string} content - The message content text
 */
export interface AssistantMessagePayload {
  role: "user" | "assistant" | "model";
  content: string;
}

/**
 * Context accepted by the server-side assistant. Values stay intentionally small.
 * @typedef {Record<string, string | number | boolean | undefined>} AssistantContext
 */
export type AssistantContext = Record<string, string | number | boolean | undefined>;

/**
 * Response structure from the AI assistant API.
 * @interface AssistantResponse
 * @property {unknown} content - The AI response content
 * @property {unknown} error - Error message if request failed
 */
interface AssistantResponse {
  content?: unknown;
  error?: unknown;
}

/** Maximum allowed length for a single message to prevent abuse */
const MAX_MESSAGE_LENGTH = 4_000;

/**
 * Sends a validated chat request to the same-origin server endpoint.
 * Keeping this boundary in one place prevents the two assistant views from
 * drifting in error handling or request shape.
 * 
 * @param {AssistantMessagePayload[]} messages - Array of conversation messages
 * @param {AssistantContext} context - Additional context for the AI (user info, match data, etc.)
 * @param {AbortSignal} [signal] - Optional abort signal for request cancellation
 * @returns {Promise<string>} The AI assistant's response text
 * @throws {Error} If the request fails, network error occurs, or response is invalid
 * 
 * @example
 * ```typescript
 * const response = await requestAssistantReply(
 *   [{ role: "user", content: "Find me a VIP seat" }],
 *   { userName: "John", userPremium: true }
 * );
 * ```
 */
export async function requestAssistantReply(
  messages: AssistantMessagePayload[],
  context: AssistantContext,
  signal?: AbortSignal,
): Promise<string> {
  const safeMessages = messages
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content.length > 0);

  if (safeMessages.length === 0) {
    throw new Error("Enter a message before sending it.");
  }

  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: safeMessages, context }),
    signal,
  });

  const payload = (await response.json().catch(() => ({}))) as AssistantResponse;

  if (!response.ok) {
    const message = typeof payload.error === "string" ? payload.error : "The assistant is unavailable right now.";
    throw new Error(message);
  }

  if (typeof payload.content !== "string" || payload.content.trim().length === 0) {
    throw new Error("The assistant returned an empty response.");
  }

  return payload.content;
}
