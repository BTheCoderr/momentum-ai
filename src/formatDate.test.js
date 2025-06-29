import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate } from './formatDate.js';

test('formatDate', async (t) => {
  await t.test('formats a date string correctly', () => {
    const date = new Date('2024-03-20T12:00:00Z');
    const formattedDate = formatDate(date.toISOString());
    assert.match(formattedDate, /March/);
    assert.match(formattedDate, /20/);
    assert.match(formattedDate, /2024/);
  });

  await t.test('formats dates with single-digit day', () => {
    const date = new Date('2024-03-05T12:00:00Z');
    const formattedDate = formatDate(date.toISOString());
    assert.match(formattedDate, /March/);
    assert.match(formattedDate, /5/);
    assert.match(formattedDate, /2024/);
  });
}); 