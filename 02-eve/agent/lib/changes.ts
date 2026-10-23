import type { SandboxSession } from "eve/sandbox";

export type ChangedFile = { path: string; content: string | null };

// Which files did the agent change? Ask git, inside the sandbox. A deleted file has no content.
export async function changedFiles(sandbox: SandboxSession): Promise<ChangedFile[]> {
  const status = await sandbox.run({ command: "git status --porcelain --untracked-files=all" });
  const paths = status.stdout.split("\n").filter(Boolean).map((line) => line.slice(3));

  return Promise.all(paths.map(async (path) => ({ path, content: await sandbox.readTextFile({ path }) })));
}
