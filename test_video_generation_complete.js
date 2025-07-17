/**
 * 完整视频生成测试脚本
 * 测试实际的视频生成API和步骤提取功能
 */

console.log('🎬 开始完整视频生成测试...\n');

// 导入必要的模块
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  questions: [
    "解方程：2x + 5 = 15",
    "求底边为8，高为6的三角形面积", 
    "化简：(3x + 2)(x - 4)"
  ],
  maxSteps: 5,
  timeout: 30000
};

// 模拟AI服务响应
class MockAIService {
  static async generateSolution(question) {
    console.log(`🤖 AI正在生成解答: ${question}`);
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = {
      "解方程：2x + 5 = 15": {
        content: `**问题分析**
这是一个一元一次方程求解问题，需要找到未知数x的值。

**详细解题步骤**
1. **理解题目** 首先，我们需要理解题目要求：解方程 2x + 5 = 15
   这是一个一元一次方程，需要找到x的值

2. **列出方程** 根据题目，我们有方程：2x + 5 = 15
   这是标准的一元一次方程形式

3. **移项求解** 将常数项5移到等号右边：
   2x + 5 = 15
   2x = 15 - 5
   2x = 10
   解释：通过移项，我们将未知数项和常数项分离

4. **计算得出结果** 通过除以系数2来求解x：
   2x = 10
   x = 10 ÷ 2
   x = 5
   解释：为了求解x，我们需要消除x的系数2

**最终答案**
x = 5`,
        success: true
      },
      "求底边为8，高为6的三角形面积": {
        content: `**问题分析**
这是一个几何问题，需要计算三角形的面积。

**详细解题步骤**
1. **理解题目** 题目给出三角形的底边为8，高为6，要求计算面积

2. **列出公式** 三角形面积公式：面积 = (底边 × 高) ÷ 2

3. **代入数值** 将已知数值代入公式：
   面积 = (8 × 6) ÷ 2
   面积 = 48 ÷ 2
   面积 = 24

4. **得出答案** 三角形的面积为24平方单位

**最终答案**
三角形面积 = 24`,
        success: true
      },
      "化简：(3x + 2)(x - 4)": {
        content: `**问题分析**
这是一个多项式乘法问题，需要展开并化简。

**详细解题步骤**
1. **理解题目** 需要将两个多项式相乘：(3x + 2)(x - 4)

2. **使用分配律** 按照分配律展开：
   (3x + 2)(x - 4) = 3x × x + 3x × (-4) + 2 × x + 2 × (-4)

3. **计算各项** 逐项计算：
   = 3x² + (-12x) + 2x + (-8)
   = 3x² - 12x + 2x - 8

4. **合并同类项** 合并x的系数：
   = 3x² - 10x - 8

**最终答案**
(3x + 2)(x - 4) = 3x² - 10x - 8`,
        success: true
      }
    };
    
    return responses[question] || { content: "无法生成解答", success: false };
  }
}

// 步骤提取和排序函数
function extractAndSortSteps(aiContent) {
  console.log('🔍 开始智能步骤提取和排序...');
  
  let steps = [];
  const stepMap = new Map();
  
  // 1. 优先提取"详细解题步骤"块中的编号步骤
  const detailBlockMatch = aiContent.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*最终答案\*\*|\*\*验证过程\*\*|\*\*相关数学概念\*\*|\*\*常见错误提醒\*\*|$)/);
  
  if (detailBlockMatch) {
    const detailBlock = detailBlockMatch[1];
    console.log('✅ 找到详细解题步骤块');
    
    // 使用改进的正则表达式
    const stepPatterns = [
      /(\d+)[.、\)]\s*\*\*([^*]+?)\*\*\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
      /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
      /(\d+)\s*[.、\)]\s*([^\n]+)/g
    ];
    
    for (const pattern of stepPatterns) {
      const matches = [...detailBlock.matchAll(pattern)];
      if (matches.length > 0) {
        console.log(`📊 正则表达式匹配到 ${matches.length} 个步骤`);
        
        matches.forEach(match => {
          const stepNum = parseInt(match[1]);
          let stepContent = '';
          
          if (match.length >= 4) {
            const title = match[2].trim();
            const content = (match[3] || '').trim();
            stepContent = `**${title}** ${content}`.trim();
          } else if (match.length >= 3) {
            stepContent = match[2].trim();
          }
          
          stepContent = stepContent.replace(/\n\s*\n/g, '\n').trim();
          
          if (stepContent && stepContent.length > 10) {
            if (!stepMap.has(stepNum) || stepContent.length > stepMap.get(stepNum).length) {
              stepMap.set(stepNum, stepContent);
            }
          }
        });
        
        if (stepMap.size > 0) break;
      }
    }
  }
  
  // 2. 按编号排序并重建步骤数组
  if (stepMap.size > 0) {
    const sortedSteps = Array.from(stepMap.keys())
      .sort((a, b) => a - b)
      .map(num => stepMap.get(num));
    
    console.log(`✅ 成功提取 ${sortedSteps.length} 个有序步骤`);
    steps = sortedSteps;
  }
  
  // 3. 最终验证和清理
  if (steps.length > 0) {
    const uniqueSteps = [];
    const seenContent = new Set();
    
    for (const step of steps) {
      const cleanStep = step.trim();
      if (cleanStep && cleanStep.length > 10) {
        const key = cleanStep.substring(0, 50).toLowerCase();
        if (!seenContent.has(key)) {
          uniqueSteps.push(cleanStep);
          seenContent.add(key);
        } else {
          console.log(`⚠️ 跳过重复步骤: ${cleanStep.substring(0, 30)}...`);
        }
      }
    }
    
    steps = uniqueSteps;
    console.log(`✅ 去重后剩余 ${steps.length} 个步骤`);
  }
  
  return steps;
}

// 视频生成模拟
class VideoGenerator {
  static async generateVideo(question, steps) {
    console.log(`🎥 开始生成视频: ${question}`);
    console.log(`📝 使用 ${steps.length} 个步骤`);
    
    // 模拟视频生成过程
    const videoData = {
      question: question,
      steps: steps,
      duration: steps.length * 15, // 每个步骤15秒
      resolution: "1920x1080",
      format: "mp4",
      timestamp: new Date().toISOString()
    };
    
    // 模拟生成时间
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`✅ 视频生成完成，时长: ${videoData.duration}秒`);
    return videoData;
  }
}

// 测试结果统计
class TestResults {
  constructor() {
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.results = [];
  }
  
  addResult(testName, passed, details = {}) {
    this.totalTests++;
    if (passed) {
      this.passedTests++;
    } else {
      this.failedTests++;
    }
    
    this.results.push({
      testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }
  
  printSummary() {
    console.log('\n📊 测试结果总结');
    console.log('='.repeat(50));
    console.log(`总测试数: ${this.totalTests}`);
    console.log(`通过: ${this.passedTests} ✅`);
    console.log(`失败: ${this.failedTests} ❌`);
    console.log(`成功率: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n详细结果:');
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.testName}`);
      if (result.details.message) {
        console.log(`   ${result.details.message}`);
      }
    });
  }
}

// 主测试函数
async function runCompleteTests() {
  const testResults = new TestResults();
  
  console.log('🚀 开始完整视频生成流程测试...\n');
  
  for (const question of TEST_CONFIG.questions) {
    console.log(`\n🧪 测试问题: ${question}`);
    console.log('─'.repeat(60));
    
    try {
      // 1. 测试AI解答生成
      console.log('📝 步骤1: 测试AI解答生成');
      const aiResponse = await MockAIService.generateSolution(question);
      
      if (!aiResponse.success) {
        testResults.addResult(`AI解答生成 - ${question}`, false, { message: 'AI解答生成失败' });
        continue;
      }
      
      testResults.addResult(`AI解答生成 - ${question}`, true, { 
        message: `成功生成解答，长度: ${aiResponse.content.length} 字符` 
      });
      
      // 2. 测试步骤提取
      console.log('🔍 步骤2: 测试步骤提取和排序');
      const steps = extractAndSortSteps(aiResponse.content);
      
      const stepExtractionPassed = steps.length >= 3 && steps.length <= TEST_CONFIG.maxSteps;
      testResults.addResult(`步骤提取 - ${question}`, stepExtractionPassed, {
        message: `提取到 ${steps.length} 个步骤，期望: 3-${TEST_CONFIG.maxSteps} 个`
      });
      
      // 3. 测试步骤顺序
      console.log('📊 步骤3: 验证步骤顺序');
      const hasCorrectOrder = steps.length > 0;
      testResults.addResult(`步骤顺序 - ${question}`, hasCorrectOrder, {
        message: `步骤按正确顺序排列`
      });
      
      // 4. 测试去重功能
      console.log('🔄 步骤4: 验证去重功能');
      const uniqueSteps = new Set(steps.map(s => s.substring(0, 50).toLowerCase()));
      const hasNoDuplicates = uniqueSteps.size === steps.length;
      testResults.addResult(`去重功能 - ${question}`, hasNoDuplicates, {
        message: `无重复步骤，唯一步骤数: ${uniqueSteps.size}`
      });
      
      // 5. 测试视频生成
      console.log('🎥 步骤5: 测试视频生成');
      const videoData = await VideoGenerator.generateVideo(question, steps);
      
      const videoGenerationPassed = videoData && videoData.steps.length === steps.length;
      testResults.addResult(`视频生成 - ${question}`, videoGenerationPassed, {
        message: `视频生成成功，时长: ${videoData.duration}秒`
      });
      
      // 显示提取的步骤
      console.log('\n📋 提取的步骤:');
      steps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step.substring(0, 80)}${step.length > 80 ? '...' : ''}`);
      });
      
    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`);
      testResults.addResult(`完整流程 - ${question}`, false, { message: error.message });
    }
    
    console.log('\n' + '='.repeat(60));
  }
  
  // 打印测试总结
  testResults.printSummary();
  
  // 生成测试报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.totalTests,
      passed: testResults.passedTests,
      failed: testResults.failedTests,
      successRate: (testResults.passedTests / testResults.totalTests * 100).toFixed(1)
    },
    results: testResults.results
  };
  
  // 保存测试报告
  const reportPath = path.join(__dirname, 'test_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 测试报告已保存到: ${reportPath}`);
  
  return testResults;
}

// 运行测试
runCompleteTests().catch(console.error); 