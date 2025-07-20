// 直接测试默认脚本生成功能
import { QuestionAnalyzer } from './src/services/questionAnalyzer.js'

function testDefaultScript() {
  console.log('🔧 测试默认脚本生成功能...')
  
  const analyzer = new QuestionAnalyzer()
  
  const testCase = {
    question: '请解释三角形的面积公式',
    solution: '三角形的面积公式是底边乘以高再除以二。这个公式适用于所有类型的三角形。',
    topic: 'geometry'
  }
  
  try {
    console.log('🤖 生成默认脚本...')
    const script = analyzer.generateDefaultScript(
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
    
    // 检查几何主题特定元素
    const hasGeometryElements = script.includes('Polygon') && script.includes('a_label') && script.includes('b_label')
    console.log(`  包含几何元素: ${hasGeometryElements ? '✅' : '❌'}`)
    
    // 显示脚本预览
    console.log('📄 脚本预览:')
    const lines = script.split('\n')
    for (let i = 0; i < Math.min(40, lines.length); i++) {
      console.log(`  ${i + 1}: ${lines[i]}`)
    }
    if (lines.length > 40) {
      console.log('  ...')
    }
    
    // 保存脚本到文件进行测试
    const fs = require('fs')
    const filename = 'test_default_script.py'
    fs.writeFileSync(filename, script)
    console.log(`💾 脚本已保存到: ${filename}`)
    
  } catch (error) {
    console.error('❌ 脚本生成失败:', error.message)
  }
}

// 运行测试
testDefaultScript() 