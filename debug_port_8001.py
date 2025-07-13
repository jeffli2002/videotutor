#!/usr/bin/env python3
"""
调试端口 8001 上的服务
"""

import requests
import json

def debug_port_8001():
    print("🔍 调试端口 8001 上的服务...")
    
    # 测试 GET 请求
    print("\n1️⃣ 测试 GET 请求...")
    try:
        response = requests.get('http://localhost:8001/api/qwen', timeout=5)
        print(f"   GET 状态码: {response.status_code}")
        print(f"   GET 响应: {response.text}")
    except Exception as e:
        print(f"   GET 请求失败: {e}")
    
    # 测试 POST 请求
    print("\n2️⃣ 测试 POST 请求...")
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
        print(f"   POST 状态码: {response.status_code}")
        print(f"   POST 响应: {response.text}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"   JSON 数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
            except:
                print("   响应不是有效的 JSON")
                
    except Exception as e:
        print(f"   POST 请求失败: {e}")
    
    # 测试其他路径
    print("\n3️⃣ 测试其他路径...")
    paths = ['/', '/api', '/test', '/health']
    for path in paths:
        try:
            response = requests.get(f'http://localhost:8001{path}', timeout=5)
            print(f"   {path}: {response.status_code} - {response.text[:100]}...")
        except Exception as e:
            print(f"   {path}: 失败 - {e}")

if __name__ == "__main__":
    debug_port_8001() 