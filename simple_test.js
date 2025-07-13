// 简单的API测试
async function testAPI() {
    console.log('🚀 开始API测试...');
    
    try {
        const testData = {
            api_key: 'sk-1899f80e08854bdcbe0b3bc64b661ef4',
            messages: [
                {
                    role: 'user',
                    content: '请简单回答：2 + 3 = ?'
                }
            ],
            temperature: 0.1,
            max_tokens: 100
        };
        
        console.log('📄 发送数据:', testData);
        
        const response = await fetch('http://127.0.0.1:8002/api/qwen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📊 响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ API调用成功:', data);
        
    } catch (error) {
        console.error('❌ API调用失败:', error);
        console.error('错误详情:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
}

// 运行测试
testAPI(); 