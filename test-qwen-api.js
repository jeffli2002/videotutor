const fetch = require('node-fetch');

// 配置你的API密钥
const QWEN_API_KEY = 'your-api-key-here'; // 请替换为你的实际API密钥

async function testQwenAPI() {
    console.log('🤖 开始测试通义千问API连接...\n');
    
    if (!QWEN_API_KEY || QWEN_API_KEY === 'your-api-key-here') {
        console.log('❌ 请先在脚本中设置你的API密钥');
        console.log('请将第4行的 QWEN_API_KEY 设置为你的实际密钥\n');
        return;
    }

    try {
        // 基础连接测试
        console.log('📡 测试1: 基础连接测试');
        
        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${QWEN_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'qwen-plus',
                input: {
                    messages: [
                        {
                            role: 'user',
                            content: '你好！请简单介绍一下你自己。'
                        }
                    ]
                },
                parameters: {
                    temperature: 0.1,
                    max_tokens: 200
                }
            })
        });

        console.log(`状态码: ${response.status}`);
        
        const data = await response.json();
        
        if (response.ok && data.output) {
            console.log('✅ 基础连接测试成功！');
            console.log('🤖 AI回答:', data.output.text);
            console.log('📊 Token使用:', data.usage);
            console.log('');
            
            // 数学测试
            console.log('🧮 测试2: 数学解题测试');
            
            const mathResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${QWEN_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'qwen-plus',
                    input: {
                        messages: [
                            {
                                role: 'system',
                                content: '你是专业的K12数学老师，请用清晰的步骤解答数学问题。'
                            },
                            {
                                role: 'user',
                                content: '请解答：解方程 2x + 5 = 15，并说明每个步骤。'
                            }
                        ]
                    },
                    parameters: {
                        temperature: 0.05,
                        max_tokens: 500
                    }
                })
            });

            const mathData = await mathResponse.json();
            
            if (mathResponse.ok && mathData.output) {
                console.log('✅ 数学解题测试成功！');
                console.log('🧮 数学解答:');
                console.log(mathData.output.text);
                console.log('📊 Token使用:', mathData.usage);
                
                // 计算成本
                const totalTokens = (data.usage?.total_tokens || 0) + (mathData.usage?.total_tokens || 0);
                const cost = (totalTokens * 0.004 / 1000);
                
                console.log('\n💰 成本统计:');
                console.log(`总Token使用: ${totalTokens}`);
                console.log(`预估成本: ¥${cost.toFixed(6)} (约$${(cost * 0.15).toFixed(6)})`);
                console.log('\n🎉 所有测试通过！你的API配置正确。');
                
            } else {
                console.log('❌ 数学测试失败:', mathData.message);
            }
            
        } else {
            console.log('❌ API调用失败');
            console.log('错误信息:', data.message || '未知错误');
            console.log('错误代码:', data.code);
            console.log('详细信息:', JSON.stringify(data, null, 2));
        }
        
    } catch (error) {
        console.log('❌ 连接失败:', error.message);
        console.log('请检查:');
        console.log('1. API密钥是否正确');
        console.log('2. 网络连接是否正常');
        console.log('3. 是否安装了node-fetch: npm install node-fetch');
    }
}

// 运行测试
testQwenAPI();