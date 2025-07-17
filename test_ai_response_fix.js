#!/usr/bin/env node

/**
 * 测试修复后的步骤提取功能
 * 使用实际的AI响应格式进行验证
 */

// 使用修复后的函数
function extractAndSortSteps(aiContent) {
  console.log('🔍 开始智能步骤提取...')
  
  const steps = [] // 使用数组确保顺序
  
  // 1. 优先提取"详细解题步骤"块中的完整步骤内容
  const detailBlockMatch = aiContent.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*最终答案\*\*|$)/)
  
  if (detailBlockMatch) {
    const detailBlock = detailBlockMatch[1]
    console.log('📋 找到详细解题步骤块，长度:', detailBlock.length)
    
    // 更灵活的步骤提取模式，支持多种格式
    const stepPatterns = [
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
        
        matches.forEach(match => {
          const stepNum = parseInt(match[1]) - 1
          let stepContent = ''
          
          if (match.length >= 4) {
            // 带标题的格式
            const title = match[2].trim()
            const content = (match[3] || '').trim()
            stepContent = `**${title}**\n${content}`
          } else {
            // 普通格式
            stepContent = match[2].trim()
          }
          
          stepContent = stepContent.trim()
          
          if (stepContent.length > 20) {
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
  
  // 2. 尝试从整个内容中提取包含数学公式的详细步骤
  console.log('🔄 尝试提取包含详细内容的步骤...')
  
  // 提取所有编号步骤，包括完整内容
  const allStepsPattern = /(?:^|\n)(\d+)[.、\)]\s*([\s\S]*?)(?=\n\d+[.、\)]|$|\*\*)/gm
  const allMatches = [...aiContent.matchAll(allStepsPattern)]
  
  if (allMatches.length > 0) {
    const detailedSteps = allMatches.map(match => {
      const content = match[2].trim()
      return content
    }).filter(content => content.length > 20)
    
    if (detailedSteps.length > 0) {
      console.log(`✅ 提取到 ${detailedSteps.length} 个详细步骤`)
      return detailedSteps
    }
  }
  
  // 3. 从内容中提取段落作为步骤
  const paragraphs = aiContent.split('\n\n').filter(p => p.trim().length > 50)
  if (paragraphs.length >= 2) {
    console.log('✅ 使用段落作为步骤')
    return paragraphs.slice(0, 6)
  }
  
  // 4. 最后使用默认步骤（仅作为后备）
  console.log('⚠️ 使用默认步骤')
  return [
    "理解题意：分析题目条件和要求",
    "建立数学模型：根据题意列出方程或表达式", 
    "逐步求解：使用数学方法求解",
    "验证结果：检查答案是否正确",
    "总结反思：回顾解题过程和方法"
  ]
}

// 实际AI响应格式测试
const actualAIResponse = `**问题分析**  
这是一个一元一次方程的求解问题，目标是找到未知数 $ x $ 的值。这类方程的基本形式为 $ ax + b = c $，其中 $ a, b, c $ 是已知常数，$ x $ 是未知数。  
解题思路是通过逆运算逐步将方程化简，最终得到 $ x $ 的具体数值。

---

**详细解题步骤**

1. **移项：将常数项移到等号右边**  
   操作：从原方程中减去5  
   原式：  
   $
   2x + 5 = 15
   $  
   减去5后：  
   $
   2x = 15 - 5
   $  
   中间结果：  
   $
   2x = 10
   $  
   解释：为了使未知数 $ x $ 单独出现在一边，我们需要把常数项 $ +5 $ 移到等号右边，并变号为 $ -5 $。

2. **消去系数：两边同时除以2**  
   操作：将等式两边都除以2  
   原式：  
   $
   2x = 10
   $  
   除以2后：  
   $
   x = \frac{10}{2}
   $  
   中间结果：  
   $
   x = 5
   $  
   解释：由于 $ x $ 前面有一个系数2，我们通过除以这个系数来"去掉"它，从而得到 $ x $ 的值。

---

**最终答案**  
$
x = 5
$

---

**验证过程**  
将 $ x = 5 $ 代入原方程 $ 2x + 5 = 15 $ 进行验证：

计算左边：
$
2(5) + 5 = 10 + 5 = 15
$

与右边相等，说明答案正确。`;

// 运行测试
console.log('🧪 测试AI响应步骤提取...')
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