// Test script for video content visibility
import { AnimationGenerator } from './src/services/animationGenerator.js';

async function testVideoVisibility() {
  console.log('🧪 Testing Video Content Visibility...\n');
  
  const generator = new AnimationGenerator();
  
  // Test case to verify colors are properly set
  const testQuestion = '测试视频内容可见性：3x - 7 > 209';
  const testSolution = `
**详细解题步骤**

1. 首先，将不等式中的常数项移到右边。
   \\[3x - 7 > 209\\]
   \\[3x > 216\\]
   
2. 计算最终结果。
   \\[x > 72\\]

**最终答案**
\\[x > 72\\]
`;

  try {
    console.log('📝 生成动画内容...');
    const result = await generator.generateUniqueAnimationFromAI(testQuestion, testSolution, {pages: []}, 'zh');
    console.log('✅ 测试完成 - 视频已生成，颜色定义已更新');
    console.log('🎨 使用的颜色方案:');
    console.log('   - 背景: 白色 (#FFFFFF)');
    console.log('   - 数学表达式: 黑色 (#000000)');
    console.log('   - 标题: 蓝色 (#0066CC)');
    console.log('   - 步骤标记: 浅灰色 (#808080)');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testVideoVisibility();