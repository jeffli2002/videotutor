import { generateManimVideoFromQwen } from './src/services/mathVideoAI.js';

console.log('🎬 测试视频修复效果...\n');

// 测试步骤
const testSteps = [
  "题目：解方程 2x + 5 = 15",
  "移项：2x = 15 - 5",
  "计算：2x = 10",
  "系数化1：x = 5",
  "验证：2×5 + 5 = 15 ✓"
];

async function testVideoGeneration() {
  try {
    console.log('📝 测试步骤:', testSteps);
    console.log('🎬 开始生成视频...');
    
    const videoUrl = await generateManimVideoFromQwen(testSteps, `test_video_${Date.now()}`);
    
    console.log('✅ 视频生成成功!');
    console.log('📁 视频URL:', videoUrl);
    
    // 验证URL格式
    if (videoUrl && videoUrl.startsWith('/rendered_videos/')) {
      console.log('✅ URL格式正确');
    } else {
      console.log('⚠️ URL格式可能有问题:', videoUrl);
    }
    
  } catch (error) {
    console.error('❌ 视频生成失败:', error.message);
  }
}

testVideoGeneration(); 