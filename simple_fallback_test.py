#!/usr/bin/env python3
"""
简单测试QWEN API fallback机制
"""

import requests
import json

def test_fallback():
    """测试fallback机制"""
    print("🧪 测试QWEN API fallback机制...")
    
    try:
        response = requests.post(
            "http://localhost:8002/api/qwen",
            json={
                "api_key": "invalid-key",
                "messages": [{"role": "user", "content": "请用动画帮我解释三角形面积的拉窗帘原理"}]
            },
            timeout=5
        )
        
        print(f"📊 响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 成功获取响应")
            print(f"📝 方法: {data.get('method', 'unknown')}")
            print(f"📊 文本长度: {len(data.get('output', {}).get('text', ''))} 字符")
            print(f"📄 响应内容预览: {data.get('output', {}).get('text', '')[:100]}...")
        else:
            print(f"❌ HTTP错误: {response.status_code}")
            print(f"📄 错误内容: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ 请求超时")
    except requests.exceptions.ConnectionError:
        print("🔌 连接错误")
    except Exception as e:
        print(f"❌ 其他错误: {e}")

if __name__ == "__main__":
    test_fallback() 