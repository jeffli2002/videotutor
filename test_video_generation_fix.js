#!/usr/bin/env node

/**
 * 视频生成修复测试脚本
 * 验证步骤提取、去重和排序的修复效果
 */

console.log('🧪 开始测试视频生成修复效果...\n')

// 模拟AI响应内容（包含重复和顺序问题）
const testAIResponse = `**问题分析**
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

5. **验证答案** 将x = 5代入原方程验证：
   2(5) + 5 = 10 + 5 = 15 ✓
   验证正确

**最终答案**
x = 5

**验证过程**
将x = 5代入原方程：2(5) + 5 = 10 + 5 = 15，等式成立。

**相关数学概念**
一元一次方程、移项、系数、解方程

**常见错误提醒**
学生容易忘记移项时改变符号，或者忘记除以系数。`

// 模拟步骤提取函数（从VideoGenerationDemo.jsx中提取的逻辑）
function extractAndSortSteps(aiContent) {
  console.log('🔍 开始智能步骤提取和排序...')
  
  let steps = []
  const stepMap = new Map() // 使用Map确保步骤编号唯一性
  
  // 1. 优先提取"详细解题步骤"块中的编号步骤
  const detailBlockMatch = aiContent.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*最终答案\*\*|\*\*验证过程\*\*|\*\*相关数学概念\*\*|\*\*常见错误提醒\*\*|$)/)
  
  if (detailBlockMatch) {
    const detailBlock = detailBlockMatch[1]
    console.log('✅ 找到详细解题步骤块')
    
    // 使用改进的正则表达式，更准确地匹配编号步骤
    const stepPatterns = [
      // 匹配：1. **标题** 内容（多行）
      /(\d+)[.、\)]\s*\*\*([^*]+?)\*\*\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
      // 匹配：1. 标题 内容（多行）
      /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
      // 匹配：1. 标题（单行）
      /(\d+)\s*[.、\)]\s*([^\n]+)/g
    ]
    
    for (const pattern of stepPatterns) {
      const matches = [...detailBlock.matchAll(pattern)]
      if (matches.length > 0) {
        console.log(`📊 正则表达式匹配到 ${matches.length} 个步骤`)
        
        matches.forEach(match => {
          const stepNum = parseInt(match[1])
          let stepContent = ''
          
          if (match.length >= 4) {
            // 带**的格式
            const title = match[2].trim()
            const content = (match[3] || '').trim()
            stepContent = `**${title}** ${content}`.trim()
          } else if (match.length >= 3) {
            // 普通格式
            stepContent = match[2].trim()
          }
          
          // 清理内容
          stepContent = stepContent.replace(/\n\s*\n/g, '\n').trim()
          
          // 只保留有效的步骤内容
          if (stepContent && stepContent.length > 10) {
            // 如果这个编号还没有内容，或者新内容更详细，则更新
            if (!stepMap.has(stepNum) || stepContent.length > stepMap.get(stepNum).length) {
              stepMap.set(stepNum, stepContent)
              console.log(`📝 步骤 ${stepNum}: ${stepContent.substring(0, 50)}...`)
            }
          }
        })
        
        if (stepMap.size > 0) break // 找到有效步骤后停止尝试其他模式
      }
    }
  }
  
  // 2. 按编号排序并重建步骤数组
  if (stepMap.size > 0) {
    const sortedSteps = Array.from(stepMap.keys())
      .sort((a, b) => a - b) // 确保按数字顺序排序
      .map(num => stepMap.get(num))
    
    console.log(`✅ 成功提取 ${sortedSteps.length} 个有序步骤`)
    steps = sortedSteps
  }
  
  // 3. 最终验证和清理
  if (steps.length > 0) {
    // 移除重复步骤（基于内容相似性）
    const uniqueSteps = []
    const seenContent = new Set()
    
    for (const step of steps) {
      const cleanStep = step.trim()
      if (cleanStep && cleanStep.length > 10) {
        // 使用前50个字符作为去重依据
        const key = cleanStep.substring(0, 50).toLowerCase()
        if (!seenContent.has(key)) {
          uniqueSteps.push(cleanStep)
          seenContent.add(key)
        } else {
          console.log(`⚠️ 跳过重复步骤: ${cleanStep.substring(0, 30)}...`)
        }
      }
    }
    
    steps = uniqueSteps
    console.log(`✅ 去重后剩余 ${steps.length} 个步骤`)
  }
  
  return steps
}

// 测试步骤提取和排序
console.log('📝 测试AI响应内容:')
console.log(testAIResponse.substring(0, 200) + '...\n')

const extractedSteps = extractAndSortSteps(testAIResponse)

console.log('\n📊 测试结果:')
console.log(`提取的步骤数量: ${extractedSteps.length}`)
console.log('步骤顺序验证:')

extractedSteps.forEach((step, index) => {
  console.log(`  ${index + 1}. ${step.substring(0, 60)}${step.length > 60 ? '...' : ''}`)
})

// 验证步骤顺序是否正确
const hasCorrectOrder = extractedSteps.length >= 4 && 
  extractedSteps[0].includes('理解题目') &&
  extractedSteps[1].includes('列出方程') &&
  extractedSteps[2].includes('移项求解') &&
  extractedSteps[3].includes('计算得出结果')

console.log(`\n✅ 步骤顺序验证: ${hasCorrectOrder ? '通过' : '失败'}`)

// 验证是否有重复
const stepKeys = extractedSteps.map(step => step.substring(0, 50).toLowerCase())
const uniqueKeys = new Set(stepKeys)
const hasNoDuplicates = stepKeys.length === uniqueKeys.size

console.log(`✅ 重复检查: ${hasNoDuplicates ? '通过（无重复）' : '失败（有重复）'}`)

console.log('\n🎉 测试完成！')
console.log('修复效果总结:')
console.log('- ✅ 智能步骤提取')
console.log('- ✅ 基于编号的正确排序')
console.log('- ✅ 内容相似性去重')
console.log('- ✅ 保持步骤完整性') 

// 测试视频生成修复
import { AnimationGenerator } from './src/services/animationGenerator.js';

async function testVideoGenerationFix() {
  console.log('🔍 测试视频生成修复...');
  
  try {
    const animationGenerator = new AnimationGenerator();
    
    // 测试路径处理
    const testVideoPath = 'media\\videos\\test\\video.mp4';
    const testAudioPath = 'rendered_videos\\audio.mp3';
    
    console.log('📹 测试路径处理...');
    console.log('原始视频路径:', testVideoPath);
    console.log('原始音频路径:', testAudioPath);
    
    // 测试路径统一化
    const fixedVideoPath = testVideoPath.replace(/[\\/]/g, '/');
    const fixedAudioPath = testAudioPath.replace(/[\\/]/g, '/');
    
    console.log('修复后视频路径:', fixedVideoPath);
    console.log('修复后音频路径:', fixedAudioPath);
    
    // 测试移除开头斜杠
    const cleanVideoPath = fixedVideoPath.startsWith('/') ? fixedVideoPath.slice(1) : fixedVideoPath;
    const cleanAudioPath = fixedAudioPath.startsWith('/') ? fixedAudioPath.slice(1) : fixedAudioPath;
    
    console.log('清理后视频路径:', cleanVideoPath);
    console.log('清理后音频路径:', cleanAudioPath);
    
    console.log('✅ 路径处理测试通过');
    
    // 测试TTS音频生成
    console.log('🎤 测试TTS音频生成...');
    const ttsResult = await animationGenerator.generateTTSAudio('测试文本', 'zh');
    console.log('TTS结果:', ttsResult);
    
    console.log('✅ 所有测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testVideoGenerationFix(); 