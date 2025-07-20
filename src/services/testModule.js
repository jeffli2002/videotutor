// 测试模块 - 用于测试智能问题类型分析系统
import { MathVideoController } from './mathVideoController.js'

export class TestModule {
  constructor() {
    this.controller = new MathVideoController()
  }

  // 运行完整测试
  async runFullTest() {
    console.log('🧪 开始运行完整测试...\n')
    
    // 1. 测试问题类型分析
    await this.testQuestionAnalysis()
    
    // 2. 测试具体求解问题
    await this.testConcreteProblems()
    
    // 3. 测试理论解释问题
    await this.testTheoreticalQuestions()
    
    // 4. 测试混合类型问题
    await this.testMixedQuestions()
    
    console.log('✅ 完整测试完成！')
  }

  // 测试问题类型分析
  async testQuestionAnalysis() {
    console.log('📊 测试问题类型分析...\n')
    
    const testQuestions = [
      // 具体求解问题
      '解方程：2x + 3 = 7',
      '已知三角形ABC，底边长为6cm，高为4cm，求三角形面积',
      '计算函数f(x)=x²的导数',
      '化简表达式：(x+1)(x-1)',
      '求不等式2x - 1 > 5的解集',
      
      // 理论解释问题
      '什么是拉窗帘原理？请用动画演示',
      '如何理解微积分的基本概念？',
      '演示三角形面积不变的几何变换',
      '解释什么是勾股定理',
      '什么是函数的连续性？',
      
      // 混合类型问题
      '拉窗帘原理的具体应用',
      '微积分在实际问题中的应用',
      '几何变换的数学原理'
    ]
    
    const results = this.controller.testQuestionAnalysis(testQuestions)
    
    // 统计结果
    const stats = {
      concrete_problem: 0,
      theoretical_question: 0,
      mixed: 0,
      fallback: 0
    }
    
    results.forEach(result => {
      stats[result.analysis.type] = (stats[result.analysis.type] || 0) + 1
    })
    
    console.log('📈 分析结果统计:')
    console.log(`具体求解问题: ${stats.concrete_problem}`)
    console.log(`理论解释问题: ${stats.theoretical_question}`)
    console.log(`混合类型问题: ${stats.mixed}`)
    console.log(`备用类型: ${stats.fallback}`)
    console.log('')
  }

  // 测试具体求解问题
  async testConcreteProblems() {
    console.log('🔢 测试具体求解问题...\n')
    
    const testCases = [
      {
        question: '解方程：2x + 3 = 7',
        solution: `**解题步骤**
1. **步骤1** 将方程2x+3=7移项：2x+3-3=7-3，得到2x=4
2. **步骤2** 系数化为1：2x÷2=4÷2，得到x=2
3. **步骤3** 验证答案：将x=2代入原方程，2×2+3=7，等式成立

**最终答案**
x = 2

**验证**
将x=2代入原方程：2×2+3=4+3=7，等式成立，答案正确。`
      },
      {
        question: '已知三角形ABC，底边长为6cm，高为4cm，求三角形面积',
        solution: `**解题步骤**
1. **步骤1** 分析题目：三角形底边6cm，高4cm
2. **步骤2** 应用面积公式：面积=底×高÷2=6×4÷2=12cm²
3. **步骤3** 验证计算：6×4=24，24÷2=12，计算正确

**最终答案**
三角形面积为12cm²

**验证**
使用公式验证：面积=底×高÷2=6×4÷2=12cm²，计算正确。`
      }
    ]
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      console.log(`📝 测试用例 ${i + 1}: ${testCase.question}`)
      
      try {
        const result = await this.controller.generateMathVideo(
          testCase.question, 
          testCase.solution, 
          'zh'
        )
        
        console.log(`✅ 生成成功，类型: ${result.type}`)
        console.log(`   脚本页数: ${result.script.pages.length}`)
        console.log(`   动画数量: ${result.animations.length}`)
        console.log(`   语音时长: ${result.voiceover.duration}秒`)
        console.log(`   总时长: ${result.totalDuration}秒`)
        console.log('')
        
      } catch (error) {
        console.error(`❌ 测试失败: ${error.message}`)
        console.log('')
      }
    }
  }

  // 测试理论解释问题
  async testTheoreticalQuestions() {
    console.log('📚 测试理论解释问题...\n')
    
    const testCases = [
      {
        question: '什么是拉窗帘原理？请用动画演示',
        solution: `**拉窗帘原理概念**
拉窗帘原理是几何学中的一个重要概念，它展示了三角形面积的不变性。

**原理说明**
当我们沿着三角形的中线剪开并重新组合时，面积保持不变。这个原理帮助我们理解几何变换中的面积守恒。

**动画演示**
通过动画演示，我们可以直观地看到这个变换过程。三角形被剪成两部分，然后重新组合成矩形，面积始终保持不变。

**应用价值**
这个原理在几何学中有着重要的应用价值，帮助我们理解面积守恒的概念。`
      },
      {
        question: '如何理解微积分的基本概念？',
        solution: `**微积分基本概念**
微积分是研究变化和积累的数学分支，包含微分和积分两个主要部分。

**微分概念**
微分研究的是瞬时变化率，比如速度是位移对时间的导数。

**积分概念**
积分研究的是累积效果，比如位移是速度对时间的积分。

**几何意义**
微积分有着深刻的几何意义，帮助我们理解曲线的斜率和面积。`
      }
    ]
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      console.log(`📝 测试用例 ${i + 1}: ${testCase.question}`)
      
      try {
        const result = await this.controller.generateMathVideo(
          testCase.question, 
          testCase.solution, 
          'zh'
        )
        
        console.log(`✅ 生成成功，类型: ${result.type}`)
        console.log(`   脚本页数: ${result.script.pages.length}`)
        console.log(`   动画数量: ${result.animations.length}`)
        console.log(`   语音时长: ${result.voiceover.duration}秒`)
        console.log(`   总时长: ${result.totalDuration}秒`)
        console.log('')
        
      } catch (error) {
        console.error(`❌ 测试失败: ${error.message}`)
        console.log('')
      }
    }
  }

  // 测试混合类型问题
  async testMixedQuestions() {
    console.log('🔄 测试混合类型问题...\n')
    
    const testCases = [
      {
        question: '拉窗帘原理的具体应用',
        solution: `**拉窗帘原理应用**
拉窗帘原理不仅是一个理论概念，在实际问题中也有重要应用。

**具体应用场景**
1. 在建筑设计中，可以利用这个原理计算不规则形状的面积
2. 在工程测量中，可以简化复杂图形的面积计算
3. 在数学教学中，可以直观地展示面积守恒概念

**实际计算**
例如，一个底边为8cm，高为5cm的三角形，应用拉窗帘原理可以将其转换为8×5=40cm²的矩形，面积计算更加直观。`
      }
    ]
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      console.log(`📝 测试用例 ${i + 1}: ${testCase.question}`)
      
      try {
        const result = await this.controller.generateMathVideo(
          testCase.question, 
          testCase.solution, 
          'zh'
        )
        
        console.log(`✅ 生成成功，类型: ${result.type}`)
        console.log(`   脚本页数: ${result.script.pages.length}`)
        console.log(`   动画数量: ${result.animations.length}`)
        console.log(`   语音时长: ${result.voiceover.duration}秒`)
        console.log(`   总时长: ${result.totalDuration}秒`)
        console.log('')
        
      } catch (error) {
        console.error(`❌ 测试失败: ${error.message}`)
        console.log('')
      }
    }
  }

  // 测试内容一致性
  testContentConsistency() {
    console.log('🔍 测试内容一致性...\n')
    
    const testQuestion = '解方程：2x + 3 = 7'
    const testSolution = '具体解题步骤...'
    
    // 多次生成相同内容，检查一致性
    const promises = []
    for (let i = 0; i < 3; i++) {
      promises.push(this.controller.generateMathVideo(testQuestion, testSolution, 'zh'))
    }
    
    Promise.all(promises).then(results => {
      console.log('📊 一致性检查结果:')
      
      const types = results.map(r => r.type)
      const durations = results.map(r => r.totalDuration)
      
      console.log(`类型一致性: ${types.every(t => t === types[0]) ? '✅' : '❌'}`)
      console.log(`时长一致性: ${durations.every(d => Math.abs(d - durations[0]) < 5) ? '✅' : '❌'}`)
      
      console.log('')
    }).catch(error => {
      console.error('❌ 一致性测试失败:', error)
    })
  }

  // 性能测试
  async performanceTest() {
    console.log('⚡ 性能测试...\n')
    
    const testQuestion = '解方程：2x + 3 = 7'
    const testSolution = '具体解题步骤...'
    
    const startTime = Date.now()
    
    try {
      const result = await this.controller.generateMathVideo(testQuestion, testSolution, 'zh')
      const endTime = Date.now()
      
      console.log(`⏱️ 生成耗时: ${endTime - startTime}ms`)
      console.log(`📊 生成结果大小: ${JSON.stringify(result).length} 字符`)
      console.log('')
      
    } catch (error) {
      console.error('❌ 性能测试失败:', error)
    }
  }
}

// 导出测试函数
export async function runTests() {
  const testModule = new TestModule()
  await testModule.runFullTest()
} 