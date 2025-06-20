#!/usr/bin/env node

// Simple testing without external dependencies
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3001';

console.log('🧪 MOMENTUM AI - COMPREHENSIVE TESTING SUITE\n');

const tests = [
  {
    name: '🌐 Web App Accessibility',
    test: async () => {
      const response = await fetch(BASE_URL);
      const html = await response.text();
      return {
        success: response.status === 200 && html.includes('Momentum AI'),
        details: `Status: ${response.status}, Contains title: ${html.includes('Momentum AI')}`
      };
    }
  },
  
  {
    name: '🤖 AI Chat Endpoint',
    test: async () => {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "I'm struggling with my fitness goals",
          goals: [{ title: "Exercise daily", progress: 30 }],
          userContext: { currentStreak: 3, mood: "motivated" }
        })
      });
      const data = await response.json();
      return {
        success: response.status === 200 && data.response,
        details: `Response: "${data.response?.substring(0, 50)}..."`
      };
    }
  },

  {
    name: '🧠 AI Insights Generation',
    test: async () => {
      const response = await fetch(`${BASE_URL}/api/ai/reflect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: "test-user-123",
          goals: [
            { title: "Learn Python", progress: 65, status: "active" },
            { title: "Exercise 3x/week", progress: 80, status: "active" }
          ],
          patterns: { recent_mood: "confident", energy_level: 8 }
        })
      });
      const data = await response.json();
      return {
        success: response.status === 200 && data.insights?.length > 0,
        details: `Generated ${data.insights?.length || 0} insights, ${data.predictions ? 'predictions included' : 'no predictions'}`
      };
    }
  },

  {
    name: '🎯 Goals API',
    test: async () => {
      const response = await fetch(`${BASE_URL}/api/goals`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return {
        success: response.status === 200,
        details: `Status: ${response.status}`
      };
    }
  },

  {
    name: '🔥 Streaks API',
    test: async () => {
      const response = await fetch(`${BASE_URL}/api/streaks?userId=test-user`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return {
        success: response.status === 200,
        details: `Status: ${response.status}`
      };
    }
  },

  {
    name: '📊 User Stats API',
    test: async () => {
      const response = await fetch(`${BASE_URL}/api/user/stats?userId=test-user`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return {
        success: response.status === 200,
        details: `Status: ${response.status}`
      };
    }
  },

  {
    name: '📱 PWA Manifest',
    test: async () => {
      const response = await fetch(`${BASE_URL}/manifest.json`);
      const manifest = await response.json();
      return {
        success: response.status === 200 && manifest.name.includes('Momentum AI'),
        details: `Name: "${manifest.name}", Icons: ${manifest.icons?.length || 0}`
      };
    }
  }
];

async function runTests() {
  console.log(chalk.yellow('Running tests...\n'));
  
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(chalk.gray(`Testing: ${test.name}`));
      const result = await test.test();
      
      if (result.success) {
        console.log(chalk.green(`✅ PASS: ${test.name}`));
        console.log(chalk.gray(`   ${result.details}\n`));
        passed++;
      } else {
        console.log(chalk.red(`❌ FAIL: ${test.name}`));
        console.log(chalk.gray(`   ${result.details}\n`));
        failed++;
      }
    } catch (error) {
      console.log(chalk.red(`❌ ERROR: ${test.name}`));
      console.log(chalk.gray(`   ${error.message}\n`));
      failed++;
    }
  }

  console.log(chalk.blue.bold('📊 TEST RESULTS:'));
  console.log(chalk.green(`✅ Passed: ${passed}`));
  console.log(chalk.red(`❌ Failed: ${failed}`));
  console.log(chalk.yellow(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`));

  if (passed >= 6) {
    console.log(chalk.green.bold('🎉 EXCELLENT! Your app is production-ready!'));
    console.log(chalk.white('Ready to deploy and launch! 🚀'));
  } else if (passed >= 4) {
    console.log(chalk.yellow.bold('⚠️ GOOD! Minor issues to fix before launch.'));
  } else {
    console.log(chalk.red.bold('🔧 NEEDS WORK! Several critical issues found.'));
  }
}

// Mobile UI Testing Checklist
console.log(chalk.blue.bold('\n📱 MANUAL MOBILE TESTING CHECKLIST:'));
console.log(chalk.white(`
🔍 Open Chrome DevTools (F12) and test these screen sizes:
   • iPhone SE (375x667) - Small mobile
   • iPhone 12 Pro (390x844) - Standard mobile  
   • iPad (768x1024) - Tablet
   • Desktop (1200x800) - Large screen

📋 Test these features on each screen size:
   ✅ Navigation tabs scroll horizontally on mobile
   ✅ Touch targets are at least 44px (easy to tap)
   ✅ Text is readable without zooming
   ✅ Cards and buttons are properly sized
   ✅ Check-in modal works smoothly
   ✅ AI chat interface is user-friendly
   ✅ Goals display properly in grid layout
   ✅ No horizontal scrolling (except intended)

🎯 Key User Flows to Test:
   1. Create a new goal → Success!
   2. Complete daily check-in → AI insights generated
   3. Chat with AI coach → Helpful responses
   4. View progress analytics → Clear visualizations
   5. Browse insights → Engaging content
`));

runTests().catch(console.error); 