// 测试TTS服务
console.log('🎤 测试TTS服务...\n')

async function testTTSService() {
  const testText = '勾股定理是直角三角形的基本性质：a的平方加b的平方等于c的平方'
  
  console.log('📝 测试文本:', testText)
  
  try {
    console.log('\n🎤 调用TTS API...')
    const response = await fetch('http://localhost:8003/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: testText,
        language: 'zh',
        engine: 'auto'
      })
    })
    
    console.log('📊 响应状态:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ TTS API调用成功:')
      console.log('📊 响应数据:', result)
      
      if (result.success) {
        console.log('🎉 TTS音频生成成功！')
        console.log('🎵 音频路径:', result.audio_path)
        console.log('🔊 引擎:', result.engine)
        console.log('⏱️ 时长:', result.duration)
      } else {
        console.log('❌ TTS音频生成失败:')
        console.log('❌ 错误信息:', result.error)
      }
    } else {
      console.log('❌ TTS API调用失败:')
      console.log('❌ 状态码:', response.status)
      const errorText = await response.text()
      console.log('❌ 错误响应:', errorText)
    }
    
  } catch (error) {
    console.log('❌ 请求异常:', error.message)
  }
}

// 运行测试
testTTSService().catch(console.error) 