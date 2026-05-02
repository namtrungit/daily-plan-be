/** Fields used to order items by planned clock (`timeText`), then creation / position. */
export type PlanItemSortFields = {
  /** Planned time shown in the UI (e.g. `06:20`). Primary sort key. */
  timeText: string | null;
  createdAt: Date | string;
  position: number;
};

/** Matches HH:mm or HH:mm:ss (24h). */
const PLANNED_TIME_RE = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;

/** Strip invisible Unicode & normalize spaces so parsing matches UI `HH:mm`. */
export function normalizeTimeTextForSort(
  timeText: string | null | undefined,
): string | null {
  if (timeText == null) return null;
  const s = String(timeText)
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '')
    .replace(/\uff1a/g, ':')
    .replace(/：/g, ':')
    .trim()
    .replace(/\s*:\s*/g, ':');
  return s.length > 0 ? s : null;
}

/**
 * Minutes since midnight from planned `timeText`, or `null` if missing / invalid.
 * Accepts optional seconds (e.g. `06:20:00`). Uses normalized text so odd whitespace
 * does not force fallback sort by `position`.
 */
export function plannedMinutesSinceMidnight(
  timeText: string | null | undefined,
): number | null {
  const s = normalizeTimeTextForSort(timeText);
  if (s == null) return null;
  const m = PLANNED_TIME_RE.exec(s);
  if (!m) return null;
  const h = Number.parseInt(m[1], 10);
  const min = Number.parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

function fallbackOrderKey(item: PlanItemSortFields): number {
  const raw = item.createdAt;
  const d = raw instanceof Date ? raw : new Date(raw);
  const t = d.getTime();
  if (!Number.isNaN(t)) return t;
  const p = Number(item.position);
  return Number.isFinite(p) ? p : 0;
}

export function comparePlanItemsByTime(a: PlanItemSortFields, b: PlanItemSortFields): number {
  const pa = plannedMinutesSinceMidnight(a.timeText ?? null);
  const pb = plannedMinutesSinceMidnight(b.timeText ?? null);
  const aTimed = pa !== null;
  const bTimed = pb !== null;
  if (aTimed && bTimed) {
    if (pa !== pb) return pa - pb;
    return fallbackOrderKey(a) - fallbackOrderKey(b);
  }
  if (aTimed && !bTimed) return -1;
  if (!aTimed && bTimed) return 1;
  const na = normalizeTimeTextForSort(a.timeText ?? null);
  const nb = normalizeTimeTextForSort(b.timeText ?? null);
  if (na && nb) {
    const cmp = na.localeCompare(nb, undefined, { numeric: true });
    if (cmp !== 0) return cmp;
  }
  return fallbackOrderKey(a) - fallbackOrderKey(b);
}

/**
 * Ascending by parsed `timeText` (earliest planned time first). Untimed / unparsable rows last
 * (then stable via createdAt / position, or raw string compare ascending).
 */
export function sortPlanItemsByPlannedTime<T extends PlanItemSortFields>(items: T[]): T[] {
  return Array.from(items).sort((a, b) => comparePlanItemsByTime(a, b));
}

/**
 * Returns a shallow copy of `plan` with `items` sorted by `timeText` ascending.
 * Use at the service and controller boundary so responses never leak raw `position` order.
 */
export function dayPlanWithSortedItems<T extends { items: PlanItemSortFields[] }>(plan: T): T {
  const sorted = sortPlanItemsByPlannedTime(
    Array.from(plan.items ?? []) as PlanItemSortFields[],
  ) as T['items'];
  return { ...plan, items: sorted };
}
