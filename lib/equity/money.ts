const MONEY_MULTIPLIERS = {
  m: 1_000_000,
  b: 1_000_000_000,
} as const;

export function parseMoneyDraft(draft: string): number | null {
  const normalized = draft
    .trim()
    .toLowerCase()
    .replaceAll("$", "")
    .replaceAll(",", "")
    .replaceAll(" ", "");
  const match = normalized.match(/^(\d+(?:\.\d*)?|\.\d+)([mb])?$/);

  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const suffix = match[2] as keyof typeof MONEY_MULTIPLIERS | undefined;
  const value = amount * (suffix ? MONEY_MULTIPLIERS[suffix] : 1);

  return Number.isFinite(value) ? Math.round(value) : null;
}
