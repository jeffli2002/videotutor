#!/usr/bin/env python3
"""
测试端口 8002 上的 SDK 服务器
"""

import requests
import json

def test_sdk_port_8002():
    print("🔍 测试端口 8002 上的 SDK 服务器...")
    
    # 测试数据
    test_data = {
        "api_key": "sk-1899f80e08854bdcbe0b3bc64b661ef4",
        "messages": [
            {"role": "user", "content": "你好"}
        ]
    }
    
    try:
        response = requests.post(
            'http://localhost:8002/api/qwen',
            json=test_data,
            timeout=10
        )
        
        print(f"状态码: {response.status_code}")
        print(f"响应内容: {response.text[:200]}...")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"响应数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
                
                # 检查是否是真正的 SDK 响应
                if 'output' in data and 'text' in data['output']:
                    print("✅ 这是真正的 SDK 响应！")
                    return True
                else:
                    print("❌ 这不是 SDK 响应格式")
                    return False
                    
            except:
                print("❌ 响应不是有效的 JSON")
                return False
        else:
            print(f"❌ 请求失败: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False

if __name__ == "__main__":
    test_sdk_port_8002() 