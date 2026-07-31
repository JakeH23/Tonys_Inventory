export interface EstimatedValueEntry {
  EstimatedCost: number;
  DateChanged: string;
}

const LEGACY_VALUE_MIGRATION_DATE = '2025-06-01T00:00:00.000Z';

export const getMostRecentEstimatedValue = (history?: EstimatedValueEntry[] | number | null): number => {
  if (typeof history === 'number') {
    return Number.isFinite(history) && history >= 0 ? history : 0;
  }

  if (!history?.length) {
    return 0;
  }

  const sorted = [...history].sort(
    (a, b) => new Date(b.DateChanged).getTime() - new Date(a.DateChanged).getTime()
  );

  return Number(sorted[0]?.EstimatedCost) || 0;
};

export const normalizeEstimatedValueHistory = (
  history?: EstimatedValueEntry[] | number | null
): EstimatedValueEntry[] => {
  if (typeof history === 'number') {
    if (!Number.isFinite(history) || history < 0) {
      return [];
    }
    return [{ EstimatedCost: history, DateChanged: LEGACY_VALUE_MIGRATION_DATE }];
  }

  if (!history?.length) {
    return [];
  }

  return [...history]
    .filter((entry) => entry && Number.isFinite(Number(entry.EstimatedCost)) && Number(entry.EstimatedCost) >= 0)
    .map((entry) => ({
      EstimatedCost: Number(entry.EstimatedCost),
      DateChanged: new Date(entry.DateChanged).toISOString(),
    }))
    .sort((a, b) => new Date(b.DateChanged).getTime() - new Date(a.DateChanged).getTime());
};

export const buildEstimatedValueHistory = (
  existingHistory: EstimatedValueEntry[] | null | undefined,
  nextEstimatedCost: number
): EstimatedValueEntry[] => {
  const normalizedHistory = normalizeEstimatedValueHistory(existingHistory);
  const sanitizedCost = Number(nextEstimatedCost);

  if (!Number.isFinite(sanitizedCost) || sanitizedCost < 0) {
    return normalizedHistory;
  }

  const latestCost = getMostRecentEstimatedValue(normalizedHistory);
  if (normalizedHistory.length && latestCost === sanitizedCost) {
    return normalizedHistory;
  }

  return [
    {
      EstimatedCost: sanitizedCost,
      DateChanged: new Date().toISOString(),
    },
    ...normalizedHistory,
  ];
};
