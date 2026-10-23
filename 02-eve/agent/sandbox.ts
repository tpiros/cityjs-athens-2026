import { defineSandbox, type SandboxSession } from "eve/sandbox";
import { DockerSandbox } from "eve/sandbox/docker";
import { VercelSandbox } from "eve/sandbox/vercel";

const REPO_URL = "https://github.com/tpiros/acme-tasks.git";

// The repository is public, so cloning needs no token. eve runs this once and keeps the result as
// an image, so every session starts from a fresh clone with dependencies installed.
// We think editing this file, for example after main moves, makes eve build the image again.
// That is not verified yet.
async function prepare(sandbox: SandboxSession) {
  const result = await sandbox.run({ command: `git clone --depth 1 ${REPO_URL} . && npm ci` });
  if (result.exitCode !== 0) throw new Error(`Sandbox setup failed:\n${result.stdout}${result.stderr}`);
}

// Cloning and `npm ci` need the network. On Vercel we can name the hosts.
// Docker only understands all or nothing, and builds its image with the network on.
export const environment = process.env.VERCEL
  ? VercelSandbox.environment({
      prepare,
      networkPolicy: { allow: { "github.com": [], "*.github.com": [], "registry.npmjs.org": [] } },
    })
  : DockerSandbox.environment({ prepare });

// Fixing a bug and running the tests needs no network at all, so the agent gets none.
export default defineSandbox(() => environment.open({ networkPolicy: "deny-all" }));
