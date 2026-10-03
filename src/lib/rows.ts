/**
 * Postgres columns are snake_case, the app uses camelCase. Only top-level keys
 * are converted: nested jsonb values ({ en, fr }, image objects) stay as they are.
 */
const TO_COLUMN: Record<string, string> = { order: "sort_order", start: "start_month", end: "end_month" };
const TO_FIELD: Record<string, string> = Object.fromEntries(Object.entries(TO_COLUMN).map(([k, v]) => [v, k]));

const snake = (key: string) => TO_COLUMN[key] ?? key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const camel = (key: string) => TO_FIELD[key] ?? key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export function toRow(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined).map(([k, v]) => [snake(k), v]));
}

export function fromRow<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [camel(k), v])) as T;
}

export function fromRows<T>(rows: Record<string, unknown>[] | null): T[] {
  return (rows ?? []).map((r) => fromRow<T>(r));
}
