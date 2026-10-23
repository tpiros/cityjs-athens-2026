import { connect } from "@vercel/connect/eve";
import type { ToolContext } from "eve/tools";

const REPO = "tpiros/acme-tasks";

// The connector holds the GitHub App's credentials. We ask it for a short-lived token and act
// as the app itself, so the bot opens the pull requests and nobody has to sign in.
const githubApp = connect({ connector: "github/cityjs-pr-fixer", principalType: "app" });

// On your laptop, a GITHUB_TOKEN in .env is used instead.
// Either way the token lives here, in the app runtime. It never enters the sandbox, so the model
// cannot read it, print it, or send it anywhere.
async function getToken(ctx: ToolContext): Promise<string> {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;

  try {
    return (await ctx.getToken(githubApp)).token;
  } catch (error) {
    console.error("GitHub token request failed:", error); // the real reason, for the logs
    throw new Error(`The GitHub App has no access to ${REPO}. Stop and tell the user.`);
  }
}

export async function github(ctx: ToolContext, method: "GET" | "POST", path: string, body?: unknown) {
  const token = await getToken(ctx);

  const response = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    method,
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) throw new Error(`GitHub ${method} ${path} returned ${response.status}: ${await response.text()}`);
  return response.json();
}
