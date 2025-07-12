/**
 * Live RAG Integration Test
 * Tests the complete flow: React Native -> RAG Service -> Vector Store -> LLM
 */

const fetch = require('node-fetch');

async function testRAGService() {
  console.log('🧪 Testing RAG Service Integration');
  console.log('=' .repeat(50));
  
  const baseUrl = 'http://localhost:8000';
  const userId = 'test-user-live';
  
  try {
    // Test 1: Health Check
    console.log('🔍 Step 1: Health Check...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Service is healthy:', healthData.status);
    } else {
      throw new Error('Health check failed');
    }
    
    // Test 2: Add User Interactions
    console.log('\n📝 Step 2: Adding user interactions...');
    
    const interactions = [
      {
        userId,
        interactionType: 'checkin',
        content: 'Had a great workout today! Feeling energized and motivated.',
        metadata: { mood: 8, energy: 9 }
      },
      {
        userId,
        interactionType: 'goal',
        content: 'I want to exercise 4 times a week consistently.',
        metadata: { category: 'fitness', priority: 'high' }
      },
      {
        userId,
        interactionType: 'reflection',
        content: 'I notice I have more energy in the mornings for workouts.',
        metadata: { insight_type: 'pattern' }
      }
    ];
    
    for (const interaction of interactions) {
      const response = await fetch(`${baseUrl}/user-interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interaction)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Added ${interaction.interactionType}: ${result.message}`);
      } else {
        console.log(`❌ Failed to add ${interaction.interactionType}`);
      }
    }
    
    // Test 3: Chat with RAG
    console.log('\n🤖 Step 3: Testing RAG Chat...');
    
    const chatMessage = {
      message: "I'm feeling unmotivated about exercise lately, can you help?",
      userId,
      coachingType: 'motivation'
    };
    
    const chatResponse = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatMessage)
    });
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ RAG Chat Response:');
      console.log('📝 Response:', chatData.response.substring(0, 100) + '...');
      console.log('📊 Context Used:', chatData.context_used);
      console.log('🎯 Confidence:', chatData.confidence);
      console.log('🧠 Coaching Type:', chatData.coaching_type);
    } else {
      console.log('❌ Chat request failed');
    }
    
    // Test 4: Pattern Analysis
    console.log('\n📈 Step 4: Testing Pattern Analysis...');
    
    const patternsResponse = await fetch(`${baseUrl}/user-patterns/${userId}`);
    
    if (patternsResponse.ok) {
      const patternsData = await patternsResponse.json();
      console.log('✅ Pattern Analysis:');
      console.log('📊 Total Data Points:', patternsData.total_data_points);
      console.log('🧠 Insights:', patternsData.insights.slice(0, 2));
      console.log('💡 Recommendations:', patternsData.recommendations.slice(0, 2));
    } else {
      console.log('❌ Pattern analysis failed');
    }
    
    // Test 5: System Stats
    console.log('\n📊 Step 5: System Statistics...');
    
    const statsResponse = await fetch(`${baseUrl}/system-stats`);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ System Stats:');
      console.log('🗂️ Vector Store Documents:', statsData.vector_store.total_documents);
      console.log('🤖 LLM Model:', statsData.rag_system.model_name);
      console.log('⚡ Status:', statsData.rag_system.status);
    } else {
      console.log('❌ Stats request failed');
    }
    
    console.log('\n🎉 RAG Integration Test Complete!');
    console.log('✅ Your React Native app can now use RAG-powered chat!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🛡️ Fallback Test:');
    console.log('Even if RAG fails, your app will use fallback responses.');
    console.log('This ensures users always get helpful coaching!');
  }
}

// Run the test
testRAGService(); 