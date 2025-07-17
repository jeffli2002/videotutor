#!/usr/bin/env python3
"""
QWEN API 连接问题快速修复工具
"""

import os
import subprocess
import platform
import time
import json
import urllib.request
import ssl
import socket
from urllib.error import URLError, HTTPError

def check_and_fix_dns():
    """检查并修复DNS设置"""
    print("🔍 检查DNS设置...")
    
    system = platform.system()
    
    if system == "Windows":
        # 检查当前DNS设置
        try:
            result = subprocess.run(['ipconfig', '/all'], capture_output=True, text=True, encoding='gbk')
            if result.returncode == 0:
                print("  ✅ 当前DNS设置:")
                for line in result.stdout.splitlines():
                    if 'DNS Servers' in line:
                        print(f"    {line.strip()}")
        except Exception as e:
            print(f"  ❌ 无法获取DNS设置: {e}")
        
        # 建议使用公共DNS
        print("  💡 建议使用以下DNS服务器:")
        print("    主要DNS: 8.8.8.8 (Google)")
        print("    备用DNS: 114.114.114.114 (114DNS)")
        print("    或使用: 223.5.5.5 (阿里DNS)")
    
    elif system == "Linux":
        try:
            result = subprocess.run(['cat', '/etc/resolv.conf'], capture_output=True, text=True)
            if result.returncode == 0:
                print("  ✅ 当前DNS设置:")
                print(result.stdout)
        except Exception as e:
            print(f"  ❌ 无法读取DNS设置: {e}")

def test_and_fix_ssl():
    """测试并修复SSL问题"""
    print("\n🔍 测试SSL连接...")
    
    try:
        # 创建SSL上下文
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')
        
        # 测试连接
        req = urllib.request.Request('https://dashscope.aliyuncs.com')
        with urllib.request.urlopen(req, timeout=15, context=ssl_context) as response:
            print("  ✅ SSL连接正常")
            return True
    except Exception as e:
        print(f"  ❌ SSL连接失败: {e}")
        print("  🔧 尝试修复SSL问题...")
        
        # 尝试不同的SSL配置
        try:
            ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS)
            ssl_context.verify_mode = ssl.CERT_NONE
            ssl_context.check_hostname = False
            
            req = urllib.request.Request('https://dashscope.aliyuncs.com')
            with urllib.request.urlopen(req, timeout=15, context=ssl_context) as response:
                print("  ✅ SSL修复成功")
                return True
        except Exception as e2:
            print(f"  ❌ SSL修复失败: {e2}")
            return False

def check_and_fix_proxy():
    """检查并修复代理设置"""
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
        print("  💡 如果网络需要代理，请设置以下环境变量:")
        print("    set HTTPS_PROXY=http://proxy-server:port")
        print("    set HTTP_PROXY=http://proxy-server:port")
    
    return found_proxy

def test_api_key(api_key):
    """测试API密钥"""
    print(f"\n🔍 测试API密钥...")
    
    if not api_key:
        print("  ❌ 未找到API密钥")
        print("  💡 请设置环境变量:")
        print("    set QWEN_API_KEY=your-api-key")
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
            'max_tokens': 50,
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
            
            # 解析响应
            try:
                response_json = json.loads(response_data)
                if 'output' in response_json:
                    print(f"  💬 响应内容: {response_json['output'].get('text', '')[:50]}...")
                return True
            except json.JSONDecodeError:
                print(f"  ⚠️  响应不是有效JSON")
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

def create_optimized_server_config():
    """创建优化的服务器配置"""
    print("\n🔧 创建优化的服务器配置...")
    
    config_content = '''# QWEN API 优化配置
# 将此文件保存为 .env 或设置环境变量

# API密钥设置
QWEN_API_KEY=your-api-key-here
REACT_APP_QWEN_API_KEY=your-api-key-here
VITE_QWEN_API_KEY=your-api-key-here

# 网络优化设置
# 如果使用代理，取消注释并设置正确的代理地址
# HTTPS_PROXY=http://proxy-server:port
# HTTP_PROXY=http://proxy-server:port

# 超时设置
QWEN_API_TIMEOUT=60
QWEN_API_RETRIES=3

# SSL设置
SSL_VERIFY=false
SSL_CHECK_HOSTNAME=false
'''
    
    try:
        with open('qwen_config.env', 'w', encoding='utf-8') as f:
            f.write(config_content)
        print("  ✅ 配置文件已创建: qwen_config.env")
        print("  💡 请将此文件重命名为 .env 或手动设置环境变量")
    except Exception as e:
        print(f"  ❌ 创建配置文件失败: {e}")

def provide_manual_fixes():
    """提供手动修复建议"""
    print("\n💡 手动修复建议:")
    print("=" * 50)
    
    print("1. 🔑 API密钥问题:")
    print("   - 确保API密钥正确且有效")
    print("   - 检查API密钥是否有足够权限")
    print("   - 确认API配额未用完")
    print("   - 在阿里云控制台测试API")
    
    print("\n2. 🌐 网络连接问题:")
    print("   - 检查网络连接是否正常")
    print("   - 尝试访问 https://dashscope.aliyuncs.com")
    print("   - 检查防火墙设置")
    print("   - 尝试使用VPN或代理")
    
    print("\n3. 🔒 SSL/证书问题:")
    print("   - 更新Python和OpenSSL版本")
    print("   - 检查系统时间是否正确")
    print("   - 尝试禁用SSL验证（仅用于测试）")
    print("   - 检查系统证书存储")
    
    print("\n4. 🖥️  系统配置问题:")
    print("   - 检查DNS设置")
    print("   - 尝试使用公共DNS（8.8.8.8, 114.114.114.114）")
    print("   - 检查代理设置")
    print("   - 重启网络服务")
    
    print("\n5. 🔧 代码配置问题:")
    print("   - 确保使用最新的服务器代码")
    print("   - 检查环境变量设置")
    print("   - 尝试增加超时时间")
    print("   - 使用网络诊断工具")

def main():
    """主函数"""
    print("🚀 QWEN API 连接问题快速修复工具")
    print("=" * 50)
    
    # 检查DNS设置
    check_and_fix_dns()
    
    # 测试并修复SSL
    ssl_ok = test_and_fix_ssl()
    
    # 检查代理设置
    proxy_ok = check_and_fix_proxy()
    
    # 测试API密钥
    api_key = os.environ.get('QWEN_API_KEY') or os.environ.get('REACT_APP_QWEN_API_KEY')
    api_ok = test_api_key(api_key)
    
    # 创建优化配置
    create_optimized_server_config()
    
    # 提供手动修复建议
    provide_manual_fixes()
    
    print("\n" + "=" * 50)
    if api_ok:
        print("✅ QWEN API 连接正常！")
    else:
        print("❌ QWEN API 连接仍有问题，请参考上述建议进行修复")
    
    print("\n🔧 快速修复命令:")
    print("1. 运行网络诊断: python network_diagnosis.py")
    print("2. 重启服务器: python server.py")
    print("3. 测试API连接: curl -X POST http://localhost:8000/api/qwen")

if __name__ == "__main__":
    main() 