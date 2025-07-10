/**
 * Test Integration - Verify RAG system works with React Native
 */

// Import the RAG client
const { getContextualReply, trackUserInteraction, getUserInsights } = require('./lib/rag-client');

async function testRAGIntegration() {
  console.log('🧪 Testing RAG Integration');
  console.log('=' .repeat(50));
  
  const userId = 'test-user-123';
  
  try {
    // Test 1: Add some user interactions
    console.log('📝 Step 1: Adding user interactions...');
    
    await trackUserInteraction(userId, 'checkin', 'Had a great workout today! Feeling energized and motivated.');
    await trackUserInteraction(userId, 'goal', 'I want to exercise 4 times a week consistently.');
    await trackUserInteraction(userId, 'reflection', 'I notice I have more energy in the mornings.');
    
    console.log('✅ Added 3 user interactions');
    
    // Test 2: Get contextual reply
    console.log('\n🤖 Step 2: Getting contextual AI response...');
    
    const response = await getContextualReply(
      userId, 
      'I\'m feeling unmotivated about exercise lately, can you help?',
      'motivation'
    );
    
    console.log('AI Response:', response);
    
    // Test 3: Get user insights
    console.log('\n📊 Step 3: Getting user insights...');
    
    const insights = await getUserInsights(userId);
    if (insights) {
      console.log('Insights:', {
        total_data_points: insights.total_data_points,
        insights: insights.insights.slice(0, 2),
        recommendations: insights.recommendations.slice(0, 2)
      });
    }
    
    console.log('\n✅ RAG Integration Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Show fallback behavior
    console.log('\n🛡️ Testing fallback behavior...');
    const fallbackResponse = await getContextualReply(userId, 'Hello!', 'general');
    console.log('Fallback response:', fallbackResponse);
  }
}

// Run the test
testRAGIntegration(); 