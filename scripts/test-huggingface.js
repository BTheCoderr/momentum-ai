const axios = require('axios');
require('dotenv').config();

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const BASE_URL = 'http://localhost:3000/api/ai';

async function testEndpoint(endpoint, data) {
  try {
    console.log(`\nTesting ${endpoint}...`);
    const response = await axios.post(`${BASE_URL}/${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  // Test sentiment analysis
  await testEndpoint('analyze-sentiment', {
    text: "I'm feeling really optimistic about my progress today!"
  });

  // Test personality analysis
  await testEndpoint('analyze-personality', {
    text: "I prefer working early in the morning and setting clear goals for each day."
  });

  // Test forecasting
  await testEndpoint('forecast', {
    timeseries: [1, 2, 3, 4, 5, 4, 3, 4, 5, 6]
  });

  // Test anomaly detection
  await testEndpoint('analyze-anomaly', {
    logs: ["Completed morning routine", "Skipped lunch", "Worked late", "Missed evening exercise"]
  });
}

console.log('Starting Hugging Face API tests...');
runTests().then(() => {
  console.log('\nAll tests completed!');
}).catch(error => {
  console.error('Test suite error:', error);
}); 