#!/usr/bin/env node

/**
 * 精确调试AI响应提取
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

function debugExactExtraction(aiContent) {
  console.log('🔍 精确调试步骤提取...')
  
  // 1. 提取详细步骤块
  const detailBlockMatch = aiContent.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*|$)/)
  if (!detailBlockMatch) {
    console.log('❌ 未找到详细步骤块')
    return []
  }
  
  const detailBlock = detailBlockMatch[1]
  console.log('📋 详细步骤块:', detailBlock)
  
  // 2. 使用简单模式提取
  const simplePattern = /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\d+[.、\)]|$)/g
  const matches = [...detailBlock.matchAll(simplePattern)]
  
  console.log(`✅ 找到 ${matches.length} 个匹配`)
  
  const steps = []
  matches.forEach((match, idx) => {
    const stepNum = parseInt(match[1])
    const content = match[2].trim()
    console.log(`\n步骤 ${stepNum}:`)
    console.log('完整内容:', content)
    console.log('内容长度:', content.length)
    
    steps[stepNum - 1] = content
  })
  
  return steps.filter(step => step && step.length > 0)
}

// 运行测试
console.log('🧪 精确调试测试...')
const steps = debugExactExtraction(actualAIResponse)

console.log('\n📊 最终结果:')
console.log(`步骤数量: ${steps.length}`)
steps.forEach((step, index) => {
  console.log(`\n步骤 ${index + 1}:`)
  console.log(step)
})