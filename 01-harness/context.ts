import type { ModelMessage } from "ai";

// The naive version of context management: keep the task, keep the recent messages, drop the middle.
// It loses things the agent may have needed. It also never grows past a fixed size.
// ⛔️ Obviously do not use in production or in a real system
export function trimContext(messages: ModelMessage[], maxMessages = 30): ModelMessage[] {
  if (messages.length <= maxMessages) return messages;

  const [task, ...rest] = messages;
  let recent = rest.slice(-(maxMessages - 1));

  // Never start on a tool result whose tool call was dropped. The API rejects an answer without a question.
  while (recent[0]?.role === "tool") recent = recent.slice(1);

  return [task!, ...recent];
}
