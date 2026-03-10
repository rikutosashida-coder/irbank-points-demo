import type { AnalysisItem } from '../features/notes/types/note.types';

export function computeWeightedRating(items: AnalysisItem[]): number | null {
  const rated = items.filter(i => i.rating && i.rating > 0);
  if (!rated.length) return null;
  const sum = rated.reduce((s, i) => s + (i.rating! * (i.weight || 5)), 0);
  const wt = rated.reduce((s, i) => s + (i.weight || 5), 0);
  return sum / wt;
}
