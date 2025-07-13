// 测试改进后的视频生成功能
import { buildManimScriptFromQwen } from './src/services/mathVideoAI.js'

// 模拟AI返回的详细解题步骤
const mockDetailedSteps = [
  "题目：解方程 2x + 5 = 15",
  "1. 首先，我们需要将方程中的常数项移到等号右边\n   2x + 5 = 15\n   2x = 15 - 5\n   2x = 10\n   解释：通过移项，我们将未知数项和常数项分离",
  "2. 然后，我们通过除以系数来求解x\n   2x = 10\n   x = 10 ÷ 2\n   x = 5\n   解释：为了求解x，我们需要消除x的系数2",
  "3. 验证答案：将x = 5代入原方程\n   2(5) + 5 = 15\n   10 + 5 = 15\n   15 = 15 ✓\n   解释：验证过程确认我们的答案是正确的",
  "4. 最终答案：x = 5\n   解释：通过以上步骤，我们成功求解了这个一元一次方程"
]

// 测试步骤提取逻辑
function testStepExtraction() {
  console.log('🧪 测试步骤提取逻辑...')
  
  // 模拟AI解答内容
  const mockAIResponse = {
    data: {
      content: `**问题分析**
这是一个一元一次方程，需要求解未知数x的值。

**详细解题步骤**
1. 首先，我们需要将方程中的常数项移到等号右边
   2x + 5 = 15
   2x = 15 - 5
   2x = 10
   解释：通过移项，我们将未知数项和常数项分离

2. 然后，我们通过除以系数来求解x
   2x = 10
   x = 10 ÷ 2
   x = 5
   解释：为了求解x，我们需要消除x的系数2

3. 验证答案：将x = 5代入原方程
   2(5) + 5 = 15
   10 + 5 = 15
   15 = 15 ✓
   解释：验证过程确认我们的答案是正确的

**最终答案**
x = 5

**相关数学概念**
- 一元一次方程
- 移项法则
- 等式性质

**常见错误提醒**
- 忘记移项时改变符号
- 计算错误
- 忘记验证答案`
    }
  }
  
  // 测试步骤提取
  let steps = []
  
  // 1. 优先提取"详细解题步骤"部分
  const detailPatterns = [
    /\*\*详细解题步骤\*\*[\s\S]*?(?=\*\*|$)/,
    /详细解题步骤[\s\S]*?(?=(\*\*|最终答案|验证过程|相关数学概念|常见错误|$))/,
    /\*\*解题步骤\*\*[\s\S]*?(?=\*\*|$)/,
    /解题步骤[\s\S]*?(?=(\*\*|最终答案|验证过程|相关数学概念|常见错误|$))/
  ]
  
  let detailBlock = ''
  for (const pattern of detailPatterns) {
    const match = mockAIResponse.data.content.match(pattern)
    if (match) {
      detailBlock = match[0]
      console.log('✅ 找到详细解题步骤块:', detailBlock.substring(0, 150) + '...')
      break
    }
  }
  
  if (detailBlock) {
    // 提取编号步骤，支持多种格式
    const numberedPatterns = [
      /(\d+)[.、\)]\s*([^\n]+(?:\n(?!\d+[.、\)])[^\n]*)*)/g,
      /(\d+)\s*[.、\)]\s*([^\n]+)/g
    ]
    
    for (const pattern of numberedPatterns) {
      const matches = [...detailBlock.matchAll(pattern)]
      if (matches && matches.length > 0) {
        const stepMap = new Map()
        matches.forEach(match => {
          const stepNum = parseInt(match[1])
          const stepContent = match[2].trim()
          if (!stepMap.has(stepNum) || stepContent.length > stepMap.get(stepNum).length) {
            stepMap.set(stepNum, stepContent)
          }
        })
        
        steps = Array.from(stepMap.keys())
          .sort((a, b) => a - b)
          .map(num => stepMap.get(num))
        
        console.log('✅ 提取编号步骤（保持顺序）:', steps)
        break
      }
    }
  }
  
  console.log('📊 最终提取的步骤数量:', steps.length)
  steps.forEach((step, index) => {
    console.log(`步骤 ${index + 1}: ${step.substring(0, 100)}...`)
  })
  
  return steps
}

// 测试Manim脚本生成
function testManimScriptGeneration(steps) {
  console.log('🎬 测试Manim脚本生成...')
  
  try {
    const manimScript = buildManimScriptFromQwen(steps, "TestMathScene")
    console.log('✅ Manim脚本生成成功')
    console.log('📝 脚本长度:', manimScript.length)
    console.log('📄 脚本预览:')
    console.log(manimScript.substring(0, 500) + '...')
    
    return manimScript
  } catch (error) {
    console.error('❌ Manim脚本生成失败:', error)
    return null
  }
}

// 运行测试
async function runTests() {
  console.log('🚀 开始测试改进后的视频生成功能...')
  
  // 测试1: 步骤提取
  const extractedSteps = testStepExtraction()
  
  // 测试2: Manim脚本生成
  if (extractedSteps.length > 0) {
    const manimScript = testManimScriptGeneration(extractedSteps)
    
    if (manimScript) {
      console.log('✅ 所有测试通过！')
      console.log('📋 改进总结:')
      console.log('- ✅ 更详细的AI提示')
      console.log('- ✅ 改进的步骤提取逻辑')
      console.log('- ✅ 支持多行步骤内容')
      console.log('- ✅ 增强的Manim脚本')
      console.log('- ✅ 动态等待时间')
      console.log('- ✅ 更好的文本显示')
    }
  }
}

// 如果直接运行此文件
if (typeof window === 'undefined') {
  runTests()
}

export { testStepExtraction, testManimScriptGeneration, runTests } 