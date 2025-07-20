#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import socket
import time

def test_server_connection():
    """测试服务器连接"""
    print("🧪 测试服务器连接...")
    
    # 测试端口8002
    host = 'localhost'
    port = 8002
    
    try:
        print(f"🔌 尝试连接到 {host}:{port}")
        start_time = time.time()
        
        # 创建socket连接
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)  # 5秒超时
        result = sock.connect_ex((host, port))
        end_time = time.time()
        
        if result == 0:
            print(f"✅ 连接成功! 耗时: {end_time - start_time:.2f}秒")
            sock.close()
            return True
        else:
            print(f"❌ 连接失败! 错误代码: {result}")
            return False
            
    except Exception as e:
        print(f"❌ 连接异常: {e}")
        return False

def test_http_request():
    """测试HTTP请求"""
    print("\n🌐 测试HTTP请求...")
    
    import requests
    
    url = "http://localhost:8002/api/qwen"
    headers = {
        "Content-Type": "application/json"
    }
    
    # 最简单的测试数据
    test_data = {
        "api_key": "test",
        "messages": [
            {
                "role": "user",
                "content": "hello"
            }
        ]
    }
    
    try:
        print(f"📡 发送HTTP请求到: {url}")
        start_time = time.time()
        
        response = requests.post(url, json=test_data, headers=headers, timeout=5)
        end_time = time.time()
        
        print(f"⏱️ 响应时间: {end_time - start_time:.2f}秒")
        print(f"📊 状态码: {response.status_code}")
        print(f"📝 响应内容: {response.text[:200]}...")
        
        return True
        
    except requests.exceptions.Timeout:
        print("⏰ HTTP请求超时")
        return False
    except requests.exceptions.ConnectionError:
        print("🔌 HTTP连接错误")
        return False
    except Exception as e:
        print(f"❌ HTTP请求异常: {e}")
        return False

if __name__ == "__main__":
    # 测试socket连接
    socket_ok = test_server_connection()
    
    if socket_ok:
        # 测试HTTP请求
        http_ok = test_http_request()
        
        if http_ok:
            print("\n✅ 所有测试通过!")
        else:
            print("\n⚠️ Socket连接正常，但HTTP请求失败")
    else:
        print("\n❌ Socket连接失败，服务器可能未运行") 