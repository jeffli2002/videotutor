// 测试优化后的勾股定理视频生成
import { MathVideoAIService } from './src/services/mathVideoAI.js'

const mathVideoService = new MathVideoAIService()

async function testOptimizedPythagorean() {
  console.log('🎬 开始测试优化后的勾股定理视频生成...')
  
  try {
    // 测试问题
    const question = '帮我用视频动画解释勾股定理'
    const solution = '勾股定理是直角三角形的基本性质：a的平方加b的平方等于c的平方。这个定理描述了直角三角形中，两条直角边的平方和等于斜边的平方。'
    
    console.log('📝 测试问题:', question)
    console.log('📝 测试解答:', solution)
    
    // 生成视频
    console.log('\n🎬 开始生成视频...')
    const result = await mathVideoService.generateMathVideo(question, solution, 'zh')
    
    console.log('\n📊 生成结果:')
    console.log(JSON.stringify(result, null, 2))
    
    if (result && result.length > 0) {
      const videoInfo = result[0]
      console.log('\n✅ 视频生成成功!')
      console.log('📹 视频路径:', videoInfo.videoPath)
      console.log('🎤 音频路径:', videoInfo.audioPath)
      console.log('⏱️ 时长:', videoInfo.duration, '秒')
      console.log('🎭 动画类型:', videoInfo.animationType)
      
      // 检查文件是否存在
      if (videoInfo.videoPath) {
        console.log('\n🔍 检查视频文件...')
        try {
          const fs = await import('fs')
          if (fs.existsSync(videoInfo.videoPath)) {
            const stats = fs.statSync(videoInfo.videoPath)
            console.log('✅ 视频文件存在')
            console.log('📊 文件大小:', (stats.size / 1024).toFixed(2), 'KB')
          } else {
            console.log('❌ 视频文件不存在')
          }
        } catch (error) {
          console.log('⚠️ 无法检查文件:', error.message)
        }
      }
    } else {
      console.log('❌ 视频生成失败')
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 运行测试
testOptimizedPythagorean() 