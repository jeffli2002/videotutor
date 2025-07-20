// 简单的问题类型分析器测试
import { QuestionAnalyzer } from './src/services/questionAnalyzer.js'

console.log('🧪 开始问题类型分析器测试...\n')

const analyzer = new QuestionAnalyzer()

// 测试用例
const testCases = [
  {
    question: '帮我生成一个三角形面积不变拉窗帘原理的动画讲解。',
    expectedType: 'theoretical_question',
    description: '拉窗帘原理理论问题'
  },
  {
    question: '解方程：2x + 3 = 7',
    expectedType: 'concrete_problem',
    description: '具体方程求解问题'
  },
  {
    question: '什么是勾股定理？',
    expectedType: 'theoretical_question',
    description: '概念解释问题'
  }
]

console.log('📊 开始测试问题类型分析...\n')

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(50)}`)
  console.log(`📝 测试用例 ${index + 1}/${testCases.length}: ${testCase.description}`)
  console.log(`问题: ${testCase.question}`)
  console.log(`期望类型: ${testCase.expectedType}`)
  console.log(`${'='.repeat(50)}`)
  
  try {
    // 执行问题类型分析
    const analysis = analyzer.analyzeQuestionType(testCase.question)
    
    console.log('\n🔍 分析结果:')
    console.log(`   类型: ${analysis.type}`)
    console.log(`   置信度: ${analysis.confidence}`)
    console.log(`   推理: ${analysis.reasoning}`)
    console.log(`   具体问题: ${analysis.isConcreteProblem}`)
    console.log(`   理论问题: ${analysis.isTheoreticalQuestion}`)
    
    // 验证类型匹配
    const typeMatch = analysis.type === testCase.expectedType
    
    if (typeMatch) {
      console.log('✅ 测试通过 - 问题类型分析正确')
    } else {
      console.log('❌ 测试失败 - 问题类型分析错误')
      console.log(`   期望: ${testCase.expectedType}`)
      console.log(`   实际: ${analysis.type}`)
    }
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error.message)
  }
})

console.log('\n🎉 问题类型分析器测试完成！') 