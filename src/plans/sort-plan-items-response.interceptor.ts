import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  type PlanItemSortFields,
  dayPlanWithSortedItems,
} from './plan-items-sort.util';

function hasSortedItemsArray(value: unknown): value is { items: unknown[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    Array.isArray((value as { items: unknown }).items)
  );
}

/** Last-mile guarantee: `items` are ordered by planned `timeText` ascending on every response. */
export function sortPlansResponseBody(body: unknown): unknown {
  if (body == null) return body;
  if (Array.isArray(body)) {
    return body.map((row) =>
      hasSortedItemsArray(row)
        ? dayPlanWithSortedItems(row as { items: PlanItemSortFields[] })
        : row,
    );
  }
  if (hasSortedItemsArray(body)) {
    return dayPlanWithSortedItems(body as { items: PlanItemSortFields[] });
  }
  return body;
}

@Injectable()
export class SortPlanItemsResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((body) => sortPlansResponseBody(body)));
  }
}
