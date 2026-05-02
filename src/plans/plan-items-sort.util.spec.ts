import {
  comparePlanItemsByTime,
  dayPlanWithSortedItems,
  normalizeTimeTextForSort,
  plannedMinutesSinceMidnight,
  sortPlanItemsByPlannedTime,
} from './plan-items-sort.util';

describe('plannedMinutesSinceMidnight', () => {
  it('parses HH:mm', () => {
    expect(plannedMinutesSinceMidnight('06:20')).toBe(380);
    expect(plannedMinutesSinceMidnight('07:00')).toBe(420);
  });

  it('parses HH:mm:ss (seconds ignored for ordering bucket)', () => {
    expect(plannedMinutesSinceMidnight('06:20:00')).toBe(380);
    expect(plannedMinutesSinceMidnight('06:20:59')).toBe(380);
  });

  it('returns null for invalid values', () => {
    expect(plannedMinutesSinceMidnight(null)).toBeNull();
    expect(plannedMinutesSinceMidnight('')).toBeNull();
    expect(plannedMinutesSinceMidnight('24:00')).toBeNull();
  });

  it('parses after stripping NBSP / invisible marks', () => {
    expect(plannedMinutesSinceMidnight('11\u00a0:\u00a011')).toBe(11 * 60 + 11);
    expect(normalizeTimeTextForSort('\ufeff12:12')).toBe('12:12');
  });
});

describe('sortPlanItemsByPlannedTime', () => {
  it('orders by timeText ascending when all have planned times', () => {
    const items = [
      {
        title: 'first-added',
        timeText: '07:00',
        position: 0,
        createdAt: new Date('2026-05-02T09:55:51.914Z'),
      },
      {
        title: 'second',
        timeText: '08:20',
        position: 1,
        createdAt: new Date('2026-05-02T09:56:00.790Z'),
      },
      {
        title: 'third',
        timeText: '14:20',
        position: 2,
        createdAt: new Date('2026-05-02T09:58:44.814Z'),
      },
      {
        title: 'fourth-added-latest-earliest-time',
        timeText: '06:20',
        position: 3,
        createdAt: new Date('2026-05-02T09:59:17.322Z'),
      },
    ];

    const sorted = sortPlanItemsByPlannedTime(items);
    expect(sorted.map((i) => i.timeText)).toEqual([
      '06:20',
      '07:00',
      '08:20',
      '14:20',
    ]);
  });

  it('orders 11:11 before 12:12 (asc) even when lower position is later in time', () => {
    const items = [
      {
        timeText: '12:12',
        position: 0,
        createdAt: new Date('2026-05-06T10:00:00.000Z'),
      },
      {
        timeText: '11:11',
        position: 1,
        createdAt: new Date('2026-05-06T10:01:00.000Z'),
      },
    ];
    const sorted = sortPlanItemsByPlannedTime(items);
    expect(sorted.map((i) => i.timeText)).toEqual(['11:11', '12:12']);
  });

  it('puts timed items before untimed', () => {
    const items = [
      {
        timeText: null,
        position: 0,
        createdAt: new Date('2026-05-02T10:00:00.000Z'),
      },
      {
        timeText: '09:00',
        position: 1,
        createdAt: new Date('2026-05-02T09:00:00.000Z'),
      },
    ];
    const sorted = sortPlanItemsByPlannedTime(items);
    expect(sorted[0].timeText).toBe('09:00');
    expect(sorted[1].timeText).toBeNull();
  });
});

describe('dayPlanWithSortedItems', () => {
  it('reorders items to timeText ascending', () => {
    const plan = {
      id: 'day-1',
      items: [
        {
          timeText: '12:12',
          position: 0,
          createdAt: new Date('2026-05-02T10:05:33.558Z'),
        },
        {
          timeText: '11:11',
          position: 1,
          createdAt: new Date('2026-05-02T10:05:39.890Z'),
        },
      ],
    };
    const out = dayPlanWithSortedItems(plan);
    expect(out.items.map((i) => i.timeText)).toEqual(['11:11', '12:12']);
  });
});

describe('comparePlanItemsByTime', () => {
  it('sort is stable for identical planned minutes via fallback key', () => {
    const a = {
      timeText: '09:00',
      position: 1,
      createdAt: new Date('2026-05-02T12:00:00.000Z'),
    };
    const b = {
      timeText: '09:00',
      position: 2,
      createdAt: new Date('2026-05-02T11:00:00.000Z'),
    };
    expect(comparePlanItemsByTime(a, b)).toBeGreaterThan(0);
  });
});
