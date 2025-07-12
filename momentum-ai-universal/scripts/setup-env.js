// Setup environment variables for running migrations
require('dotenv').config();

const fs = require('fs');
const path = require('path');

// Required environment variables
const requiredVars = {
  SUPABASE_URL: 'https://nsgqhhbqpyvonirlfluv.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTc1NjE2MCwiZXhwIjoyMDI1MzMyMTYwfQ.ms5JrkNikk5-cFSJkJuZzL30IHTg00WsCQ13tu0pEGM',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1NTgsImV4cCI6MjA2NTMzMjU1OH0.twGF9Y6clrRtJg_4S1OWHA1vhhYpKzn3ZpFJPGJbmEo'
};

// Set environment variables
Object.entries(requiredVars).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
    console.log(`✅ Set ${key}`);
  } else {
    console.log(`✓ ${key} already set`);
  }
});

// Export for use in other scripts
module.exports = requiredVars; 