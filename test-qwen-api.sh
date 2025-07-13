#!/bin/bash

echo "🤖 通义千问API连接测试脚本"
echo "================================"
echo ""

# 检查API密钥是否设置
if [ -z "$QWEN_API_KEY" ]; then
    echo "❌ 环境变量 QWEN_API_KEY 未设置"
    echo ""
    echo "请设置你的API密钥:"
    echo "export QWEN_API_KEY='你的API密钥'"
    echo ""
    echo "或者直接在命令行中运行:"
    echo "QWEN_API_KEY='你的密钥' ./test-qwen-api.sh"
    echo ""
    exit 1
fi

echo "🔑 使用API密钥: ${QWEN_API_KEY:0:8}..."
echo "📡 开始测试连接..."
echo ""

# 基础连接测试
echo "测试1: 基础连接测试"
echo "==================="

response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $QWEN_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "qwen-plus",
        "input": {
            "messages": [
                {
                    "role": "user",
                    "content": "你好！请用一句话介绍你自己。"
                }
            ]
        },
        "parameters": {
            "temperature": 0.1,
            "max_tokens": 100
        }
    }' \
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation")

# 分离HTTP状态码和响应体
http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
response_body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

echo "HTTP状态码: $http_code"

if [ $http_code -eq 200 ]; then
    echo "✅ 基础连接测试成功！"
    echo ""
    echo "🤖 AI回答:"
    echo "$response_body" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'output' in data and 'text' in data['output']:
        print(data['output']['text'])
        if 'usage' in data:
            print(f\"\\n📊 Token使用: 输入{data['usage'].get('input_tokens', 0)} + 输出{data['usage'].get('output_tokens', 0)} = 总计{data['usage'].get('total_tokens', 0)}\")
    else:
        print('响应格式异常')
        print(json.dumps(data, indent=2, ensure_ascii=False))
except:
    print('JSON解析失败')
    print(sys.stdin.read())
" 2>/dev/null || echo "$response_body"
    
    echo ""
    echo "🧮 测试2: 数学解题测试"
    echo "==================="
    
    # 数学测试
    math_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
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
                        "content": "请解答：解方程 2x + 5 = 15"
                    }
                ]
            },
            "parameters": {
                "temperature": 0.05,
                "max_tokens": 300
            }
        }' \
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation")
    
    math_http_code=$(echo $math_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    math_response_body=$(echo $math_response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ $math_http_code -eq 200 ]; then
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
            print(f\"\\n📊 Token使用: 输入{data['usage'].get('input_tokens', 0)} + 输出{data['usage'].get('output_tokens', 0)} = 总计{data['usage'].get('total_tokens', 0)}\")
            # 计算成本
            total_tokens = data['usage'].get('total_tokens', 0)
            cost_cny = total_tokens * 0.004 / 1000
            cost_usd = cost_cny * 0.15
            print(f\"💰 预估成本: ¥{cost_cny:.6f} (约\\${cost_usd:.6f})\")
    else:
        print('响应格式异常')
except:
    print('JSON解析失败')
" 2>/dev/null || echo "$math_response_body"
        
        echo ""
        echo "🎉 所有测试通过！你的Qwen API配置正确。"
        
    else
        echo "❌ 数学测试失败，HTTP状态码: $math_http_code"
        echo "$math_response_body"
    fi
    
else
    echo "❌ 基础连接测试失败，HTTP状态码: $http_code"
    echo ""
    echo "响应内容:"
    echo "$response_body"
    echo ""
    echo "可能的原因:"
    echo "1. API密钥无效或过期"
    echo "2. 网络连接问题" 
    echo "3. API服务暂时不可用"
fi

echo ""
echo "测试完成！"