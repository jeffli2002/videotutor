// 完整的AI生成端到端测试
import { MathVideoAIService } from './src/services/mathVideoAI.js'

async function testCompleteAIGeneration() {
  console.log('🚀 开始完整的AI生成端到端测试...')
  
  const mathVideoAI = new MathVideoAIService()
  
  // 测试不同主题的问题
  const testCases = [
    {
      question: '请解释什么是导数？',
      solution: '导数是微积分中的基本概念，表示函数在某一点的瞬时变化率。它描述了函数图像在该点的切线斜率。导数的几何意义是函数图像在该点的切线斜率，物理意义是瞬时速度或瞬时变化率。',
      description: '微积分主题 - 导数概念'
    },
    {
      question: '帮我生成一个关于概率分布的动画讲解',
      solution: '概率分布描述了随机变量取不同值的概率。常见的概率分布包括正态分布、二项分布、泊松分布等。正态分布是最重要的连续概率分布，具有钟形曲线特征。',
      description: '统计主题 - 概率分布'
    },
    {
      question: '什么是三角函数？',
      solution: '三角函数是数学中重要的函数类型，包括正弦、余弦、正切等。它们在几何、物理等领域有广泛应用。正弦函数描述周期性的波动，余弦函数是正弦函数的相位移动。',
      description: '三角函数主题'
    },
    {
      question: '请解释因式分解的方法',
      solution: '因式分解是将多项式表示为几个因式乘积的过程。常用的方法包括提取公因式、公式法、分组分解法等。因式分解在解方程、化简表达式等方面有重要应用。',
      description: '代数主题 - 因式分解'
    }
  ]
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log('\n' + '='.repeat(80))
    console.log(`🎬 测试 ${i + 1}/${testCases.length}: ${testCase.description}`)
    console.log(`📝 问题: ${testCase.question}`)
    
    try {
      console.log('🤖 开始生成数学视频...')
      const startTime = Date.now()
      
      // 调用完整的视频生成服务
      const result = await mathVideoAI.generateMathVideo(
        testCase.question,
        testCase.solution,
        'zh'
      )
      
      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000
      
      console.log('✅ 视频生成完成!')
      console.log(`⏱️ 总耗时: ${duration.toFixed(2)}秒`)
      
      if (result && result.length > 0) {
        const video = result[0]
        console.log('📊 生成结果:')
        console.log(`  动画类型: ${video.animationType}`)
        console.log(`  视频路径: ${video.videoPath}`)
        console.log(`  音频路径: ${video.audioPath || '无'}`)
        console.log(`  持续时间: ${video.duration}秒`)
        console.log(`  主题: ${video.topic || '未知'}`)
        console.log(`  AI生成: ${video.aiGenerated ? '是' : '否'}`)
        console.log(`  数学内容: ${video.mathContent?.substring(0, 100)}...`)
        
        // 检查文件是否存在
        if (video.videoPath) {
          console.log('📁 检查生成的文件...')
          try {
            const fs = await import('fs')
            const exists = fs.existsSync(video.videoPath)
            console.log(`  视频文件存在: ${exists ? '✅' : '❌'}`)
            
            if (exists) {
              const stats = fs.statSync(video.videoPath)
              console.log(`  文件大小: ${(stats.size / 1024).toFixed(2)} KB`)
            }
          } catch (error) {
            console.log('  文件检查失败:', error.message)
          }
        }
        
      } else {
        console.log('❌ 没有生成视频结果')
      }
      
    } catch (error) {
      console.error('❌ 视频生成失败:', error.message)
      console.error('错误详情:', error)
    }
    
    // 等待一下再进行下一个测试
    if (i < testCases.length - 1) {
      console.log('⏳ 等待5秒后进行下一个测试...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('🎉 完整的AI生成端到端测试完成!')
  console.log('📊 测试总结:')
  console.log(`  总测试数: ${testCases.length}`)
  console.log('  请检查生成的视频文件质量和内容')
}

// 运行测试
testCompleteAIGeneration().catch(console.error) 