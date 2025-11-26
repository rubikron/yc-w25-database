const axios = require('axios')
require('dotenv').config()

async function testPerplexity() {
  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'What is Rivet, the YC F25 company that builds visual web development tools?'
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    console.log('✅ Success!')
    console.log('Response:', JSON.stringify(response.data, null, 2))
  } catch (error) {
    console.error('❌ Error:', error.response?.status)
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2))
    console.error('Headers:', JSON.stringify(error.response?.headers, null, 2))
  }
}

testPerplexity()
