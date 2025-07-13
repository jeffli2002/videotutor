// 直接测试前端调用SDK
async function testFrontendSDKCall() {
  console.log('🧪 开始测试前端SDK调用...')
  
  const testData = {
    api_key: 'test_key',
    messages: [
      {
        role: 'system',
        content: '你是专业的数学老师'
      },
      {
        role: 'user',
        content: '请解答：2x + 5 = 15'
      }
    ],
    temperature: 0.1,
    max_tokens: 500,
    top_p: 0.8
  }
  
  try {
    console.log('📡 发送OPTIONS请求...')
    const optionsResponse = await fetch('http://127.0.0.1:8002/api/qwen', {
      method: 'OPTIONS',
      headers: { 'Content-Type': 'application/json' }
    })
    console.log('✅ OPTIONS响应:', optionsResponse.status, optionsResponse.statusText)
    
    console.log('📡 发送POST请求...')
    const postResponse = await fetch('http://127.0.0.1:8002/api/qwen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })
    console.log('✅ POST响应:', postResponse.status, postResponse.statusText)
    
    if (postResponse.ok) {
      const data = await postResponse.json()
      console.log('📄 响应数据:', data)
    } else {
      console.log('❌ POST请求失败:', postResponse.status, postResponse.statusText)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 在浏览器控制台运行
if (typeof window !== 'undefined') {
  window.testFrontendSDKCall = testFrontendSDKCall
  console.log('🧪 测试函数已加载，请在控制台运行: testFrontendSDKCall()')
}

export { testFrontendSDKCall } 