const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Test 1: Format a date string correctly
const date1 = new Date('2024-03-20T12:00:00Z');
const formattedDate1 = formatDate(date1.toISOString());
console.log('Test 1:', formattedDate1.includes('March') && formattedDate1.includes('20') && formattedDate1.includes('2024'));

// Test 2: Format dates with single-digit day
const date2 = new Date('2024-03-05T12:00:00Z');
const formattedDate2 = formatDate(date2.toISOString());
console.log('Test 2:', formattedDate2.includes('March') && formattedDate2.includes('5') && formattedDate2.includes('2024')); 