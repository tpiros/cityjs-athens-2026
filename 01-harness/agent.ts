import { readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { generateText, type ModelMessage } from "ai";
import { trimContext } from "./context.ts";
import { checkGuardrails } from "./guardrails.ts";
import { logStep } from "./log.ts";
import { model } from "./model.ts";
import bash from "./tools/bash.ts";
import edit_file from "./tools/edit_file.ts";
import { snapshot, verify } from "./verify.ts";

const instructions = readFileSync("instructions.md", "utf8");
const tools = { bash, edit_file };

// You tell the agent what to do. Pass it as an argument, or type it when asked.
const terminal = createInterface({ input: process.stdin, output: process.stdout });
const task = process.argv[2] ?? (await terminal.question("What should the agent do?\n> "));

const messages: ModelMessage[] = [{ role: "user", content: task }];
const run = { turns: 0, tokens: 0 };
const before = snapshot();

// The agent is this loop. The model decides, a tool acts, the result goes back in, repeat.
while (true) {
  const stop = checkGuardrails(run);
  if (stop) {
    console.log(`\nharness: stopped, ${stop}`);
    break;
  }

  const result = await generateText({ model, instructions, messages: trimContext(messages), tools });

  messages.push(...result.responseMessages);
  run.turns++;
  run.tokens += result.usage.totalTokens ?? 0;

  for (const call of result.toolCalls) {
    const failed = result.content.find((part) => part.type === "tool-error" && part.toolCallId === call.toolCallId);
    logStep(run.turns, call.toolName, call.input as Record<string, string>, result.usage.totalTokens, failed?.type === "tool-error" ? failed.error : undefined);
  }

  // A tool call means the model is still working.
  if (result.toolCalls.length > 0) continue;

  // No tool call means the model thinks it is done.
  console.log(`\nagent: ${result.text.trim()}`);
  if (snapshot() === before) {
    console.log("harness: no files changed, so there is nothing to verify.");
    break;
  }

  // It changed something. Check before believing it.
  const check = verify();
  console.log(`harness: I ran the tests myself. ${check.passed ? "PASS" : "FAIL"} (${check.summary})`);
  if (check.passed) break;

  // If nobody is at the keyboard (input was piped in), the answer is no.
  const answer = await terminal.question("Send the agent back in with the test output? [Y/n] ").catch(() => "n");
  if (answer.trim().toLowerCase() === "n") break;
  messages.push({ role: "user", content: `The tests still fail:\n${check.output}` });
}

console.log(`\n${run.turns} turns, ${run.tokens} tokens`);
terminal.close();
