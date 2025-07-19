// 全面测试套件 - 覆盖所有类型的问题，验证AI生成的脚本、TTS和视频生成播放功能
import { MathVideoAIService } from './src/services/mathVideoAI.js'

// 测试用例集合
const testCases = [
  // 1. 理论问题 - 几何概念
  {
    category: '理论问题 - 几何概念',
    question: '请解释勾股定理',
    solution: '勾股定理是直角三角形中，直角边的平方和等于斜边的平方。即 a² + b² = c²。',
    description: '基础几何定理解释'
  },
  
  // 2. 理论问题 - 代数概念
  {
    category: '理论问题 - 代数概念',
    question: '什么是二次函数？',
    solution: '二次函数是形如 f(x) = ax² + bx + c 的函数，其中 a ≠ 0。它的图像是一条抛物线。',
    description: '代数函数概念'
  },
  
  // 3. 计算问题 - 方程求解
  {
    category: '计算问题 - 方程求解',
    question: '求解方程 2x + 5 = 15',
    solution: '步骤1：2x + 5 = 15\n步骤2：2x = 15 - 5\n步骤3：2x = 10\n步骤4：x = 5',
    description: '一元一次方程求解'
  },
  
  // 4. 计算问题 - 几何计算
  {
    category: '计算问题 - 几何计算',
    question: '计算边长为3、4、5的三角形的面积',
    solution: '这是一个直角三角形，面积 = 底边 × 高 ÷ 2 = 3 × 4 ÷ 2 = 6',
    description: '三角形面积计算'
  },
  
  // 5. 证明问题 - 几何证明
  {
    category: '证明问题 - 几何证明',
    question: '证明等腰三角形的两底角相等',
    solution: '在等腰三角形中，两腰相等，根据等边对等角定理，两底角相等。',
    description: '几何定理证明'
  },
  
  // 6. 应用题 - 实际问题
  {
    category: '应用题 - 实际问题',
    question: '一个长方形的长是8米，宽是6米，求其面积和周长',
    solution: '面积 = 长 × 宽 = 8 × 6 = 48平方米\n周长 = 2(长 + 宽) = 2(8 + 6) = 28米',
    description: '实际应用计算'
  },
  
  // 7. 复杂问题 - 多步骤
  {
    category: '复杂问题 - 多步骤',
    question: '解方程组：x + y = 10, 2x - y = 4',
    solution: '步骤1：从第一个方程得 y = 10 - x\n步骤2：代入第二个方程：2x - (10 - x) = 4\n步骤3：2x - 10 + x = 4\n步骤4：3x = 14\n步骤5：x = 14/3\n步骤6：y = 10 - 14/3 = 16/3',
    description: '二元一次方程组'
  },
  
  // 8. 特殊问题 - 拉窗帘原理
  {
    category: '特殊问题 - 拉窗帘原理',
    question: '解释三角形面积不变的拉窗帘原理',
    solution: '拉窗帘原理：当三角形的底边固定，顶点在平行于底边的直线上移动时，三角形的高保持不变，因此面积不变。',
    description: '特殊几何原理'
  }
]

// 测试结果统计
let testResults = {
  total: 0,
  success: 0,
  failed: 0,
  details: []
}

// 主测试函数
async function runComprehensiveTest() {
  console.log('🎯 开始全面测试套件...')
  console.log('=' * 60)
  
  const mathVideoAI = new MathVideoAIService()
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`\n📋 测试 ${i + 1}/${testCases.length}: ${testCase.category}`)
    console.log(`📝 问题: ${testCase.question}`)
    console.log(`📚 解答: ${testCase.solution.substring(0, 50)}...`)
    
    testResults.total++
    
    try {
      const startTime = Date.now()
      
      // 调用视频生成服务
      const result = await mathVideoAI.generateMathVideo(
        testCase.question,
        testCase.solution,
        'zh'
      )
      
      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000
      
      // 验证结果
      const validation = await validateTestResult(result, testCase, duration)
      
      if (validation.success) {
        testResults.success++
        console.log(`✅ 测试通过 (${duration.toFixed(2)}s)`)
        console.log(`   🎬 视频文件: ${validation.videoFile}`)
        console.log(`   🎤 音频文件: ${validation.audioFile}`)
        console.log(`   📄 脚本文件: ${validation.scriptFile}`)
      } else {
        testResults.failed++
        console.log(`❌ 测试失败: ${validation.error}`)
      }
      
      testResults.details.push({
        category: testCase.category,
        question: testCase.question,
        success: validation.success,
        duration: duration,
        error: validation.error,
        files: validation.files
      })
      
    } catch (error) {
      testResults.failed++
      console.log(`❌ 测试异常: ${error.message}`)
      testResults.details.push({
        category: testCase.category,
        question: testCase.question,
        success: false,
        error: error.message
      })
    }
    
    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // 生成测试报告
  await generateTestReport()
}

// 验证测试结果
async function validateTestResult(result, testCase, duration) {
  const fs = await import('fs')
  
  try {
    // 检查返回结果
    if (!result || !result.success) {
      return {
        success: false,
        error: '视频生成失败',
        files: {}
      }
    }
    
    // 检查生成的文件
    const files = {}
    let hasVideo = false
    let hasAudio = false
    let hasScript = false
    
    // 检查视频文件
    if (result.video_path && fs.existsSync(result.video_path)) {
      const videoStats = fs.statSync(result.video_path)
      files.video = {
        path: result.video_path,
        size: videoStats.size,
        sizeKB: (videoStats.size / 1024).toFixed(2)
      }
      hasVideo = true
    }
    
    // 检查音频文件
    if (result.audio_path && fs.existsSync(result.audio_path)) {
      const audioStats = fs.statSync(result.audio_path)
      files.audio = {
        path: result.audio_path,
        size: audioStats.size,
        sizeKB: (audioStats.size / 1024).toFixed(2)
      }
      hasAudio = true
    }
    
    // 检查脚本文件
    const scriptPath = result.script_path || `rendered_videos/manim_script_${Date.now()}.py`
    if (fs.existsSync(scriptPath)) {
      const scriptStats = fs.statSync(scriptPath)
      files.script = {
        path: scriptPath,
        size: scriptStats.size,
        sizeKB: (scriptStats.size / 1024).toFixed(2)
      }
      hasScript = true
    }
    
    // 验证文件质量
    const validation = {
      success: hasVideo && hasAudio && hasScript,
      duration: duration,
      files: files,
      videoFile: hasVideo ? `${files.video.sizeKB}KB` : '未生成',
      audioFile: hasAudio ? `${files.audio.sizeKB}KB` : '未生成',
      scriptFile: hasScript ? `${files.script.sizeKB}KB` : '未生成'
    }
    
    if (!validation.success) {
      validation.error = `缺少必要文件: 视频=${hasVideo}, 音频=${hasAudio}, 脚本=${hasScript}`
    }
    
    return validation
    
  } catch (error) {
    return {
      success: false,
      error: `验证异常: ${error.message}`,
      files: {}
    }
  }
}

// 生成测试报告
async function generateTestReport() {
  console.log('\n' + '=' * 60)
  console.log('📊 全面测试报告')
  console.log('=' * 60)
  
  console.log(`\n📈 总体统计:`)
  console.log(`   总测试数: ${testResults.total}`)
  console.log(`   成功数: ${testResults.success}`)
  console.log(`   失败数: ${testResults.failed}`)
  console.log(`   成功率: ${((testResults.success / testResults.total) * 100).toFixed(2)}%`)
  
  console.log(`\n📋 详细结果:`)
  testResults.details.forEach((detail, index) => {
    const status = detail.success ? '✅' : '❌'
    const duration = detail.duration ? `(${detail.duration.toFixed(2)}s)` : ''
    console.log(`   ${status} ${index + 1}. ${detail.category} ${duration}`)
    if (!detail.success && detail.error) {
      console.log(`      ❌ 错误: ${detail.error}`)
    }
    if (detail.files && detail.files.video) {
      console.log(`      🎬 视频: ${detail.files.video.sizeKB}KB`)
    }
  })
  
  // 按类别统计
  const categoryStats = {}
  testResults.details.forEach(detail => {
    if (!categoryStats[detail.category]) {
      categoryStats[detail.category] = { total: 0, success: 0 }
    }
    categoryStats[detail.category].total++
    if (detail.success) {
      categoryStats[detail.category].success++
    }
  })
  
  console.log(`\n📊 按类别统计:`)
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const successRate = ((stats.success / stats.total) * 100).toFixed(2)
    console.log(`   ${category}: ${stats.success}/${stats.total} (${successRate}%)`)
  })
  
  // 保存报告到文件
  const fs = await import('fs')
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      success: testResults.success,
      failed: testResults.failed,
      successRate: ((testResults.success / testResults.total) * 100).toFixed(2)
    },
    categoryStats: categoryStats,
    details: testResults.details
  }
  
  const reportPath = `comprehensive_test_report_${Date.now()}.json`
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 详细报告已保存到: ${reportPath}`)
  
  // 最终结论
  console.log(`\n🎯 测试结论:`)
  if (testResults.success === testResults.total) {
    console.log(`   🎉 所有测试通过！系统运行正常。`)
  } else if (testResults.success > testResults.total * 0.8) {
    console.log(`   ✅ 大部分测试通过，系统基本正常，需要关注失败案例。`)
  } else {
    console.log(`   ⚠️ 较多测试失败，需要检查系统配置和依赖服务。`)
  }
}

// 运行测试
runComprehensiveTest().catch(error => {
  console.error('❌ 测试套件执行失败:', error)
  process.exit(1)
})