import type { SandboxSession } from "eve/sandbox";

// The harness checks the work itself. The type check has to pass. The tests are compared with main,
// because main is red on purpose: one failing test per open issue. So "all tests pass" can't be the bar.
// The bar is: nothing that passed on main fails now, and at least one more test passes.
export async function runChecks(sandbox: SandboxSession) {
  const lint = await sandbox.run({ command: "npm run lint" });
  if (lint.exitCode !== 0) throw new Error(`npm run lint fails:\n${lint.stdout}${lint.stderr}`);

  const before = await passingOnMain(sandbox);
  const after = await passingTests(sandbox);

  const broken = [...before].filter((name) => !after.has(name));
  if (broken.length > 0) throw new Error(`These tests pass on main and fail now:\n${broken.join("\n")}`);

  const fixed = [...after].filter((name) => !before.has(name));
  if (fixed.length === 0) throw new Error("No test passes now that failed on main. Fix the issue, or add a regression test for it.");

  return { tests: `${after.size} passing, newly passing: ${fixed.join("; ")}` };
}

// Set the agent's changes aside, run the tests on main, then put the changes back.
async function passingOnMain(sandbox: SandboxSession) {
  const stash = await sandbox.run({ command: "git -c user.name=harness -c user.email=harness@localhost stash push --include-untracked" });
  if (stash.exitCode !== 0) throw new Error(`git stash fails:\n${stash.stdout}${stash.stderr}`);

  try {
    return await passingTests(sandbox);
  } finally {
    await sandbox.run({ command: "git stash pop" });
  }
}

// The names of the tests that pass right now.
async function passingTests(sandbox: SandboxSession) {
  const run = await sandbox.run({ command: "npx vitest run --reporter=json" });
  const report = JSON.parse(run.stdout) as { testResults: { assertionResults: { fullName: string; status: string }[] }[] };

  return new Set(report.testResults.flatMap((file) => file.assertionResults.filter((test) => test.status === "passed").map((test) => test.fullName)));
}
