import { sortPlansResponseBody } from './sort-plan-items-response.interceptor';

describe('sortPlansResponseBody', () => {
  it('sorts a single day plan by timeText ascending', () => {
    const body = {
      id: 'plan-1',
      items: [
        {
          timeText: '12:12',
          position: 0,
          createdAt: '2026-05-02T10:05:33.558Z',
        },
        {
          timeText: '11:11',
          position: 1,
          createdAt: '2026-05-02T10:05:39.890Z',
        },
      ],
    };
    const out = sortPlansResponseBody(body) as typeof body;
    expect(out.items.map((i) => i.timeText)).toEqual(['11:11', '12:12']);
  });

  it('sorts each row in an array of day plans', () => {
    const body = [
      {
        items: [
          { timeText: '09:30', position: 1, createdAt: new Date() },
          { timeText: '08:00', position: 0, createdAt: new Date() },
        ],
      },
    ];
    const out = sortPlansResponseBody(body) as typeof body;
    expect(out[0].items.map((i) => i.timeText)).toEqual(['08:00', '09:30']);
  });

  it('passes through non-plan payloads', () => {
    expect(sortPlansResponseBody({ id: 'x', title: 'y' })).toEqual({
      id: 'x',
      title: 'y',
    });
    expect(sortPlansResponseBody(null)).toBeNull();
  });
});
