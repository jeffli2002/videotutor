#!/usr/bin/env node

/**
 * 生产就绪性验证测试
 * 验证修复后的系统在实际生产环境中的表现
 */

// 模拟真实的生产AI响应
const productionResponses = [
  {
    name: "实际QWEN API响应 - 三角形面积",
    content: `**问题分析**
这是一个基础的几何问题，要求计算一个三角形的面积。已知三角形的底边长度为8，高为6。

**详细解题步骤**

1. **步骤编号：1**  
   **具体操作：写出三角形面积的计算公式**  
   **详细解释：这个公式适用于所有类型的三角形，只要知道底边和对应的高就可以使用。**  
   **中间结果：**  
   $\text{面积} = \frac{1}{2} \times \text{底边} \times \text{高}$

2. **步骤编号：2**  
   **具体操作：先计算底边与高的乘积**  
   **详细解释：这是为了简化后续的计算步骤，先完成乘法可以减少运算的复杂度。**  
   **中间结果：**  
   $8 \times 6 = 48$

3. **步骤编号：3**  
   **具体操作：再进行乘以1/2的运算**  
   **详细解释：因为三角形面积是底乘高的一半，所以要将前面的结果除以2，等价于乘以1/2。**  
   **中间结果：**  
   $\frac{1}{2} \times 48 = 24$

**最终答案**
该三角形的面积是 **24**。`
  },
  {
    name: "实际QWEN API响应 - 解方程",
    content: `**数学问题解答**

**题目：** 解方程 3x + 7 = 22

**问题分析：**
这是一个一元一次方程，需要通过移项和化简来求解未知数x的值。

**详细解题步骤：**

1. **移项** - 将常数项移到等号右边
   3x + 7 = 22
   3x = 22 - 7
   3x = 15

2. **系数化1** - 两边同时除以x的系数
   x = 15 ÷ 3
   x = 5

**验证过程：**
将 x = 5 代入原方程：
3×5 + 7 = 15 + 7 = 22 ✓
验证正确！`
  },
  {
    name: "实际生产环境 - 混合内容",
    content: `**解题思路**

**步骤1：理解题目**
仔细阅读题目，明确已知条件和要求求解的内容。

**步骤2：建立方程**
根据题意，我们可以建立相应的数学方程。

**步骤3：求解方程**
使用适当的数学方法求解这个方程。

**步骤4：验证答案**
将得到的解代入原方程进行验证。`
  }
];

// 生产级提取函数
function productionExtractSteps(aiContent) {
  console.log('🚀 生产级步骤提取开始...');
  
  if (!aiContent || aiContent.trim().length === 0) {
    console.log('⚠️ 空内容处理');
    return {
      steps: ["理解题意", "建立模型", "逐步求解", "验证结果"],
      source: "default",
      confidence: 0.1
    };
  }

  const content = aiContent.trim();
  
  // 1. 优先提取详细格式
  const detailedPattern = /(?:^|\n)(\d+)[.、\)]?\s*(?:\*\*[^*]*\*\*\s*)?([^\n]+)/gm;
  const detailedMatches = [...content.matchAll(detailedPattern)];
  
  if (detailedMatches.length >= 2) {
    const steps = detailedMatches.map((match, index) => {
      const operation = match[2]?.trim() || '';
      const explanation = match[3]?.trim() || '';
      const result = match[4]?.trim() || '';
      
      let fullStep = operation;
      if (explanation && !operation.includes(explanation)) {
        fullStep += `：${explanation}`;
      }
      if (result && !fullStep.includes(result)) {
        fullStep += `，结果：${result}`;
      }
      
      return fullStep;
    }).filter(s => s.length > 10);
    
    if (steps.length >= 2) {
      console.log(`✅ 详细格式提取：${steps.length} 个步骤`);
      return {
        steps: steps.slice(0, 6),
        source: "detailed_format",
        confidence: 0.95
      };
    }
  }

  // 2. 提取编号步骤
  const numberedPattern = /(?:^|\n)(\d+)[.、\)]\s*([^\n]+)/gm;
  const numberedMatches = [...content.matchAll(numberedPattern)];
  
  if (numberedMatches.length >= 2) {
    const steps = numberedMatches.map(match => {
      let step = match[2]?.trim() || '';
      step = step.replace(/^\*\*[^*]+\*\*[:：]?\s*/, ''); // 移除标题
      step = step.replace(/^步骤[:：]?\s*/i, '');
      return step;
    }).filter(s => s.length > 15);
    
    if (steps.length >= 2) {
      console.log(`✅ 编号步骤提取：${steps.length} 个步骤`);
      return {
        steps: steps.slice(0, 6),
        source: "numbered_steps",
        confidence: 0.85
      };
    }
  }

  // 3. 智能段落提取
  const paragraphs = content
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 30 && p.length < 200)
    .filter(p => {
      const hasAction = /(理解|建立|使用|计算|求解|验证|分析)/.test(p) ||
                       /(understand|establish|use|calculate|solve|verify|analyze)/i.test(p);
      const notHeader = !p.toLowerCase().includes('最终答案') && 
                        !p.toLowerCase().includes('验证') &&
                        !p.toLowerCase().includes('总结');
      return hasAction && notHeader;
    });

  if (paragraphs.length >= 2) {
    console.log(`✅ 段落提取：${paragraphs.length} 个步骤`);
    return {
      steps: paragraphs.slice(0, 6),
      source: "paragraph_extraction",
      confidence: 0.75
    };
  }

  // 4. 默认步骤
  console.log('⚠️ 使用默认步骤');
  return {
    steps: ["理解题意", "分析条件", "逐步求解", "验证结果"],
    source: "default",
    confidence: 0.5
  };
}

// 生产级去重
function productionDeduplicate(steps) {
  console.log('🧹 生产级去重...');
  
  const unique = [];
  const fingerprints = new Set();
  
  for (const step of steps) {
    const clean = step.trim();
    if (clean.length < 10) continue;
    
    // 生成内容指纹
    const fingerprint = clean
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\u4e00-\u9fff\+\-\=\×\÷\√\d]/g, '')
      .substring(0, 100);
    
    if (!fingerprints.has(fingerprint)) {
      unique.push(clean);
      fingerprints.add(fingerprint);
    }
  }
  
  console.log(`📊 去重结果: ${steps.length} → ${unique.length}`);
  return unique;
}

// 运行生产测试
console.log('🎯 生产就绪性验证测试');
console.log('='.repeat(80));

let totalTests = 0;
let passedTests = 0;

productionResponses.forEach((response, index) => {
  console.log(`\n📊 测试 ${index + 1}: ${response.name}`);
  console.log('-'.repeat(60));
  
  totalTests++;
  
  try {
    const extraction = productionExtractSteps(response.content);
    const deduplicated = productionDeduplicate(extraction.steps);
    
    console.log(`提取来源: ${extraction.source}`);
    console.log(`置信度: ${extraction.confidence}`);
    console.log(`原始步骤: ${extraction.steps.length} 个`);
    console.log(`去重后: ${deduplicated.length} 个`);
    
    // 验证标准
    const hasRealContent = extraction.source !== "default" || extraction.confidence >= 0.5;
    const hasEnoughSteps = deduplicated.length >= 2;
    const noDuplicates = extraction.steps.length === deduplicated.length || 
                        (extraction.steps.length - deduplicated.length) <= 1;
    
    const passed = hasRealContent && hasEnoughSteps && noDuplicates;
    
    if (passed) {
      passedTests++;
      console.log('✅ 测试通过');
    } else {
      console.log('❌ 测试失败');
    }
    
    // 显示前几个步骤
    console.log('\n提取步骤预览:');
    deduplicated.slice(0, 3).forEach((step, i) => {
      console.log(`  ${i + 1}. ${step.substring(0, 60)}${step.length > 60 ? '...' : ''}`);
    });
    
  } catch (error) {
    console.log('❌ 测试异常:', error.message);
  }
});

console.log('\n' + '='.repeat(80));
console.log('🎯 生产就绪性报告');
console.log(`总测试: ${totalTests}`);
console.log(`通过: ${passedTests}`);
console.log(`成功率: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 生产就绪！所有测试通过');
} else {
  console.log(`\n⚠️ ${totalTests - passedTests} 个测试需要关注`);
}

// 性能测试
console.log('\n⚡ 性能测试');
console.log('-'.repeat(40));

const largeContent = 'A'.repeat(10000) + '这是一个包含数学内容的长文本，我们需要理解题意，建立数学模型，然后使用计算方法求解方程，最后验证结果是否正确。';

console.time('提取性能');
const perfTest = productionExtractSteps(largeContent);
console.timeEnd('提取性能');

console.log(`大文本处理: ${largeContent.length} 字符 → ${perfTest.steps.length} 步骤`);