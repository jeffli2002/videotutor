#!/usr/bin/env python3
"""
简单的 SDK 测试
"""

import requests
import json

def test_sdk():
    print("🔍 测试 SDK 服务器...")
    
    # 测试数据
    test_data = {
        "api_key": "test_key",
        "messages": [
            {"role": "user", "content": "你好"}
        ]
    }
    
    try:
        response = requests.post(
            'http://localhost:8001/api/qwen',
            json=test_data,
            timeout=10
        )
        
        print(f"状态码: {response.status_code}")
        print(f"响应内容: {response.text[:200]}...")
        
        if response.status_code == 200:
            data = response.json()
            print(f"响应数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"错误: {response.text}")
            
    except Exception as e:
        print(f"异常: {e}")

if __name__ == "__main__":
    test_sdk() 