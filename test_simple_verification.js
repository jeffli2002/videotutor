// 简单验证测试脚本
import { QuestionAnalyzer } from './src/services/questionAnalyzer.js'

console.log('🧪 简单验证测试开始...\n')

const analyzer = new QuestionAnalyzer()

// 测试拉窗帘原理问题
const testQuestion = '帮我生成一个三角形面积不变拉窗帘原理的动画讲解。'
console.log('📝 测试问题:', testQuestion)

const analysis = analyzer.analyzeQuestionType(testQuestion)

console.log('\n🔍 分析结果:')
console.log(`  类型: ${analysis.type}`)
console.log(`  置信度: ${analysis.confidence}`)
console.log(`  推理: ${analysis.reasoning}`)
console.log(`  理论问题: ${analysis.isTheoreticalQuestion}`)
console.log(`  具体问题: ${analysis.isConcreteProblem}`)

// 验证结果
if (analysis.type === 'theoretical_question' && analysis.isTheoreticalQuestion) {
  console.log('\n✅ 测试通过！问题类型分析正确')
  console.log('✅ 拉窗帘原理被正确识别为理论问题')
  console.log('✅ 系统已准备就绪，可以处理理论问题')
} else {
  console.log('\n❌ 测试失败！问题类型分析错误')
}

// 测试服务连通性
console.log('\n🌐 测试服务连通性...')

async function testServices() {
  const services = [
    { url: 'http://localhost:8002/api/qwen', name: 'QWEN API' },
    { url: 'http://localhost:5001/api/manim_render', name: 'Manim API' },
    { url: 'http://localhost:8003/api/tts', name: 'TTS Service' }
  ]

  let availableCount = 0
  
  for (const service of services) {
    try {
      const response = await fetch(service.url, { 
        method: 'OPTIONS',
        signal: AbortSignal.timeout(3000) // 3秒超时
      })
      if (response.ok) {
        console.log(`✅ ${service.name} 可访问`)
        availableCount++
      } else {
        console.log(`⚠️ ${service.name} 响应错误: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ ${service.name} 连接失败: ${error.message}`)
    }
  }

  console.log(`\n📊 服务状态: ${availableCount}/${services.length} 个服务可访问`)
  
  if (availableCount >= 2) {
    console.log('✅ 核心服务可用，系统可以运行')
  } else {
    console.log('⚠️ 部分服务不可用，请检查服务状态')
  }
}

testServices().then(() => {
  console.log('\n🎉 简单验证测试完成！')
  console.log('\n📋 下一步建议:')
  console.log('1. 访问 http://localhost:5173/videotutor/ 测试前端')
  console.log('2. 输入拉窗帘原理问题测试完整流程')
  console.log('3. 检查生成的动画和视频')
}).catch(console.error) 