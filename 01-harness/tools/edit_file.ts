import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, normalize } from "node:path";
import { tool } from "ai";
import { z } from "zod";

// Bash can already edit, but only by rewriting the whole file. This sends just the change.
export default tool({
  description: "Replace one exact string in a file. old_text must appear exactly once in the file.",
  inputSchema: z.object({ path: z.string(), old_text: z.string(), new_text: z.string() }),
  execute: async ({ path, old_text, new_text }) => {
    // The prompt asks the model to leave the tests alone. This line makes sure.
    // if (normalize(path).startsWith("test")) throw new Error("The files in test/ are read-only. Fix the code in src/.");

    const file = join("workspace", path);
    const content = readFileSync(file, "utf8");

    // Refuse to guess. A thrown error goes back to the model, which can read the file and try again.
    const matches = content.split(old_text).length - 1;
    if (matches !== 1) throw new Error(`old_text appears ${matches} times in ${path}. It must appear exactly once.`);

    const updated = content.replace(old_text, () => new_text);
    writeFileSync(file, updated);

    // Don't make the model spend two turns finding out what its edit did. Tell it.
    const tests = spawnSync("npm", ["test"], { cwd: "workspace", encoding: "utf8" });
    return `Edited ${path}. It now reads:\n${updated}\nnpm test:\n${failures(tests.stdout)}`;
  },
});

// Only what the model needs from a failing run: which test, expected and actual. No stack traces.
function failures(output: string): string {
  const failing = output.split("✖ failing tests:")[1];
  if (!failing) return "all tests pass";
  return failing.split("\n").filter((line) => /^(test at|✖)|Error|!==|^ {2}[+-] /.test(line)).join("\n");
}
