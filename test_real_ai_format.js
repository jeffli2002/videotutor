#!/usr/bin/env node

/**
 * 测试修复后的实际AI响应格式提取
 */

const actualAIResponse = `**问题分析**  
这是一个基础的几何问题，要求计算一个三角形的面积。已知三角形的底边长度为8，高为6。解题的关键是掌握三角形面积的计算公式，并正确代入数值进行计算。

---

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

---

**最终答案**  
该三角形的面积是 **24**。

---

**验证过程**  
我们可以将结果代入原公式进行验证：
$
\text{面积} = \frac{1}{2} \times 8 \times 6 = 24
$  
计算结果一致，说明答案正确。`;

// 使用修复后的函数
function extractAndSortSteps(aiContent) {
  console.log('🔍 开始智能步骤提取...')
  
  const steps = [] // 使用数组确保顺序
  
  // 1. 优先提取"详细解题步骤"块中的完整步骤内容
  const detailBlockMatch = aiContent.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*最终答案\*\*|$)/)
  
  if (detailBlockMatch) {
    const detailBlock = detailBlockMatch[1]
    console.log('📋 找到详细解题步骤块，长度:', detailBlock.length)
    console.log('详细步骤块预览:', detailBlock.substring(0, 200) + '...')
    
    // 更灵活的步骤提取模式，支持多种格式
    const stepPatterns = [
      // 匹配：1. **步骤编号：1** **具体操作：移项** 详细解释...（支持多行，包括数学公式）
      /(\d+)[.、\)]\s*\*\*[^*]*?步骤编号：\d+\*\*\s*\*\*[^*]*?具体操作：([^*]+?)\*[\s\S]*?(?=\n\d+[.、\)]|$)/g,
      // 匹配：1. **具体操作：移项** 详细解释...（简化格式）
      /(\d+)[.、\)]\s*\*\*[^*]*?具体操作：([^*]+?)\*[\s\S]*?(?=\n\d+[.、\)]|$)/g,
      // 匹配：1. **标题** 内容（支持多行，包括数学公式）
      /(\d+)[.、\)]\s*\*\*([^*]+?)\*\*\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|\*\*|$)/g,
      // 匹配：1. 内容（包括数学公式和换行）
      /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|\*\*|$)/g,
      // 匹配：步骤描述（如果没有编号）
      /(?:步骤|step)\s*(\d+)[:：\s]+([\s\S]*?)(?=\n\s*(?:步骤|step)|\*\*|$)/gi
    ]
    
    let foundSteps = false
    for (const pattern of stepPatterns) {
      const matches = [...detailBlock.matchAll(pattern)]
      if (matches.length > 0) {
        console.log(`✅ 使用模式匹配到 ${matches.length} 个步骤`)
        
        matches.forEach((match, idx) => {
          console.log(`匹配 ${idx + 1}:`, {
            group1: match[1],
            fullContent: match[0].substring(0, 100) + '...'
          })
          
          const stepNum = parseInt(match[1]) - 1
          let stepContent = ''
          
          if (match.length >= 4) {
            // 对于实际AI格式，捕获完整内容
            stepContent = match[0].trim()
          } else {
            // 普通格式
            stepContent = match[2] ? match[2].trim() : match[1].trim()
          }
          
          // 清理内容但保留数学公式和格式
          stepContent = stepContent.trim()
          
          if (stepContent.length > 10) {
            steps[stepNum] = stepContent
            console.log(`📝 提取步骤 ${stepNum + 1}: ${stepContent.substring(0, 80)}...`)
            foundSteps = true
          }
        })
        
        if (foundSteps) break
      }
    }
    
    if (foundSteps) {
      const validSteps = steps.filter(step => step && step.length > 0)
      if (validSteps.length > 0) {
        console.log(`✅ 成功提取 ${validSteps.length} 个详细步骤`)
        return validSteps
      }
    }
  }
  
  // 后备方案
  console.log('⚠️ 使用默认步骤')
  return [
    "理解题意：分析题目条件和要求",
    "建立数学模型：根据题意列出方程或表达式", 
    "逐步求解：使用数学方法求解",
    "验证结果：检查答案是否正确"
  ]
}

// 运行测试
console.log('🧪 测试实际AI响应格式提取...')
console.log('='.repeat(50))

const extractedSteps = extractAndSortSteps(actualAIResponse);
console.log('\n📊 提取结果:')
console.log(`步骤数量: ${extractedSteps.length}`)
extractedSteps.forEach((step, index) => {
  console.log(`\n步骤 ${index + 1}:`)
  console.log(step)
})

console.log('\n' + '='.repeat(50))
console.log('✅ 测试完成！')