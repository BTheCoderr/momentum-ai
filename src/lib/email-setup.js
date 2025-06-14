// Run this script to get free email credentials for testing
// Usage: node src/lib/email-setup.js

const nodemailer = require('nodemailer');

async function createTestAccount() {
  try {
    // Create a test account with Ethereal Email
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('\n🎉 Free Email Credentials Generated!');
    console.log('\nAdd these to your .env file:');
    console.log('=====================================');
    console.log(`EMAIL_SERVER_HOST="${testAccount.smtp.host}"`);
    console.log(`EMAIL_SERVER_PORT="${testAccount.smtp.port}"`);
    console.log(`EMAIL_SERVER_USER="${testAccount.user}"`);
    console.log(`EMAIL_SERVER_PASSWORD="${testAccount.pass}"`);
    console.log(`EMAIL_FROM="noreply@momentum-ai.com"`);
    console.log('=====================================\n');
    
    console.log('📧 Test emails will be viewable at: https://ethereal.email');
    console.log(`📧 Login with: ${testAccount.user} / ${testAccount.pass}\n`);
    
  } catch (error) {
    console.error('Error creating test account:', error);
  }
}

createTestAccount(); 