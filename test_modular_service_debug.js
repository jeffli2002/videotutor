// 调试模块化服务
import { MathVideoAIService } from './src/services/mathVideoAI.js'

async function testModularService() {
  console.log('🧪 开始测试模块化服务...')
  
  try {
    const mathVideoService = new MathVideoAIService()
    console.log('✅ MathVideoAIService 实例创建成功')
    
    // 测试问题类型分析
    console.log('\n🔍 测试问题类型分析...')
    const question = '帮我生成一个三角形面积不变的拉窗帘原理讲解的视频。'
    const analysis = mathVideoService.analyzeQuestionType(question)
    console.log('问题类型分析结果:', analysis)
    
    // 测试完整的视频生成流程
    console.log('\n🎬 测试完整视频生成流程...')
    const solution = '拉窗帘原理是几何学中的重要概念，它展示了三角形面积的不变性。当我们沿着三角形的中线剪开并重新组合时，面积保持不变。'
    
    console.log('📝 调用 generateMathVideo...')
    const result = await mathVideoService.generateMathVideo(question, solution, 'zh')
    console.log('✅ 视频生成结果:', result)
    
    if (result && result.success) {
      console.log('🎉 模块化服务工作正常！')
      console.log('📊 结果详情:')
      console.log('  - 问题类型:', result.type)
      console.log('  - 脚本页数:', result.script?.pages?.length || 0)
      console.log('  - 动画数量:', result.animations?.length || 0)
      console.log('  - 语音时长:', result.voiceover?.duration || 0)
      console.log('  - 总时长:', result.totalDuration || 0)
    } else {
      console.log('❌ 模块化服务返回失败结果:', result)
    }
    
  } catch (error) {
    console.error('❌ 模块化服务测试失败:', error)
    console.error('错误堆栈:', error.stack)
  }
}

// 运行测试
testModularService().catch(error => {
  console.error('❌ 测试执行失败:', error)
  process.exit(1)
}) 