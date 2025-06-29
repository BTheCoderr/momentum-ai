import { formatDate } from '../utils/formatDate';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-03-15T12:00:00Z');
    expect(formatDate(date)).toBe('March 15, 2024');
  });

  it('handles string dates', () => {
    expect(formatDate('2024-03-15')).toBe('March 15, 2024');
  });
}); 