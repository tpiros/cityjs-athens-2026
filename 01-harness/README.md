# Part 1: a harness, written by hand

An agent that fixes the failing tests in `workspace/`. Nine small files, under 200 lines in total.

A harness is everything around the model: the tools it can call, the context it sees, the
guardrails that stop it, the loop that drives it, and the checks that verify what it claims.
One file for each.

| File | What it is |
| --- | --- |
| `agent.ts` | The loop. The model decides, a tool acts, the result goes back in, repeat. |
| `model.ts` | The provider. Swap it here and nothing else changes. |
| `instructions.md` | The system prompt. Three lines. |
| `tools/bash.ts` | The first tool. A model with a shell can already do everything. |
| `tools/edit_file.ts` | The second tool. Sends only the change, and refuses to touch `test/`. |
| `guardrails.ts` | Hard limits on turns and tokens, enforced in code. |
| `context.ts` | Keeps the task and the recent messages, drops the middle. |
| `log.ts` | What you see in the terminal: one line per step, and a diff for every edit. |
| `verify.ts` | The harness runs the tests itself. "Done" from the model is a claim, not evidence. |

To add a tool, add a file in `tools/` and put it in the `tools` object in `agent.ts`.

## Run it

Needs Node 24 or newer. Node runs the TypeScript files directly, so there is no build step.

```sh
npm install
cp .env.example .env   # paste a Gemini API key into it
npm run reset          # creates workspace/ with 7 failing tests
npm run agent          # asks what you want it to do
```

Or pass the task directly: `npm run agent -- "fix the failing tests"`.

Each step prints one line: the tool the model chose, what it ran, and the tokens that step cost.
An edit also prints a diff, removed lines in red and added lines in green.
When the model says it is done, the harness runs the tests itself and prints PASS or FAIL. On a
FAIL it asks whether to send the agent back in with the test output.

`npm run reset` breaks the workspace again so you can rerun. To try a weaker model and watch the
harness work harder: `MODEL=gemini-2.5-flash-lite npm run agent`.

## Read this first

The agent gets a real shell on your machine, with your permissions. Nothing here isolates it.
That is one of the gaps part 2 closes.
