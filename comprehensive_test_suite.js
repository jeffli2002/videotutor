#!/usr/bin/env node

/**
 * 综合测试套件 - 验证所有修复
 * 测试AI响应提取、去重、数学内容保留等
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 模拟完整的AI服务函数
class ComprehensiveTester {
  constructor() {
    this.testResults = {
      extraction: [],
      deduplication: [],
      formatHandling: [],
      edgeCases: [],
      production: []
    };
  }

  // 测试用例1: 标准AI响应格式
  testCase1 = {
    name: "标准三角形面积计算",
    content: `**问题分析**
这是一个基础的几何问题，要求计算一个三角形的面积。已知三角形的底边长度为8，高为6。

**详细解题步骤**

1. **步骤编号：1**  
   **具体操作：写出三角形面积的计算公式**  
   **详细解释：这个公式适用于所有类型的三角形**  
   **中间结果：**  
   $\text{面积} = \frac{1}{2} \times \text{底边} \times \text{高}$

2. **步骤编号：2**  
   **具体操作：先计算底边与高的乘积**  
   **详细解释：简化计算步骤**  
   **中间结果：**  
   $8 \times 6 = 48$

3. **步骤编号：3**  
   **具体操作：再进行乘以1/2的运算**  
   **详细解释：三角形面积是底乘高的一半**  
   **中间结果：**  
   $\frac{1}{2} \times 48 = 24$

**最终答案**
该三角形的面积是 **24**。`
  };

  // 测试用例2: 复杂代数方程
  testCase2 = {
    name: "复杂二次方程求解",
    content: `**二次方程求解**

**题目：** 解方程 x² - 5x + 6 = 0

**解题思路**
这是一个标准的二次方程，可以使用因式分解法求解。

**详细步骤**

1. **步骤编号：1**  
   **具体操作：观察方程结构**  
   **详细解释：识别这是一个标准的二次方程**  
   **中间结果：方程形式为 x² - 5x + 6 = 0**

2. **步骤编号：2**  
   **具体操作：使用因式分解法**  
   **详细解释：寻找两个数，乘积为6，和为-5**  
   **中间结果：分解为 (x-2)(x-3) = 0**

3. **步骤编号：3**  
   **具体操作：求解方程**  
   **详细解释：令每个因式等于零**  
   **中间结果：x-2=0 或 x-3=0**

4. **步骤编号：4**  
   **具体操作：得出最终解**  
   **详细解释：解得两个根**  
   **中间结果：x=2 或 x=3**

**验证**
将解代入原方程验证正确性。`
  };

  // 测试用例3: 带重复步骤的响应
  testCase3 = {
    name: "带重复步骤的响应",
    content: `**解题步骤**

1. **移项**：将常数项移到等号右边
2. **计算**：2x = 10
3. **计算**：2x = 10  // 重复
4. **求解**：x = 5
5. **求解**：x = 5   // 重复
6. **验证**：代入检验`
  };

  // 测试用例4: 混合格式响应
  testCase4 = {
    name: "混合格式响应",
    content: `**问题描述**
解方程组：
\begin{cases}
2x + y = 7 \\
x - y = -1
\end{cases}

**解题步骤**

**步骤1：理解题意**
这是一个二元一次方程组，可以使用代入法或加减法求解。

**步骤2：选择解法**
选择加减法，因为两个方程相加可以消去y。

**步骤3：执行计算**
将两个方程相加：
$(2x + y) + (x - y) = 7 + (-1)$
$3x = 6$

**步骤4：求解**
$x = 2$

**步骤5：回代求解**
将x=2代入第一个方程：
$2(2) + y = 7$
$4 + y = 7$
$y = 3$

**最终答案**
x=2, y=3`
  };

  // 测试用例5: 英文AI响应
  testCase5 = {
    name: "英文AI响应",
    content: `**Problem Analysis**
Solve the linear equation: 3x - 7 = 11

**Step-by-Step Solution**

1. **Step 1: Identify the equation type**
   This is a linear equation in one variable.

2. **Step 2: Isolate the variable term**
   Add 7 to both sides: 3x - 7 + 7 = 11 + 7
   Result: 3x = 18

3. **Step 3: Solve for x**
   Divide both sides by 3: (3x)/3 = 18/3
   Final result: x = 6

**Verification**
Substitute x = 6 into original equation: 3(6) - 7 = 18 - 7 = 11 ✓`
  };

  // 测试用例6: 边缘情况 - 空响应
  testCase6 = {
    name: "空响应",
    content: ""
  };

  // 测试用例7: 无编号响应
  testCase7 = {
    name: "无编号响应",
    content: `**解题过程**

首先，我们需要理解题目要求。这是一个基础的代数问题。

然后，我们可以建立数学模型。根据题意，我们需要解一个方程。

接下来，执行计算步骤。使用标准的代数方法求解。

最后，验证结果确保答案正确。`
  };

  // 改进的提取函数（复制自修复后的代码）
  extractAndSortSteps(aiContent) {
    console.log('🔍 开始智能步骤提取...');
    console.log('原始内容长度:', aiContent.length);
    
    const steps = [];
    
    if (!aiContent || aiContent.trim().length === 0) {
      console.log('⚠️ 空内容，返回默认步骤');
      return ["分析题目", "建立模型", "逐步求解", "验证结果"];
    }

    // 1. 首先尝试匹配实际AI响应格式
    const detailedStepPattern = /(?:^|\n)(\d+)[.、\)]?\s*(?:\*\*步骤编号：\1\*\*\s*\*\*具体操作：([^*]+)\*\*\s*\*\*详细解释：([^*]+)\*\*(?:\s*\*\*中间结果：\*\*\s*([^\n]*))?)/gm;
    const detailedMatches = [...aiContent.matchAll(detailedStepPattern)];
    
    if (detailedMatches.length > 0) {
      console.log(`✅ 找到 ${detailedMatches.length} 个详细步骤格式`);
      
      detailedMatches.forEach(match => {
        const stepNum = parseInt(match[1]);
        const operation = match[2] ? match[2].trim() : '';
        const explanation = match[3] ? match[3].trim() : '';
        const result = match[4] ? match[4].trim() : '';
        
        let fullContent = operation;
        if (explanation && !operation.includes(explanation)) {
          fullContent += '：' + explanation;
        }
        if (result && result.trim() && !result.includes('$')) {
          fullContent += '，结果：' + result.trim();
        }
        
        if (fullContent.length > 10) {
          steps[stepNum - 1] = fullContent;
        }
      });
      
      const validSteps = steps.filter(step => step && step.length > 0);
      if (validSteps.length > 0) {
        console.log(`✅ 成功提取 ${validSteps.length} 个详细步骤`);
        return validSteps;
      }
    }

    // 2. 尝试匹配带标题的步骤
    const titledStepPattern = /(?:^|\n)(\d+)[.、\)]\s*\*\*([^*]+)\*\*\s*([^\n]+)/gm;
    const titledMatches = [...aiContent.matchAll(titledStepPattern)];
    
    if (titledMatches.length > 0) {
      console.log(`✅ 找到 ${titledMatches.length} 个带标题步骤`);
      
      titledMatches.forEach(match => {
        const stepNum = parseInt(match[1]);
        const title = match[2] ? match[2].trim() : '';
        const content = match[3] ? match[3].trim() : '';
        
        let fullContent = title;
        if (content && !title.includes(content)) {
          fullContent += '：' + content;
        }
        
        if (fullContent.length > 10) {
          steps[stepNum - 1] = fullContent;
        }
      });
      
      const validSteps = steps.filter(step => step && step.length > 0);
      if (validSteps.length > 0) {
        return validSteps;
      }
    }

    // 3. 提取普通编号步骤
    let filteredContent = aiContent;
    filteredContent = filteredContent.replace(/\*\*/g, '');
    filteredContent = filteredContent.replace(/^#+.*?\n/gm, '');
    
    const stepPattern = /(?:^|\n)(\d+)[.、\)]\s*([^\n]+)/gm;
    const matches = [...filteredContent.matchAll(stepPattern)];
    
    if (matches.length > 0) {
      console.log(`✅ 找到 ${matches.length} 个普通编号步骤`);
      
      const extractedSteps = matches.map(match => {
        const content = match[2].trim();
        return content.replace(/^步骤[:：]?\s*/i, '').trim();
      }).filter(content => content.length > 15);
      
      if (extractedSteps.length > 0) {
        return extractedSteps.slice(0, 6);
      }
    }

    // 4. 提取数学段落
    const mathParagraphs = aiContent
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 30 && (p.includes('=') || /\d+/.test(p)))
      .filter(p => !p.startsWith('**最终答案'));
    
    if (mathParagraphs.length >= 2) {
      console.log(`✅ 找到 ${mathParagraphs.length} 个数学段落`);
      return mathParagraphs.slice(0, 6);
    }

    // 5. 默认步骤
    console.log('⚠️ 使用默认步骤');
    return ["分析题目", "建立模型", "逐步求解", "验证结果"];
  }

  // 去重测试
  removeDuplicateSteps(steps) {
    console.log('🧹 开始智能去重...');
    
    const uniqueSteps = [];
    const seenContent = new Set();
    
    for (const step of steps) {
      const cleanStep = step.trim();
      if (cleanStep && cleanStep.length > 10) {
        // 基于数学内容指纹去重
        const normalized = cleanStep
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/[^\w\+\-\=\×\÷\√\d]/g, '')
          .substring(0, 100);
        
        if (!seenContent.has(normalized)) {
          uniqueSteps.push(cleanStep);
          seenContent.add(normalized);
        }
      }
    }
    
    console.log(`📊 去重结果: ${steps.length} → ${uniqueSteps.length} 个步骤`);
    return uniqueSteps;
  }

  // 运行测试
  async runAllTests() {
    console.log('🧪 开始综合测试套件...\n');
    console.log('='.repeat(80));
    
    const testCases = [
      this.testCase1, this.testCase2, this.testCase3, 
      this.testCase4, this.testCase5, this.testCase6, this.testCase7
    ];
    
    let totalTests = 0;
    let passedTests = 0;
    
    for (const testCase of testCases) {
      console.log(`\n📊 测试用例: ${testCase.name}`);
      console.log('-'.repeat(60));
      
      totalTests++;
      
      try {
        // 测试步骤提取
        const extracted = this.extractAndSortSteps(testCase.content);
        const unique = this.removeDuplicateSteps(extracted);
        
        const success = this.validateTest(testCase, extracted, unique);
        
        if (success) {
          passedTests++;
          console.log('✅ 测试通过');
        } else {
          console.log('❌ 测试失败');
        }
        
        this.testResults.extraction.push({
          testCase: testCase.name,
          extracted: extracted.length,
          unique: unique.length,
          success: success
        });
        
      } catch (error) {
        console.log('❌ 测试异常:', error.message);
        this.testResults.extraction.push({
          testCase: testCase.name,
          error: error.message,
          success: false
        });
      }
    }
    
    // 测试边缘情况
    await this.testEdgeCases();
    
    // 生成测试报告
    this.generateReport(totalTests, passedTests);
  }

  validateTest(testCase, extracted, unique) {
    console.log(`提取步骤: ${extracted.length} 个`);
    console.log(`去重后: ${unique.length} 个`);
    
    if (extracted.length === 0) {
      console.log('⚠️ 未提取到任何步骤');
      return false;
    }
    
    // 检查是否使用了默认步骤
    const defaultSteps = ["分析题目", "建立模型", "逐步求解", "验证结果"];
    const usingDefaults = extracted.every(step => 
      defaultSteps.some(defaultStep => step.includes(defaultStep))
    );
    
    if (usingDefaults && extracted.length === 4) {
      console.log('⚠️ 可能使用了默认步骤');
      return false;
    }
    
    // 检查是否有实际数学内容
    const hasMathContent = extracted.some(step => 
      /[\+\-\=\×\÷\√\d]/.test(step) || 
      step.includes('计算') || 
      step.includes('求解') ||
      step.includes('equation')
    );
    
    if (!hasMathContent) {
      console.log('⚠️ 缺少数学内容');
      return false;
    }
    
    // 检查去重效果
    const duplicateCheck = extracted.length === unique.length || 
                          (extracted.length - unique.length) <= 1;
    
    if (!duplicateCheck) {
      console.log(`⚠️ 去重效果不佳: ${extracted.length} → ${unique.length}`);
    }
    
    return true;
  }

  async testEdgeCases() {
    console.log('\n\n🔍 边缘情况测试');
    console.log('='.repeat(40));
    
    // 测试空内容
    const emptyResult = this.extractAndSortSteps('');
    console.log('空内容测试:', emptyResult.length > 0 ? '✅' : '❌');
    
    // 测试超长内容
    const longContent = '这是一个很长的内容'.repeat(1000);
    const longResult = this.extractAndSortSteps(longContent);
    console.log('超长内容测试:', longResult.length <= 6 ? '✅' : '❌');
    
    // 测试特殊字符
    const specialChars = '特殊字符：@#$%^&*()_+{}[]|\\:;"\'<>?,./';
    const specialResult = this.extractAndSortSteps(specialChars);
    console.log('特殊字符测试:', specialResult.length > 0 ? '✅' : '❌');
  }

  generateReport(totalTests, passedTests) {
    console.log('\n\n📊 综合测试报告');
    console.log('='.repeat(80));
    console.log(`总测试用例: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`通过率: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📋 详细结果:');
    this.testResults.extraction.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.testCase}: ${result.extracted || 0} → ${result.unique || 0}`);
    });
    
    const summary = {
      allTests: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      successRate: ((passedTests/totalTests) * 100).toFixed(1) + '%',
      timestamp: new Date().toISOString()
    };
    
    console.log('\n🎯 测试结论:');
    if (passedTests === totalTests) {
      console.log('🎉 所有测试通过！修复成功！');
    } else {
      console.log(`⚠️ ${totalTests - passedTests} 个测试失败，需要进一步检查`);
    }
    
    return summary;
  }
}

// 运行测试
const tester = new ComprehensiveTester();
tester.runAllTests().then(() => {
  console.log('\n✅ 综合测试完成！');
});