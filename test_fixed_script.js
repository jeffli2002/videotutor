// 测试修复后的脚本生成
import { QuestionAnalyzer } from './src/services/questionAnalyzer.js'

async function testFixedScript() {
  console.log('🔧 测试修复后的脚本生成...')
  
  const analyzer = new QuestionAnalyzer()
  
  const testCase = {
    question: '请解释三角形的面积公式',
    solution: '三角形的面积公式是底边乘以高再除以二。这个公式适用于所有类型的三角形。',
    topic: 'geometry'
  }
  
  try {
    console.log('🤖 生成修复后的脚本...')
    const script = await analyzer.generateManimScript(
      testCase.question,
      testCase.solution,
      testCase.topic,
      'theoretical_question'
    )
    
    console.log('✅ 脚本生成成功!')
    console.log('📄 脚本长度:', script.length, '字符')
    
    // 检查是否还有JavaScript语法
    const hasJSKeywords = script.includes('const ') || script.includes('let ') || script.includes('var ')
    console.log('🔍 语法检查:')
    console.log(`  包含JavaScript关键字: ${hasJSKeywords ? '❌' : '✅'}`)
    
    // 检查Python语法
    const hasPythonKeywords = script.includes('def ') && script.includes('import ') && script.includes('class ')
    console.log(`  包含Python关键字: ${hasPythonKeywords ? '✅' : '❌'}`)
    
    // 检查排版优化元素
    const hasLayoutElements = script.includes('VGroup') && script.includes('Rectangle') && script.includes('buff=0.3')
    console.log(`  包含排版优化元素: ${hasLayoutElements ? '✅' : '❌'}`)
    
    // 显示脚本预览
    console.log('📄 脚本预览:')
    const lines = script.split('\n')
    for (let i = 0; i < Math.min(30, lines.length); i++) {
      console.log(`  ${i + 1}: ${lines[i]}`)
    }
    if (lines.length > 30) {
      console.log('  ...')
    }
    
  } catch (error) {
    console.error('❌ 脚本生成失败:', error.message)
  }
}

// 运行测试
testFixedScript().catch(console.error) 