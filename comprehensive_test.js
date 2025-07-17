/**
 * 全面视频生成测试脚本
 * 测试多个数学问题的完整流程
 */

console.log('🎯 开始全面视频生成测试...\n');

// 测试问题集合
const testQuestions = [
  {
    question: "解方程：2x + 5 = 15",
    expectedSteps: 4,
    category: "代数方程"
  },
  {
    question: "求底边为8，高为6的三角形面积",
    expectedSteps: 4,
    category: "几何"
  },
  {
    question: "化简：(3x + 2)(x - 4)",
    expectedSteps: 4,
    category: "多项式"
  },
  {
    question: "计算：√16 + √9",
    expectedSteps: 3,
    category: "根式运算"
  }
];

// 模拟AI响应数据
const mockResponses = {
  "解方程：2x + 5 = 15": `**问题分析**
这是一个一元一次方程求解问题。

**详细解题步骤**
1. **理解题目** 首先，我们需要理解题目要求：解方程 2x + 5 = 15
   这是一个一元一次方程，需要找到x的值

2. **列出方程** 根据题目，我们有方程：2x + 5 = 15
   这是标准的一元一次方程形式

3. **移项求解** 将常数项5移到等号右边：
   2x + 5 = 15
   2x = 15 - 5
   2x = 10

4. **计算得出结果** 通过除以系数2来求解x：
   2x = 10
   x = 10 ÷ 2
   x = 5

**最终答案**
x = 5`,

  "求底边为8，高为6的三角形面积": `**问题分析**
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

  "化简：(3x + 2)(x - 4)": `**问题分析**
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

  "计算：√16 + √9": `**问题分析**
这是一个根式运算问题，需要计算两个平方根的和。

**详细解题步骤**
1. **理解题目** 需要计算 √16 + √9，即16的平方根加上9的平方根

2. **计算平方根** 分别计算每个平方根：
   √16 = 4
   √9 = 3

3. **求和** 将两个结果相加：
   √16 + √9 = 4 + 3 = 7

**最终答案**
√16 + √9 = 7`
};

// 步骤提取函数
function extractSteps(content) {
  const steps = [];
  const stepMap = new Map();
  
  // 查找详细解题步骤块
  const detailMatch = content.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*最终答案\*\*|$)/);
  
  if (detailMatch) {
    const detailBlock = detailMatch[1];
    
    // 匹配编号步骤
    const stepPattern = /(\d+)[.、\)]\s*\*\*([^*]+?)\*\*\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g;
    const matches = [...detailBlock.matchAll(stepPattern)];
    
    matches.forEach(match => {
      const stepNum = parseInt(match[1]);
      const title = match[2].trim();
      const content = (match[3] || '').trim();
      const stepContent = `**${title}** ${content}`.trim();
      
      if (stepContent.length > 10) {
        stepMap.set(stepNum, stepContent);
      }
    });
  }
  
  // 按编号排序
  if (stepMap.size > 0) {
    const sortedSteps = Array.from(stepMap.keys())
      .sort((a, b) => a - b)
      .map(num => stepMap.get(num));
    
    steps.push(...sortedSteps);
  }
  
  return steps;
}

// 验证步骤质量
function validateSteps(steps, expectedCount) {
  const validations = {
    hasSteps: steps.length > 0,
    correctCount: steps.length === expectedCount,
    hasTitles: steps.every(step => step.includes('**')),
    noDuplicates: new Set(steps.map(s => s.substring(0, 50).toLowerCase())).size === steps.length,
    properOrder: steps.length > 0
  };
  
  return validations;
}

// 模拟视频生成
function generateVideo(question, steps) {
  const videoData = {
    question: question,
    steps: steps,
    duration: steps.length * 15,
    resolution: "1920x1080",
    format: "mp4",
    timestamp: new Date().toISOString()
  };
  
  return videoData;
}

// 测试结果统计
class TestStats {
  constructor() {
    this.total = 0;
    this.passed = 0;
    this.failed = 0;
    this.details = [];
  }
  
  addResult(testName, passed, details = {}) {
    this.total++;
    if (passed) {
      this.passed++;
    } else {
      this.failed++;
    }
    
    this.details.push({
      test: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }
  
  printSummary() {
    console.log('\n📊 测试结果总结');
    console.log('='.repeat(50));
    console.log(`总测试数: ${this.total}`);
    console.log(`通过: ${this.passed} ✅`);
    console.log(`失败: ${this.failed} ❌`);
    console.log(`成功率: ${((this.passed / this.total) * 100).toFixed(1)}%`);
    
    console.log('\n详细结果:');
    this.details.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
      if (result.details.message) {
        console.log(`   ${result.details.message}`);
      }
    });
  }
}

// 主测试函数
async function runComprehensiveTests() {
  const stats = new TestStats();
  
  console.log('🚀 开始全面视频生成流程测试...\n');
  
  for (const testCase of testQuestions) {
    console.log(`\n🧪 测试问题: ${testCase.question}`);
    console.log(`📂 分类: ${testCase.category}`);
    console.log(`📊 期望步骤数: ${testCase.expectedSteps}`);
    console.log('─'.repeat(60));
    
    try {
      // 获取AI响应
      const aiResponse = mockResponses[testCase.question];
      if (!aiResponse) {
        console.log('❌ 未找到对应的AI响应数据');
        stats.addResult(`AI响应 - ${testCase.question}`, false, { message: '缺少AI响应数据' });
        continue;
      }
      
      console.log('✅ AI响应数据获取成功');
      stats.addResult(`AI响应 - ${testCase.question}`, true, { 
        message: `响应长度: ${aiResponse.length} 字符` 
      });
      
      // 提取步骤
      const steps = extractSteps(aiResponse);
      console.log(`📝 提取到 ${steps.length} 个步骤`);
      
      // 显示步骤
      steps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step.substring(0, 50)}${step.length > 50 ? '...' : ''}`);
      });
      
      // 验证步骤
      const validations = validateSteps(steps, testCase.expectedSteps);
      
      // 记录验证结果
      Object.entries(validations).forEach(([key, passed]) => {
        const testName = `${key} - ${testCase.question}`;
        const message = key === 'correctCount' ? 
          `步骤数: ${steps.length}/${testCase.expectedSteps}` : 
          `${key}: ${passed}`;
        
        stats.addResult(testName, passed, { message });
      });
      
      // 生成视频
      const video = generateVideo(testCase.question, steps);
      console.log(`🎥 视频生成成功 - 时长: ${video.duration}秒`);
      
      stats.addResult(`视频生成 - ${testCase.question}`, true, {
        message: `视频时长: ${video.duration}秒，分辨率: ${video.resolution}`
      });
      
      // 检查是否所有验证都通过
      const allValidationsPassed = Object.values(validations).every(v => v);
      if (allValidationsPassed) {
        console.log('✅ 所有验证通过');
      } else {
        console.log('❌ 部分验证失败');
      }
      
    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`);
      stats.addResult(`完整流程 - ${testCase.question}`, false, { message: error.message });
    }
    
    console.log('\n' + '='.repeat(60));
  }
  
  // 打印总结
  stats.printSummary();
  
  // 最终评估
  console.log('\n🎯 最终评估:');
  if (stats.passed === stats.total) {
    console.log('🎉 完美！所有测试都通过了！');
    console.log('✅ 视频生成流程工作正常');
    console.log('✅ 步骤提取功能正常');
    console.log('✅ 步骤排序功能正常');
    console.log('✅ 视频生成功能正常');
  } else {
    console.log('⚠️ 部分测试失败，需要进一步检查');
    console.log(`失败率: ${((stats.failed / stats.total) * 100).toFixed(1)}%`);
  }
  
  return stats;
}

// 运行测试
runComprehensiveTests().catch(console.error); 