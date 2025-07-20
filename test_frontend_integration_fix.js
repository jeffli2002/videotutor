// 测试前端与模块化服务的集成
import { MathVideoAIService } from './src/services/mathVideoAI.js'

async function testFrontendIntegration() {
  console.log('🧪 测试前端与模块化服务集成...')
  
  try {
    const mathVideoService = new MathVideoAIService()
    console.log('✅ MathVideoAIService 实例创建成功')
    
    // 模拟前端调用
    const question = '帮我生成一个三角形面积不变的拉窗帘原理讲解的视频。'
    const solution = '拉窗帘原理是几何学中的重要概念，它展示了三角形面积的不变性。当我们沿着三角形的中线剪开并重新组合时，面积保持不变。'
    const language = 'zh'
    
    console.log('📝 模拟前端调用 generateMathVideo...')
    console.log('问题:', question)
    console.log('解答:', solution.substring(0, 50) + '...')
    
    const videoResult = await mathVideoService.generateMathVideo(question, solution, language)
    console.log('✅ 模块化服务返回结果:', videoResult)
    
    // 模拟前端处理逻辑
    console.log('\n🔍 模拟前端处理逻辑...')
    
    // 检查模块化服务是否成功
    if (videoResult && videoResult.success && videoResult.animations && videoResult.animations.length > 0) {
      console.log('✅ 模块化服务成功')
      
      // 从模块化服务获取视频路径
      const animation = videoResult.animations[0]
      const manimVideoUrl = animation.videoPath || animation.url || ''
      console.log('📹 视频路径:', manimVideoUrl)
      
      // 处理视频URL
      let processedVideoUrl = manimVideoUrl
      if (manimVideoUrl && !manimVideoUrl.startsWith('/rendered_videos/') && !manimVideoUrl.startsWith('http')) {
        // 如果URL不完整，添加路径前缀
        if (manimVideoUrl.includes('theoretical_question_') || manimVideoUrl.includes('qwen_video_')) {
          processedVideoUrl = `/rendered_videos/${manimVideoUrl.split('\\').pop()}`
          console.log('🔧 修复视频URL:', processedVideoUrl)
        }
      }
      
      // 生成最终结果
      const finalResult = {
        success: true,
        video: {
          videoUrl: processedVideoUrl || '/videos/sample-math-explanation.mp4',
          thumbnailUrl: '/images/video-thumbnail.jpg',
          duration: videoResult.totalDuration || 180,
          processingTime: 45
        },
        mathSolution: {
          content: solution,
          usage: {},
          model: 'qwen-plus'
        },
        metadata: {
          language,
          difficulty: 'intermediate',
          mathTopics: ['geometry', 'triangle', 'area'],
          actualCost: 0.01
        },
        script: {
          title: `数学解题：${question}`,
          scenes: videoResult.script?.pages || []
        },
        question: question.trim()
      }
      
      console.log('🎉 前端处理完成！')
      console.log('📊 最终结果:')
      console.log('  - 成功状态:', finalResult.success)
      console.log('  - 视频URL:', finalResult.video.videoUrl)
      console.log('  - 视频时长:', finalResult.video.duration)
      console.log('  - 脚本场景数:', finalResult.script.scenes.length)
      
      return finalResult
      
    } else {
      console.log('❌ 模块化服务返回失败或空结果')
      console.log('返回结果:', videoResult)
      return { success: false, error: '模块化服务失败' }
    }
    
  } catch (error) {
    console.error('❌ 前端集成测试失败:', error)
    console.error('错误堆栈:', error.stack)
    return { success: false, error: error.message }
  }
}

// 运行测试
testFrontendIntegration().then(result => {
  if (result.success) {
    console.log('\n🎉 前端集成测试成功！')
  } else {
    console.log('\n❌ 前端集成测试失败:', result.error)
  }
}).catch(error => {
  console.error('❌ 测试执行失败:', error)
  process.exit(1)
}) 