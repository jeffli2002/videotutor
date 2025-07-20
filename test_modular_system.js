// 测试模块化系统
import { MathVideoAIService } from './src/services/mathVideoAI.js'
import { runTests } from './src/services/testModule.js'

console.log('🧪 开始测试模块化系统...\n')

// 创建服务实例
const mathVideoService = new MathVideoAIService()

// 测试问题类型分析
console.log('📊 测试问题类型分析...\n')

const testQuestions = [
  '解方程：2x + 3 = 7',
  '什么是拉窗帘原理？请用动画演示',
  '已知三角形ABC，底边长为6cm，高为4cm，求三角形面积',
  '如何理解微积分的基本概念？',
  '拉窗帘原理的具体应用'
]

testQuestions.forEach((question, index) => {
  console.log(`问题 ${index + 1}: ${question}`)
  const analysis = mathVideoService.analyzeQuestionType(question)
  console.log(`类型: ${analysis.type}`)
  console.log(`置信度: ${analysis.confidence}`)
  console.log(`推理: ${analysis.reasoning}`)
  console.log('---')
})

// 测试具体求解问题
console.log('\n🔢 测试具体求解问题...\n')

const concreteQuestion = '解方程：2x + 3 = 7'
const concreteSolution = `**解题步骤**
1. **步骤1** 将方程2x+3=7移项：2x+3-3=7-3，得到2x=4
2. **步骤2** 系数化为1：2x÷2=4÷2，得到x=2
3. **步骤3** 验证答案：将x=2代入原方程，2×2+3=7，等式成立

**最终答案**
x = 2

**验证**
将x=2代入原方程：2×2+3=4+3=7，等式成立，答案正确。`

console.log(`问题: ${concreteQuestion}`)
console.log('正在生成视频内容...')

mathVideoService.generateMathVideo(concreteQuestion, concreteSolution, 'zh')
  .then(result => {
    console.log('✅ 具体问题视频生成成功')
    console.log(`类型: ${result.type}`)
    console.log(`脚本页数: ${result.script.pages.length}`)
    console.log(`动画数量: ${result.animations.length}`)
    console.log(`语音时长: ${result.voiceover.duration}秒`)
    console.log(`总时长: ${result.totalDuration}秒`)
  })
  .catch(error => {
    console.error('❌ 具体问题视频生成失败:', error.message)
  })

// 测试理论解释问题
console.log('\n📚 测试理论解释问题...\n')

const theoreticalQuestion = '什么是拉窗帘原理？请用动画演示'
const theoreticalSolution = `**拉窗帘原理概念**
拉窗帘原理是几何学中的一个重要概念，它展示了三角形面积的不变性。

**原理说明**
当我们沿着三角形的中线剪开并重新组合时，面积保持不变。这个原理帮助我们理解几何变换中的面积守恒。

**动画演示**
通过动画演示，我们可以直观地看到这个变换过程。三角形被剪成两部分，然后重新组合成矩形，面积始终保持不变。

**应用价值**
这个原理在几何学中有着重要的应用价值，帮助我们理解面积守恒的概念。`

console.log(`问题: ${theoreticalQuestion}`)
console.log('正在生成视频内容...')

mathVideoService.generateMathVideo(theoreticalQuestion, theoreticalSolution, 'zh')
  .then(result => {
    console.log('✅ 理论问题视频生成成功')
    console.log(`类型: ${result.type}`)
    console.log(`脚本页数: ${result.script.pages.length}`)
    console.log(`动画数量: ${result.animations.length}`)
    console.log(`语音时长: ${result.voiceover.duration}秒`)
    console.log(`总时长: ${result.totalDuration}秒`)
  })
  .catch(error => {
    console.error('❌ 理论问题视频生成失败:', error.message)
  })

// 获取问题类型统计
console.log('\n📈 问题类型统计...\n')
const stats = mathVideoService.getQuestionTypeStats()
console.log('问题类型说明:')
Object.entries(stats).forEach(([type, info]) => {
  console.log(`${type}: ${info.description}`)
  console.log(`示例: ${info.examples.join(', ')}`)
  console.log('')
})

console.log('✅ 模块化系统测试完成！') 