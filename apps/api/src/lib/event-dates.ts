const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export type EventDateFilter = 'all' | 'today' | 'upcoming' | 'past';

function calendarDate(value: unknown, timeZone: string): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const raw = value.trim();
  if (DATE_ONLY.test(raw)) return raw;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(parsed);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function todayInTimeZone(timeZone: string): string {
  return calendarDate(new Date().toISOString(), timeZone) as string;
}

export function matchesEventDateFilter(
  startDate: unknown,
  endDate: unknown,
  filter: EventDateFilter,
  timeZone: string,
): boolean {
  if (filter === 'all') return true;
  const start = calendarDate(startDate, timeZone);
  if (!start) return false;
  const end = calendarDate(endDate, timeZone) || start;
  const today = todayInTimeZone(timeZone);

  if (filter === 'today') return start <= today && end >= today;
  if (filter === 'upcoming') return start > today;
  return end < today;
}

export function eventDateSortValue(value: unknown, timeZone: string): string {
  return calendarDate(value, timeZone) || '0000-00-00';
}
