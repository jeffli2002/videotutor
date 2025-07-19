// 端到端完整流程测试 - 覆盖所有不同类型题目
import { MathVideoAIService } from './src/services/mathVideoAI.js'

console.log('🚀 开始端到端完整流程测试...\n')

// 创建服务实例
const mathVideoService = new MathVideoAIService()

// 测试用例集合
const testCases = [
  // 1. 具体求解问题 - 代数方程
  {
    category: '具体求解问题 - 代数方程',
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
  
  // 2. 具体求解问题 - 几何计算
  {
    category: '具体求解问题 - 几何计算',
    question: '已知三角形ABC，底边长为6cm，高为4cm，求三角形面积',
    solution: `**解题步骤**
1. **步骤1** 分析题目：三角形底边6cm，高4cm
2. **步骤2** 应用面积公式：面积=底×高÷2=6×4÷2=12cm²
3. **步骤3** 验证计算：6×4=24，24÷2=12，计算正确

**最终答案**
三角形面积为12cm²

**验证**
使用公式验证：面积=底×高÷2=6×4÷2=12cm²，计算正确。`
  },
  
  // 3. 具体求解问题 - 微积分
  {
    category: '具体求解问题 - 微积分',
    question: '计算函数f(x)=x²的导数',
    solution: `**解题步骤**
1. **步骤1** 识别函数类型：f(x)=x²是幂函数
2. **步骤2** 应用导数公式：幂函数f(x)=x^n的导数为f'(x)=n×x^(n-1)
3. **步骤3** 计算导数：f'(x)=2×x^(2-1)=2x

**最终答案**
f'(x) = 2x

**验证**
使用定义验证：lim(h→0)[(x+h)²-x²]/h = lim(h→0)[x²+2xh+h²-x²]/h = lim(h→0)[2xh+h²]/h = lim(h→0)[2x+h] = 2x`
  },
  
  // 4. 具体求解问题 - 不等式
  {
    category: '具体求解问题 - 不等式',
    question: '求不等式2x - 1 > 5的解集',
    solution: `**解题步骤**
1. **步骤1** 将不等式2x-1>5移项：2x-1+1>5+1，得到2x>6
2. **步骤2** 系数化为1：2x÷2>6÷2，得到x>3
3. **步骤3** 验证解集：取x=4代入原不等式，2×4-1=7>5，成立

**最终答案**
x > 3

**验证**
解集为x>3，表示所有大于3的实数都是不等式的解。`
  },
  
  // 5. 理论解释问题 - 几何原理
  {
    category: '理论解释问题 - 几何原理',
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
  
  // 6. 理论解释问题 - 微积分概念
  {
    category: '理论解释问题 - 微积分概念',
    question: '如何理解微积分的基本概念？',
    solution: `**微积分基本概念**
微积分是研究变化和积累的数学分支，包含微分和积分两个主要部分。

**微分概念**
微分研究的是瞬时变化率，比如速度是位移对时间的导数。它帮助我们理解函数在某一点的瞬时变化情况。

**积分概念**
积分研究的是累积效果，比如位移是速度对时间的积分。它帮助我们计算面积、体积等累积量。

**几何意义**
微积分有着深刻的几何意义，帮助我们理解曲线的斜率和面积。微分对应切线的斜率，积分对应曲线下的面积。`
  },
  
  // 7. 理论解释问题 - 勾股定理
  {
    category: '理论解释问题 - 勾股定理',
    question: '解释什么是勾股定理',
    solution: `**勾股定理定义**
勾股定理是几何学中的基本定理，描述了直角三角形三边之间的关系。

**定理内容**
在直角三角形中，直角边的平方和等于斜边的平方，即a²+b²=c²。

**几何意义**
勾股定理揭示了直角三角形中边长的内在关系，是几何学的基础定理之一。

**应用范围**
勾股定理广泛应用于建筑、工程、物理等领域，是解决实际问题的重要工具。`
  },
  
  // 8. 混合类型问题 - 原理应用
  {
    category: '混合类型问题 - 原理应用',
    question: '拉窗帘原理的具体应用',
    solution: `**拉窗帘原理应用**
拉窗帘原理不仅是一个理论概念，在实际问题中也有重要应用。

**具体应用场景**
1. 在建筑设计中，可以利用这个原理计算不规则形状的面积
2. 在工程测量中，可以简化复杂图形的面积计算
3. 在数学教学中，可以直观地展示面积守恒概念

**实际计算**
例如，一个底边为8cm，高为5cm的三角形，应用拉窗帘原理可以将其转换为8×5=40cm²的矩形，面积计算更加直观。

**教学价值**
这个原理在数学教学中具有重要价值，帮助学生理解几何变换的本质。`
  },
  
  // 9. 混合类型问题 - 微积分应用
  {
    category: '混合类型问题 - 微积分应用',
    question: '微积分在实际问题中的应用',
    solution: `**微积分应用概述**
微积分在实际问题中有着广泛的应用，从物理学到经济学都有其身影。

**物理应用**
在物理学中，微积分用于描述运动、力、能量等概念。例如，速度是位移的导数，加速度是速度的导数。

**经济应用**
在经济学中，微积分用于分析边际效应、优化问题等。例如，边际成本是总成本函数的导数。

**工程应用**
在工程学中，微积分用于设计、分析、优化各种系统。例如，电路分析、结构力学等。

**实际计算**
通过具体的数值计算，我们可以更好地理解微积分的应用价值。`
  },
  
  // 10. 复杂问题 - 多步骤求解
  {
    category: '复杂问题 - 多步骤求解',
    question: '已知函数f(x)=x³-3x²+2x+1，求f(x)的极值点和单调区间',
    solution: `**解题步骤**
1. **步骤1** 求导数：f'(x)=3x²-6x+2
2. **步骤2** 求导数的零点：3x²-6x+2=0，解得x=(6±√(36-24))/6=(6±√12)/6=(3±√3)/3
3. **步骤3** 分析单调性：当x<(3-√3)/3时，f'(x)>0，函数单调递增；当(3-√3)/3<x<(3+√3)/3时，f'(x)<0，函数单调递减；当x>(3+√3)/3时，f'(x)>0，函数单调递增
4. **步骤4** 确定极值点：x=(3-√3)/3是极大值点，x=(3+√3)/3是极小值点

**最终答案**
极大值点：x=(3-√3)/3，极小值点：x=(3+√3)/3
单调递增区间：(-∞,(3-√3)/3)和((3+√3)/3,+∞)
单调递减区间：((3-√3)/3,(3+√3)/3)

**验证**
通过二阶导数f''(x)=6x-6可以验证极值点的性质。`
  }
]

// 执行端到端测试
async function runEndToEndTest() {
  console.log(`📊 开始测试 ${testCases.length} 个不同类型的题目...\n`)
  
  const results = []
  const startTime = Date.now()
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📝 测试用例 ${i + 1}/${testCases.length}: ${testCase.category}`)
    console.log(`问题: ${testCase.question}`)
    console.log(`${'='.repeat(60)}`)
    
    try {
      // 1. 问题类型分析
      console.log('🔍 步骤1: 问题类型分析...')
      const analysis = mathVideoService.analyzeQuestionType(testCase.question)
      console.log(`   类型: ${analysis.type}`)
      console.log(`   置信度: ${analysis.confidence}`)
      console.log(`   推理: ${analysis.reasoning}`)
      
      // 2. 生成完整视频内容
      console.log('🎬 步骤2: 生成完整视频内容...')
      const result = await mathVideoService.generateMathVideo(
        testCase.question,
        testCase.solution,
        'zh'
      )
      
      // 3. 验证结果
      console.log('✅ 步骤3: 验证生成结果...')
      console.log(`   脚本类型: ${result.script.type}`)
      console.log(`   脚本页数: ${result.script.pages.length}`)
      console.log(`   动画数量: ${result.animations.length}`)
      console.log(`   语音类型: ${result.voiceover.type}`)
      console.log(`   总时长: ${result.totalDuration}秒`)
      
      // 4. 内容一致性检查
      console.log('🔍 步骤4: 内容一致性检查...')
      const isConsistent = checkContentConsistency(result)
      console.log(`   内容一致性: ${isConsistent ? '✅' : '❌'}`)
      
      // 5. 记录结果
      results.push({
        index: i + 1,
        category: testCase.category,
        question: testCase.question,
        analysis: analysis,
        result: result,
        success: true,
        isConsistent: isConsistent,
        duration: Date.now() - startTime
      })
      
      console.log('✅ 测试用例完成')
      
    } catch (error) {
      console.error('❌ 测试用例失败:', error.message)
      results.push({
        index: i + 1,
        category: testCase.category,
        question: testCase.question,
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      })
    }
    
    // 添加延迟避免服务器过载
    if (i < testCases.length - 1) {
      console.log('⏳ 等待3秒后继续下一个测试...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  // 生成测试报告
  generateTestReport(results, Date.now() - startTime)
}

// 检查内容一致性
function checkContentConsistency(result) {
  const { script, animations, voiceover, analysis } = result
  
  // 检查类型一致性
  const typeConsistent = script.type === analysis.type &&
                        (animations.length === 0 || animations[0].animationType === analysis.type) &&
                        voiceover.type === analysis.type
  
  // 检查时长合理性
  const scriptDuration = script.pages.reduce((total, page) => total + page.duration, 0)
  const animationDuration = animations.reduce((total, anim) => total + (anim.duration || 0), 0)
  const voiceoverDuration = voiceover.duration || 0
  
  const durationConsistent = Math.abs(scriptDuration - animationDuration) < 10 &&
                            Math.abs(scriptDuration - voiceoverDuration) < 10
  
  return typeConsistent && durationConsistent
}

// 生成测试报告
function generateTestReport(results, totalDuration) {
  console.log('\n' + '='.repeat(80))
  console.log('📊 端到端测试报告')
  console.log('='.repeat(80))
  
  // 统计信息
  const totalTests = results.length
  const successfulTests = results.filter(r => r.success).length
  const failedTests = totalTests - successfulTests
  const consistentTests = results.filter(r => r.isConsistent).length
  
  console.log(`总测试数: ${totalTests}`)
  console.log(`成功测试: ${successfulTests}`)
  console.log(`失败测试: ${failedTests}`)
  console.log(`内容一致: ${consistentTests}`)
  console.log(`总耗时: ${(totalDuration / 1000).toFixed(2)}秒`)
  console.log(`平均耗时: ${(totalDuration / totalTests / 1000).toFixed(2)}秒/题`)
  
  // 按类型统计
  const typeStats = {}
  results.forEach(result => {
    if (result.success) {
      const type = result.analysis.type
      typeStats[type] = (typeStats[type] || 0) + 1
    }
  })
  
  console.log('\n📈 按问题类型统计:')
  Object.entries(typeStats).forEach(([type, count]) => {
    console.log(`${type}: ${count} 个`)
  })
  
  // 详细结果
  console.log('\n📋 详细测试结果:')
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    const consistency = result.isConsistent ? '✅' : '❌'
    console.log(`${status} ${result.index}. ${result.category}`)
    if (result.success) {
      console.log(`   类型: ${result.analysis.type}, 一致性: ${consistency}`)
    } else {
      console.log(`   错误: ${result.error}`)
    }
  })
  
  // 性能分析
  console.log('\n⚡ 性能分析:')
  const durations = results.filter(r => r.success).map(r => r.duration)
  if (durations.length > 0) {
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const minDuration = Math.min(...durations)
    const maxDuration = Math.max(...durations)
    console.log(`平均耗时: ${(avgDuration / 1000).toFixed(2)}秒`)
    console.log(`最短耗时: ${(minDuration / 1000).toFixed(2)}秒`)
    console.log(`最长耗时: ${(maxDuration / 1000).toFixed(2)}秒`)
  }
  
  // 总结
  console.log('\n🎯 测试总结:')
  if (successfulTests === totalTests) {
    console.log('🎉 所有测试用例都成功通过！')
  } else {
    console.log(`⚠️ 有 ${failedTests} 个测试用例失败，需要进一步检查`)
  }
  
  if (consistentTests === successfulTests) {
    console.log('🎉 所有成功测试的内容都保持一致！')
  } else {
    console.log(`⚠️ 有 ${successfulTests - consistentTests} 个测试的内容一致性有问题`)
  }
  
  console.log('\n✅ 端到端测试完成！')
}

// 运行测试
runEndToEndTest().catch(error => {
  console.error('❌ 端到端测试失败:', error)
  process.exit(1)
}) 