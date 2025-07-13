#!/usr/bin/env python3
"""
快速API测试脚本
"""
import requests
import json

def main():
    print("🧪 快速API测试")
    print("=" * 30)
    
    # 使用示例API密钥进行测试
    api_key = input("请输入您的通义千问API密钥: ").strip()
    
    if not api_key:
        print("❌ 未输入API密钥")
        return
    
    print(f"🔑 测试API密钥: {api_key[:8]}...")
    
    # 测试本地服务器
    data = {
        'api_key': api_key,
        'messages': [{'role': 'user', 'content': '你好'}],
        'temperature': 0.1,
        'max_tokens': 50
    }
    
    try:
        print("📡 正在测试本地服务器...")
        response = requests.post('http://localhost:8000/api/qwen', json=data, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text[:200]}...")
        
        if response.status_code == 200:
            print("✅ 测试成功！")
        else:
            print("❌ 测试失败")
            
    except Exception as e:
        print(f"❌ 连接失败: {e}")

if __name__ == "__main__":
    main() 