import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { changedFiles } from "../lib/changes.ts";
import { runChecks } from "../lib/checks.ts";
import { openPullRequest } from "../lib/pull_request.ts";

export default defineTool({
  description: "Open a pull request with the changes in /workspace. Call this once, when the fix is finished and tested.",
  inputSchema: z.object({
    issue: z.number().int().positive(),
    title: z.string().describe("Pull request title, without the issue number."),
    summary: z.string().describe("What was broken and what the fix changes. A few sentences."),
  }),

  // Other people will see this pull request, so a person approves it first.
  // In Slack the question shows up as Approve and Cancel buttons.
  approval: always(),

  async execute({ issue, title, summary }, ctx) {
    const sandbox = await ctx.getSandbox();

    const files = await changedFiles(sandbox);
    if (files.length === 0) throw new Error("No files were changed, so there is nothing to commit.");

    const checks = await runChecks(sandbox);

    const pullRequest = await openPullRequest(ctx, {
      branch: `fix/issue-${issue}`,
      commitMessage: `fix: ${title} (#${issue})`,
      title: `Fixes #${issue}: ${title}`,
      files,
      body: [
        `Fixes #${issue}`,
        summary,
        "### Checked by the harness",
        [
          "- `npm run lint`: passes",
          `- \`npm test\`: ${checks.tests}`,
          `- Files changed: ${files.map((file) => `\`${file.path}\``).join(", ")}`,
        ].join("\n"),
      ].join("\n\n"),
    });

    return { url: pullRequest.html_url, number: pullRequest.number, tests: checks.tests };
  },
});
