#!/usr/bin/env python3
"""
测试SDK服务器响应格式
"""

import requests
import json

def test_sdk_server():
    url = 'http://localhost:8002/api/qwen'
    
    # 测试数据
    test_data = {
        'api_key': 'sk-1899f80e08854bdcbe0b3bc64b661ef4',  # 使用测试密钥
        'messages': [
            {
                'role': 'system',
                'content': '你是专业的数学老师'
            },
            {
                'role': 'user',
                'content': '请解答：2x + 5 = 15'
            }
        ],
        'temperature': 0.1,
        'max_tokens': 500,
        'top_p': 0.8
    }
    
    try:
        print("🔄 发送请求到SDK服务器...")
        print(f"📡 URL: {url}")
        print(f"📄 请求数据: {json.dumps(test_data, indent=2, ensure_ascii=False)}")
        
        response = requests.post(url, json=test_data, timeout=10)
        
        print(f"📊 响应状态码: {response.status_code}")
        print(f"📊 响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("✅ 成功响应:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
            except json.JSONDecodeError as e:
                print(f"❌ JSON解析失败: {e}")
                print(f"原始响应文本: {response.text}")
        else:
            print(f"❌ 错误响应状态码: {response.status_code}")
            print(f"❌ 错误响应文本: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ 请求超时")
    except requests.exceptions.ConnectionError:
        print("❌ 连接错误 - 服务器可能未运行")
    except requests.exceptions.RequestException as e:
        print(f"❌ 请求失败: {e}")
    except Exception as e:
        print(f"❌ 未知错误: {e}")

if __name__ == "__main__":
    test_sdk_server() 