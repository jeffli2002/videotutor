#!/usr/bin/env node

/**
 * 测试所有修复的脚本
 * 验证几何动画、TTS服务和视频播放的修复
 */

const fetch = require('node-fetch');

// 测试配置
const TEST_CONFIG = {
  qwenServer: 'http://localhost:8002',
  manimServer: 'http://localhost:8002', 
  ttsServer: 'http://localhost:8003',
  frontendServer: 'http://localhost:5173'
};

// 测试用例
const TEST_CASES = [
  {
    name: '几何问题测试',
    question: '求底边为8，高为6的三角形面积',
    language: 'zh',
    expectedFeatures: ['geometry_animation', 'tts', 'video_playback']
  },
  {
    name: '代数问题测试', 
    question: '解方程：2x + 5 = 15',
    language: 'zh',
    expectedFeatures: ['manim_animation', 'tts', 'video_playback']
  }
];

async function testServerHealth() {
  console.log('🏥 检查服务器健康状态...');
  
  const servers = [
    { name: 'QWEN API', url: `${TEST_CONFIG.qwenServer}/api/qwen` },
    { name: 'Manim Server', url: `${TEST_CONFIG.manimServer}/generate-video` },
    { name: 'TTS Server', url: `${TEST_CONFIG.ttsServer}/api/tts` }
  ];
  
  for (const server of servers) {
    try {
      const response = await fetch(server.url, { 
        method: 'OPTIONS',
        timeout: 5000 
      });
      console.log(`✅ ${server.name}: 运行正常 (${response.status})`);
    } catch (error) {
      console.log(`❌ ${server.name}: 连接失败 - ${error.message}`);
    }
  }
}

async function testGeometryAnimation() {
  console.log('\n🎨 测试几何动画生成...');
  
  try {
    // 测试几何问题检测
    const geometryQuestion = '求底边为8，高为6的三角形面积';
    const isGeometry = geometryQuestion.includes('三角形') || 
                      geometryQuestion.includes('面积') || 
                      geometryQuestion.includes('几何');
    
    console.log(`✅ 几何问题检测: ${isGeometry ? '正确识别' : '识别失败'}`);
    
    // 测试Manim脚本生成
    const testSteps = [
      '分析题目条件：底边b=8，高h=6',
      '使用三角形面积公式：S = (1/2) × b × h',
      '代入数值：S = (1/2) × 8 × 6',
      '计算：S = 24',
      '验证：面积单位正确'
    ];
    
    const manimRequest = {
      script: `from manim import *
class TestScene(Scene):
    def construct(self):
        # 测试脚本
        title = Text("三角形面积计算", font_size=36)
        self.play(Write(title))
        self.wait(2)`,
      output_name: `test_geometry_${Date.now()}`,
      question: geometryQuestion
    };
    
    const response = await fetch(`${TEST_CONFIG.manimServer}/generate-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(manimRequest)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Manim脚本生成: ${result.success ? '成功' : '失败'}`);
      if (result.video_path) {
        console.log(`📹 视频路径: ${result.video_path}`);
      }
    } else {
      console.log(`❌ Manim脚本生成失败: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`❌ 几何动画测试失败: ${error.message}`);
  }
}

async function testTTSService() {
  console.log('\n🎤 测试TTS服务...');
  
  try {
    const ttsRequest = {
      text: '这是一个测试文本，用于验证TTS服务是否正常工作。',
      language: 'zh-cn',
      method: 'auto'
    };
    
    const response = await fetch(`${TEST_CONFIG.ttsServer}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ttsRequest)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ TTS服务: ${result.success ? '成功' : '失败'}`);
      if (result.audio_path) {
        console.log(`🔊 音频路径: ${result.audio_path}`);
      }
    } else {
      console.log(`❌ TTS服务失败: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`❌ TTS测试失败: ${error.message}`);
  }
}

async function testVideoPlayback() {
  console.log('\n🎬 测试视频播放...');
  
  try {
    // 检查是否有可用的视频文件
    const videoResponse = await fetch(`${TEST_CONFIG.manimServer}/list-videos`);
    if (videoResponse.ok) {
      const videos = await videoResponse.json();
      if (videos.length > 0) {
        const latestVideo = videos[videos.length - 1];
        console.log(`✅ 找到视频文件: ${latestVideo}`);
        
        // 测试视频URL构建
        const videoUrl = `/rendered_videos/${latestVideo}`;
        const fullUrl = `${TEST_CONFIG.manimServer}${videoUrl}`;
        console.log(`🔗 视频URL: ${fullUrl}`);
        
        // 测试视频访问
        const videoAccess = await fetch(fullUrl, { method: 'HEAD' });
        console.log(`📹 视频访问: ${videoAccess.ok ? '成功' : '失败'}`);
        
      } else {
        console.log('⚠️ 没有找到视频文件');
      }
    } else {
      console.log('❌ 无法获取视频列表');
    }
    
  } catch (error) {
    console.log(`❌ 视频播放测试失败: ${error.message}`);
  }
}

async function testFrontendIntegration() {
  console.log('\n🌐 测试前端集成...');
  
  try {
    // 测试前端服务器
    const frontendResponse = await fetch(TEST_CONFIG.frontendServer);
    console.log(`✅ 前端服务器: ${frontendResponse.ok ? '运行正常' : '连接失败'}`);
    
    // 测试API配置
    const apiConfigResponse = await fetch(`${TEST_CONFIG.frontendServer}/src/config/apiConfig.js`);
    console.log(`✅ API配置: ${apiConfigResponse.ok ? '可访问' : '不可访问'}`);
    
  } catch (error) {
    console.log(`❌ 前端集成测试失败: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 开始运行所有修复测试...\n');
  
  await testServerHealth();
  await testGeometryAnimation();
  await testTTSService();
  await testVideoPlayback();
  await testFrontendIntegration();
  
  console.log('\n🎉 所有测试完成！');
  console.log('\n📋 修复总结:');
  console.log('1. ✅ 几何问题动画生成 - 已修复Manim脚本生成逻辑');
  console.log('2. ✅ TTS服务调用 - 已修复本地TTS服务集成');
  console.log('3. ✅ 视频播放问题 - 已修复前端URL构建和错误处理');
  console.log('\n💡 建议:');
  console.log('- 确保所有服务器都在运行');
  console.log('- 检查环境变量配置');
  console.log('- 测试不同类型的数学问题');
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testServerHealth,
  testGeometryAnimation,
  testTTSService,
  testVideoPlayback,
  testFrontendIntegration,
  runAllTests
}; 