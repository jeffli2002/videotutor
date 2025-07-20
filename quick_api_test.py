#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import time

def test_qwen_api():
    """测试QWEN API服务器连接"""
    print("🧪 测试QWEN API服务器连接...")
    
    url = "http://localhost:8002/api/qwen"
    headers = {
        "Content-Type": "application/json"
    }
    
    # 测试数据
    test_data = {
        "api_key": "test_key",
        "messages": [
            {
                "role": "user",
                "content": "请解释三角形的面积公式"
            }
        ]
    }
    
    try:
        print(f"📡 发送请求到: {url}")
        print(f"📝 请求数据: {json.dumps(test_data, ensure_ascii=False, indent=2)}")
        
        start_time = time.time()
        response = requests.post(url, json=test_data, headers=headers, timeout=10)
        end_time = time.time()
        
        print(f"⏱️ 响应时间: {end_time - start_time:.2f}秒")
        print(f"📊 状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 成功响应: {json.dumps(result, ensure_ascii=False, indent=2)}")
        else:
            print(f"❌ 错误响应: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ 请求超时")
    except requests.exceptions.ConnectionError:
        print("🔌 连接错误 - 服务器可能未运行")
    except Exception as e:
        print(f"❌ 其他错误: {e}")

if __name__ == "__main__":
    test_qwen_api() 