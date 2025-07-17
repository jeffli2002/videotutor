import fetch from 'node-fetch';

console.log('🔍 测试QWEN API连接...\n');

async function testQwenAPI() {
  const testData = {
    messages: [
      {
        role: "user",
        content: "请解释三角形面积的拉窗帘原理"
      }
    ],
    api_key: "sk-1899f..."
  };

  try {
    console.log('📡 发送请求到: http://localhost:8002/api/qwen');
    console.log('📄 请求数据:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:8002/api/qwen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 响应状态:', response.status, response.statusText);
    console.log('📊 响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 服务器错误:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API调用成功!');
    console.log('📄 响应数据:', JSON.stringify(data, null, 2));

    if (data.output && data.output.text) {
      console.log('\n🎯 AI回答内容:');
      console.log(data.output.text.substring(0, 200) + '...');
    }

  } catch (error) {
    console.error('❌ API调用失败:', error.message);
    console.error('🔍 错误详情:', error);
  }
}

testQwenAPI(); 