import { defineTool } from "eve/tools";
import { z } from "zod";

// The edit_file tool from part 1. Tests are editable here, because some issues ask for a new test.
// What changed: the file now lives in the sandbox, so reads and writes go through
// ctx.getSandbox() and no longer through node:fs.
export default defineTool({
  description: "Replace one exact string in a file. old_text must appear exactly once in the file.",
  inputSchema: z.object({ path: z.string(), old_text: z.string(), new_text: z.string() }),
  async execute({ path, old_text, new_text }, ctx) {
    

    const sandbox = await ctx.getSandbox();
    const content = await sandbox.readTextFile({ path });
    if (content === null) throw new Error(`${path} does not exist.`);

    const matches = content.split(old_text).length - 1;
    if (matches !== 1) throw new Error(`old_text appears ${matches} times in ${path}. It must appear exactly once.`);

    await sandbox.writeTextFile({ path, content: content.replace(old_text, () => new_text) });
    return `Edited ${path}.`;
  },
});
