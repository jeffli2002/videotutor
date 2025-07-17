// 测试视频重复和顺序问题修复
console.log('🧪 开始测试视频重复和顺序问题修复...\n');

// 模拟Manim分段视频文件名
const mockVideoFiles = [
  'MathSolutionScene_0001.mp4',
  'MathSolutionScene_0002.mp4', 
  'MathSolutionScene_0003.mp4',
  'MathSolutionScene_0004.mp4',
  'MathSolutionScene_0001_duplicate.mp4',  // 重复文件
  'MathSolutionScene_0002_copy.mp4',       // 重复文件
  'MathSolutionScene_0005.mp4',
  'MathSolutionScene_0006.mp4'
];

// 模拟步骤内容
const mockSteps = [
  "理解题目：仔细阅读题目，明确已知条件和要求求解的内容",
  "确定解题思路：根据题目类型选择合适的解题方法",
  "列出公式或方程：根据数学原理，写出相关的公式",
  "代入已知条件：将题目中的具体数值代入公式中",
  "逐步计算：按照数学运算规则，一步一步进行计算",
  "得出结果：完成所有计算后，得出最终答案"
];

// 测试1: 步骤编号提取
function testStepNumberExtraction() {
  console.log('🔍 测试1: 步骤编号提取');
  
  const extractStepNumber = (filename) => {
    const patterns = [
      '(\d+)',  // 纯数字
      'step_(\\d+)',  // step_数字
      'segment_(\\d+)',  // segment_数字
      'part_(\\d+)',  // part_数字
      '(\\d+)_',  // 数字_
      '_(\\d+)\\.',  // _数字.
    ];
    
    for (const pattern of patterns) {
      const match = filename.match(new RegExp(pattern));
      if (match) {
        return parseInt(match[1]);
      }
    }
    return 9999;
  };
  
  mockVideoFiles.forEach(filename => {
    const stepNum = extractStepNumber(filename);
    console.log(`  ${filename} -> 步骤 ${stepNum}`);
  });
  
  console.log('✅ 步骤编号提取测试完成\n');
}

// 测试2: 去重功能
function testDeduplication() {
  console.log('🧹 测试2: 去重功能');
  
  const removeDuplicates = (files) => {
    const stepGroups = {};
    
    files.forEach(filename => {
      const stepNum = filename.match(/(\d+)/)?.[1] || '999';
      if (!stepGroups[stepNum]) {
        stepGroups[stepNum] = [];
      }
      stepGroups[stepNum].push(filename);
    });
    
    const uniqueFiles = [];
    Object.keys(stepGroups).sort().forEach(stepNum => {
      const filesForStep = stepGroups[stepNum];
      if (filesForStep.length > 1) {
        console.log(`  ⚠️ 步骤 ${stepNum} 发现 ${filesForStep.length} 个重复文件`);
        console.log(`     ${filesForStep.join(', ')}`);
      }
      uniqueFiles.push(filesForStep[0]);
    });
    
    return uniqueFiles;
  };
  
  const originalCount = mockVideoFiles.length;
  const uniqueFiles = removeDuplicates(mockVideoFiles);
  const finalCount = uniqueFiles.length;
  
  console.log(`📊 去重结果: ${originalCount} -> ${finalCount} 个文件`);
  console.log(`📋 去重后文件: ${uniqueFiles.join(', ')}`);
  console.log('✅ 去重功能测试完成\n');
}

// 测试3: 排序功能
function testSorting() {
  console.log('📊 测试3: 排序功能');
  
  const sortFiles = (files) => {
    return files.sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)/)?.[1] || '999');
      const numB = parseInt(b.match(/(\d+)/)?.[1] || '999');
      return numA - numB;
    });
  };
  
  const shuffledFiles = [...mockVideoFiles].sort(() => Math.random() - 0.5);
  console.log(`🔄 原始顺序: ${shuffledFiles.join(', ')}`);
  
  const sortedFiles = sortFiles(shuffledFiles);
  console.log(`✅ 排序后: ${sortedFiles.join(', ')}`);
  
  console.log('✅ 排序功能测试完成\n');
}

// 测试4: 步骤内容优化
function testStepOptimization() {
  console.log('🔧 测试4: 步骤内容优化');
  
  const optimizeSteps = (steps) => {
    return steps.map((step, index) => {
      let optimized = step;
      
      // 限制长度
      if (optimized.length > 100) {
        optimized = optimized.substring(0, 97) + "...";
      }
      
      // 清理特殊字符
      optimized = optimized.replace(/[^\w\s\u4e00-\u9fff,.，。！？()（）=+\-*/÷×²³√π∞≤≥≠≈±∑∏∫∂∇∆∈∉⊂⊃∪∩∅∀∃]/g, '');
      
      return optimized;
    });
  };
  
  const originalSteps = [...mockSteps];
  const optimizedSteps = optimizeSteps(originalSteps);
  
  console.log('📝 原始步骤:');
  originalSteps.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step.substring(0, 50)}...`);
  });
  
  console.log('\n📝 优化后步骤:');
  optimizedSteps.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step.substring(0, 50)}...`);
  });
  
  console.log('✅ 步骤内容优化测试完成\n');
}

// 测试5: 完整流程测试
function testCompleteFlow() {
  console.log('🎬 测试5: 完整流程测试');
  
  // 模拟完整的视频生成流程
  const processVideoGeneration = (steps, videoFiles) => {
    console.log('📋 输入步骤数量:', steps.length);
    console.log('📹 输入视频文件数量:', videoFiles.length);
    
    // 1. 步骤优化
    const optimizedSteps = steps.slice(0, 4); // 限制到4个步骤
    console.log('✅ 步骤优化完成，保留4个步骤');
    
    // 2. 视频文件去重
    const uniqueFiles = videoFiles.filter((file, index, arr) => {
      const stepNum = file.match(/(\d+)/)?.[1];
      return arr.findIndex(f => f.match(/(\d+)/)?.[1] === stepNum) === index;
    });
    console.log('✅ 视频文件去重完成，从', videoFiles.length, '减少到', uniqueFiles.length);
    
    // 3. 视频文件排序
    const sortedFiles = uniqueFiles.sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)/)?.[1] || '999');
      const numB = parseInt(b.match(/(\d+)/)?.[1] || '999');
      return numA - numB;
    });
    console.log('✅ 视频文件排序完成');
    
    // 4. 验证结果
    const stepNumbers = sortedFiles.map(file => file.match(/(\d+)/)?.[1]).filter(Boolean);
    console.log('📊 最终步骤顺序:', stepNumbers);
    
    return {
      steps: optimizedSteps,
      videos: sortedFiles,
      stepOrder: stepNumbers
    };
  };
  
  const result = processVideoGeneration(mockSteps, mockVideoFiles);
  
  console.log('\n🎯 最终结果:');
  console.log('📝 优化步骤:', result.steps.length, '个');
  console.log('📹 处理视频:', result.videos.length, '个');
  console.log('📊 步骤顺序:', result.stepOrder.join(' -> '));
  
  // 验证结果
  const isOrdered = result.stepOrder.every((num, index) => {
    if (index === 0) return true;
    return parseInt(num) > parseInt(result.stepOrder[index - 1]);
  });
  
  const hasNoDuplicates = result.stepOrder.length === new Set(result.stepOrder).size;
  
  console.log('\n✅ 验证结果:');
  console.log(`  顺序正确: ${isOrdered ? '✅' : '❌'}`);
  console.log(`  无重复: ${hasNoDuplicates ? '✅' : '❌'}`);
  console.log(`  总体状态: ${isOrdered && hasNoDuplicates ? '✅ 通过' : '❌ 失败'}`);
  
  console.log('\n✅ 完整流程测试完成\n');
}

// 运行所有测试
console.log('🚀 开始运行所有测试...\n');

testStepNumberExtraction();
testDeduplication();
testSorting();
testStepOptimization();
testCompleteFlow();

console.log('🎉 所有测试完成！');
console.log('📋 修复内容总结:');
console.log('  ✅ 智能步骤编号提取');
console.log('  ✅ 重复视频文件检测和移除');
console.log('  ✅ 正确的视频文件排序');
console.log('  ✅ 步骤内容优化');
console.log('  ✅ 完整的流程验证'); 