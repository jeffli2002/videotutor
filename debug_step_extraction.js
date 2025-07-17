// 调试实际的AI响应格式
const actualAIResponse = `**问题分析**  
这是一个一元一次不等式的求解问题，目标是找出满足不等式 $ 3x - 7 > 14 $ 的所有实数 $ x $ 的取值范围。  
解题的基本思路是通过移项和化简，将不等式转化为 $ x > a $ 的形式，从而得到解集。

---

**详细解题步骤**

1. **步骤编号：1**  
   **具体操作：移项**  
   **详细解释：为了将未知数 $ x $ 单独留在不等式的一边，我们需要将常数项 $ -7 $ 移到不等号右边。移项时要变号。**  
   **中间结果：**  
   $
   3x - 7 > 14
   $  
   将 $ -7 $ 移到右边变为 $ +7 $：  
   $
   3x > 14 + 7
   $  
   $
   3x > 21
   $

2. **步骤编号：2**  
   **具体操作：两边同时除以3**  
   **详细解释：为了求出 $ x $ 的值，需要将两边都除以 $ x $ 的系数3。因为3是正数，不等号方向不变。**  
   **中间结果：**  
   $
   \frac{3x}{3} > \frac{21}{3}
   $  
   $
   x > 7
   $`;

// 测试当前提取逻辑
function debugStepExtraction(aiContent) {
  console.log('🔍 调试步骤提取...')
  console.log('输入长度:', aiContent.length)
  
  // 1. 检查详细步骤块
  const detailBlockMatch = aiContent.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*最终答案\*\*|$)/)
  if (detailBlockMatch) {
    console.log('✅ 找到详细步骤块')
    const detailBlock = detailBlockMatch[1]
    console.log('详细步骤块长度:', detailBlock.length)
    console.log('详细步骤块内容:')
    console.log(detailBlock.substring(0, 200) + '...')
    
    // 2. 测试不同的提取模式
    const patterns = [
      // 当前模式
      /(\d+)[.、\)]\s*\*\*([^*]+?)\*\*\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|\*\*|$)/g,
      // 新格式模式
      /(\d+)[.、\)]\s*\*\*[^*]*?步骤编号：(\d+)\*\*[^*]*?具体操作：([^*]+?)\*\*[\s\S]*?(?=\n\d+[.、\)]|$)/g,
      // 更简单的模式
      /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
      // 捕获整个段落
      /(\d+)[.、\)]\s*\*\*([^*]+?)\*\*\s*([\s\S]*?)(?=\n\d+[.、\)]|\*\*|$)/g,
      // 捕获到下一个数字
      /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\d+[.、\)]|$)/g
    ]
    
    for (let i = 0; i < patterns.length; i++) {
      console.log(`\n🧪 测试模式 ${i + 1}:`)
      const matches = [...detailBlock.matchAll(patterns[i])]
      console.log(`匹配数量: ${matches.length}`)
      
      if (matches.length > 0) {
        matches.forEach((match, idx) => {
          console.log(`  匹配 ${idx + 1}:`, {
            group1: match[1],
            group2: match[2] ? match[2].substring(0, 50) + '...' : 'N/A',
            group3: match[3] ? match[3].substring(0, 50) + '...' : 'N/A'
          })
        })
      }
    }
    
    // 3. 尝试更简单的提取
    console.log('\n🧪 尝试简单提取:')
    const simplePattern = /(\d+)[.、\)]\s*([^\n]*(?:\n[^\n]*)*?)(?=\n\d+[.、\)]|$)/gm
    const simpleMatches = [...detailBlock.matchAll(simplePattern)]
    console.log(`简单模式匹配: ${simpleMatches.length}`)
    simpleMatches.forEach((match, idx) => {
      console.log(`  步骤 ${match[1]}: ${match[2].substring(0, 100)}...`)
    })
    
  } else {
    console.log('❌ 未找到详细步骤块')
  }
  
  return []
}

// 运行调试
debugStepExtraction(actualAIResponse);