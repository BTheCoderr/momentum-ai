import { formatDate } from '../../utils/formatDate';

describe('formatDate', () => {
  beforeAll(() => {
    // Mock the timezone to UTC
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-20T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('formats a date string correctly', () => {
    const date = new Date('2024-03-20T12:00:00Z');
    const formattedDate = formatDate(date.toISOString());
    expect(formattedDate).toMatch(/March 20, 2024/);
  });

  it('handles different date formats', () => {
    const date = new Date('2024-03-20T12:00:00Z');
    const formattedDate = formatDate(date.toISOString());
    expect(formattedDate).toMatch(/March 20, 2024/);
  });

  it('formats dates with single-digit day', () => {
    const date = new Date('2024-03-05T12:00:00Z');
    const formattedDate = formatDate(date.toISOString());
    expect(formattedDate).toMatch(/March 5, 2024/);
  });
}); 