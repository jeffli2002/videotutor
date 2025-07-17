#!/usr/bin/env node

/**
 * 精确调试实际格式
 */

const aiContent = `
**详细解题步骤**

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
   $

**最终答案**
该三角形的面积是 **24**。
`;

console.log('🔍 精确调试开始...')

// 1. 提取详细步骤块
const detailBlockMatch = aiContent.match(/\*\*详细解题步骤\*\*\s*\n\s*([\s\S]*?)(?=\n\*\*最终答案|$)/)
if (detailBlockMatch) {
  const detailBlock = detailBlockMatch[1]
  console.log('✅ 详细步骤块:')
  console.log(detailBlock)
  console.log('长度:', detailBlock.length)
  
  // 2. 提取步骤
  const stepPattern = /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g
  const matches = [...detailBlock.matchAll(stepPattern)]
  
  console.log(`\n✅ 找到 ${matches.length} 个步骤`)
  
  const steps = []
  matches.forEach((match, idx) => {
    const stepNum = parseInt(match[1])
    const content = match[2].trim()
    steps[stepNum - 1] = content
    console.log(`\n步骤 ${stepNum}:`)
    console.log(content)
  })
  
  const validSteps = steps.filter(s => s && s.length > 0)
  console.log(`\n🎯 最终结果: ${validSteps.length} 个步骤`)
  
  validSteps.forEach((step, index) => {
    console.log(`\n${index + 1}. ${step.substring(0, 200)}...`)
  })
} else {
  // 直接提取所有编号步骤
  console.log('⚠️ 尝试直接提取所有编号步骤...')
  const allStepsPattern = /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\d+[.、\)]|$)/g
  const allMatches = [...aiContent.matchAll(allStepsPattern)]
  
  const steps = []
  allMatches.forEach((match, idx) => {
    const stepNum = parseInt(match[1])
    const content = match[2].trim()
    steps[stepNum - 1] = content
  })
  
  const validSteps = steps.filter(s => s && s.length > 0)
  console.log(`\n🎯 直接提取: ${validSteps.length} 个步骤`)
  
  validSteps.forEach((step, index) => {
    console.log(`\n${index + 1}. ${step.substring(0, 200)}...`)
  })
}

console.log('\n✅ 调试完成')