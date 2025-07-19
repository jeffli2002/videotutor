// 完整流程测试脚本
import { MathVideoController } from './src/services/mathVideoController.js'

console.log('🧪 开始完整流程测试...\n')

const controller = new MathVideoController()

// 测试用例
const testCases = [
  {
    question: '帮我生成一个三角形面积不变拉窗帘原理的动画讲解。',
    solution: '拉窗帘原理是几何学中的重要概念，它展示了三角形面积的不变性。当我们沿着三角形的中线剪开并重新组合时，面积保持不变。这个原理帮助我们理解几何变换中的面积守恒。',
    expectedType: 'theoretical_question',
    description: '拉窗帘原理理论问题'
  },
  {
    question: '解方程：2x + 3 = 7',
    solution: '1. 移项：2x = 7 - 3\n2. 计算：2x = 4\n3. 求解：x = 4 ÷ 2\n4. 结果：x = 2',
    expectedType: 'concrete_problem',
    description: '具体方程求解问题'
  },
  {
    question: '什么是勾股定理？',
    solution: '勾股定理是直角三角形的基本定理，它描述了直角三角形的三边关系。在直角三角形中，两直角边的平方和等于斜边的平方。',
    expectedType: 'theoretical_question',
    description: '概念解释问题'
  }
]

console.log('📊 开始测试完整流程...\n')

async function runTest() {
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📝 测试用例 ${i + 1}/${testCases.length}: ${testCase.description}`)
    console.log(`问题: ${testCase.question}`)
    console.log(`期望类型: ${testCase.expectedType}`)
    console.log(`${'='.repeat(60)}`)
    
    try {
      // 执行完整流程
      const result = await controller.generateMathVideo(
        testCase.question, 
        testCase.solution, 
        'zh'
      )
      
      console.log('\n🔍 流程执行结果:')
      console.log(`   问题类型: ${result.analysis.type}`)
      console.log(`   置信度: ${result.analysis.confidence}`)
      console.log(`   推理: ${result.analysis.reasoning}`)
      console.log(`   脚本类型: ${result.script.type}`)
      console.log(`   脚本页数: ${result.script.pages.length}`)
      console.log(`   动画数量: ${result.animations.length}`)
      console.log(`   动画类型: ${result.animations[0]?.animationType || 'N/A'}`)
      console.log(`   语音类型: ${result.voiceover.type}`)
      console.log(`   总时长: ${result.totalDuration}秒`)
      
      // 验证类型匹配
      const typeMatch = result.analysis.type === testCase.expectedType
      const scriptMatch = result.script.type === testCase.expectedType
      const animationMatch = result.animations[0]?.animationType === testCase.expectedType
      const voiceoverMatch = result.voiceover.type === testCase.expectedType
      
      if (typeMatch && scriptMatch && animationMatch && voiceoverMatch) {
        console.log('✅ 测试通过 - 所有组件类型匹配')
      } else {
        console.log('❌ 测试失败 - 组件类型不匹配')
        console.log(`   问题分析: ${typeMatch ? '✅' : '❌'}`)
        console.log(`   脚本生成: ${scriptMatch ? '✅' : '❌'}`)
        console.log(`   动画生成: ${animationMatch ? '✅' : '❌'}`)
        console.log(`   语音生成: ${voiceoverMatch ? '✅' : '❌'}`)
      }
      
      // 显示脚本内容
      console.log('\n📝 生成的脚本内容:')
      result.script.pages.forEach((page, index) => {
        console.log(`   页面 ${page.page}: ${page.text.substring(0, 50)}...`)
      })
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error.message)
    }
  }
  
  console.log('\n🎉 完整流程测试完成！')
}

runTest().catch(console.error) 