// 手动测试音频合并功能
async function testManualAudioMerge() {
  console.log('🎬 手动测试音频合并功能...')
  
  try {
    // 测试音频合并API
    const videoPath = 'rendered_videos/theoretical_question_1752912884924.mp4'
    const audioPath = 'rendered_videos/tts_audio_1752912910696.mp3'
    
    console.log('📹 视频路径:', videoPath)
    console.log('🎤 音频路径:', audioPath)
    
    const response = await fetch('http://localhost:5001/api/merge_audio_video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_path: videoPath,
        audio_path: audioPath
      })
    })
    
    console.log('📡 响应状态:', response.status)
    console.log('📡 响应头:', response.headers)
    
    const text = await response.text()
    console.log('📄 响应内容:', text)
    
    if (response.ok) {
      try {
        const result = JSON.parse(text)
        console.log('✅ 音频合并成功:', result)
      } catch (e) {
        console.log('❌ JSON解析失败:', e.message)
      }
    } else {
      console.log('❌ 请求失败')
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 运行测试
testManualAudioMerge() 