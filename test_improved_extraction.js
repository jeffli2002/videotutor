#!/usr/bin/env node

/**
 * 测试改进后的步骤提取和过滤
 */

const testAIResponse = `**数学问题解答**

**题目：** 解方程 2x + 5 = 15

**问题分析：**
这是一个一元一次方程，需要通过移项和化简来求解未知数x的值。

**详细解题步骤：**

1. **移项** - 将常数项移到等号右边
   2x + 5 = 15
   2x = 15 - 5
   2x = 10

2. **系数化1** - 两边同时除以x的系数
   x = 10 ÷ 2
   x = 5

**最终答案：** x = 5

**验证过程：**
将 x = 5 代入原方程：
2×5 + 5 = 10 + 5 = 15 ✓
验证正确！

**相关数学概念：**
- 一元一次方程
- 移项法则
- 等式性质

**常见错误提醒：**
- 移项时要变号
- 系数化1时要注意除法运算`;

function extractAndSortStepsImproved(aiContent) {
  console.log('🔍 开始改进后的步骤提取...')
  
  const steps = []
  
  // 清理内容，移除标题和无效信息
  let cleanContent = aiContent
    .replace(/^#+\s*.*/gm, '') // 移除标题
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 移除加粗标记
    .replace(/\n\s*\n/g, '\n') // 合并多余空行
    .trim()
  
  console.log('清理后的内容:', cleanContent.substring(0, 200) + '...')
  
  // 提取编号步骤
  const stepPattern = /(?:^|\n)(\d+)[.、\)]\s*([\s\S]*?)(?=\n\d+[.、\)]|$|\*\*)/gm
  const matches = [...cleanContent.matchAll(stepPattern)]
  
  if (matches.length > 0) {
    console.log(`✅ 找到 ${matches.length} 个编号步骤`)
    
    matches.forEach(match => {
      const stepNum = parseInt(match[1])
      let content = match[2].trim()
      
      // 检查是否为有效步骤
      const hasMath = /[\+\-\=\×\÷\√\d]/.test(content)
      const hasOperation = /(移项|化简|计算|求解|除以|乘以|加减|代入)/.test(content)
      const isTooShort = content.length < 15
      const isTitle = /^(题目|问题|答案|验证|概念|提醒)/.test(content)
      
      if (hasMath && hasOperation && !isTooShort && !isTitle) {
        // 清理内容
        content = content
          .replace(/^题目[:：].*\n?/gm, '')
          .replace(/\*\*最终答案.*\*\*/gm, '')
          .replace(/\*\*验证过程.*\*\*/gm, '')
          .replace(/\*\*相关数学概念.*\*\*/gm, '')
          .replace(/\*\*常见错误提醒.*\*\*/gm, '')
          .replace(/\n\s*\n/g, '\n')
          .trim()
        
        if (content.length > 10) {
          steps[stepNum - 1] = content
          console.log(`✅ 有效步骤 ${stepNum}: ${content.substring(0, 60)}...`)
        }
      } else {
        console.log(`⚠️ 跳过无效步骤: ${content.substring(0, 50)}... (${isTooShort ? '太短' : isTitle ? '标题' : '无数学内容'})`)
      }
    })
    
    const validSteps = steps.filter(step => step && step.length > 0)
    if (validSteps.length > 0) {
      console.log(`✅ 最终提取 ${validSteps.length} 个有效步骤`)
      return validSteps
    }
  }
  
  // 后备方案：直接提取数学操作
  const fallbackPattern = /([\+\-\=\×\÷\√\d].*?)(?=\n|$)/gm
  const fallbackMatches = [...cleanContent.matchAll(fallbackPattern)]
  
  const mathSteps = []
  fallbackMatches.forEach(match => {
    const content = match[1].trim()
    if (content.length > 15 && /[\+\-\=\×\÷\√\d]/.test(content)) {
      mathSteps.push(content)
    }
  })
  
  if (mathSteps.length >= 2) {
    console.log(`✅ 使用数学步骤后备方案: ${mathSteps.length} 个`)
    return mathSteps.slice(0, 4)
  }
  
  // 高质量默认步骤
  console.log('⚠️ 使用高质量默认步骤')
  return [
    "分析方程结构，确定解题思路",
    "移项：将常数项移到等号右边",
    "化简：合并同类项",
    "系数化1：两边同时除以未知数系数",
    "验证：将解代入原方程检验"
  ]
}

function removeDuplicateStepsImproved(steps) {
  console.log('🧹 开始智能去重...')
  
  const uniqueSteps = []
  const seenContent = new Set()
  
  for (const step of steps) {
    const cleanStep = step.trim()
    if (cleanStep && cleanStep.length > 10) {
      // 更智能的去重，基于数学内容
      const normalized = cleanStep
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\+\-\=\×\÷\√\d]/g, '') // 只保留数学相关字符
        .substring(0, 100) // 取前100字符作为指纹
      
      if (!seenContent.has(normalized)) {
        uniqueSteps.push(cleanStep)
        seenContent.add(normalized)
        console.log(`✅ 保留: ${cleanStep.substring(0, 50)}...`)
      } else {
        console.log(`⚠️ 跳过重复: ${cleanStep.substring(0, 50)}...`)
      }
    }
  }
  
  console.log(`📊 去重结果: ${steps.length} → ${uniqueSteps.length} 个步骤`)
  return uniqueSteps
}

console.log('🧪 开始改进步骤提取测试...')
console.log('='.repeat(60))

const extracted = extractAndSortStepsImproved(testAIResponse)
console.log('\n📊 提取结果:')
console.log(`有效步骤数量: ${extracted.length}`)

extracted.forEach((step, index) => {
  console.log(`\n${index + 1}. ${step}`)
})

// 测试去重
console.log('\n' + '='.repeat(40))
console.log('🧪 测试去重功能...')

const testSteps = [
  "移项：2x = 15 - 5",
  "移项：2x = 15 - 5", // 重复
  "计算：2x = 10",
  "计算：2x = 10", // 重复
  "求解：x = 5",
  "验证：代入检验"
]

const uniqueSteps = removeDuplicateStepsImproved(testSteps)
console.log('\n📊 去重结果:')
uniqueSteps.forEach((step, index) => {
  console.log(`${index + 1}. ${step}`)
})

console.log('\n' + '='.repeat(60))
console.log('✅ 改进测试完成！')