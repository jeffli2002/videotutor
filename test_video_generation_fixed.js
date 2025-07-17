#!/usr/bin/env node

/**
 * 视频生成修复测试脚本
 * 测试修复后的步骤提取和去重功能
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 动态导入修复后的mathVideoAI.js中的函数
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 测试用例 - 模拟各种有问题的AI响应
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
    name: "无编号步骤",
    content: `解题过程：
首先我们需要理解这个数学问题的本质。
然后建立相应的数学模型。
接着使用代数方法进行求解。
最后验证我们的答案是否正确。

最终答案：x=2`,
    expectedSteps: 5, // 默认步骤
    expectedOrder: ["分析题目条件", "列出方程或不等式", "移项求解", "计算得出结果", "验证答案"]
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
  console.log('🚀 开始视频生成修复测试...\n');
  
  try {
    // 动态导入修复后的函数
    const mathVideoAIPath = join(__dirname, 'src', 'services', 'mathVideoAI.js');
    const mathVideoAI = await import('file://' + mathVideoAIPath);
    
    const { extractAndSortSteps, removeDuplicateSteps } = mathVideoAI;
    
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
    
  } catch (error) {
    console.error('❌ 测试框架错误:', error);
  }
}

/**
 * 验证步骤顺序
 * @param {string[]} actualSteps - 实际步骤
 * @param {string[]} expectedOrder - 期望的顺序关键词
 * @returns {boolean} - 是否顺序正确
 */
function verifyStepOrder(actualSteps, expectedOrder) {
  if (actualSteps.length !== expectedOrder.length) return false;
  
  for (let i = 0; i < actualSteps.length; i++) {
    const actual = actualSteps[i].toLowerCase();
    const expected = expectedOrder[i].toLowerCase();
    
    if (!actual.includes(expected) && !expected.includes(actual)) {
      return false;
    }
  }
  
  return true;
}

/**
 * 标准化内容用于验证
 * @param {string} content - 原始内容
 * @returns {string} - 标准化后的内容
 */
function normalizeForDeduplication(content) {
  return content
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[,.，。！？；：\-]/g, '')
    .replace(/\*\*/g, '')
    .trim();
}

// 运行测试
runTests().catch(console.error);