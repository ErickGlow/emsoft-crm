import {
  startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  subDays, format, isToday, isPast, formatDistanceToNow, subWeeks,
} from "date-fns";

export type DateRangeKey = "today" | "yesterday" | "this_week" | "last_week" | "this_month" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

export function getDateRange(key: DateRangeKey, custom?: { from: Date; to: Date }): DateRange {
  const now = new Date();
  switch (key) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now), label: "Today" };
    case "yesterday": {
      const y = subDays(now, 1);
      return { from: startOfDay(y), to: endOfDay(y), label: "Yesterday" };
    }
    case "this_week":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }), label: "This Week" };
    case "last_week": {
      const lw = subWeeks(now, 1);
      return { from: startOfWeek(lw, { weekStartsOn: 1 }), to: endOfWeek(lw, { weekStartsOn: 1 }), label: "Last Week" };
    }
    case "this_month":
      return { from: startOfMonth(now), to: endOfMonth(now), label: "This Month" };
    case "custom":
      if (custom) return { from: startOfDay(custom.from), to: endOfDay(custom.to), label: "Custom Range" };
      return { from: startOfDay(now), to: endOfDay(now), label: "Custom Range" };
  }
}

export function fmtDate(d: string | Date, pattern = "MMM d, yyyy") {
  return format(new Date(d), pattern);
}

export function fmtDateTime(d: string | Date) {
  return format(new Date(d), "MMM d, h:mm a");
}

export function fmtTime(d: string | Date) {
  return format(new Date(d), "h:mm a");
}

export function relativeTime(d: string | Date) {
  return formatDistanceToNow(new Date(d), { addSuffix: true });
}

export function isOverdue(dueDate: string) {
  return isPast(endOfDay(new Date(dueDate))) && !isToday(new Date(dueDate));
}

export function isDueToday(dueDate: string) {
  return isToday(new Date(dueDate));
}

export type ReportPeriod = "daily" | "weekly" | "monthly";

export function getReportRange(period: ReportPeriod, anchor: Date): DateRange {
  if (period === "daily") return { from: startOfDay(anchor), to: endOfDay(anchor), label: format(anchor, "MMMM d, yyyy") };
  if (period === "weekly") {
    const from = startOfWeek(anchor, { weekStartsOn: 1 });
    const to = endOfWeek(anchor, { weekStartsOn: 1 });
    return { from, to, label: `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}` };
  }
  return { from: startOfMonth(anchor), to: endOfMonth(anchor), label: format(anchor, "MMMM yyyy") };
}

export function shiftAnchor(period: ReportPeriod, anchor: Date, direction: 1 | -1) {
  if (period === "daily") return subDays(anchor, -direction);
  if (period === "weekly") return subWeeks(anchor, -direction);
  const d = new Date(anchor);
  d.setMonth(d.getMonth() + direction);
  return d;
}
