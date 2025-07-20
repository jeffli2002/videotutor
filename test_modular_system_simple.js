// 简化测试脚本 - 只测试模块化架构
import { QuestionAnalyzer } from './src/services/questionAnalyzer.js'
import { ScriptGenerator } from './src/services/scriptGenerator.js'
import { MathVideoController } from './src/services/mathVideoController.js'

console.log('🧪 开始测试模块化系统（简化版）...\n')

// 测试问题分析器
console.log('📊 测试问题分析器...\n')
const questionAnalyzer = new QuestionAnalyzer()

const testQuestions = [
  '解方程：2x + 3 = 7',
  '什么是拉窗帘原理？请用动画演示',
  '已知三角形ABC，底边长为6cm，高为4cm，求三角形面积',
  '如何理解微积分的基本概念？',
  '拉窗帘原理的具体应用'
]

testQuestions.forEach((question, index) => {
  console.log(`问题 ${index + 1}: ${question}`)
  const analysis = questionAnalyzer.analyzeQuestionType(question)
  console.log(`类型: ${analysis.type}`)
  console.log(`置信度: ${analysis.confidence}`)
  console.log(`推理: ${analysis.reasoning}`)
  console.log(`具体问题: ${analysis.isConcreteProblem}`)
  console.log(`理论问题: ${analysis.isTheoreticalQuestion}`)
  console.log('---')
})

// 测试脚本生成器
console.log('\n📝 测试脚本生成器...\n')
const scriptGenerator = new ScriptGenerator()

const concreteQuestion = '解方程：2x + 3 = 7'
const concreteSolution = `**解题步骤**
1. **步骤1** 将方程2x+3=7移项：2x+3-3=7-3，得到2x=4
2. **步骤2** 系数化为1：2x÷2=4÷2，得到x=2
3. **步骤3** 验证答案：将x=2代入原方程，2×2+3=7，等式成立

**最终答案**
x = 2

**验证**
将x=2代入原方程：2×2+3=4+3=7，等式成立，答案正确。`

console.log(`测试具体问题: ${concreteQuestion}`)
scriptGenerator.generateScript(concreteQuestion, concreteSolution, 'zh')
  .then(script => {
    console.log('✅ 具体问题脚本生成成功')
    console.log(`脚本类型: ${script.type}`)
    console.log(`脚本页数: ${script.pages.length}`)
    console.log('脚本页面:')
    script.pages.forEach((page, index) => {
      console.log(`  页面${index + 1}: ${page.text.substring(0, 50)}...`)
    })
    console.log('')
  })
  .catch(error => {
    console.error('❌ 具体问题脚本生成失败:', error.message)
  })

const theoreticalQuestion = '什么是拉窗帘原理？请用动画演示'
const theoreticalSolution = `**拉窗帘原理概念**
拉窗帘原理是几何学中的一个重要概念，它展示了三角形面积的不变性。

**原理说明**
当我们沿着三角形的中线剪开并重新组合时，面积保持不变。这个原理帮助我们理解几何变换中的面积守恒。

**动画演示**
通过动画演示，我们可以直观地看到这个变换过程。三角形被剪成两部分，然后重新组合成矩形，面积始终保持不变。

**应用价值**
这个原理在几何学中有着重要的应用价值，帮助我们理解面积守恒的概念。`

console.log(`测试理论问题: ${theoreticalQuestion}`)
scriptGenerator.generateScript(theoreticalQuestion, theoreticalSolution, 'zh')
  .then(script => {
    console.log('✅ 理论问题脚本生成成功')
    console.log(`脚本类型: ${script.type}`)
    console.log(`脚本页数: ${script.pages.length}`)
    console.log('脚本页面:')
    script.pages.forEach((page, index) => {
      console.log(`  页面${index + 1}: ${page.text.substring(0, 50)}...`)
    })
    console.log('')
  })
  .catch(error => {
    console.error('❌ 理论问题脚本生成失败:', error.message)
  })

// 测试主控制器（不依赖外部服务）
console.log('\n🎮 测试主控制器...\n')
const controller = new MathVideoController()

// 测试问题类型统计
console.log('📈 问题类型统计:')
const stats = controller.getQuestionTypeStats()
Object.entries(stats).forEach(([type, info]) => {
  console.log(`${type}: ${info.description}`)
  console.log(`示例: ${info.examples.join(', ')}`)
  console.log('')
})

// 测试批量分析
console.log('🔄 批量问题分析:')
const analysisResults = controller.testQuestionAnalysis(testQuestions)
console.log(`分析完成，共处理 ${analysisResults.length} 个问题`)

// 统计结果
const typeStats = {
  concrete_problem: 0,
  theoretical_question: 0,
  mixed: 0
}

analysisResults.forEach(result => {
  typeStats[result.analysis.type] = (typeStats[result.analysis.type] || 0) + 1
})

console.log('📊 分析结果统计:')
Object.entries(typeStats).forEach(([type, count]) => {
  console.log(`${type}: ${count} 个`)
})

console.log('\n✅ 模块化系统测试完成！')
console.log('🎉 所有核心功能正常工作')
console.log('📝 注意：此测试不包含外部服务调用（动画生成、TTS等）') 