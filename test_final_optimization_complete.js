// 最终完整优化测试 - 验证布局和音频功能
import { MathVideoAIService } from './src/services/mathVideoAI.js'

async function testFinalOptimizationComplete() {
  console.log('🎯 最终完整优化测试 - 验证布局和音频功能...')
  
  const mathVideoAI = new MathVideoAIService()
  
  // 测试一个简单的几何问题
  const testCase = {
    question: '请解释三角形的面积公式',
    solution: '三角形的面积公式是底边乘以高再除以二。这个公式适用于所有类型的三角形。',
    description: '几何主题 - 三角形面积（测试完整流程）'
  }
  
  try {
    console.log('🤖 开始生成优化后的数学视频...')
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
    console.log(`⏱️ 总耗时: ${duration.toFixed(2)} 秒`)
    
    if (result && result.length > 0) {
      const video = result[0]
      console.log('📊 生成结果详情:')
      console.log(`   🎬 动画类型: ${video.animationType}`)
      console.log(`   📹 视频路径: ${video.videoPath}`)
      console.log(`   🔊 音频路径: ${video.audioPath || '无'}`)
      console.log(`   ⏱️ 时长: ${video.duration} 秒`)
      console.log(`   📚 主题: ${video.topic || '未指定'}`)
      console.log(`   🤖 AI生成: ${video.aiGenerated ? '是' : '否'}`)
      
      // 检查文件是否存在
      const fs = await import('fs')
      
      if (video.videoPath && fs.existsSync(video.videoPath)) {
        const stats = fs.statSync(video.videoPath)
        console.log(`   📁 视频文件大小: ${(stats.size / 1024).toFixed(2)} KB`)
        
        if (stats.size > 100 * 1024) {
          console.log('✅ 视频文件大小合理，包含动画内容')
        } else {
          console.log('⚠️ 视频文件较小，可能只有静态内容')
        }
      } else {
        console.log('❌ 视频文件不存在')
      }
      
      if (video.audioPath && fs.existsSync(video.audioPath)) {
        const audioStats = fs.statSync(video.audioPath)
        console.log(`   🔊 音频文件大小: ${(audioStats.size / 1024).toFixed(2)} KB`)
        console.log('✅ 音频文件存在')
      } else {
        console.log('⚠️ 音频文件不存在或未生成')
      }
      
      // 检查是否有带音频的最终视频
      const videoName = video.videoPath.split('/').pop().split('.')[0]
      const possibleAudioVideo = `rendered_videos/${videoName}_with_audio_*.mp4`
      
      try {
        const glob = await import('glob')
        const audioVideos = glob.globSync(possibleAudioVideo)
        
        if (audioVideos.length > 0) {
          const finalVideo = audioVideos[0]
          const finalStats = fs.statSync(finalVideo)
          console.log(`   🎬 最终带音频视频: ${finalVideo}`)
          console.log(`   📁 最终文件大小: ${(finalStats.size / 1024).toFixed(2)} KB`)
          console.log('✅ 音频视频合并成功！')
        } else {
          console.log('⚠️ 未找到带音频的最终视频')
        }
      } catch (error) {
        console.log('⚠️ 检查最终视频时出错:', error.message)
      }
      
    } else {
      console.log('❌ 没有生成视频结果')
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 运行测试
testFinalOptimizationComplete() 