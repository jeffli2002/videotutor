#!/usr/bin/env python3
"""
网络诊断工具 - 检测 QWEN API 连接问题
"""

import urllib.request
import urllib.parse
import json
import ssl
import socket
import time
import os
import subprocess
import platform
from urllib.error import URLError, HTTPError

def test_basic_connectivity():
    """测试基本网络连接"""
    print("🔍 测试基本网络连接...")
    
    test_urls = [
        ('百度', 'https://www.baidu.com'),
        ('Google', 'https://www.google.com'),
        ('阿里云', 'https://www.aliyun.com'),
        ('QWEN API', 'https://dashscope.aliyuncs.com')
    ]
    
    results = {}
    for name, url in test_urls:
        try:
            print(f"  📡 测试 {name} ({url})...")
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as response:
                print(f"  ✅ {name} 连接正常 (状态码: {response.code})")
                results[name] = True
        except Exception as e:
            print(f"  ❌ {name} 连接失败: {type(e).__name__} - {str(e)}")
            results[name] = False
    
    return results

def test_dns_resolution():
    """测试DNS解析"""
    print("\n🔍 测试DNS解析...")
    
    domains = [
        'dashscope.aliyuncs.com',
        'www.baidu.com',
        'www.google.com'
    ]
    
    for domain in domains:
        try:
            ip = socket.gethostbyname(domain)
            print(f"  ✅ {domain} -> {ip}")
        except socket.gaierror as e:
            print(f"  ❌ {domain} DNS解析失败: {e}")

def test_ssl_connection():
    """测试SSL连接"""
    print("\n🔍 测试SSL连接...")
    
    try:
        # 创建SSL上下文
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        # 测试QWEN API的SSL连接
        req = urllib.request.Request('https://dashscope.aliyuncs.com')
        with urllib.request.urlopen(req, timeout=15, context=ssl_context) as response:
            print(f"  ✅ QWEN API SSL连接成功 (状态码: {response.code})")
            return True
    except Exception as e:
        print(f"  ❌ QWEN API SSL连接失败: {type(e).__name__} - {str(e)}")
        return False

def test_proxy_settings():
    """检查代理设置"""
    print("\n🔍 检查代理设置...")
    
    proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']
    found_proxy = False
    
    for var in proxy_vars:
        value = os.environ.get(var)
        if value:
            print(f"  📡 发现代理设置: {var} = {value}")
            found_proxy = True
    
    if not found_proxy:
        print("  ℹ️  未发现代理设置")
    
    return found_proxy

def test_qwen_api_with_key(api_key):
    """使用API密钥测试QWEN API"""
    print(f"\n🔍 使用API密钥测试QWEN API...")
    
    if not api_key:
        print("  ❌ 未提供API密钥")
        return False
    
    # 准备测试请求
    test_data = {
        'model': 'qwen-plus',
        'input': {
            'messages': [
                {'role': 'user', 'content': '你好'}
            ]
        },
        'parameters': {
            'temperature': 0.1,
            'max_tokens': 100,
            'top_p': 0.8
        }
    }
    
    # 创建SSL上下文
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')
    
    # 创建请求
    req = urllib.request.Request(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        data=json.dumps(test_data).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'MathTutor-AI/1.0'
        }
    )
    
    try:
        print(f"  🔑 使用API密钥: {api_key[:8]}...")
        print(f"  📡 发送测试请求...")
        
        with urllib.request.urlopen(req, timeout=30, context=ssl_context) as response:
            response_data = response.read().decode('utf-8')
            print(f"  ✅ API调用成功 (状态码: {response.code})")
            print(f"  📊 响应大小: {len(response_data)} 字符")
            
            # 解析响应
            try:
                response_json = json.loads(response_data)
                if 'output' in response_json:
                    print(f"  💬 响应内容: {response_json['output'].get('text', '')[:100]}...")
                return True
            except json.JSONDecodeError:
                print(f"  ⚠️  响应不是有效JSON: {response_data[:200]}...")
                return False
                
    except HTTPError as e:
        print(f"  ❌ HTTP错误: {e.code} - {e.reason}")
        if e.code == 401:
            print(f"  🔑 认证失败，请检查API密钥是否正确")
        elif e.code == 403:
            print(f"  🚫 访问被拒绝，请检查API密钥权限")
        return False
    except URLError as e:
        print(f"  ❌ URL错误: {type(e).__name__} - {str(e)}")
        return False
    except socket.timeout:
        print(f"  ⏰ 连接超时")
        return False
    except Exception as e:
        print(f"  ❌ 未知错误: {type(e).__name__} - {str(e)}")
        return False

def check_system_network():
    """检查系统网络配置"""
    print("\n🔍 检查系统网络配置...")
    
    system = platform.system()
    
    if system == "Windows":
        print("  🖥️  检测到Windows系统")
        try:
            # 检查网络适配器
            result = subprocess.run(['ipconfig'], capture_output=True, text=True, encoding='gbk')
            if result.returncode == 0:
                print("  ✅ ipconfig命令可用")
            else:
                print("  ❌ ipconfig命令不可用")
        except Exception as e:
            print(f"  ❌ 执行ipconfig失败: {e}")
    
    elif system == "Linux":
        print("  🐧 检测到Linux系统")
        try:
            # 检查网络接口
            result = subprocess.run(['ip', 'addr'], capture_output=True, text=True)
            if result.returncode == 0:
                print("  ✅ ip addr命令可用")
            else:
                print("  ❌ ip addr命令不可用")
        except Exception as e:
            print(f"  ❌ 执行ip addr失败: {e}")
    
    elif system == "Darwin":
        print("  🍎 检测到macOS系统")
        try:
            # 检查网络接口
            result = subprocess.run(['ifconfig'], capture_output=True, text=True)
            if result.returncode == 0:
                print("  ✅ ifconfig命令可用")
            else:
                print("  ❌ ifconfig命令不可用")
        except Exception as e:
            print(f"  ❌ 执行ifconfig失败: {e}")

def provide_solutions(connectivity_results, ssl_success, api_success):
    """提供解决方案"""
    print("\n💡 问题诊断与解决方案:")
    
    if not any(connectivity_results.values()):
        print("❌ 所有网站都无法连接")
        print("🔧 解决方案:")
        print("  1. 检查网络连接是否正常")
        print("  2. 检查防火墙设置")
        print("  3. 尝试重启网络设备")
        print("  4. 联系网络管理员")
        return
    
    if not connectivity_results.get('QWEN API', False):
        print("❌ QWEN API 无法连接")
        print("🔧 解决方案:")
        print("  1. 检查是否在中国大陆网络环境")
        print("  2. 尝试使用VPN或代理")
        print("  3. 检查DNS设置")
        print("  4. 尝试使用其他DNS服务器（如8.8.8.8）")
    
    if not ssl_success:
        print("❌ SSL连接失败")
        print("🔧 解决方案:")
        print("  1. 更新Python和OpenSSL版本")
        print("  2. 检查系统时间是否正确")
        print("  3. 尝试禁用SSL验证（仅用于测试）")
    
    if not api_success:
        print("❌ API调用失败")
        print("🔧 解决方案:")
        print("  1. 检查API密钥是否正确")
        print("  2. 确认API密钥有足够权限")
        print("  3. 检查API配额是否用完")
        print("  4. 尝试在阿里云控制台测试API")

def main():
    """主函数"""
    print("🚀 QWEN API 网络诊断工具")
    print("=" * 50)
    
    # 检查系统网络
    check_system_network()
    
    # 测试基本连接性
    connectivity_results = test_basic_connectivity()
    
    # 测试DNS解析
    test_dns_resolution()
    
    # 测试SSL连接
    ssl_success = test_ssl_connection()
    
    # 检查代理设置
    test_proxy_settings()
    
    # 测试API密钥（如果提供）
    api_key = os.environ.get('QWEN_API_KEY') or os.environ.get('REACT_APP_QWEN_API_KEY')
    api_success = False
    if api_key:
        api_success = test_qwen_api_with_key(api_key)
    else:
        print("\n⚠️  未找到API密钥环境变量")
        print("  请设置 QWEN_API_KEY 或 REACT_APP_QWEN_API_KEY")
    
    # 提供解决方案
    provide_solutions(connectivity_results, ssl_success, api_success)
    
    print("\n" + "=" * 50)
    print("✅ 诊断完成")

if __name__ == "__main__":
    main() 