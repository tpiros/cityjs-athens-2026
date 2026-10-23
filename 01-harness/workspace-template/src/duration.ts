const SECONDS: Record<string, number> = { s: 1, m: 60, h: 3600 };

/** Parses strings such as "45s", "1h30m" or "2h 5m 10s" into seconds. */
export function parseDuration(input: string): number {
  const match = input.match(/(\d+)([smh])/);
  if (!match) return 0;
  return Number(match[1]) * (SECONDS[match[2]!] ?? 0);
}
