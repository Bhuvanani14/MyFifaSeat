/** Shape of an OpenRouter completion response. */
export interface CompletionResponse {
  choices?: Array<{ message: { content: string } }>;
  message?: { content: string };
}

/** Extract assistant text from an OpenRouter-style completion payload. */
export function extractCompletionContent(completion: CompletionResponse | null | undefined): string {
  if (completion?.choices?.[0]?.message?.content) {
    return completion.choices[0].message.content;
  }
  if (completion?.message?.content) {
    return completion.message.content;
  }
  return "";
}
