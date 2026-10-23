// Hard limits, enforced in code, whatever the model wants.
// A guardrail looks at the run so far and returns a reason to stop, or nothing.
type Run = { turns: number; tokens: number };
type Guardrail = (run: Run) => string | undefined;

const maxTurns = (limit: number): Guardrail => ({ turns }) =>
  turns >= limit ? `reached the turn limit (${limit})` : undefined;

const maxTokens = (limit: number): Guardrail => ({ tokens }) =>
  tokens >= limit ? `reached the token budget (${limit})` : undefined;

const guardrails = [maxTurns(25), maxTokens(250_000)];

export function checkGuardrails(run: Run): string | undefined {
  for (const guardrail of guardrails) {
    const reason = guardrail(run);
    if (reason) return reason;
  }
}
