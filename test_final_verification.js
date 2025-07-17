#!/usr/bin/env node

/**
 * 最终验证测试脚本
 * 验证视频生成修复效果
 */

// 直接复制修复后的函数进行测试
function extractAndSortSteps(aiContent) {
  console.log('🔍 开始智能步骤提取...')
  
  const steps = [] // 使用数组确保顺序
  
  // 1. 只从"详细解题步骤"块提取，避免全局污染
  const detailBlockMatch = aiContent.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*最终答案\*\*|$)/)
  
  if (detailBlockMatch) {
    const detailBlock = detailBlockMatch[1]
    console.log('📋 找到详细解题步骤块，长度:', detailBlock.length)
    
    // 使用精确的单一步骤提取模式
    const stepPattern = /(\d+)[.、\)]\s*(?:\*\*([^*]+?)\*\*)?\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g
    
    const matches = [...detailBlock.matchAll(stepPattern)]
    if (matches.length > 0) {
      console.log(`✅ 匹配到 ${matches.length} 个步骤`)
      
      // 直接按编号放置到正确位置
      matches.forEach(match => {
        const stepNum = parseInt(match[1]) - 1 // 转换为0-based索引
        const title = (match[2] || '').trim()
        const content = (match[3] || '').trim()
        
        let stepContent = title ? `**${title}** ${content}` : content
        stepContent = stepContent.replace(/\n\s*\n/g, '\n').trim()
        
        if (stepContent.length > 10) {
          steps[stepNum] = stepContent
        }
      })
    }
  }
  
  // 移除空位并返回有序步骤
  const validSteps = steps.filter(step => step && step.length > 0)
  
  if (validSteps.length > 0) {
    console.log(`✅ 成功提取 ${validSteps.length} 个排序步骤`)
    return validSteps
  }
  
  // 如果未找到详细步骤块，使用简化提取
  console.log('🔄 未找到详细步骤块，使用简化提取...')
  const simplePattern = /(?:步骤|step)\s*(\d+)[.:：\s]+([^\n]+)/gi
  const simpleMatches = [...aiContent.matchAll(simplePattern)]
  
  if (simpleMatches.length > 0) {
    const simpleSteps = simpleMatches.map(match => match[2].trim()).filter(s => s.length > 5)
    if (simpleSteps.length > 0) {
      console.log(`✅ 简化提取到 ${simpleSteps.length} 个步骤`)
      return simpleSteps
    }
  }
  
  // 最后使用默认步骤
  console.log('⚠️ 使用默认步骤')
  return [
    "分析题目条件",
    "列出方程或不等式", 
    "移项求解",
    "计算得出结果",
    "验证答案"
  ]
}

function removeDuplicateSteps(steps) {
  console.log('🧹 开始去重处理...')
  
  const uniqueSteps = []
  const seenContent = new Set()
  const duplicateCount = { count: 0, details: [] }

  for (const step of steps) {
    const cleanStep = step.trim()
    if (cleanStep && cleanStep.length > 5) {
      // 使用更智能的去重算法：基于内容哈希而非前缀
      const normalizedContent = normalizeForDeduplication(cleanStep)
      const key = hashContent(normalizedContent)
      
      if (!seenContent.has(key)) {
        uniqueSteps.push(cleanStep)
        seenContent.add(key)
        console.log(`✅ 保留步骤: ${cleanStep.substring(0, 80)}...`)
      } else {
        duplicateCount.count++
        duplicateCount.details.push(cleanStep.substring(0, 80))
        console.log(`⚠️ 跳过重复步骤: ${cleanStep.substring(0, 80)}...`)
      }
    }
  }
  
  console.log(`📊 去重结果: 原始 ${steps.length} 个步骤，去重后 ${uniqueSteps.length} 个步骤，跳过 ${duplicateCount.count} 个重复`)
  
  return uniqueSteps
}

function normalizeForDeduplication(content) {
  return content
    .toLowerCase()
    .replace(/\s+/g, ' ') // 统一空格
    .replace(/[,.，。！？；：\-]/g, '') // 移除标点
    .replace(/\*\*/g, '') // 移除markdown标记
    .trim()
}

function hashContent(content) {
  // 使用内容的前200字符作为哈希，避免过于敏感
  return content.substring(0, 200)
}

// 测试用例
const testCases = [
  {
    name: "正常有序步骤",
    content: `**详细解题步骤**
1. **理解题意** 首先分析题目给出的条件
2. **列出方程** 根据题意建立数学模型
3. **求解方程** 使用代数方法求解
4. **验证结果** 检查答案是否正确

**最终答案**
答案为x=5`,
    expectedSteps: 4,
    expectedOrder: ["理解题意", "列出方程", "求解方程", "验证结果"]
  },
  {
    name: "乱序重复步骤",
    content: `**详细解题步骤**
3. **计算结果** 最后得出答案
1. **理解题意** 分析题目条件
2. **建立模型** 建立数学方程
1. **理解题意** 再次分析题目条件
4. **验证答案** 检查结果
2. **建立模型** 重复建立模型

**最终答案**
答案为x=3`,
    expectedSteps: 4,
    expectedOrder: ["理解题意", "建立模型", "计算结果", "验证答案"]
  },
  {
    name: "大量重复步骤",
    content: `**详细解题步骤**
1. **分析** 分析题目
2. **分析** 分析题目
3. **建立方程** 建立方程
4. **建立方程** 建立方程
5. **求解** 求解方程
6. **求解** 求解方程
7. **验证** 验证结果
8. **验证** 验证结果

**最终答案**
答案为x=1`,
    expectedSteps: 4,
    expectedOrder: ["分析", "建立方程", "求解", "验证"]
  },
  {
    name: "中文步骤重复",
    content: `**详细解题步骤**
1. **理解题意** 这是一个二次方程问题
2. **列出方程** 根据题意列出：x²-5x+6=0
3. **因式分解** 将方程分解为：(x-2)(x-3)=0
4. **求解** 得到x=2或x=3
5. **验证** 代入原方程验证
1. **理解题意** 再次理解这是一个二次方程问题
3. **因式分解** 重复因式分解步骤

**最终答案**
答案为x=2或x=3`,
    expectedSteps: 5,
    expectedOrder: ["理解题意", "列出方程", "因式分解", "求解", "验证"]
  }
];

// 运行测试
async function runTests() {
  console.log('🚀 开始最终视频生成修复验证...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`📋 测试用例: ${testCase.name}`);
    console.log(`期望步骤数: ${testCase.expectedSteps}`);
    
    try {
      // 测试步骤提取
      const extractedSteps = extractAndSortSteps(testCase.content);
      console.log(`✅ 实际提取步骤数: ${extractedSteps.length}`);
      console.log(`提取的步骤:`, extractedSteps.map((s, i) => `${i+1}. ${s.substring(0, 50)}...`));
      
      // 测试去重
      const deduplicatedSteps = removeDuplicateSteps(extractedSteps);
      console.log(`✅ 去重后步骤数: ${deduplicatedSteps.length}`);
      
      // 验证步骤顺序
      const orderCorrect = verifyStepOrder(deduplicatedSteps, testCase.expectedOrder);
      console.log(`✅ 步骤顺序验证: ${orderCorrect ? '通过' : '失败'}`);
      
      // 验证去重效果
      const uniqueCount = new Set(deduplicatedSteps.map(s => 
        normalizeForDeduplication(s).substring(0, 50)
      )).size;
      const deduplicationCorrect = uniqueCount === deduplicatedSteps.length;
      console.log(`✅ 去重验证: ${deduplicationCorrect ? '通过' : '失败'}`);
      
      // 综合验证
      const stepCountCorrect = deduplicatedSteps.length === testCase.expectedSteps;
      const allCorrect = orderCorrect && deduplicationCorrect && stepCountCorrect;
      
      if (allCorrect) {
        console.log(`🎉 测试通过: ${testCase.name}\n`);
        passedTests++;
      } else {
        console.log(`❌ 测试失败: ${testCase.name}`);
        console.log(`原因: 步骤数${stepCountCorrect ? '正确' : '错误'}, 顺序${orderCorrect ? '正确' : '错误'}, 去重${deduplicationCorrect ? '正确' : '错误'}\n`);
      }
      
    } catch (error) {
      console.log(`❌ 测试执行失败: ${error.message}\n`);
    }
  }
  
  // 测试报告
  console.log('📊 测试报告');
  console.log('==================');
  console.log(`总测试用例: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`通过率: ${(passedTests / totalTests * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎊 所有测试通过！视频生成修复成功。');
  } else {
    console.log('\n⚠️  部分测试失败，需要进一步调试。');
  }
}

/**
 * 验证步骤顺序
 * @param {string[]} actualSteps - 实际步骤
 * @param {string[]} expectedOrder - 期望的顺序关键词
 * @returns {boolean} - 是否顺序正确
 */
function verifyStepOrder(actualSteps, expectedOrder) {
  if (actualSteps.length !== expectedOrder.length) {
    return false;
  }
  
  for (let i = 0; i < actualSteps.length; i++) {
    const actual = actualSteps[i].toLowerCase();
    const expected = expectedOrder[i].toLowerCase();
    
    if (!actual.includes(expected) && !expected.includes(actual)) {
      return false;
    }
  }
  
  return true;
}

// 运行测试
runTests().catch(console.error);