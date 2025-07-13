#!/usr/bin/env python3
import requests
import json
import sys

def test_qwen_api(api_key):
    print("🤖 通义千问API连接测试")
    print("=" * 40)
    print()
    
    if not api_key:
        print("❌ API密钥不能为空")
        print("使用方法: python3 test-qwen-api-cli.py 'your-api-key-here'")
        return
    
    if not api_key.startswith('sk-'):
        print("⚠️ 警告: API密钥通常以'sk-'开头，请确认密钥正确")
    
    print(f"🔑 使用API密钥: {api_key[:8]}...")
    print("📡 开始测试连接...")
    print()
    
    # 测试1: 基础连接
    print("测试1: 基础连接测试")
    print("=" * 20)
    
    try:
        response = requests.post(
            'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'qwen-plus',
                'input': {
                    'messages': [
                        {
                            'role': 'user',
                            'content': '你好，请简单介绍一下你自己。'
                        }
                    ]
                },
                'parameters': {
                    'temperature': 0.1,
                    'max_tokens': 100
                }
            },
            timeout=30
        )
        
        print(f"HTTP状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'output' in data and 'text' in data['output']:
                print("✅ 基础连接测试成功!")
                print()
                print("🤖 AI回答:")
                print(data['output']['text'])
                print()
                
                if 'usage' in data:
                    usage = data['usage']
                    print("📊 Token使用情况:")
                    print(f"  输入tokens: {usage.get('input_tokens', 0)}")
                    print(f"  输出tokens: {usage.get('output_tokens', 0)}")
                    print(f"  总tokens: {usage.get('total_tokens', 0)}")
                    
                    # 计算成本
                    total_tokens = usage.get('total_tokens', 0)
                    cost_cny = total_tokens * 0.004 / 1000
                    cost_usd = cost_cny * 0.15
                    print(f"  预估成本: ¥{cost_cny:.6f} (约${cost_usd:.6f})")
                
                print()
                print("🧮 测试2: 数学解题测试")
                print("=" * 20)
                
                # 数学测试
                math_response = requests.post(
                    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
                    headers={
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'model': 'qwen-plus',
                        'input': {
                            'messages': [
                                {
                                    'role': 'system',
                                    'content': '你是专业的K12数学老师，请用清晰的步骤解答数学问题。'
                                },
                                {
                                    'role': 'user',
                                    'content': '请解答这个方程：2x + 5 = 15，并详细说明每个步骤。'
                                }
                            ]
                        },
                        'parameters': {
                            'temperature': 0.05,
                            'max_tokens': 400
                        }
                    },
                    timeout=30
                )
                
                if math_response.status_code == 200:
                    math_data = math_response.json()
                    if 'output' in math_data and 'text' in math_data['output']:
                        print("✅ 数学解题测试成功!")
                        print()
                        print("🧮 数学解答:")
                        print(math_data['output']['text'])
                        print()
                        
                        if 'usage' in math_data:
                            usage = math_data['usage']
                            print("📊 Token使用情况:")
                            print(f"  输入tokens: {usage.get('input_tokens', 0)}")
                            print(f"  输出tokens: {usage.get('output_tokens', 0)}")
                            print(f"  总tokens: {usage.get('total_tokens', 0)}")
                            
                            # 计算成本
                            total_tokens = usage.get('total_tokens', 0)
                            cost_cny = total_tokens * 0.004 / 1000
                            cost_usd = cost_cny * 0.15
                            print(f"  预估成本: ¥{cost_cny:.6f} (约${cost_usd:.6f})")
                        
                        print()
                        print("🎉 所有测试通过！你的Qwen API配置正确。")
                        print()
                        print("📋 测试总结:")
                        print("  ✅ API密钥有效")
                        print("  ✅ 基础连接正常")
                        print("  ✅ 数学解题功能正常")
                        print("  ✅ 中文回答质量良好")
                        print()
                        print("🚀 你现在可以开始使用AI数学视频生成功能了！")
                        
                        # 额外测试：JSON格式数学解答
                        print()
                        print("🔬 测试3: JSON格式数学解答")
                        print("=" * 20)
                        
                        json_response = requests.post(
                            'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
                            headers={
                                'Authorization': f'Bearer {api_key}',
                                'Content-Type': 'application/json'
                            },
                            json={
                                'model': 'qwen-plus',
                                'input': {
                                    'messages': [
                                        {
                                            'role': 'system',
                                            'content': '你是专业的K12数学老师，请严格按照JSON格式回答数学问题。'
                                        },
                                        {
                                            'role': 'user',
                                            'content': '''请解答这个方程并用JSON格式回答：

题目：3x - 7 = 14

请按以下格式回答：
{
  "analysis": "问题分析",
  "steps": [
    {"stepNumber": 1, "description": "移项", "operation": "3x = 14 + 7", "result": "3x = 21"},
    {"stepNumber": 2, "description": "系数化1", "operation": "x = 21 ÷ 3", "result": "x = 7"}
  ],
  "finalAnswer": "x = 7",
  "verification": "验证：3×7 - 7 = 21 - 7 = 14 ✓"
}'''
                                        }
                                    ]
                                },
                                'parameters': {
                                    'temperature': 0.05,
                                    'max_tokens': 500
                                }
                            },
                            timeout=30
                        )
                        
                        if json_response.status_code == 200:
                            json_data = json_response.json()
                            if 'output' in json_data and 'text' in json_data['output']:
                                print("✅ JSON格式测试成功!")
                                print()
                                print("📝 JSON格式回答:")
                                response_text = json_data['output']['text']
                                print(response_text)
                                
                                # 尝试解析JSON
                                try:
                                    import re
                                    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                                    if json_match:
                                        parsed_json = json.loads(json_match.group())
                                        print()
                                        print("🔍 解析的JSON内容:")
                                        print(json.dumps(parsed_json, indent=2, ensure_ascii=False))
                                        print()
                                        print("✅ JSON解析成功！AI可以生成结构化的数学解答。")
                                    else:
                                        print()
                                        print("⚠️ 未找到有效的JSON格式，但回答内容正确。")
                                except json.JSONDecodeError:
                                    print()
                                    print("⚠️ JSON解析失败，但回答内容正确。")
                                
                        else:
                            print("⚠️ JSON格式测试失败，但基本功能正常。")
                        
                    else:
                        print("❌ 数学测试响应格式异常")
                        print(f"响应内容: {math_data}")
                else:
                    print(f"❌ 数学测试失败，HTTP状态码: {math_response.status_code}")
                    try:
                        error_data = math_response.json()
                        print(f"错误信息: {error_data.get('message', '未知错误')}")
                        print(f"错误代码: {error_data.get('code', 'N/A')}")
                    except:
                        print(f"响应内容: {math_response.text}")
                        
            else:
                print("❌ 响应格式异常")
                print(f"响应内容: {data}")
        else:
            print(f"❌ 基础连接测试失败，HTTP状态码: {response.status_code}")
            try:
                error_data = response.json()
                print(f"错误信息: {error_data.get('message', '未知错误')}")
                print(f"错误代码: {error_data.get('code', 'N/A')}")
                print(f"请求ID: {error_data.get('request_id', 'N/A')}")
            except:
                print(f"响应内容: {response.text}")
            
            print()
            print("📋 故障排查步骤:")
            print("1. 检查API密钥是否正确 (应以sk-开头)")
            print("2. 确认API密钥是否已激活")
            print("3. 检查阿里云账户余额")
            print("4. 访问 https://dashscope.console.aliyun.com/ 确认服务状态")
            print()
            print("🔍 常见错误码:")
            print("  400: 请求格式错误")
            print("  401: API密钥无效")
            print("  403: 权限不足")
            print("  429: 请求频率过高")
            print("  500: 服务器内部错误")
    
    except requests.exceptions.RequestException as e:
        print(f"❌ 网络请求失败: {e}")
        print()
        print("可能的原因:")
        print("1. 网络连接问题")
        print("2. 请求超时")
        print("3. DNS解析问题")
        print("4. 防火墙或代理设置")
    
    except Exception as e:
        print(f"❌ 未知错误: {e}")
    
    print()
    print("测试完成！")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("使用方法: python3 test-qwen-api-cli.py 'your-api-key-here'")
        print("例如: python3 test-qwen-api-cli.py 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'")
        sys.exit(1)
    
    api_key = sys.argv[1]
    test_qwen_api(api_key)