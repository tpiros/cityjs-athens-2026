# Part 2: the harness, on eve

Part 1 was a harness written by hand. This is the same idea on eve, Vercel's agent framework,
pointed at a real repository. You tell the agent which issue to fix in
[tpiros/acme-tasks](https://github.com/tpiros/acme-tasks). It reads the issue, fixes the code in a
sandbox, and opens a pull request once a person approves.

eve is in preview. This folder is pinned to `eve@0.80.1`.

## From part 1 to here

| Part 1 | Here | What changed |
| --- | --- | --- |
| `agent.ts`, the loop | nothing | eve runs the loop. |
| `instructions.md`, `model.ts` | `agent/instructions.md`, `agent/agent.ts` | The same kind of prompt, the same `@ai-sdk/google` model. |
| `tools/bash.ts`, a shell on your laptop | `agent/tools/bash.ts` and `agent/sandbox.ts` | The shell runs in a container with no network. There is no `..` that leads to your files. |
| `workspace/`, a folder | `/workspace`, a fresh clone of the repo | `agent/sandbox.ts` clones it and runs `npm ci` once. |
| `tools/edit_file.ts` | `agent/tools/edit_file.ts` | The same tool, reading and writing through the sandbox. |
| `guardrails.ts` | `limits` in `agent/agent.ts` | Configuration, not code. |
| `context.ts` | nothing | eve summarises old turns by itself. |
| `verify.ts` | `agent/lib/checks.ts` | The harness runs lint and the tests itself and writes the result into the pull request. |
| the y/n question in the terminal | `approval: always()` in `agent/tools/open_pull_request.ts` | A person approves before anyone else sees the work. In Slack it is a button. |

## The files

| File | What it does |
| --- | --- |
| `agent/instructions.md` | The steps: read the issue, reproduce, fix, test, open a pull request. And: if a tool fails, stop and say so. |
| `agent/agent.ts` | The model, the token limits, and `defaultTools: false` so only the tools below are on. |
| `agent/sandbox.ts` | Clones the public repo and installs dependencies once. Sessions start from that copy, with the network off. |
| `agent/tools/get_issue.ts` | Reads the issue through the GitHub API. |
| `agent/tools/open_pull_request.ts` | Calls the three `lib/` steps in order. Needs approval every time. |
| `agent/lib/changes.ts` | Asks git which files changed. |
| `agent/lib/checks.ts` | Runs lint and the tests. |
| `agent/lib/pull_request.ts` | One commit on a new branch, then the pull request, through the GitHub API. |
| `agent/lib/github.ts` | The one place that holds the GitHub credential. |
| `agent/tools/bash.ts`, `edit_file.ts`, `read_file.ts`, `write_file.ts` | The working tools. Three are one-line re-exports of eve's own. |

Two things to point out to a room:

- The GitHub token never enters the sandbox. The model has a shell in there, and a shell can print
  any secret it can reach. So the sandbox only clones a public URL, and the commit is made by the
  tool, outside the sandbox.
- `main` is red on purpose, one failing test per open issue. So the harness reports the test
  result in the pull request and does not demand an all-green run.

## Run it locally

Needs Node 24 or newer and Docker running.

```sh
npm install
cp .env.example .env   # a Gemini key, and a GitHub token that can read and write the repo
npm run dev
```

Then type `fix issue #1`. The agent stops and asks before it opens the pull request.

## Put it on Slack

Run these from this folder, in this order. Each one needs the one before it.

1. **Vercel project.** `npx eve link` creates a project and links this folder to it. The project
   is where the agent runs. https://vercel.com/tamas-piros-projects
2. **Gemini key.** `vercel env add GOOGLE_GENERATIVE_AI_API_KEY production` lets the deployed
   agent call the model. https://aistudio.google.com/apikey
3. **GitHub App.** `vercel connect create github --name cityjs-pr-fixer` opens the browser, creates
   a GitHub App and stores its credentials as a connector. Install it on `tpiros/acme-tasks` only.
   Always install from this flow, never from GitHub's own install page, which fails with
   "Missing 'state' parameter". Check it at https://github.com/settings/installations
4. **Wire the connector in.** `npm install @vercel/connect`, then make `agent/lib/github.ts` ask
   Connect for a token: `connect({ connector: "github/cityjs-pr-fixer", principalType: "app" })`
   and `ctx.getToken(...)`. No secret sits in the repo or in the environment.
5. **Slack app.** `npx eve add channel/slack`, choose Vercel Connect, then create a new Slack app
   and install it in your workspace. It points Slack's events at `/eve/v1/slack` and writes
   `agent/channels/slack.ts`. https://api.slack.com/apps
6. **Deploy.** `npx eve deploy` builds the agent and puts it live.
7. **Test.** DM the bot `fix issue #2`. Approve and Cancel buttons appear before the pull request
   is opened. https://github.com/tpiros/acme-tasks/pulls

A connector is Vercel's record of an app's credentials. Deleting a connector does not delete the
GitHub App or the Slack app behind it. Those are removed at https://github.com/settings/apps and
https://api.slack.com/apps.

## Reset the demo

Pull request numbers never go back. To get the repo to its starting state (issues #1 to #3, next
pull request #4), delete it and run `scripts/create-github.sh` from a clone. Then install the
GitHub App on the new repo again, from the Connect dashboard, because the old installation dies
with the old repo.
