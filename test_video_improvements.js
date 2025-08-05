// Test script for video improvements
import { AnimationGenerator } from './src/services/animationGenerator.js';

async function testVideoImprovements() {
  console.log('🧪 Testing Video Improvements...\n');
  
  const generator = new AnimationGenerator();
  
  // Test case with fractions that should be calculated
  const testQuestion = '解不等式：3x - 7 > 209';
  const testSolution = `
**详细解题步骤**

1. 首先，将不等式中的常数项移到右边。
   \\[3x - 7 > 209\\]
   \\[3x > 209 + 7\\]
   \\[3x > 216\\]
   
2. 接下来，将x的系数化为1。
   \\[x > \\frac{216}{3}\\]
   
3. 计算最终结果。
   \\[x > 72\\]

**最终答案**
\\[x > 72\\]
`;

  try {
    console.log('📝 生成动画内容...');
    const result = await generator.generateUniqueAnimationFromAI(testQuestion, testSolution, {pages: []}, 'zh');
    console.log('✅ 测试完成');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testVideoImprovements();
