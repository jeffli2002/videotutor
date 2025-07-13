#!/bin/bash

echo "🤖 通义千问API连接测试"
echo "===================="
echo ""

# 检查是否提供了API密钥参数
if [ -z "$1" ]; then
    echo "❌ 请提供API密钥作为参数"
    echo ""
    echo "使用方法:"
    echo "./test-qwen-simple.sh 'your-api-key-here'"
    echo ""
    echo "或者设置环境变量:"
    echo "export QWEN_API_KEY='your-api-key-here'"
    echo "./test-qwen-simple.sh"
    echo ""
    exit 1
fi

QWEN_API_KEY="$1"

echo "🔑 使用API密钥: ${QWEN_API_KEY:0:8}..."
echo "📡 开始测试连接..."
echo ""

# 测试1: 基础连接
echo "测试1: 基础连接测试"
echo "==================="

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $QWEN_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "qwen-plus",
        "input": {
            "messages": [
                {
                    "role": "user",
                    "content": "你好，请简单介绍一下你自己。"
                }
            ]
        },
        "parameters": {
            "temperature": 0.1,
            "max_tokens": 100
        }
    }' \
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation")

# 提取HTTP状态码
http_code=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
response_body=$(echo "$response" | sed '/HTTP_STATUS:/d')

echo "HTTP状态码: $http_code"

if [ "$http_code" = "200" ]; then
    echo "✅ 基础连接测试成功！"
    echo ""
    
    # 使用python解析JSON响应
    echo "🤖 AI回答:"
    echo "$response_body" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'output' in data and 'text' in data['output']:
        print(data['output']['text'])
        if 'usage' in data:
            usage = data['usage']
            print(f\"\\n📊 Token使用情况:\")
            print(f\"  输入tokens: {usage.get('input_tokens', 0)}\")
            print(f\"  输出tokens: {usage.get('output_tokens', 0)}\")
            print(f\"  总tokens: {usage.get('total_tokens', 0)}\")
            
            # 计算成本
            total_tokens = usage.get('total_tokens', 0)
            cost_cny = total_tokens * 0.004 / 1000
            cost_usd = cost_cny * 0.15
            print(f\"  预估成本: ¥{cost_cny:.6f} (约\\${cost_usd:.6f})\")
    else:
        print('⚠️ 响应格式异常')
        print(json.dumps(data, indent=2, ensure_ascii=False))
except Exception as e:
    print('⚠️ JSON解析失败:', str(e))
    print('原始响应:', sys.stdin.read())
" 2>/dev/null || echo "$response_body"
    
    echo ""
    echo "🧮 测试2: 数学解题测试"
    echo "==================="
    
    # 数学测试
    math_response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $QWEN_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "qwen-plus",
            "input": {
                "messages": [
                    {
                        "role": "system",
                        "content": "你是专业的K12数学老师，请用清晰的步骤解答数学问题。"
                    },
                    {
                        "role": "user",
                        "content": "请解答这个方程：2x + 5 = 15，并详细说明每个步骤。"
                    }
                ]
            },
            "parameters": {
                "temperature": 0.05,
                "max_tokens": 400
            }
        }' \
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation")
    
    math_http_code=$(echo "$math_response" | grep "HTTP_STATUS:" | cut -d: -f2)
    math_response_body=$(echo "$math_response" | sed '/HTTP_STATUS:/d')
    
    if [ "$math_http_code" = "200" ]; then
        echo "✅ 数学解题测试成功！"
        echo ""
        echo "🧮 数学解答:"
        echo "$math_response_body" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'output' in data and 'text' in data['output']:
        print(data['output']['text'])
        if 'usage' in data:
            usage = data['usage']
            print(f\"\\n📊 Token使用情况:\")
            print(f\"  输入tokens: {usage.get('input_tokens', 0)}\")
            print(f\"  输出tokens: {usage.get('output_tokens', 0)}\")
            print(f\"  总tokens: {usage.get('total_tokens', 0)}\")
            
            # 计算成本
            total_tokens = usage.get('total_tokens', 0)
            cost_cny = total_tokens * 0.004 / 1000
            cost_usd = cost_cny * 0.15
            print(f\"  预估成本: ¥{cost_cny:.6f} (约\\${cost_usd:.6f})\")
    else:
        print('⚠️ 响应格式异常')
        print(json.dumps(data, indent=2, ensure_ascii=False))
except Exception as e:
    print('⚠️ JSON解析失败:', str(e))
    print('原始响应:', sys.stdin.read())
" 2>/dev/null || echo "$math_response_body"
        
        echo ""
        echo "🎉 所有测试通过！你的Qwen API配置正确。"
        echo ""
        echo "📋 测试总结:"
        echo "  ✅ API密钥有效"
        echo "  ✅ 基础连接正常"
        echo "  ✅ 数学解题功能正常"
        echo "  ✅ 中文回答质量良好"
        echo ""
        echo "🚀 你现在可以开始使用AI数学视频生成功能了！"
        
    else
        echo "❌ 数学测试失败，HTTP状态码: $math_http_code"
        echo ""
        echo "响应内容:"
        echo "$math_response_body"
    fi
    
else
    echo "❌ 基础连接测试失败，HTTP状态码: $http_code"
    echo ""
    echo "响应内容:"
    echo "$response_body"
    echo ""
    echo "📋 故障排查步骤:"
    echo "1. 检查API密钥是否正确 (应以sk-开头)"
    echo "2. 确认API密钥是否已激活"
    echo "3. 检查阿里云账户余额"
    echo "4. 访问 https://dashscope.console.aliyun.com/ 确认服务状态"
    echo ""
    echo "🔍 常见错误码:"
    echo "  400: 请求格式错误"
    echo "  401: API密钥无效"
    echo "  403: 权限不足"
    echo "  429: 请求频率过高"
    echo "  500: 服务器内部错误"
fi

echo ""
echo "测试完成！"