// 测试环境变量是否正确设置
console.log('🔍 检查环境变量...')

// 检查Node.js环境变量
console.log('📋 Node.js环境变量:')
console.log('QWEN_API_KEY:', process.env.QWEN_API_KEY ? '***已配置***' : '未配置')
console.log('VITE_QWEN_API_KEY:', process.env.VITE_QWEN_API_KEY ? '***已配置***' : '未配置')

// 检查所有包含QWEN的环境变量
const qwenVars = Object.keys(process.env).filter(key => key.includes('QWEN'))
console.log('🔍 所有QWEN相关环境变量:', qwenVars)

// 测试API密钥格式
const apiKey = process.env.VITE_QWEN_API_KEY || process.env.QWEN_API_KEY
if (apiKey) {
    console.log('✅ API密钥格式检查:', {
        length: apiKey.length,
        startsWithSk: apiKey.startsWith('sk-'),
        isValid: apiKey.length > 20 && apiKey.startsWith('sk-')
    })
} else {
    console.log('❌ 未找到API密钥')
}

console.log('🏁 环境变量检查完成') 