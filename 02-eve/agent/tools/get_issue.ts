import { defineTool } from "eve/tools";
import { z } from "zod";
import { github } from "../lib/github.ts";

export default defineTool({
  description: "Read a GitHub issue from the repository: its title, body and state.",
  inputSchema: z.object({ number: z.number().int().positive() }),
  async execute({ number }, ctx) {
    const issue = await github(ctx, "GET", `/issues/${number}`);
    return { number, title: issue.title, state: issue.state, body: issue.body };
  },
});
