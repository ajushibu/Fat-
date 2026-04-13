import { format, parseISO, startOfWeek, differenceInDays, subDays } from 'date-fns';

export const todayStr = (): string => format(new Date(), 'yyyy-MM-dd');

export const formatDate = (dateStr: string, fmt = 'MMM d, yyyy'): string => {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
};

export const formatDateShort = (dateStr: string): string => formatDate(dateStr, 'MMM d');

export const weekStartStr = (date = new Date()): string =>
  format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');

export const daysAgo = (n: number): string =>
  format(subDays(new Date(), n), 'yyyy-MM-dd');

export const daysBetween = (a: string, b: string): number =>
  differenceInDays(parseISO(b), parseISO(a));

export const last7Days = (): string[] =>
  Array.from({ length: 7 }, (_, i) => daysAgo(6 - i));

export const last30Days = (): string[] =>
  Array.from({ length: 30 }, (_, i) => daysAgo(29 - i));

export const dayLabel = (dateStr: string): string =>
  format(parseISO(dateStr), 'EEE');
