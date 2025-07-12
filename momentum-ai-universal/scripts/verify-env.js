require('../test-env');

console.log('Environment Variables Check:');
console.log('----------------------------');

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

let hasErrors = false;

for (const varName of requiredVars) {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: Missing`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: Present (${value.substring(0, 10)}...)`);
  }
}

if (hasErrors) {
  console.log('\n⚠️ Some required environment variables are missing!');
  process.exit(1);
} else {
  console.log('\n✨ All required environment variables are present!');
} 