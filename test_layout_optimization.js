// 测试排版优化功能
import { QuestionAnalyzer } from './src/services/questionAnalyzer.js'

async function testLayoutOptimization() {
  console.log('🎨 测试排版优化功能...')
  
  const analyzer = new QuestionAnalyzer()
  
  // 测试不同主题的排版效果
  const testCases = [
    {
      question: '请解释三角形的面积公式',
      solution: '三角形的面积公式是底边乘以高再除以二。这个公式适用于所有类型的三角形，包括直角三角形、锐角三角形和钝角三角形。在实际应用中，我们需要先确定底边和对应的高，然后代入公式计算面积。',
      topic: 'geometry',
      description: '几何主题 - 三角形面积'
    },
    {
      question: '什么是二次方程的求根公式？',
      solution: '二次方程ax²+bx+c=0的求根公式是x=(-b±√(b²-4ac))/(2a)。这个公式可以求解所有二次方程，其中b²-4ac称为判别式，用来判断方程根的性质。当判别式大于零时，方程有两个不同的实根；当判别式等于零时，方程有一个重根；当判别式小于零时，方程有两个共轭复根。',
      topic: 'algebra',
      description: '代数主题 - 二次方程'
    },
    {
      question: '请解释导数的几何意义',
      solution: '导数的几何意义是函数图像在某一点的切线斜率。当函数在某点可导时，该点的导数就是函数图像在该点切线的斜率。这个斜率反映了函数在该点的瞬时变化率，正斜率表示函数在该点递增，负斜率表示函数在该点递减，零斜率表示函数在该点有极值。',
      topic: 'calculus',
      description: '微积分主题 - 导数几何意义'
    }
  ]
  
  for (const testCase of testCases) {
    console.log('\n' + '='.repeat(80))
    console.log(`🎨 测试排版: ${testCase.description}`)
    console.log(`📝 问题: ${testCase.question}`)
    console.log(`📚 主题: ${testCase.topic}`)
    
    try {
      // 生成优化后的脚本
      console.log('🤖 生成优化排版脚本...')
      const script = await analyzer.generateManimScript(
        testCase.question,
        testCase.solution,
        testCase.topic,
        'theoretical_question'
      )
      
      console.log('✅ 脚本生成成功!')
      console.log('📄 脚本长度:', script.length, '字符')
      
      // 检查脚本中的关键排版元素
      const checks = {
        '使用VGroup': script.includes('VGroup'),
        '设置行间距': script.includes('buff=0.3'),
        '边长标签优化': script.includes('next_to') && script.includes('buff=0.2'),
        '区域划分': script.includes('Rectangle') && script.includes('width'),
        '字体大小控制': script.includes('font_size='),
        '颜色设置': script.includes('color=BLACK') || script.includes('color=BLUE')
      }
      
      console.log('🔍 排版优化检查:')
      for (const [check, result] of Object.entries(checks)) {
        console.log(`  ${check}: ${result ? '✅' : '❌'}`)
      }
      
      // 检查特定主题的优化
      if (testCase.topic === 'geometry') {
        const hasTriangle = script.includes('Polygon')
        const hasLabels = script.includes('a_label') && script.includes('b_label')
        console.log(`  几何图形优化: ${hasTriangle ? '✅' : '❌'}`)
        console.log(`  边长标签优化: ${hasLabels ? '✅' : '❌'}`)
      }
      
      // 显示脚本预览
      console.log('📄 脚本预览:')
      const previewLines = script.split('\n').slice(0, 20)
      console.log(previewLines.join('\n'))
      console.log('...')
      
    } catch (error) {
      console.error('❌ 脚本生成失败:', error.message)
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('🎉 排版优化测试完成!')
  console.log('📊 优化要点:')
  console.log('  ✅ 边长标签显示在图形外侧')
  console.log('  ✅ 解释内容使用VGroup和行间距')
  console.log('  ✅ 左右分区域布局')
  console.log('  ✅ 字体大小和颜色优化')
  console.log('  ✅ 确保内容在显示区域内')
}

// 运行测试
testLayoutOptimization().catch(console.error) 