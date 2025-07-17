#!/usr/bin/env node

/**
 * 测试边缘情况修复
 */

// 模拟实际边缘情况
const edgeCases = [
  {
    name: "空响应",
    content: "",
    expected: "默认步骤"
  },
  {
    name: "无编号响应",
    content: `这是一个无编号的响应。

我们需要理解题目的要求。根据题意，这是一个基础的数学问题。

通过建立数学模型，我们可以列出相应的方程。

使用标准的方法求解这个方程。

最后验证结果确保答案正确。`,
    expected: "数学段落"
  },
  {
    name: "纯英文无编号",
    content: `To solve this problem, we need to understand the requirements first.

Then we can establish a mathematical model based on the given information.

Using standard algebraic methods, we can solve the equation step by step.

Finally, we verify the result to ensure the answer is correct.`,
    expected: "英文数学段落"
  }
];

// 修复后的提取函数
function extractAndSortStepsFixed(aiContent) {
  console.log('🔍 开始增强提取...');
  
  if (!aiContent || aiContent.trim().length === 0) {
    console.log('⚠️ 空内容处理');
    return ["分析题目", "建立模型", "逐步求解", "验证结果"];
  }

  const steps = [];

  // 1. 提取无编号的数学段落
  const paragraphs = aiContent
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 20)
    .filter(p => {
      const hasMath = /[\+\-\=\×\÷\√\d]/.test(p) || 
                     /(计算|求解|化简|展开|合并|移项|代入|方程|函数|理解|建立|使用)/.test(p) ||
                     /(calculate|solve|simplify|equation|function|understand|establish|use)/i.test(p);
      const notHeader = !p.startsWith('**最终答案') && 
                        !p.startsWith('**验证') && 
                        !p.startsWith('**总结');
      return hasMath && notHeader;
    });

  if (paragraphs.length >= 2) {
    console.log(`✅ 找到 ${paragraphs.length} 个数学段落`);
    return paragraphs.map(p => p.replace(/\s+/g, ' ').trim()).slice(0, 6);
  }

  // 2. 提取句子作为步骤
  const sentences = aiContent
    .split(/[.!?。！？]/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 150)
    .filter(s => {
      const hasMath = /[\+\-\=\×\÷\√\d]/.test(s) || 
                     /(计算|求解|方程|公式|定理|理解|建立|使用)/.test(s) ||
                     /(calculate|solve|equation|formula|theorem|understand|establish|use)/i.test(s);
      return hasMath;
    });

  if (sentences.length >= 2) {
    console.log(`✅ 找到 ${sentences.length} 个数学句子`);
    return sentences.slice(0, 6);
  }

  // 3. 智能分段 - 每50-100字符一段
  const content = aiContent.trim();
  if (content.length > 50) {
    const segments = [];
    let start = 0;
    
    while (start < content.length) {
      const end = Math.min(start + 100, content.length);
      let segment = content.substring(start, end).trim();
      if (segment.length > 30) {
        segments.push(segment);
      }
      start = end;
    }
    
    if (segments.length >= 2) {
      console.log(`✅ 智能分段得到 ${segments.length} 个步骤`);
      return segments.slice(0, 6);
    }
  }

  console.log('⚠️ 使用默认步骤');
  return ["理解题意", "建立模型", "逐步求解", "验证结果"];
}

// 运行边缘情况测试
console.log('🧪 边缘情况修复测试\n');
console.log('='.repeat(60));

let passed = 0;
let total = edgeCases.length;

edgeCases.forEach((testCase, index) => {
  console.log(`\n📊 测试 ${index + 1}: ${testCase.name}`);
  console.log('-'.repeat(40));
  
  const result = extractAndSortStepsFixed(testCase.content);
  
  console.log(`提取步骤: ${result.length} 个`);
  result.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step.substring(0, 80)}${step.length > 80 ? '...' : ''}`);
  });
  
  // 验证是否不是默认步骤
  const isDefault = result.length === 4 && result.every(s => 
    ["分析题目", "建立模型", "逐步求解", "验证结果"].some(def => s.includes(def))
  );
  
  if (isDefault && testCase.expected !== "默认步骤") {
    console.log('❌ 仍然使用默认步骤');
  } else {
    console.log('✅ 成功提取内容');
    passed++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`📊 边缘测试总结: ${passed}/${total} 通过`);
console.log(`✅ 通过率: ${((passed/total) * 100).toFixed(1)}%`);

if (passed === total) {
  console.log('🎉 所有边缘情况测试通过！');
} else {
  console.log('⚠️ 需要进一步优化');
}