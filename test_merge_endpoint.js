// 测试音频视频合并端点
async function testMergeEndpoint() {
  console.log('🔧 测试音频视频合并端点...')
  
  try {
    // 测试端点是否存在
    const response = await fetch('http://localhost:5001/api/merge_audio_video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_path: 'rendered_videos/theoretical_question_1752912884924.mp4',
        audio_path: 'rendered_videos/tts_audio_1752912910696.mp3'
      })
    })
    
    console.log('📡 响应状态:', response.status)
    console.log('📡 响应头:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ 合并端点正常:', result)
    } else {
      const errorText = await response.text()
      console.log('❌ 合并端点错误:', errorText)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 运行测试
testMergeEndpoint() 