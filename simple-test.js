#!/usr/bin/env node

const http = require('http');
const querystring = require('querystring');

console.log('🧪 MOMENTUM AI - QUICK TEST SUITE\n');

const BASE_URL = 'http://localhost:3000';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAPI() {
  console.log('Testing API endpoints...\n');
  
  // Test 1: Chat API
  try {
    console.log('🤖 Testing AI Chat...');
    const chatResult = await makeRequest(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: "Help me stay motivated",
        goals: [{ title: "Exercise", progress: 50 }]
      })
    });
    
    if (chatResult.status === 200 && chatResult.data.response) {
      console.log('✅ Chat API working!');
      console.log(`   Response: "${chatResult.data.response.substring(0, 60)}..."`);
    } else {
      console.log('❌ Chat API failed');
    }
  } catch (error) {
    console.log('❌ Chat API error:', error.message);
  }
  
  // Test 2: Insights API
  try {
    console.log('\n🧠 Testing AI Insights...');
    const insightsResult = await makeRequest(`${BASE_URL}/api/ai/reflect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: "test-user",
        goals: [{ title: "Build app", progress: 80 }],
        patterns: { mood: "motivated" }
      })
    });
    
    if (insightsResult.status === 200 && insightsResult.data.insights) {
      console.log('✅ Insights API working!');
      console.log(`   Generated ${insightsResult.data.insights.length} insights`);
    } else {
      console.log('❌ Insights API failed');
    }
  } catch (error) {
    console.log('❌ Insights API error:', error.message);
  }
  
  // Test 3: Goals API
  try {
    console.log('\n🎯 Testing Goals API...');
    const goalsResult = await makeRequest(`${BASE_URL}/api/goals`);
    
    if (goalsResult.status === 200) {
      console.log('✅ Goals API accessible!');
    } else {
      console.log('❌ Goals API failed');
    }
  } catch (error) {
    console.log('❌ Goals API error:', error.message);
  }
  
  console.log('\n📱 MANUAL TESTING CHECKLIST:');
  console.log(`
1. Open browser to: ${BASE_URL}
2. Test mobile view (Chrome DevTools → Toggle device toolbar)
3. Try creating a goal
4. Test the daily check-in flow
5. Chat with the AI coach
6. Check insights generation

🎯 Key things to verify:
• All buttons are touch-friendly (44px minimum)
• Text is readable on mobile
• Navigation works smoothly
• AI responses are helpful
• No console errors
• All features accessible
  `);
}

testAPI().catch(console.error); 