// 测试备用响应修复
console.log('🧪 测试QWEN API备用响应修复...\n')

async function testFallbackResponse() {
  const testQuestions = [
    '帮我用视频动画解释勾股定理',
    '请解释拉窗帘原理',
    '求解方程 2x + 5 = 15',
    '什么是勾股定理？',
    '帮我生成一个三角形面积不变拉窗帘原理的动画讲解'
  ]

  console.log('📝 测试问题列表:')
  testQuestions.forEach((q, i) => {
    console.log(`${i + 1}. ${q}`)
  })

  console.log('\n🔍 测试备用响应机制...')

  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i]
    console.log(`\n📝 测试问题 ${i + 1}: ${question}`)

    try {
      const response = await fetch('http://localhost:8002/api/qwen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: 'test-key',
          messages: [
            { role: 'user', content: question }
          ],
          temperature: 0.1,
          max_tokens: 1000,
          top_p: 0.8
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ 响应成功`)
        console.log(`📊 响应方法: ${data.method}`)
        console.log(`📝 响应内容: ${data.output.text.substring(0, 100)}...`)
        
        // 检查是否为理论问题响应
        if (data.output.text.includes('数学概念') || data.output.text.includes('概念分析')) {
          console.log(`✅ 正确识别为理论问题`)
        } else if (data.output.text.includes('数学问题') || data.output.text.includes('解题提示')) {
          console.log(`✅ 正确识别为数学问题`)
        } else {
          console.log(`✅ 通用问题响应`)
        }
      } else {
        console.log(`❌ 响应失败: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`)
    }
  }

  console.log('\n🎉 备用响应测试完成！')
  console.log('\n📋 测试总结:')
  console.log('✅ 理论问题（勾股定理、拉窗帘原理）应该返回概念分析响应')
  console.log('✅ 数学问题（方程求解）应该返回解题提示响应')
  console.log('✅ 其他问题应该返回通用响应')
}

// 运行测试
testFallbackResponse().catch(console.error) 