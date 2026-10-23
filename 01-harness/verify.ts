import { spawnSync } from "node:child_process";
import { cpSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

// A model saying it is done is a claim, not evidence. The harness checks.
export function verify() {
  // The cheapest way to make a test pass is to edit the test. So we do not ask the model
  // to leave test/ alone and hope. We put our own copy back, then run the tests.
  rmSync("workspace/test", { recursive: true, force: true });
  cpSync("workspace-template/test", "workspace/test", { recursive: true });

  const result = spawnSync("npm", ["test"], { cwd: "workspace", encoding: "utf8" });
  const output = result.stdout + result.stderr;
  const count = (label: string) => output.match(new RegExp(`ℹ ${label} (\\d+)`))?.[1] ?? "?";

  return { passed: result.status === 0, summary: `${count("pass")} passing, ${count("fail")} failing`, output: output.slice(-4000) };
}

// Everything in the workspace as one string. Take one before the run and one after:
// if they match, the agent changed nothing, and there is nothing to verify.
export function snapshot(): string {
  return readdirSync("workspace", { recursive: true, encoding: "utf8" })
    .map((name) => join("workspace", name))
    .filter((path) => statSync(path).isFile())
    .map((path) => path + readFileSync(path, "utf8"))
    .join("\n");
}
