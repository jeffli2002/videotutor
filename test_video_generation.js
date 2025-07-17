// 自动测试视频生成流程
import 'dotenv/config'
import fs from 'fs';
const testQuestions = [
  "解方程：2x + 5 = 15",
  "求底边为8，高为6的三角形面积",
  "化简：(3x + 2)(x - 4)",
  "解不等式：3x - 7 > 14",
  // 新增测试用例 - 测试更复杂的数学问题
  "计算：√(25 + 144)",
  "解二次方程：x² - 5x + 6 = 0",
  "求函数 f(x) = 2x + 3 在 x = 4 时的值"
];

async function testVideoGeneration() {
  console.log('🧪 开始自动测试视频生成流程...');
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`\n📝 测试 ${i + 1}/${testQuestions.length}: ${question}`);
    
    try {
      // 测试QWEN API调用
      console.log('🔍 测试QWEN API调用...');
      const qwenResponse = await testQwenAPI(question);
      console.log('✅ QWEN API调用成功');
      
      // 测试步骤提取
      console.log('🔍 测试步骤提取...');
      const steps = extractSteps(qwenResponse);
      console.log(`✅ 提取到 ${steps.length} 个步骤`);
      
      // 测试Manim渲染
      console.log('🔍 测试Manim渲染...');
      const videoUrl = await testManimRendering(question, steps);
      console.log(`✅ Manim渲染成功: ${videoUrl}`);
      
      console.log(`✅ 测试 ${i + 1} 完成`);
      
    } catch (error) {
      console.error(`❌ 测试 ${i + 1} 失败:`, error.message);
    }
    
    // 等待一段时间再进行下一个测试
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 所有测试完成！');
}

async function testQwenAPI(question) {
  // 读取本地环境变量
  const apiKey = process.env.VITE_QWEN_API_KEY || process.env.QWEN_API_KEY;
  if (!apiKey) {
    throw new Error('未配置VITE_QWEN_API_KEY环境变量，无法调用QWEN API');
  }
  const response = await fetch('http://localhost:8002/api/qwen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      messages: [{
        role: 'user',
        content: `请详细解答这个K12数学问题：

题目：${question}

请严格按照以下结构回答，确保每个步骤清晰明了，步骤之间不重复：

**问题分析**
简要分析题目类型和解题思路。

**详细解题步骤**
1. **第一步：理解题目**
   具体分析题目条件和要求...

2. **第二步：列出方程/公式**
   根据题目条件列出相应的数学表达式...

3. **第三步：求解过程**
   逐步计算，每步都要清晰...

4. **第四步：得出答案**
   给出最终答案...

**最终答案**
明确给出最终答案。

**验证过程**
验证答案的正确性。

注意：
- 每个步骤都要有明确的标题和具体内容
- 步骤之间不能重复
- 计算过程要详细清晰
- 最终答案要明确标注`
      }],
      model: 'qwen-plus',
      max_tokens: 2000
    })
  });
  
  if (!response.ok) {
    throw new Error(`QWEN API调用失败: ${response.status}`);
  }
  
  const data = await response.json();
  return data.output.text;
}

function extractSteps(aiResponse) {
  console.log('🔍 开始提取步骤...');
  console.log('📝 AI响应内容:', aiResponse.substring(0, 200) + '...');
  
  let steps = [];
  
  // 方法1：提取"详细解题步骤"块中的步骤 - 修复版本
  const detailedStepsMatch = aiResponse.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*最终答案\*\*|\*\*验证过程\*\*|\*\*相关数学概念\*\*|\*\*常见错误提醒\*\*|$)/);
  if (detailedStepsMatch) {
    console.log('✅ 找到详细解题步骤块');
    const stepsContent = detailedStepsMatch[1];
    console.log('📋 详细解题步骤块内容:', stepsContent.substring(0, 300) + '...');
    
    // 改进的正则表达式，更准确地匹配步骤
    const stepPattern = /(\d+)\.\s*\*\*([^*]+?)\*\*\s*([\s\S]*?)(?=(?:\d+\.\s*\*\*)|$)/g;
    let match;
    const tempSteps = [];
    
    while ((match = stepPattern.exec(stepsContent)) !== null) {
      const stepNumber = parseInt(match[1]);
      const stepTitle = match[2].trim();
      const stepContent = match[3].trim();
      
      // 清理内容，移除多余的换行和空格
      const cleanContent = stepContent
        .replace(/\n\s*\n/g, '\n')  // 移除多余空行
        .replace(/^\s+|\s+$/g, '')  // 移除首尾空格
        .substring(0, 300);  // 限制长度
      
      if (stepTitle && cleanContent) {
        tempSteps.push({
          number: stepNumber,
          title: stepTitle,
          content: cleanContent,
          originalOrder: tempSteps.length  // 保持原始顺序
        });
        
        console.log(`📋 提取步骤 ${stepNumber}: ${stepTitle}`);
        console.log(`📝 内容预览: ${cleanContent.substring(0, 80)}...`);
      }
    }
    
    // 按步骤编号排序，确保正确顺序
    steps = tempSteps.sort((a, b) => a.number - b.number);
    
    console.log(`📊 成功提取 ${steps.length} 个有序步骤`);
  }
  
  // 方法2：如果方法1失败，尝试简化的匹配模式
  if (steps.length === 0) {
    console.log('⚠️ 方法1失败，尝试方法2：简化匹配模式');
    
    // 查找所有编号行
    const numberedLines = stepsContent.match(/^\d+\.\s*.+$/gm);
    if (numberedLines && numberedLines.length > 0) {
      console.log(`📊 找到 ${numberedLines.length} 个编号行`);
      
      steps = numberedLines.map((line, index) => {
        const match = line.match(/^(\d+)\.\s*(.+)$/);
        if (match) {
          const stepNumber = parseInt(match[1]);
          const stepTitle = match[2].replace(/\*\*/g, '').trim();
          
          return {
            number: stepNumber,
            title: stepTitle,
            content: `${stepTitle}的详细解答过程`,
            originalOrder: index
          };
        }
        return null;
      }).filter(step => step !== null);
      
      // 按步骤编号排序
      steps.sort((a, b) => a.number - b.number);
    }
  }
  
  // 方法3：最后的备选方案
  if (steps.length === 0) {
    console.log('⚠️ 前两种方法都失败，使用默认步骤');
    steps = [
      { number: 1, title: '理解题目', content: '分析题目条件和要求', originalOrder: 0 },
      { number: 2, title: '列出公式', content: '根据题目条件列出相应的数学表达式', originalOrder: 1 },
      { number: 3, title: '求解过程', content: '逐步计算，每步都要清晰', originalOrder: 2 },
      { number: 4, title: '得出答案', content: '给出最终答案并验证', originalOrder: 3 }
    ];
  }
  
  // 严格去重 - 基于步骤编号，避免重复
  const uniqueSteps = [];
  const seenNumbers = new Set();
  
  for (const step of steps) {
    if (!seenNumbers.has(step.number)) {
      seenNumbers.add(step.number);
      uniqueSteps.push(step);
    } else {
      console.log(`⚠️ 跳过重复步骤 ${step.number}: ${step.title}`);
    }
  }
  
  // 最终排序确保顺序正确
  uniqueSteps.sort((a, b) => a.number - b.number);
  
  // 重新编号，确保连续性
  const finalSteps = uniqueSteps.map((step, index) => ({
    number: index + 1,
    title: step.title,
    content: step.content
  }));
  
  console.log(`✅ 最终提取到 ${finalSteps.length} 个有序步骤:`);
  finalSteps.forEach(step => {
    console.log(`  ${step.number}. ${step.title}`);
    console.log(`    内容: ${step.content.substring(0, 50)}${step.content.length > 50 ? '...' : ''}`);
  });
  
  return finalSteps;
}

async function testManimRendering(question, steps) {
  const manimScript = generateManimScript(question, steps);
  
  // 生成唯一的输出名称
  const timestamp = Date.now();
  const outputName = `test_video_${timestamp}`;
  
  const response = await fetch('http://localhost:5001/api/manim_render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script: manimScript,
      output_name: outputName,
      scene_name: "MathSolutionScene",
      quality: "high",
      fps: 30
    })
  });
  
  if (!response.ok) {
    throw new Error(`Manim渲染失败: ${response.status}`);
  }
  
  const data = await response.json();
  return data.video_path || data.video_url;
}

// 清理文本内容，移除LaTeX符号和格式化文本
function cleanTextForVideo(text) {
  if (!text) return '';
  
  return text
    // 移除LaTeX数学符号
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    // 移除LaTeX命令
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
    .replace(/\\[a-zA-Z]+/g, '')
    // 移除markdown格式
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // 移除多余的空格和换行
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    // 移除特殊字符
    .replace(/[{}]/g, '')
    .trim();
}

// 将长文本分割成多行
function splitTextIntoLines(text, maxLength = 40) {
  if (!text || text.length <= maxLength) return [text];
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxLength) {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3); // 最多3行
}

function generateManimScript(question, steps) {
  console.log('🎬 生成Manim脚本...');
  console.log(`📝 题目: ${question}`);
  console.log(`📊 步骤数量: ${steps.length}`);
  
  // 强制确保步骤按1,2,3,4顺序，无重复
  const step1 = steps.find(s => s.number === 1) || { title: '理解题目', content: '分析题目条件和要求' };
  const step2 = steps.find(s => s.number === 2) || { title: '列出公式', content: '根据题目列出数学表达式' };
  const step3 = steps.find(s => s.number === 3) || { title: '求解过程', content: '逐步计算求解' };
  const step4 = steps.find(s => s.number === 4) || { title: '得出答案', content: '给出最终答案' };
  
  // 清理文本
  const cleanStep1Title = cleanTextForVideo(step1.title);
  const cleanStep1Content = cleanTextForVideo(step1.content).substring(0, 80);
  const cleanStep2Title = cleanTextForVideo(step2.title);
  const cleanStep2Content = cleanTextForVideo(step2.content).substring(0, 80);
  const cleanStep3Title = cleanTextForVideo(step3.title);
  const cleanStep3Content = cleanTextForVideo(step3.content).substring(0, 80);
  const cleanStep4Title = cleanTextForVideo(step4.title);
  const cleanStep4Content = cleanTextForVideo(step4.content).substring(0, 80);
  const cleanQuestion = cleanTextForVideo(question).substring(0, 60);
  
  console.log('📋 最终步骤顺序:');
  console.log(`  1. ${cleanStep1Title}: ${cleanStep1Content.substring(0, 30)}...`);
  console.log(`  2. ${cleanStep2Title}: ${cleanStep2Content.substring(0, 30)}...`);
  console.log(`  3. ${cleanStep3Title}: ${cleanStep3Content.substring(0, 30)}...`);
  console.log(`  4. ${cleanStep4Title}: ${cleanStep4Content.substring(0, 30)}...`);
  
  // 生成简化的单一场景Manim脚本 - 避免多个partial videos
  const script = `from manim import *

class MathSolutionScene(Scene):
    def construct(self):
        # 设置背景
        self.camera.background_color = "#1a1a1a"
        
        # 创建所有文本对象
        title = Text("数学解题视频", font_size=36, color=WHITE)
        question_text = Text("${cleanQuestion}", font_size=24, color=YELLOW)
        
        # 步骤文本对象
        step1_num = Text("步骤 1", font_size=32, color=BLUE)
        step1_title = Text("${cleanStep1Title}", font_size=24, color=GREEN)
        step1_content = Text("${cleanStep1Content}", font_size=18, color=WHITE)
        
        step2_num = Text("步骤 2", font_size=32, color=BLUE)
        step2_title = Text("${cleanStep2Title}", font_size=24, color=GREEN)
        step2_content = Text("${cleanStep2Content}", font_size=18, color=WHITE)
        
        step3_num = Text("步骤 3", font_size=32, color=BLUE)
        step3_title = Text("${cleanStep3Title}", font_size=24, color=GREEN)
        step3_content = Text("${cleanStep3Content}", font_size=18, color=WHITE)
        
        step4_num = Text("步骤 4", font_size=32, color=BLUE)
        step4_title = Text("${cleanStep4Title}", font_size=24, color=GREEN)
        step4_content = Text("${cleanStep4Content}", font_size=18, color=WHITE)
        
        end_text = Text("解题完成!", font_size=28, color=GOLD)
        
        # 定位所有对象
        title.to_edge(UP)
        question_text.next_to(title, DOWN, buff=0.5)
        
        # 步骤1定位
        step1_num.to_edge(UP)
        step1_title.next_to(step1_num, DOWN, buff=0.5)
        step1_content.next_to(step1_title, DOWN, buff=0.3)
        
        # 步骤2定位
        step2_num.to_edge(UP)
        step2_title.next_to(step2_num, DOWN, buff=0.5)
        step2_content.next_to(step2_title, DOWN, buff=0.3)
        
        # 步骤3定位
        step3_num.to_edge(UP)
        step3_title.next_to(step3_num, DOWN, buff=0.5)
        step3_content.next_to(step3_title, DOWN, buff=0.3)
        
        # 步骤4定位
        step4_num.to_edge(UP)
        step4_title.next_to(step4_num, DOWN, buff=0.5)
        step4_content.next_to(step4_title, DOWN, buff=0.3)
        
        # 按顺序播放动画 - 单一连续场景
        # 标题页
        self.play(Write(title), run_time=1)
        self.play(Write(question_text), run_time=1)
        self.wait(2)
        self.play(FadeOut(title), FadeOut(question_text), run_time=0.5)
        
        # 步骤1 - 严格按顺序
        self.play(Write(step1_num), run_time=0.8)
        self.play(Write(step1_title), run_time=0.8)
        self.play(Write(step1_content), run_time=1)
        self.wait(3)
        self.play(FadeOut(step1_num), FadeOut(step1_title), FadeOut(step1_content), run_time=0.5)
        
        # 步骤2 - 严格按顺序
        self.play(Write(step2_num), run_time=0.8)
        self.play(Write(step2_title), run_time=0.8)
        self.play(Write(step2_content), run_time=1)
        self.wait(3)
        self.play(FadeOut(step2_num), FadeOut(step2_title), FadeOut(step2_content), run_time=0.5)
        
        # 步骤3 - 严格按顺序
        self.play(Write(step3_num), run_time=0.8)
        self.play(Write(step3_title), run_time=0.8)
        self.play(Write(step3_content), run_time=1)
        self.wait(3)
        self.play(FadeOut(step3_num), FadeOut(step3_title), FadeOut(step3_content), run_time=0.5)
        
        # 步骤4 - 严格按顺序
        self.play(Write(step4_num), run_time=0.8)
        self.play(Write(step4_title), run_time=0.8)
        self.play(Write(step4_content), run_time=1)
        self.wait(3)
        self.play(FadeOut(step4_num), FadeOut(step4_title), FadeOut(step4_content), run_time=0.5)
        
        # 结束页
        self.play(Write(end_text), run_time=1)
        self.wait(2)
        self.play(FadeOut(end_text), run_time=0.5)
`;
  
  console.log('✅ Manim脚本生成完成 - 单一场景，严格顺序1,2,3,4');
  return script;
}

// 检查视频文件是否存在的辅助函数
function checkVideoExists(outputName) {
  const possiblePaths = [
    `media/videos/${outputName}/2160p60/${outputName}.mp4`,
    `media/videos/${outputName}/1080p60/${outputName}.mp4`,
    `media/videos/${outputName}/1080p30/${outputName}.mp4`,
    `media/videos/${outputName}/720p30/${outputName}.mp4`,
    `rendered_videos/${outputName}.mp4`
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// 运行测试
testVideoGeneration().catch(console.error); 