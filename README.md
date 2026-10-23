# The Harness Engineering Workshop

CityJS Athens, 22 October 2026.

An agent is a model plus a harness. The morning has two halves:

1. [`01-harness/`](./01-harness): write the harness by hand. A loop, two tools, guardrails, context
   trimming and a verify step, on the AI SDK with Gemini. Then list what it still cannot do.
2. [`02-eve/`](./02-eve): the same ideas on eve, pointed at a real GitHub repository. Tell the
   agent which issue to fix, from the terminal or from Slack. It fixes the code in a sandbox and
   opens a pull request once a person approves.

`plan-1-harness.md` and `plan-2-eve.md` are the current plans, with what is verified, measured and
still assumed. `PLAN.md` is the original single-part brief and predates the split.
