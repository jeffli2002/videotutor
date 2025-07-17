// 简化的视频生成修复测试
// 直接测试步骤提取和去重功能，不依赖环境变量

/**
 * 智能提取和排序步骤，解决重复和顺序问题
 * @param {string} aiContent - AI返回的完整内容
 * @returns {string[]} - 去重且排序后的步骤数组
 */
function extractAndSortSteps(aiContent) {
  console.log('🔍 开始智能步骤提取...')
  
  const stepMap = new Map() // 使用Map确保步骤编号唯一性
  
  // 1. 优先提取"详细解题步骤"块中的编号步骤
  const detailBlockMatch = aiContent.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*最终答案\*\*|\*\*验证过程\*\*|\*\*相关数学概念\*\*|\*\*常见错误提醒\*\*|$)/)
  
  if (detailBlockMatch) {
    const detailBlock = detailBlockMatch[1]
    console.log('📋 找到详细解题步骤块，长度:', detailBlock.length)
    
    // 使用改进的正则表达式，更准确地匹配编号步骤
    const stepPatterns = [
      // 匹配：1. **标题** 内容（多行）
      /(\d+)[.、\)]\s*\*\*([^*]+?)\*\*\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
      // 匹配：1. 标题 内容（多行）
      /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
      // 匹配：1. 标题（单行）
      /(\d+)\s*[.、\)]\s*([^\n]+)/g
    ]
    
    for (const pattern of stepPatterns) {
      const matches = [...detailBlock.matchAll(pattern)]
      if (matches.length > 0) {
        console.log(`✅ 使用模式匹配到 ${matches.length} 个步骤`)
        matches.forEach(match => {
          const stepNum = parseInt(match[1])
          let stepContent = ''
          
          if (match.length >= 4) {
            // 带**的格式
            const title = match[2].trim()
            const content = (match[3] || '').trim()
            stepContent = `**${title}** ${content}`.trim()
          } else if (match.length >= 3) {
            // 普通格式
            stepContent = match[2].trim()
          }
          
          // 清理内容
          stepContent = stepContent.replace(/\n\s*\n/g, '\n').trim()
          
          // 只保留有效的步骤内容
          if (stepContent && stepContent.length > 10) {
            // 如果这个编号还没有内容，或者新内容更详细，则更新
            if (!stepMap.has(stepNum) || stepContent.length > stepMap.get(stepNum).length) {
              stepMap.set(stepNum, stepContent)
              console.log(`📝 步骤 ${stepNum}: ${stepContent.substring(0, 50)}...`)
            }
          }
        })
        
        if (stepMap.size > 0) break // 找到有效步骤后停止尝试其他模式
      }
    }
  }
  
  // 2. 如果没有找到详细步骤块，尝试从整个内容中提取
  if (stepMap.size === 0) {
    console.log('🔄 未找到详细步骤块，尝试从整个内容提取...')
    
    // 从整个内容中提取编号步骤
    const globalStepPattern = /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g
    const globalMatches = [...aiContent.matchAll(globalStepPattern)]
    
    globalMatches.forEach(match => {
      const stepNum = parseInt(match[1])
      const stepContent = match[2].trim()
      
      if (stepContent && stepContent.length > 10) {
        if (!stepMap.has(stepNum) || stepContent.length > stepMap.get(stepNum).length) {
          stepMap.set(stepNum, stepContent)
          console.log(`📝 全局步骤 ${stepNum}: ${stepContent.substring(0, 50)}...`)
        }
      }
    })
  }
  
  // 3. 按编号排序并重建步骤数组
  if (stepMap.size > 0) {
    const sortedSteps = Array.from(stepMap.keys())
      .sort((a, b) => a - b) // 确保按数字顺序排序
      .map(num => stepMap.get(num))
    
    console.log(`✅ 成功提取 ${sortedSteps.length} 个排序步骤`)
    return sortedSteps
  }
  
  // 4. 如果仍然没有找到步骤，使用默认步骤
  console.log('⚠️ 未找到有效步骤，使用默认步骤')
  return [
    "分析题目条件",
    "列出方程或不等式", 
    "移项求解",
    "计算得出结果",
    "验证答案"
  ]
}

/**
 * 增强的去重机制，基于内容相似性判断
 * @param {string[]} steps - 原始步骤数组
 * @returns {string[]} - 去重后的步骤数组
 */
function removeDuplicateSteps(steps) {
  console.log('🧹 开始去重处理...')
  
  const uniqueSteps = []
  const seenContent = new Set()
  const duplicateCount = { count: 0, details: [] }

  for (const step of steps) {
    const cleanStep = step.trim()
    if (cleanStep && cleanStep.length > 10) {
      // 使用前80个字符作为去重依据，提高准确性
      const key = cleanStep.substring(0, 80).toLowerCase().replace(/\s+/g, ' ')
      
      if (!seenContent.has(key)) {
        uniqueSteps.push(cleanStep)
        seenContent.add(key)
        console.log(`✅ 保留步骤: ${cleanStep.substring(0, 50)}...`)
      } else {
        duplicateCount.count++
        duplicateCount.details.push(cleanStep.substring(0, 50))
        console.log(`⚠️ 跳过重复步骤: ${cleanStep.substring(0, 50)}...`)
      }
    }
  }
  
  console.log(`📊 去重结果: 原始 ${steps.length} 个步骤，去重后 ${uniqueSteps.length} 个步骤，跳过 ${duplicateCount.count} 个重复`)
  
  return uniqueSteps
}

// 测试用例1：包含重复步骤的AI响应
const testAIResponseWithDuplicates = `**详细解题步骤**
1. **理解题目** 首先，我们需要理解题目要求：解不等式 3x - 7 > 14
   这是一个一元一次不等式，需要找到x的范围

2. **列出不等式** 根据题目，我们有不等式：3x - 7 > 14
   这是标准的一元一次不等式形式

3. **移项求解** 将常数项7移到等号右边：
   3x - 7 > 14
   3x > 14 + 7
   3x > 21
   解释：通过移项，我们将未知数项和常数项分离

4. **计算得出结果** 通过除以系数3来求解x：
   3x > 21
   x > 21 ÷ 3
   x > 7
   解释：为了求解x，我们需要消除x的系数3

5. **验证答案** 将x = 8代入原不等式验证：
   3(8) - 7 = 24 - 7 = 17 > 14 ✓
   验证正确

**最终答案**
x > 7

**相关数学概念**
一元一次不等式、移项、系数

**常见错误提醒**
注意不等号方向，不要忘记变号
`

// 测试用例2：顺序混乱的步骤
const testAIResponseWithWrongOrder = `**详细解题步骤**
3. **移项求解** 将常数项7移到等号右边：
   3x - 7 > 14
   3x > 14 + 7
   3x > 21

1. **理解题目** 首先，我们需要理解题目要求：解不等式 3x - 7 > 14

5. **验证答案** 将x = 8代入原不等式验证：
   3(8) - 7 = 24 - 7 = 17 > 14 ✓

2. **列出不等式** 根据题目，我们有不等式：3x - 7 > 14

4. **计算得出结果** 通过除以系数3来求解x：
   3x > 21
   x > 21 ÷ 3
   x > 7

**最终答案**
x > 7
`

// 测试用例3：包含重复内容的步骤
const testAIResponseWithRepeatedContent = `**详细解题步骤**
1. **理解题目** 首先，我们需要理解题目要求：解不等式 3x - 7 > 14
   这是一个一元一次不等式，需要找到x的范围

2. **列出不等式** 根据题目，我们有不等式：3x - 7 > 14
   这是标准的一元一次不等式形式

3. **移项求解** 将常数项7移到等号右边：
   3x - 7 > 14
   3x > 14 + 7
   3x > 21

4. **移项求解** 将常数项7移到等号右边：
   3x - 7 > 14
   3x > 14 + 7
   3x > 21

5. **计算得出结果** 通过除以系数3来求解x：
   3x > 21
   x > 21 ÷ 3
   x > 7

6. **计算得出结果** 通过除以系数3来求解x：
   3x > 21
   x > 21 ÷ 3
   x > 7

**最终答案**
x > 7
`

async function testVideoGenerationFix() {
  console.log('🧪 开始测试视频生成修复效果...\n')
  
  const testCases = [
    { name: '重复步骤测试', content: testAIResponseWithDuplicates },
    { name: '顺序混乱测试', content: testAIResponseWithWrongOrder },
    { name: '重复内容测试', content: testAIResponseWithRepeatedContent }
  ]
  
  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}`)
    console.log('='.repeat(50))
    
    try {
      // 测试步骤提取
      console.log('🔍 测试步骤提取...')
      const extractedSteps = extractAndSortSteps(testCase.content)
      console.log('✅ 步骤提取成功')
      console.log(`📊 提取到 ${extractedSteps.length} 个步骤`)
      
      // 测试去重
      console.log('🧹 测试去重处理...')
      const uniqueSteps = removeDuplicateSteps(extractedSteps)
      console.log('✅ 去重处理成功')
      console.log(`📊 去重后 ${uniqueSteps.length} 个步骤`)
      
      // 显示最终步骤
      console.log('📝 最终步骤:')
      uniqueSteps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step.substring(0, 60)}${step.length > 60 ? '...' : ''}`)
      })
      
      console.log('\n')
    } catch (error) {
      console.error(`❌ ${testCase.name} 失败:`, error.message)
      console.log('\n')
    }
  }
  
  console.log('🎉 所有测试完成！')
}

// 运行测试
testVideoGenerationFix().catch(console.error) 