// 手动合并音频和视频，测试优化后的排版
async function testManualMergeFix() {
  console.log('🔧 手动合并音频和视频，测试优化后的排版...')
  
  const videoPath = 'rendered_videos/theoretical_question_1752917447270.mp4'
  const audioPath = 'rendered_videos/tts_audio_1752917474714.mp3'
  
  try {
    console.log('📹 视频文件:', videoPath)
    console.log('🎤 音频文件:', audioPath)
    
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
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ 合并成功:', result)
      
      // 检查最终文件
      const fs = await import('fs')
      if (fs.existsSync(result.final_video_path)) {
        const stats = fs.statSync(result.final_video_path)
        console.log(`✅ 最终视频文件: ${result.final_video_path}`)
        console.log(`📁 文件大小: ${(stats.size / 1024).toFixed(2)} KB`)
      }
    } else {
      const errorText = await response.text()
      console.log('❌ 合并失败:', errorText)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 运行测试
testManualMergeFix() 