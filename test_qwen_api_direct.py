#!/usr/bin/env python3
"""
直接测试 QWEN API 连接
"""

import urllib.request
import json
import ssl
import os
from urllib.error import URLError, HTTPError

def test_qwen_api_endpoints():
    """测试不同的 QWEN API 端点"""
    
    # 获取API密钥
    api_key = os.environ.get('QWEN_API_KEY') or os.environ.get('REACT_APP_QWEN_API_KEY')
    if not api_key:
        print("❌ 未找到API密钥")
        print("请设置环境变量: QWEN_API_KEY 或 REACT_APP_QWEN_API_KEY")
        return
    
    print(f"🔑 使用API密钥: {api_key[:8]}...")
    
    # 测试不同的API端点
    endpoints = [
        {
            'name': '通义千问官方API',
            'url': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
            'headers': {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
        },
        {
            'name': '通义千问API (备用)',
            'url': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
            'headers': {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'disable'
            }
        }
    ]
    
    # 测试数据
    test_data = {
        'model': 'qwen-plus',
        'input': {
            'messages': [
                {'role': 'user', 'content': '你好，请简单回复'}
            ]
        },
        'parameters': {
            'temperature': 0.1,
            'max_tokens': 50,
            'top_p': 0.8
        }
    }
    
    # 创建SSL上下文
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')
    
    for endpoint in endpoints:
        print(f"\n🔍 测试 {endpoint['name']}...")
        print(f"  📡 URL: {endpoint['url']}")
        
        try:
            # 创建请求
            req = urllib.request.Request(
                endpoint['url'],
                data=json.dumps(test_data).encode('utf-8'),
                headers=endpoint['headers']
            )
            
            # 发送请求
            with urllib.request.urlopen(req, timeout=30, context=ssl_context) as response:
                response_data = response.read().decode('utf-8')
                print(f"  ✅ 请求成功 (状态码: {response.code})")
                print(f"  📊 响应大小: {len(response_data)} 字符")
                
                # 解析响应
                try:
                    response_json = json.loads(response_data)
                    if 'output' in response_json:
                        text = response_json['output'].get('text', '')
                        print(f"  💬 响应内容: {text[:100]}...")
                    elif 'message' in response_json:
                        print(f"  💬 响应消息: {response_json['message']}")
                    else:
                        print(f"  📄 响应结构: {list(response_json.keys())}")
                    return True
                except json.JSONDecodeError:
                    print(f"  ⚠️  响应不是有效JSON: {response_data[:200]}...")
                    
        except HTTPError as e:
            print(f"  ❌ HTTP错误: {e.code} - {e.reason}")
            if e.code == 401:
                print(f"  🔑 认证失败，请检查API密钥")
            elif e.code == 403:
                print(f"  🚫 访问被拒绝，请检查API密钥权限")
            elif e.code == 404:
                print(f"  🔍 API端点不存在，请检查URL")
            elif e.code == 429:
                print(f"  ⏰ 请求频率超限，请稍后重试")
            else:
                print(f"  📄 错误响应: {e.read().decode('utf-8')}")
                
        except URLError as e:
            print(f"  ❌ URL错误: {type(e).__name__} - {str(e)}")
            
        except Exception as e:
            print(f"  ❌ 未知错误: {type(e).__name__} - {str(e)}")
    
    return False

def test_alternative_endpoints():
    """测试其他可能的API端点"""
    print("\n🔍 测试其他可能的API端点...")
    
    test_urls = [
        'https://dashscope.aliyuncs.com/',
        'https://dashscope.aliyuncs.com/api/',
        'https://dashscope.aliyuncs.com/api/v1/',
        'https://dashscope.aliyuncs.com/api/v1/services/',
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/',
    ]
    
    for url in test_urls:
        try:
            print(f"  📡 测试 {url}...")
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as response:
                print(f"  ✅ {url} 可访问 (状态码: {response.code})")
        except Exception as e:
            print(f"  ❌ {url} 不可访问: {type(e).__name__}")

def main():
    """主函数"""
    print("🚀 QWEN API 直接测试工具")
    print("=" * 50)
    
    # 测试其他端点
    test_alternative_endpoints()
    
    # 测试API调用
    success = test_qwen_api_endpoints()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ QWEN API 连接成功！")
    else:
        print("❌ QWEN API 连接失败")
        print("\n💡 建议:")
        print("1. 检查API密钥是否正确")
        print("2. 确认API密钥有足够权限")
        print("3. 检查网络连接")
        print("4. 尝试在阿里云控制台测试API")

if __name__ == "__main__":
    main() 