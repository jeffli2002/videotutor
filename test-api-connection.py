#!/usr/bin/env python3
"""
API连接测试脚本
用于诊断通义千问API连接问题
"""

import requests
import json
import sys

def test_api_connection(api_key):
    """测试通义千问API连接"""
    
    print("🧪 开始测试通义千问API连接...")
    print(f"🔑 使用API密钥: {api_key[:8]}...")
    print()
    
    # 测试数据
    test_data = {
        'api_key': api_key,
        'messages': [
            {
                'role': 'user',
                'content': '你好，请简单介绍一下你自己。'
            }
        ],
        'temperature': 0.1,
        'max_tokens': 100
    }
    
    # 先测试本地代理服务器
    print("📡 测试本地代理服务器...")
    try:
        response = requests.post(
            'http://localhost:8000/api/qwen',
            json=test_data,
            timeout=30
        )
        
        print(f"📊 响应状态码: {response.status_code}")
        print(f"📋 响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 本地代理服务器测试成功!")
            print(f"📄 响应内容: {result}")
            return True
        else:
            print(f"❌ 本地代理服务器测试失败: {response.status_code}")
            print(f"📄 错误内容: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 本地代理服务器连接失败: {e}")
        return False

def test_direct_api(api_key):
    """直接测试通义千问API"""
    
    print("\n🌐 测试直接API连接...")
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    data = {
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
    }
    
    try:
        response = requests.post(
            'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
            json=data,
            headers=headers,
            timeout=30
        )
        
        print(f"📊 响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 直接API测试成功!")
            print(f"📄 响应内容: {result}")
            return True
        else:
            print(f"❌ 直接API测试失败: {response.status_code}")
            try:
                error_data = response.json()
                print(f"📄 错误详情: {error_data}")
            except:
                print(f"📄 错误内容: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 直接API连接失败: {e}")
        return False

def main():
    """主函数"""
    
    print("🔧 MathTutor AI - API连接诊断工具")
    print("=" * 40)
    
    # 获取API密钥
    api_key = input("请输入您的通义千问API密钥: ").strip()
    
    if not api_key:
        print("❌ 未输入API密钥")
        sys.exit(1)
    
    if not api_key.startswith('sk-'):
        print("⚠️  警告: API密钥格式不正确，应该以'sk-'开头")
    
    print()
    
    # 测试本地代理服务器
    proxy_success = test_api_connection(api_key)
    
    # 测试直接API连接
    direct_success = test_direct_api(api_key)
    
    # 总结结果
    print("\n📋 测试结果总结:")
    print(f"本地代理服务器: {'✅ 成功' if proxy_success else '❌ 失败'}")
    print(f"直接API连接: {'✅ 成功' if direct_success else '❌ 失败'}")
    
    if proxy_success and direct_success:
        print("\n🎉 所有测试通过! API连接正常。")
    elif direct_success and not proxy_success:
        print("\n⚠️  直接API连接正常，但本地代理服务器有问题。")
        print("建议检查本地服务器日志。")
    elif not direct_success:
        print("\n❌ 直接API连接失败，请检查:")
        print("- API密钥是否正确")
        print("- 阿里云账户是否有余额")
        print("- 网络连接是否正常")
    
    print("\n💡 如需帮助，请查看服务器终端的日志输出。")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 测试已取消")
    except Exception as e:
        print(f"\n❌ 测试过程中发生错误: {e}") 