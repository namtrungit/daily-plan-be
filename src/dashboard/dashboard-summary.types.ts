export type DashboardRange = '7d' | '30d';

export type DashboardSummary = {
  today: { total: number; done: number; completionRate: number };
  overdue: { count: number };
  trend: { date: string; doneCount: number }[];
  streak: { days: number };
  meta: { range: DashboardRange; userId: string; todayYmd: string };
};