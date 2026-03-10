export type InsightSeverity = 'info' | 'warning' | 'positive';

export interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  actionLabel?: string;
  actionRoute?: string;
}
