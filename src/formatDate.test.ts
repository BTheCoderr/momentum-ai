import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats a date string correctly', () => {
    const date = new Date('2024-03-20T12:00:00Z');
    const formattedDate = formatDate(date.toISOString());
    expect(formattedDate).toContain('March');
    expect(formattedDate).toContain('20');
    expect(formattedDate).toContain('2024');
  });

  it('formats dates with single-digit day', () => {
    const date = new Date('2024-03-05T12:00:00Z');
    const formattedDate = formatDate(date.toISOString());
    expect(formattedDate).toContain('March');
    expect(formattedDate).toContain('5');
    expect(formattedDate).toContain('2024');
  });
}); 