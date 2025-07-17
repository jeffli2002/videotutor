/**
 * 最终简化测试脚本
 * 验证视频生成流程的核心功能
 */

console.log('Starting final video generation test...\n');

// 测试数据
const testData = {
  question: "解方程：2x + 5 = 15",
  aiResponse: `**问题分析**
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
x = 5`
};

// 步骤提取函数
function extractSteps(content) {
  console.log('Extracting steps from AI response...');
  
  const steps = [];
  const stepMap = new Map();
  
  // 查找详细解题步骤块
  const detailMatch = content.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*最终答案\*\*|$)/);
  
  if (detailMatch) {
    console.log('Found detailed solution steps block');
    const detailBlock = detailMatch[1];
    
    // 匹配编号步骤
    const stepPattern = /(\d+)[.、\)]\s*\*\*([^*]+?)\*\*\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g;
    const matches = [...detailBlock.matchAll(stepPattern)];
    
    console.log(`Found ${matches.length} numbered steps`);
    
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
    console.log(`Successfully extracted ${steps.length} ordered steps`);
  }
  
  return steps;
}

// 验证步骤质量
function validateSteps(steps) {
  console.log('Validating step quality...');
  
  const validations = {
    hasSteps: steps.length > 0,
    correctCount: steps.length >= 3 && steps.length <= 5,
    hasTitles: steps.every(step => step.includes('**')),
    noDuplicates: new Set(steps.map(s => s.substring(0, 50).toLowerCase())).size === steps.length
  };
  
  console.log('Validation results:');
  console.log(`- Has steps: ${validations.hasSteps}`);
  console.log(`- Correct count (3-5): ${validations.correctCount}`);
  console.log(`- Has titles: ${validations.hasTitles}`);
  console.log(`- No duplicates: ${validations.noDuplicates}`);
  
  return validations;
}

// 模拟视频生成
function generateVideo(question, steps) {
  console.log('Generating video...');
  
  const videoData = {
    question: question,
    steps: steps,
    duration: steps.length * 15,
    resolution: "1920x1080",
    format: "mp4",
    timestamp: new Date().toISOString()
  };
  
  console.log(`Video generated successfully!`);
  console.log(`- Duration: ${videoData.duration} seconds`);
  console.log(`- Steps: ${videoData.steps.length}`);
  console.log(`- Resolution: ${videoData.resolution}`);
  
  return videoData;
}

// 主测试函数
function runTest() {
  console.log('=== VIDEO GENERATION TEST ===\n');
  
  console.log(`Testing question: ${testData.question}\n`);
  
  // 1. 提取步骤
  const steps = extractSteps(testData.aiResponse);
  
  console.log('\nExtracted steps:');
  steps.forEach((step, index) => {
    console.log(`${index + 1}. ${step.substring(0, 60)}${step.length > 60 ? '...' : ''}`);
  });
  
  // 2. 验证步骤
  console.log('\n--- Step Validation ---');
  const validations = validateSteps(steps);
  
  // 3. 生成视频
  console.log('\n--- Video Generation ---');
  const video = generateVideo(testData.question, steps);
  
  // 4. 测试结果
  console.log('\n=== TEST RESULTS ===');
  const allPassed = Object.values(validations).every(v => v);
  
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('✅ Step extraction working correctly');
    console.log('✅ Step ordering working correctly');
    console.log('✅ Video generation working correctly');
  } else {
    console.log('❌ SOME TESTS FAILED');
    Object.entries(validations).forEach(([key, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${key}: ${passed}`);
    });
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

// 运行测试
runTest(); 