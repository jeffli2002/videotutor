#!/usr/bin/env python3
"""
网络连接诊断工具 - 解决GitHub连接问题
"""

import socket
import requests
import subprocess
import sys
import os
from urllib.parse import urlparse

def test_dns_resolution(hostname):
    """测试DNS解析"""
    try:
        ip = socket.gethostbyname(hostname)
        print(f"✅ DNS解析成功: {hostname} -> {ip}")
        return True
    except socket.gaierror as e:
        print(f"❌ DNS解析失败: {hostname} - {e}")
        return False

def test_http_connection(url, timeout=10):
    """测试HTTP连接"""
    try:
        response = requests.get(url, timeout=timeout)
        print(f"✅ HTTP连接成功: {url} (状态码: {response.status_code})")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ HTTP连接失败: {url} - {e}")
        return False

def test_curl_connection(url):
    """使用curl测试连接"""
    try:
        result = subprocess.run(['curl', '-I', '--connect-timeout', '10', url], 
                              capture_output=True, text=True, timeout=15)
        if result.returncode == 0:
            print(f"✅ curl连接成功: {url}")
            return True
        else:
            print(f"❌ curl连接失败: {url} - {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ curl测试异常: {e}")
        return False

def check_proxy_settings():
    """检查代理设置"""
    proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']
    for var in proxy_vars:
        value = os.environ.get(var)
        if value:
            print(f"⚠️ 发现代理设置: {var}={value}")
        else:
            print(f"✅ 无代理设置: {var}")

def suggest_solutions():
    """提供解决方案建议"""
    print("\n🔧 解决方案建议:")
    print("1. 检查网络连接")
    print("2. 尝试使用代理:")
    print("   export HTTP_PROXY=http://your-proxy:port")
    print("   export HTTPS_PROXY=http://your-proxy:port")
    print("3. 修改hosts文件:")
    print("   # 在 /etc/hosts 或 C:\\Windows\\System32\\drivers\\etc\\hosts 中添加:")
    print("   185.199.108.133 raw.githubusercontent.com")
    print("   185.199.109.133 raw.githubusercontent.com")
    print("   185.199.110.133 raw.githubusercontent.com")
    print("   185.199.111.133 raw.githubusercontent.com")
    print("4. 使用镜像源:")
    print("   # 替换为国内镜像")
    print("5. 使用VPN或代理软件")

def main():
    print("🌐 网络连接诊断工具")
    print("=" * 50)
    
    # 检查代理设置
    print("📋 检查代理设置...")
    check_proxy_settings()
    print()
    
    # 测试DNS解析
    print("🔍 测试DNS解析...")
    hosts_to_test = [
        'raw.githubusercontent.com',
        'github.com',
        'google.com',
        'baidu.com'
    ]
    
    dns_results = {}
    for host in hosts_to_test:
        dns_results[host] = test_dns_resolution(host)
    print()
    
    # 测试HTTP连接
    print("🌐 测试HTTP连接...")
    urls_to_test = [
        'https://raw.githubusercontent.com/LLM-Red-Team/kimi-cc/refs/heads/main/install.sh',
        'https://github.com',
        'https://www.google.com',
        'https://www.baidu.com'
    ]
    
    http_results = {}
    for url in urls_to_test:
        http_results[url] = test_http_connection(url)
    print()
    
    # 测试curl连接
    print("📡 测试curl连接...")
    curl_results = {}
    for url in urls_to_test:
        curl_results[url] = test_curl_connection(url)
    print()
    
    # 分析结果
    print("📊 诊断结果分析:")
    print("=" * 50)
    
    if not dns_results.get('raw.githubusercontent.com', False):
        print("❌ GitHub raw.githubusercontent.com DNS解析失败")
        print("   这可能是网络连接问题或DNS配置问题")
    else:
        print("✅ GitHub raw.githubusercontent.com DNS解析正常")
    
    if not http_results.get('https://raw.githubusercontent.com/LLM-Red-Team/kimi-cc/refs/heads/main/install.sh', False):
        print("❌ GitHub raw.githubusercontent.com HTTP连接失败")
        print("   这可能是防火墙、代理或网络限制问题")
    else:
        print("✅ GitHub raw.githubusercontent.com HTTP连接正常")
    
    # 提供解决方案
    if not (dns_results.get('raw.githubusercontent.com', False) and 
            http_results.get('https://raw.githubusercontent.com/LLM-Red-Team/kimi-cc/refs/heads/main/install.sh', False)):
        suggest_solutions()
    else:
        print("✅ 网络连接正常，可以尝试重新运行原始命令")
        print("\n💡 如果仍然失败，可能是临时网络问题，请稍后重试")

if __name__ == "__main__":
    main() 