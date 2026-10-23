# Part 1: write the harness by hand

CityJS Athens, 22 October 2026, 9:00 to 12:00. This covers the first 100 minutes. `plan-2-eve.md` covers the rest. Both replace `plan.md`.

The code is in `01-harness/`. It runs today.

## What attendees build

An agent that fixes failing tests in a small TypeScript project. Eight files, about 150 lines, on the AI SDK with `@ai-sdk/google`. Node 24 runs the TypeScript directly, so there is no build step and no tsx.

Attendees write the `while` loop themselves. The AI SDK makes one model call per turn and runs the tool the model asked for. Going round again is our code.

## Stages

Every timing here is a guess. Nobody has rehearsed this yet.

| Min | Stage | Files | The decision to explain |
| --- | --- | --- | --- |
| 10 | Intro | none | An agent is a model plus a harness. Show the loop diagram and the climbing harness line. |
| 35 | The loop and one tool | `agent.ts`, `model.ts`, `instructions.md`, `tools/bash.ts` | Why one tool is enough to start. A model with a shell can read, edit and run tests. |
| 15 | A second tool | `tools/edit_file.ts` | Bash edits by rewriting the whole file. `edit_file` sends only the change and fails loudly on an ambiguous match. |
| 15 | Guardrails | `guardrails.ts` | Limits belong in code. The model will not always decide to stop. |
| 10 | Context | `context.ts` | Keep the task and the recent messages, drop the middle. Say plainly that this loses things. |
| 15 | Verify | `verify.ts`, the `test/` rule in `edit_file.ts` | "Done" from the model is a claim. The harness runs the tests itself and puts its own test files back first. |

That is 100 minutes with no slack inside it. The slack sits in part 2.

The description promises a working agent inside the first hour. Intro plus the first stage is 45 minutes, so there is a 15 minute margin.

## The opening demo

Run the finished harness with `MODEL=gemini-2.5-flash-lite`. In my one run it kept redoing the same edits, fixed 8 of 9 tests, and the token guardrail stopped it at turn 24. You can also watch the input token count stop growing once `context.ts` starts trimming. That gives the audience a reason to care about every later stage.

`gemini-3.8-flash` and `gemini-3.5-flash-lite` both solved the task with the bare loop. With those models the guardrails and the verify step have nothing to catch, and the stages feel unmotivated. Attendees should still build with `gemini-3.8-flash` so that nobody gets stuck.

## The bash argument, told honestly

Vercel has written about this twice, and the two posts pull in different directions. Show both.

- "We removed 80% of our agent's tools" (December 2025). 15 specialised tools became one bash tool. The post reports success up from 80% to 100% and 37% fewer tokens. Their own caveat is that it only worked because the data was already well documented.
- "Testing if bash is all you need" (January 2026). Bash alone scored 52.7% against 100% for a SQL agent, at over six times the cost. Bash plus SQLite won in the end, and they credit self-verification.

That second post is the case for `edit_file` and `verify.ts`. One general tool is the right start, and it is not the whole answer.

## Verified

- `gemini-3.8-flash` exists and the prices are from Google's pricing page, checked 2026-09-21.
- The harness typechecks and ran against three real Gemini models.
- The message shapes, the `tool` role and the `error-text` convention match the AI SDK 7 docs and types.
- The Google provider carries Gemini's thought signatures inside the messages, so pushing `responseMessages` back unchanged keeps them.

## Measured, once each, so treat as anecdote

| Model | Result | Turns |
| --- | --- | --- |
| `gemini-3.8-flash` | 9 of 9, verified | 14 |
| `gemini-3.5-flash-lite` | 9 of 9, verified | 11 |
| `gemini-2.5-flash-lite` | 8 of 9, stopped by the token guardrail | 24 |

Bash only, before `edit_file` existed: 14 turns, about 81,000 input tokens, roughly 8 cents. First turn input was 115 tokens.

## Not verified

- The "you said done but the tests fail" path has never fired. No model has lied to it yet.
- Whether `edit_file` saves tokens. On 10-line files it cannot show much. It needs a task with a large file.
- All the numbers from the Vercel posts. I read them through a summarising fetch tool. Read the originals before they go on a slide.
- Free tier rate limits with a full room.

## Known rough edges

- Every model ran `npm test` on turn 1, even though the harness had already given it the output. One wasted turn per run.
- `verify.ts` overwrites `workspace/test` with the shipped copy. Correct for this task, wrong for any task that involves writing tests.
- There are no per-stage checkpoints yet, only the finished code. Stragglers need them.
- The agent has a real shell on the attendee's laptop. The README says so. Part 2 is the answer.

## Open decisions for Tamas

1. Keys. Attendees bring their own, or credits from CityJS or a sponsor.
2. Checkpoints as folders or branches. I would use folders.
3. Whether to mention the chatbot line from the published description at all.
4. The "twenty-one patterns" source is still unchecked, and so is the pattern map that depends on it.
