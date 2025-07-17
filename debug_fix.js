#!/usr/bin/env node

/**
 * 修复后的步骤提取测试
 */

const actualAIResponse = `**详细解题步骤**

1. **步骤编号：1**  
   **具体操作：写出三角形面积的计算公式**  
   **详细解释：这个公式适用于所有类型的三角形，只要知道底边和对应的高就可以使用。**  
   **中间结果：**  
   $
   \text{面积} = \frac{1}{2} \times \text{底边} \times \text{高}
   $  
   公式为：  
   $
   \text{面积} = \frac{1}{2} \times 8 \times 6
   $

2. **步骤编号：2**  
   **具体操作：先计算底边与高的乘积**  
   **详细解释：这是为了简化后续的计算步骤，先完成乘法可以减少运算的复杂度。**  
   **中间结果：**  
   $
   8 \times 6 = 48
   $  
   所以：  
   $
   \text{面积} = \frac{1}{2} \times 48
   $

3. **步骤编号：3**  
   **具体操作：再进行乘以1/2的运算**  
   **详细解释：因为三角形面积是底乘高的一半，所以要将前面的结果除以2，等价于乘以1/2。**  
   **中间结果：**  
   $
   \frac{1}{2} \times 48 = 24
   $  
   最终得到：  
   $
   \text{面积} = 24
   $`;

function extractAndSortStepsFixed(aiContent) {
  console.log('🔍 开始智能步骤提取...')
  console.log('内容长度:', aiContent.length)
  
  const steps = [] // 使用数组确保顺序
  
  // 1. 提取"详细解题步骤"块
  const detailBlockMatch = aiContent.match(/\*\*详细解题步骤\*\*\s*\n?([\s\S]*?)(?=\*\*|$)/)
  
  if (detailBlockMatch) {
    const detailBlock = detailBlockMatch[1]
    console.log('📋 找到详细解题步骤块，长度:', detailBlock.length)
    console.log('详细步骤块内容:')
    console.log(JSON.stringify(detailBlock))
    
    // 使用精确的步骤提取模式
    const stepPattern = /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g
    const matches = [...detailBlock.matchAll(stepPattern)]
    
    console.log(`✅ 找到 ${matches.length} 个匹配`)
    
    matches.forEach((match, idx) => {
      const stepNum = parseInt(match[1])
      const content = match[2].trim()
      console.log(`\n步骤 ${stepNum}:`)
      console.log('内容:', JSON.stringify(content))
      console.log('长度:', content.length)
      
      if (content.length > 5) {
        steps[stepNum - 1] = content
      }
    })
    
    const validSteps = steps.filter(step => step && step.length > 0)
    if (validSteps.length > 0) {
      console.log(`✅ 成功提取 ${validSteps.length} 个详细步骤`)
      return validSteps
    }
  }
  
  // 后备方案 - 使用整个内容提取
  console.log('🔄 尝试直接提取编号步骤...')
  const allStepsPattern = /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\d+[.、\)]|$)/g
  const allMatches = [...aiContent.matchAll(allStepsPattern)]
  
  const extractedSteps = []
  allMatches.forEach(match => {
    const stepNum = parseInt(match[1])
    const content = match[2].trim()
    if (content.length > 20) {
      extractedSteps[stepNum - 1] = content
    }
  })
  
  const validSteps = extractedSteps.filter(step => step && step.length > 0)
  if (validSteps.length > 0) {
    console.log(`✅ 直接提取 ${validSteps.length} 个步骤`)
    return validSteps
  }
  
  // 最后后备
  console.log('⚠️ 使用默认步骤')
  return [
    "理解题意：分析题目条件和要求",
    "建立数学模型：根据题意列出方程或表达式", 
    "逐步求解：使用数学方法求解",
    "验证结果：检查答案是否正确"
  ]
}

// 运行测试
console.log('🧪 测试修复后的提取...')
console.log('='.repeat(50))

const extractedSteps = extractAndSortStepsFixed(actualAIResponse);

console.log('\n📊 提取结果:')
console.log(`步骤数量: ${extractedSteps.length}`)
extractedSteps.forEach((step, index) => {
  console.log(`\n步骤 ${index + 1}:`)
  console.log(step)
})

console.log('\n' + '='.repeat(50))
console.log('✅ 测试完成！')