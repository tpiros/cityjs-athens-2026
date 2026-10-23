import type { ToolContext } from "eve/tools";
import type { ChangedFile } from "./changes.ts";
import { github } from "./github.ts";

type PullRequest = { branch: string; commitMessage: string; title: string; body: string; files: ChangedFile[] };

// One commit on a new branch, then a pull request. All through the GitHub API,
// so the sandbox never needs a token and never pushes.
export async function openPullRequest(ctx: ToolContext, { branch, commitMessage, title, body, files }: PullRequest) {
  const main = await github(ctx, "GET", "/git/ref/heads/main");
  const parent = await github(ctx, "GET", `/git/commits/${main.object.sha}`);

  const tree = await github(ctx, "POST", "/git/trees", {
    base_tree: parent.tree.sha,
    tree: files.map(({ path, content }) =>
      content === null ? { path, mode: "100644", type: "blob", sha: null } : { path, mode: "100644", type: "blob", content },
    ),
  });

  const commit = await github(ctx, "POST", "/git/commits", { message: commitMessage, tree: tree.sha, parents: [main.object.sha] });
  await github(ctx, "POST", "/git/refs", { ref: `refs/heads/${branch}`, sha: commit.sha });

  return github(ctx, "POST", "/pulls", { title, body, head: branch, base: "main" });
}
