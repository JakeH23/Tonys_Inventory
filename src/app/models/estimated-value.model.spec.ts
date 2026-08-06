import { buildEstimatedValueHistory, getMostRecentEstimatedValue, normalizeEstimatedValueHistory } from './estimated-value.model';

describe('estimated-value model helpers', () => {
  it('returns the latest numeric value for a numeric history input', () => {
    expect(getMostRecentEstimatedValue(125)).toBe(125);
  });

  it('normalizes legacy numeric values into a history entry', () => {
    const history = normalizeEstimatedValueHistory(200);

    expect(history).toEqual([{ EstimatedCost: 200, DateChanged: jasmine.any(String) }]);
  });

  it('builds a new history entry when the cost changes and keeps the latest value first', () => {
    const existing = [{ EstimatedCost: 100, DateChanged: '2025-01-01T00:00:00.000Z' }];
    const history = buildEstimatedValueHistory(existing, 150);

    expect(history[0]).toEqual(jasmine.objectContaining({ EstimatedCost: 150 }));
    expect(history[1]).toEqual(jasmine.objectContaining({ EstimatedCost: 100 }));
  });

  it('does not duplicate the latest value when the cost is unchanged', () => {
    const existing = [{ EstimatedCost: 100, DateChanged: '2025-01-01T00:00:00.000Z' }];
    const history = buildEstimatedValueHistory(existing, 100);

    expect(history).toEqual(existing);
  });
});
