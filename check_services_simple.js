// 简单服务状态检查脚本
console.log('🔍 检查所有服务状态...\n')

const services = [
  {
    name: 'QWEN API服务器',
    url: 'http://localhost:8002/api/qwen',
    method: 'POST',
    body: {
      model: 'qwen-turbo',
      messages: [{ role: 'user', content: '测试连接' }]
    }
  },
  {
    name: 'Manim API服务器',
    url: 'http://localhost:5001/api/animate',
    method: 'POST',
    body: {
      script: 'print("Hello World")',
      type: 'test'
    }
  },
  {
    name: 'TTS服务',
    url: 'http://localhost:8003/api/tts',
    method: 'POST',
    body: {
      text: '测试语音合成',
      language: 'zh'
    }
  },
  {
    name: '前端应用',
    url: 'http://localhost:5173',
    method: 'GET',
    body: null
  }
]

async function checkService(service) {
  try {
    console.log(`🔍 检查 ${service.name}...`)
    
    const options = {
      method: service.method,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    if (service.body && service.method !== 'GET') {
      options.body = JSON.stringify(service.body)
    }
    
    const response = await fetch(service.url, options)
    
    if (response.ok) {
      console.log(`✅ ${service.name} 运行正常`)
      return true
    } else {
      console.log(`⚠️ ${service.name} 响应异常: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ ${service.name} 连接失败: ${error.message}`)
    return false
  }
}

async function checkAllServices() {
  console.log('🚀 开始检查所有服务...\n')
  
  const results = await Promise.all(services.map(checkService))
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 服务状态总结')
  console.log('='.repeat(50))
  
  const successCount = results.filter(r => r).length
  const totalCount = services.length
  
  console.log(`总服务数: ${totalCount}`)
  console.log(`正常运行: ${successCount}`)
  console.log(`异常服务: ${totalCount - successCount}`)
  
  if (successCount === totalCount) {
    console.log('\n🎉 所有服务都正常运行！')
    console.log('\n📋 服务访问地址:')
    console.log('前端应用: http://localhost:5173')
    console.log('QWEN API: http://localhost:8002/api/qwen')
    console.log('Manim API: http://localhost:5001/api/animate')
    console.log('TTS服务: http://localhost:8003/api/tts')
  } else {
    console.log('\n⚠️ 部分服务异常，请检查配置')
  }
  
  console.log('\n✅ 服务检查完成！')
}

checkAllServices().catch(error => {
  console.error('❌ 服务检查失败:', error)
}) 