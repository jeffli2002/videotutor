#!/usr/bin/env node

/**
 * 逐步调试步骤提取
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

console.log('🔍 逐步调试开始...')

// 1. 检查整个内容
console.log('1. 内容长度:', actualAIResponse.length)
console.log('2. 内容开头:', actualAIResponse.substring(0, 100))

// 2. 提取详细步骤块
const detailBlockMatch = actualAIResponse.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*|$)/)
if (detailBlockMatch) {
  const detailBlock = detailBlockMatch[1]
  console.log('3. 详细步骤块找到，长度:', detailBlock.length)
  console.log('4. 详细步骤块内容:')
  console.log(detailBlock)
  
  // 3. 使用简单模式提取
  console.log('\n5. 开始提取步骤...')
  const stepPattern = /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g
  const matches = [...detailBlock.matchAll(stepPattern)]
  
  console.log(`6. 找到 ${matches.length} 个步骤`)
  
  const steps = []
  matches.forEach((match, idx) => {
    const stepNum = parseInt(match[1])
    const content = match[2].trim()
    console.log(`步骤 ${stepNum}:`)
    console.log('  内容:', content)
    console.log('  长度:', content.length)
    
    steps[stepNum - 1] = content
  })
  
  console.log('\n7. 最终结果:')
  console.log('  步骤数量:', steps.filter(s => s).length)
  
  steps.forEach((step, index) => {
    if (step) {
      console.log(`  ${index + 1}. ${step.substring(0, 100)}...`)
    }
  })
} else {
  console.log('❌ 未找到详细步骤块')
  
  // 4. 尝试其他提取方式
  console.log('\n8. 尝试直接提取所有编号步骤...')
  const allStepsPattern = /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\d+[.、\)]|$)/g
  const allMatches = [...actualAIResponse.matchAll(allStepsPattern)]
  
  console.log(`9. 找到 ${allMatches.length} 个步骤`)
  allMatches.forEach((match, idx) => {
    console.log(`全局步骤 ${idx + 1}: ${match[1]}. ${match[2].substring(0, 100)}...`)
  })
}

console.log('\n✅ 调试完成')