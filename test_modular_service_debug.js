// 测试模块化服务调用
import { MathVideoAIService } from './src/services/mathVideoAI.js'

async function testModularService() {
  console.log('🧪 开始测试模块化服务...')
  
  try {
    const mathVideoService = new MathVideoAIService()
    console.log('✅ MathVideoAIService 实例化成功')
    
    const question = '生成一个三角形面积不变的拉窗帘原理的动画讲解。'
    const solution = '拉窗帘原理是三角形面积不变原理。当三角形的顶点沿着平行于底边的直线移动时，三角形的面积保持不变。'
    const language = 'zh'
    
    console.log('📝 测试参数:')
    console.log('  问题:', question)
    console.log('  解答:', solution)
    console.log('  语言:', language)
    
    console.log('🔄 调用 generateMathVideo...')
    const result = await mathVideoService.generateMathVideo(question, solution, language)
    
    console.log('🟢 完整结果:', JSON.stringify(result, null, 2))
    
    if (result && result.success) {
      console.log('✅ 模块化服务调用成功')
      if (result.animations && result.animations.length > 0) {
        console.log('🎬 动画数量:', result.animations.length)
        result.animations.forEach((anim, index) => {
          console.log(`  动画 ${index + 1}:`, {
            videoPath: anim.videoPath,
            audioPath: anim.audioPath,
            duration: anim.duration,
            animationType: anim.animationType
          })
        })
      } else {
        console.log('⚠️ 没有生成动画')
      }
      
      if (result.voiceover) {
        console.log('🎤 语音信息:', {
          audioPath: result.voiceover.audioPath,
          duration: result.voiceover.duration,
          type: result.voiceover.type
        })
      } else {
        console.log('⚠️ 没有生成语音')
      }
    } else {
      console.log('❌ 模块化服务调用失败')
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    console.error('🔍 错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
  }
}

// 运行测试
testModularService() 