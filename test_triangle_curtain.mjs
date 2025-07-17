import { execSync } from 'child_process';
import fs from 'fs';

console.log('🎬 测试三角形面积拉窗帘原理视频生成...\n');

// 测试配置
const testConfig = {
  topic: '三角形面积的拉窗帘原理',
  grade: '八年级',
  difficulty: '中等',
  steps: 4
};

console.log('📋 测试配置:');
console.log(`  主题: ${testConfig.topic}`);
console.log(`  年级: ${testConfig.grade}`);
console.log(`  难度: ${testConfig.difficulty}`);
console.log(`  步骤数: ${testConfig.steps}\n`);

try {
  // 1. 测试API连接
  console.log('🔍 步骤1: 测试API连接...');
  try {
    const apiTest = execSync('powershell -Command "Invoke-WebRequest -Uri \\"http://localhost:8002/api/qwen\\" -Method POST -Headers @{\\"Content-Type\\"=\\"application/json\\"} -Body \\"{\\\\\\"messages\\\\\\":[{\\\\\\"role\\\\\\":\\\\\\"user\\\\\\",\\\\\\"content\\\\\\":\\\\\\"请解释三角形面积的拉窗帘原理\\\\\\"}],\\\\\\"api_key\\\\\\":\\\\\\"sk-1899f...\\\\\\"}\\" | Select-Object -ExpandProperty StatusCode"', { encoding: 'utf8' });
    console.log(`✅ API连接正常，状态码: ${apiTest.trim()}\n`);
  } catch (error) {
    console.log('⚠️ API连接测试失败，但继续测试\n');
  }

  // 2. 测试Manim服务器
  console.log('🔍 步骤2: 测试Manim服务器...');
  try {
    const manimTest = execSync('powershell -Command "Invoke-WebRequest -Uri \\"http://localhost:5001/api/manim_render\\" -Method POST -Headers @{\\"Content-Type\\"=\\"application/json\\"} -Body \\"{\\\\\\"video_id\\\\\\":\\\\\\"test_curtain\\\\\\",\\\\\\"script\\\\\\":\\\\\\"from manim import *\\\\n\\\\nclass TriangleCurtain(Scene):\\\\n    def construct(self):\\\\n        # 创建三角形\\\\n        triangle = Polygon([-2, -1, 0], [2, -1, 0], [0, 2, 0], color=BLUE)\\\\n        self.play(Create(triangle))\\\\n        self.wait(1)\\\\n\\\\n        # 显示面积公式\\\\n        formula = MathTex(r\\\\"S = \\\\frac{1}{2} \\\\times b \\\\times h\\\\")\\\\n        formula.to_edge(UP)\\\\n        self.play(Write(formula))\\\\n        self.wait(2)\\\\n\\\\n        # 拉窗帘效果\\\\n        curtain = Rectangle(height=4, width=0.1, color=RED)\\\\n        curtain.move_to([-2, 0, 0])\\\\n        self.play(Create(curtain))\\\\n        self.wait(1)\\\\n\\\\n        # 移动窗帘\\\\n        self.play(curtain.animate.move_to([2, 0, 0]), run_time=3)\\\\n        self.wait(2)\\\\n\\\\n        # 显示最终结果\\\\n        result = Text(\\\\"拉窗帘原理：面积 = 底边 × 高\\\\", font_size=36)\\\\n        result.to_edge(DOWN)\\\\n        self.play(Write(result))\\\\n        self.wait(3)\\\\n\\\\",\\\\\\"steps\\\\\\":[\\\\\\"创建三角形\\\\\\",\\\\\\"显示面积公式\\\\\\",\\\\\\"演示拉窗帘效果\\\\\\",\\\\\\"总结原理\\\\\\"]}\\" | Select-Object -ExpandProperty StatusCode"', { encoding: 'utf8' });
    console.log(`✅ Manim服务器正常，状态码: ${manimTest.trim()}\n`);
  } catch (error) {
    console.log('⚠️ Manim服务器测试失败，但继续测试\n');
  }

  // 3. 检查前端服务
  console.log('🔍 步骤3: 检查前端服务...');
  try {
    const frontendTest = execSync('powershell -Command "Invoke-WebRequest -Uri \\"http://localhost:5173\\" -Method GET | Select-Object -ExpandProperty StatusCode"', { encoding: 'utf8' });
    console.log(`✅ 前端服务正常，状态码: ${frontendTest.trim()}\n`);
  } catch (error) {
    console.log('⚠️ 前端服务未运行\n');
  }

  // 4. 检查生成的文件
  console.log('🔍 步骤4: 检查生成的文件...');
  const renderedDir = './rendered_videos';
  if (fs.existsSync(renderedDir)) {
    const files = fs.readdirSync(renderedDir);
    console.log(`✅ 渲染目录存在，包含 ${files.length} 个文件`);
    if (files.length > 0) {
      console.log('📁 最新文件:');
      files.slice(-3).forEach(file => {
        const stats = fs.statSync(`${renderedDir}/${file}`);
        console.log(`   ${file} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`);
      });
    }
  } else {
    console.log('⚠️ 渲染目录不存在');
  }

  console.log('\n🎉 测试完成！');
  console.log('\n📝 建议:');
  console.log('1. 刷新前端页面: http://localhost:5173/videotutor/');
  console.log('2. 重新尝试生成三角形面积拉窗帘原理视频');
  console.log('3. 如果仍有问题，检查浏览器控制台错误信息');

} catch (error) {
  console.error('❌ 测试过程中出现错误:', error.message);
} 