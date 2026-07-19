/** Allowed chat message roles (whitelist for API security). */
export const VALID_CHAT_ROLES = new Set(["user", "assistant", "model", "system"]);

/** Maximum messages in a single conversation payload. */
export const MAX_CHAT_MESSAGES = 50;

/** Maximum character length per message. */
export const MAX_CHAT_CONTENT_LENGTH = 4000;

export interface ChatMessagePayload {
  role: "user" | "assistant" | "model" | "system";
  content: string;
}

export interface ValidatedChatRequest {
  messages: ChatMessagePayload[];
  context: Record<string, unknown>;
}

export interface ChatValidationError {
  ok: false;
  status: 400;
  error: string;
}

export type ChatValidationResult = { ok: true; data: ValidatedChatRequest } | ChatValidationError;

/** Strip script tags and HTML to reduce XSS risk in AI prompts. */
export function sanitizeChatInput(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

/** Validate and normalize an incoming /api/ai/chat request body. */
export function validateChatRequest(body: unknown): ChatValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, error: "Invalid request: messages must be an array." };
  }

  const { messages, context } = body as { messages?: unknown; context?: unknown };

  if (!messages || !Array.isArray(messages)) {
    return { ok: false, status: 400, error: "Invalid request: messages must be an array." };
  }
  if (messages.length > MAX_CHAT_MESSAGES) {
    return {
      ok: false,
      status: 400,
      error: `Too many messages. Maximum is ${MAX_CHAT_MESSAGES}.`,
    };
  }

  for (const msg of messages) {
    if (!msg || typeof msg !== "object") {
      return { ok: false, status: 400, error: "Invalid message format or content too long." };
    }
    const { role, content } = msg as { role?: unknown; content?: unknown };
    if (typeof content !== "string" || content.length > MAX_CHAT_CONTENT_LENGTH) {
      return { ok: false, status: 400, error: "Invalid message format or content too long." };
    }
    if (typeof role !== "string" || !VALID_CHAT_ROLES.has(role)) {
      return { ok: false, status: 400, error: "Invalid message role." };
    }
  }

  const safeContext =
    context && typeof context === "object" && !Array.isArray(context)
      ? (context as Record<string, unknown>)
      : {};

  return {
    ok: true,
    data: {
      messages: messages as ChatMessagePayload[],
      context: safeContext,
    },
  };
}

/** Map client roles to provider-safe roles and sanitize content. */
export function formatMessagesForProvider(messages: ChatMessagePayload[]) {
  return messages.map((message) => ({
    role: message.role === "user" ? "user" : "assistant",
    content: sanitizeChatInput(message.content),
  }));
}
