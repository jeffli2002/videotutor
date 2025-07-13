#!/usr/bin/env python3
"""
测试SDK服务器连接
"""

import requests
import json

def test_sdk_connection():
    url = "http://127.0.0.1:8002/api/qwen"
    
    # 测试数据
    test_data = {
        "api_key": "sk-1899f80e08854bdcbe0b3bc64b661ef4",
        "messages": [
            {"role": "user", "content": "你好"}
        ],
        "temperature": 0.1,
        "max_tokens": 100
    }
    
    try:
        print("🔍 测试SDK服务器连接...")
        print(f"📡 请求地址: {url}")
        print(f"📄 请求数据: {json.dumps(test_data, ensure_ascii=False, indent=2)}")
        
        # 发送POST请求
        response = requests.post(url, json=test_data, timeout=10)
        
        print(f"📊 响应状态码: {response.status_code}")
        print(f"📋 响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ 连接成功!")
            print(f"📝 响应内容: {response.text[:200]}...")
        else:
            print(f"❌ 连接失败，状态码: {response.status_code}")
            print(f"📝 错误信息: {response.text}")
            
    except requests.exceptions.ConnectionError as e:
        print(f"❌ 连接错误: {e}")
    except requests.exceptions.Timeout as e:
        print(f"❌ 请求超时: {e}")
    except Exception as e:
        print(f"❌ 其他错误: {e}")

if __name__ == "__main__":
    test_sdk_connection() 