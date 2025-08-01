import { QuestionAnalyzer } from './src/services/questionAnalyzer.js'
import { readFileSync } from 'fs'
import { join } from 'path'

// 加载.env文件
try {
  const envPath = join(process.cwd(), '.env')
  const envContent = readFileSync(envPath, 'utf8')
  
  // 解析.env文件内容
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      if (!key.startsWith('#') && value) {
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '')
      }
    }
  })
  console.log('✅ 成功加载.env文件')
} catch (error) {
  console.log('⚠️ 无法加载.env文件，使用默认配置')
  process.env.VITE_KIMI_API_KEY = 'your-kimi-api-key-here'
  process.env.VITE_KIMI_API_ENDPOINT = 'https://api.moonshot.cn/v1/chat/completions'
}

async function testCompleteVideoGeneration() {
  console.log('🎬 开始完整视频生成流程测试...')
  
  const questionAnalyzer = new QuestionAnalyzer()
  
  // 测试问题
  const testQuestions = [
    '求底边为8，高为6的三角形面积',
    '解方程：2x + 5 = 15',
    '计算圆的面积，半径是5'
  ]
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i]
    console.log(`\n📝 测试问题 ${i + 1}: ${question}`)
    
    try {
      // 1. 生成Manim脚本
      console.log('🤖 生成Manim脚本...')
      const script = await questionAnalyzer.generateManimScript(question)
      
      // 2. 分析脚本质量
      console.log('📊 分析脚本质量...')
      const quality = analyzeScriptQuality(script)
      
      // 3. 检查是否包含具体步骤
      console.log('🔍 检查解题步骤...')
      const steps = extractSteps(script)
      
      // 4. 输出结果
      console.log('✅ 脚本生成成功!')
      console.log('📊 质量指标:', quality)
      console.log('📋 包含步骤数:', steps.length)
      console.log('📝 步骤列表:', steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n'))
      
      // 5. 保存脚本到文件
      const filename = `test_script_${i + 1}_${Date.now()}.py`
      const fs = await import('fs')
      fs.writeFileSync(filename, script)
      console.log('💾 脚本已保存到:', filename)
      
    } catch (error) {
      console.error(`❌ 问题 ${i + 1} 处理失败:`, error.message)
    }
    
    // 添加延迟避免API限制
    if (i < testQuestions.length - 1) {
      console.log('⏳ 等待3秒...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  console.log('\n🎉 完整测试完成!')
}

function analyzeScriptQuality(script) {
  const checks = {
    hasImports: script.includes('from manim import'),
    hasConfig: script.includes('config.frame_rate') || script.includes('config.pixel_height'),
    hasClass: /class\s+\w+Scene\s*\(\s*Scene\s*\)/.test(script),
    hasConstruct: script.includes('def construct(self):'),
    hasTriangle: script.includes('Triangle') || script.includes('triangle'),
    hasCalculation: script.includes('Tex(') || script.includes('MathTex('),
    hasSteps: /步骤\d+/.test(script) || /Step\s*\d+/.test(script),
    hasFormula: script.includes('\\frac') || script.includes('\\times') || script.includes('='),
    isDetailed: script.length > 1000,
    hasGeometry: script.includes('Triangle') || script.includes('Circle') || script.includes('Rectangle')
  }
  
  const passed = Object.values(checks).filter(Boolean).length
  const total = Object.keys(checks).length
  
  return {
    score: `${passed}/${total}`,
    percentage: Math.round((passed / total) * 100),
    details: checks
  }
}

function extractSteps(script) {
  const stepPatterns = [
    /步骤\s*(\d+)[：:]\s*([^\n]+)/g,
    /Step\s*(\d+)[：:]\s*([^\n]+)/g,
    /#\s*步骤\s*(\d+)[：:]\s*([^\n]+)/g
  ]
  
  const steps = []
  
  stepPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(script)) !== null) {
      steps.push(match[2].trim())
    }
  })
  
  return steps
}

// 运行测试
testCompleteVideoGeneration().catch(console.error) 