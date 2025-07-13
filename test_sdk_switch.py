#!/usr/bin/env python3
"""
测试 SDK 切换是否成功
"""

import requests
import json
import time

def test_sdk_server():
    """测试 SDK 服务器是否正常工作"""
    print("🔍 开始测试 SDK 切换...")
    print("=" * 50)
    
    # 测试 1: 检查 SDK 服务器是否运行
    print("1️⃣ 测试 SDK 服务器连接...")
    try:
        response = requests.get('http://localhost:8001/api/qwen', timeout=5)
        print(f"   ✅ SDK 服务器响应: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   ❌ SDK 服务器未运行 (端口 8001)")
        return False
    except Exception as e:
        print(f"   ❌ SDK 服务器连接失败: {e}")
        return False
    
    # 测试 2: 测试 API 调用
    print("\n2️⃣ 测试 SDK API 调用...")
    test_data = {
        "api_key": "test_key_for_sdk_test",
        "messages": [
            {
                "role": "system",
                "content": "你是专业的数学老师，请用中文回答。"
            },
            {
                "role": "user", 
                "content": "请简单介绍一下一元一次方程"
            }
        ],
        "temperature": 0.1,
        "max_tokens": 200,
        "top_p": 0.8
    }
    
    try:
        start_time = time.time()
        response = requests.post(
            'http://localhost:8001/api/qwen',
            json=test_data,
            timeout=30
        )
        end_time = time.time()
        
        print(f"   📊 响应状态: {response.status_code}")
        print(f"   ⏱️  响应时间: {end_time - start_time:.2f}秒")
        
        if response.status_code == 200:
            data = response.json()
            if 'output' in data and 'text' in data['output']:
                print("   ✅ SDK API 调用成功")
                print(f"   📝 返回内容长度: {len(data['output']['text'])} 字符")
                print(f"   🔑 使用模型: {data.get('model', 'unknown')}")
                return True
            else:
                print("   ❌ SDK API 返回格式异常")
                print(f"   📄 返回数据: {data}")
                return False
        else:
            print(f"   ❌ SDK API 调用失败: {response.status_code}")
            print(f"   📄 错误信息: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("   ❌ SDK API 调用超时")
        return False
    except Exception as e:
        print(f"   ❌ SDK API 调用异常: {e}")
        return False

def test_old_server():
    """测试旧服务器是否还在运行"""
    print("\n3️⃣ 检查旧 HTTP 服务器状态...")
    try:
        response = requests.get('http://localhost:8000/api/qwen', timeout=5)
        print(f"   ⚠️  旧服务器仍在运行 (端口 8000)")
        return True
    except requests.exceptions.ConnectionError:
        print("   ✅ 旧服务器已停止 (端口 8000)")
        return False
    except Exception as e:
        print(f"   ✅ 旧服务器连接失败: {e}")
        return False

def test_frontend_config():
    """检查前端配置是否正确"""
    print("\n4️⃣ 检查前端配置...")
    try:
        with open('src/components/VideoGenerationDemo.jsx', 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'localhost:8001' in content:
            print("   ✅ 前端已配置为使用 SDK 服务器 (端口 8001)")
            return True
        elif 'localhost:8000' in content:
            print("   ❌ 前端仍配置为使用旧服务器 (端口 8000)")
            return False
        else:
            print("   ⚠️  无法确定前端配置")
            return False
    except Exception as e:
        print(f"   ❌ 检查前端配置失败: {e}")
        return False

def main():
    """主测试函数"""
    print("🚀 SDK 切换测试开始")
    print("=" * 60)
    
    results = []
    
    # 测试 SDK 服务器
    sdk_ok = test_sdk_server()
    results.append(("SDK 服务器", sdk_ok))
    
    # 测试旧服务器
    old_running = test_old_server()
    results.append(("旧服务器状态", not old_running))  # 旧服务器应该停止
    
    # 测试前端配置
    frontend_ok = test_frontend_config()
    results.append(("前端配置", frontend_ok))
    
    # 总结
    print("\n" + "=" * 60)
    print("📊 测试结果总结:")
    print("=" * 60)
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ 通过" if passed else "❌ 失败"
        print(f"   {test_name}: {status}")
        if not passed:
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 SDK 切换测试全部通过！")
        print("✅ 已成功切换到 SDK 方式")
        print("✅ 前端配置正确")
        print("✅ 旧服务器已停止")
    else:
        print("⚠️  SDK 切换测试存在问题")
        print("请检查上述失败的测试项")
    
    print("=" * 60)
    
    return all_passed

if __name__ == "__main__":
    main() 