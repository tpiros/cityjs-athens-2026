// What you see in the terminal. None of this affects the agent.
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;

// One line per step: the tool the model chose, what it ran, and what the step cost.
// If the tool refused, say so. Otherwise a rejected edit looks just like one that worked.
export function logStep(turn: number, toolName: string, input: Record<string, string>, tokens?: number, error?: unknown) {
  const firstLine = String(Object.values(input)[0]).split("\n")[0]!.slice(0, 60);
  console.log(`${String(turn).padStart(2)}. ${toolName}: ${firstLine}  (${tokens} tokens)`);

  if ("old_text" in input && "new_text" in input) logDiff(input.old_text!, input.new_text!);
  if (error) console.log(red(`    ✗ ${error instanceof Error ? error.message : String(error)}`));
}

// An edit is "replace this with that", so the diff is already there. Skip the lines both sides share.
function logDiff(oldText: string, newText: string) {
  const before = oldText.split("\n");
  const after = newText.split("\n");
  while (before.length && after.length && before[0] === after[0]) (before.shift(), after.shift());
  while (before.length && after.length && before.at(-1) === after.at(-1)) (before.pop(), after.pop());

  for (const line of before) console.log(red(`    - ${line}`));
  for (const line of after) console.log(green(`    + ${line}`));
}
