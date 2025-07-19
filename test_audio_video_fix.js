// 测试修复后的音频视频合并功能
import { MathVideoAIService } from './src/services/mathVideoAI.js'

async function testAudioVideoFix() {
  console.log('🔧 测试修复后的音频视频合并功能...')
  
  const mathVideoAI = new MathVideoAIService()
  
  // 测试一个简单的几何问题
  const testCase = {
    question: '请解释三角形的面积公式',
    solution: '三角形的面积公式是底边乘以高再除以二。这个公式适用于所有类型的三角形。',
    description: '几何主题 - 三角形面积（测试音频视频合并修复）'
  }
  
  try {
    console.log('🤖 开始生成带音频的数学视频...')
    console.log(`📝 问题: ${testCase.question}`)
    console.log(`📚 解答: ${testCase.solution}`)
    
    const startTime = Date.now()
    
    // 调用完整的视频生成服务
    const result = await mathVideoAI.generateMathVideo(
      testCase.question,
      testCase.solution,
      'zh'
    )
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log('✅ 视频生成完成!')
    console.log(`⏱️ 总耗时: ${duration.toFixed(2)}秒`)
    
    if (result && result.length > 0) {
      const video = result[0]
      console.log('📊 生成结果:')
      console.log(`  🎬 动画类型: ${video.animationType}`)
      console.log(`  📹 视频路径: ${video.videoPath}`)
      console.log(`  🔊 音频路径: ${video.audioPath || '无'}`)
      console.log(`  ⏱️ 时长: ${video.duration}秒`)
      console.log(`  📚 主题: ${video.topic || '未知'}`)
      console.log(`  🤖 AI生成: ${video.aiGenerated ? '是' : '否'}`)
      
      // 检查文件是否存在
      const fs = await import('fs')
      if (fs.existsSync(video.videoPath)) {
        const stats = fs.statSync(video.videoPath)
        console.log(`  📁 视频文件大小: ${(stats.size / 1024).toFixed(2)} KB`)
      }
      
      if (video.audioPath && fs.existsSync(video.audioPath)) {
        const stats = fs.statSync(video.audioPath)
        console.log(`  🔊 音频文件大小: ${(stats.size / 1024).toFixed(2)} KB`)
      }
      
      // 检查是否有带音频的最终视频
      const finalVideoPath = video.videoPath.replace('.mp4', '_with_audio_') + Date.now() + '.mp4'
      if (fs.existsSync(finalVideoPath)) {
        const stats = fs.statSync(finalVideoPath)
        console.log(`  🎬 最终视频文件: ${finalVideoPath}`)
        console.log(`  📁 最终视频大小: ${(stats.size / 1024).toFixed(2)} KB`)
      }
      
    } else {
      console.log('❌ 没有生成视频结果')
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 运行测试
testAudioVideoFix() 