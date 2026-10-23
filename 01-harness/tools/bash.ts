import { execSync } from "node:child_process";
import { tool } from "ai";
import { z } from "zod";

// One tool is enough to start. A model with a shell can read files, change them and run the tests.
export default tool({
  description: "Run a shell command in the project directory. Returns its output.",
  inputSchema: z.object({ command: z.string() }),
  execute: async ({ command }) => {
    try {
      return execSync(command, { cwd: "workspace", encoding: "utf8", stdio: "pipe", timeout: 60_000 }).slice(-4000);
    } catch (error: any) {
      // A failing command is not a crash. It is what the model needs to read next.
      return `exit code ${error.status}\n${error.stdout}${error.stderr}`.slice(-4000);
    }
  },
});
