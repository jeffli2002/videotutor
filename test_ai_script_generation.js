// 测试AI生成Manim脚本功能
import { QuestionAnalyzer } from './src/services/questionAnalyzer.js'

async function testAIScriptGeneration() {
  console.log('🤖 测试AI生成Manim脚本功能...')
  
  const analyzer = new QuestionAnalyzer()
  
  // 测试不同主题的问题
  const testCases = [
    {
      question: '请解释什么是导数？',
      solution: '导数是微积分中的基本概念，表示函数在某一点的瞬时变化率。它描述了函数图像在该点的切线斜率。',
      expectedTopic: 'calculus'
    },
    {
      question: '帮我生成一个关于概率分布的动画讲解',
      solution: '概率分布描述了随机变量取不同值的概率。常见的概率分布包括正态分布、二项分布等。',
      expectedTopic: 'statistics'
    },
    {
      question: '什么是三角函数？',
      solution: '三角函数是数学中重要的函数类型，包括正弦、余弦、正切等。它们在几何、物理等领域有广泛应用。',
      expectedTopic: 'trigonometry'
    },
    {
      question: '请解释因式分解的方法',
      solution: '因式分解是将多项式表示为几个因式乘积的过程。常用的方法包括提取公因式、公式法等。',
      expectedTopic: 'algebra'
    }
  ]
  
  for (const testCase of testCases) {
    console.log('\n' + '='.repeat(60))
    console.log(`📝 测试问题: ${testCase.question}`)
    console.log(`📚 期望主题: ${testCase.expectedTopic}`)
    
    // 分析问题类型
    const analysis = analyzer.analyzeQuestionType(testCase.question)
    console.log(`🔍 问题类型: ${analysis.type}`)
    
    // 识别主题
    const topic = analyzer.identifyTopic(testCase.question)
    console.log(`📚 识别主题: ${topic}`)
    
    // 生成AI脚本
    console.log('🤖 生成AI脚本...')
    try {
      const script = await analyzer.generateManimScript(
        testCase.question, 
        testCase.solution, 
        topic, 
        analysis.type
      )
      
      console.log('✅ AI脚本生成成功!')
      console.log('📄 脚本长度:', script.length, '字符')
      console.log('📄 脚本预览:')
      console.log(script.substring(0, 500) + '...')
      
      // 检查脚本是否包含必要的元素
      const hasClass = script.includes('class') && script.includes('Scene')
      const hasManim = script.includes('from manim import')
      const hasConstruct = script.includes('def construct')
      
      console.log('🔍 脚本质量检查:')
      console.log(`  包含类定义: ${hasClass ? '✅' : '❌'}`)
      console.log(`  包含Manim导入: ${hasManim ? '✅' : '❌'}`)
      console.log(`  包含construct方法: ${hasConstruct ? '✅' : '❌'}`)
      
    } catch (error) {
      console.error('❌ AI脚本生成失败:', error.message)
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('🎉 AI脚本生成测试完成!')
}

// 运行测试
testAIScriptGeneration().catch(console.error) 