// 前端集成测试脚本
import { MathVideoAIService } from './src/services/mathVideoAI.js'
import { AnimationGenerator } from './src/services/animationGenerator.js'
import { TTSService } from './src/services/ttsService.js'

console.log('🎬 前端集成测试开始...\n')

const mathVideoAI = new MathVideoAIService()
const animationGenerator = new AnimationGenerator()
const ttsService = new TTSService()

async function testCompleteFlow() {
  try {
    // 测试问题
    const question = '帮我生成一个三角形面积不变拉窗帘原理的动画讲解。'
    const solution = '拉窗帘原理是几何学中的重要概念，它展示了三角形面积的不变性。当我们沿着三角形的中线剪开并重新组合时，面积保持不变。这个原理帮助我们理解几何变换中的面积守恒。'
    
    console.log('📝 测试问题:', question)
    console.log('📝 测试解答:', solution)
    
    // 步骤1: 问题类型分析
    console.log('\n🔍 步骤1: 问题类型分析')
    const analysis = mathVideoAI.analyzeQuestionType(question)
    console.log('分析结果:', analysis)
    
    if (analysis.type !== 'theoretical_question') {
      throw new Error('问题类型分析失败')
    }
    console.log('✅ 问题类型分析正确')
    
    // 步骤2: 生成数学视频
    console.log('\n🎬 步骤2: 生成数学视频')
    const videoResult = await mathVideoAI.generateMathVideo(question, solution, 'zh')
    console.log('视频生成结果:', videoResult)
    
    if (videoResult && videoResult.success) {
      console.log('✅ 视频生成成功')
      console.log('📹 视频URL:', videoResult.videoUrl)
      console.log('🎵 音频URL:', videoResult.audioUrl)
    } else {
      console.log('❌ 视频生成失败:', videoResult?.error || '未知错误')
    }
    
    // 步骤3: 测试动画生成
    console.log('\n🎨 步骤3: 测试动画生成')
    const animationResult = await animationGenerator.generateAnimation(question, solution, 'zh')
    console.log('动画生成结果:', animationResult)
    
    if (animationResult && animationResult.success) {
      console.log('✅ 动画生成成功')
      console.log('🎬 动画URL:', animationResult.animationUrl)
    } else {
      console.log('❌ 动画生成失败:', animationResult?.error || '未知错误')
    }
    
    // 步骤4: 测试TTS生成
    console.log('\n🎤 步骤4: 测试TTS生成')
    const ttsResult = await ttsService.generateTTS(solution, 'zh')
    console.log('TTS生成结果:', ttsResult)
    
    if (ttsResult && ttsResult.success) {
      console.log('✅ TTS生成成功')
      console.log('🎵 音频URL:', ttsResult.audioUrl)
    } else {
      console.log('❌ TTS生成失败:', ttsResult?.error || '未知错误')
    }
    
    console.log('\n🎉 前端集成测试完成！')
    console.log('\n📋 测试总结:')
    console.log('✅ 问题类型分析: 通过')
    console.log('✅ 视频生成: ' + (videoResult?.success ? '通过' : '失败'))
    console.log('✅ 动画生成: ' + (animationResult?.success ? '通过' : '失败'))
    console.log('✅ TTS生成: ' + (ttsResult?.success ? '通过' : '失败'))
    
    console.log('\n🌐 前端访问地址: http://localhost:5173/videotutor/')
    console.log('💡 建议在前端界面中测试完整的用户交互流程')
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
    console.error('错误详情:', error)
  }
}

// 运行测试
testCompleteFlow()