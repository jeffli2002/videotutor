import requests
import json
import time

def test_complete_system():
    print("🧪 开始完整系统测试...")
    print("=" * 50)
    
    # 1. 测试前端服务
    print("1️⃣ 测试前端服务...")
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print("✅ 前端服务正常 (端口5173)")
        else:
            print(f"⚠️ 前端服务响应异常: {response.status_code}")
    except Exception as e:
        print(f"❌ 前端服务连接失败: {e}")
    
    # 2. 测试QWEN SDK服务器
    print("\n2️⃣ 测试QWEN SDK服务器...")
    try:
        test_data = {
            "api_key": "sk-1899f80e08854bdcbe0b3bc64b661ef4",
            "messages": [{"role": "user", "content": "测试连接"}],
            "temperature": 0.1,
            "max_tokens": 50
        }
        response = requests.post("http://127.0.0.1:8002/api/qwen", json=test_data, timeout=10)
        if response.status_code == 200:
            print("✅ QWEN SDK服务器正常 (端口8002)")
            data = response.json()
            print(f"📝 响应示例: {data.get('output', {}).get('text', '')[:50]}...")
        else:
            print(f"❌ QWEN SDK服务器错误: {response.status_code}")
    except Exception as e:
        print(f"❌ QWEN SDK服务器连接失败: {e}")
    
    # 3. 测试Manim API服务器
    print("\n3️⃣ 测试Manim API服务器...")
    try:
        response = requests.get("http://127.0.0.1:5001", timeout=5)
        if response.status_code == 404:  # Flask默认返回404 for root
            print("✅ Manim API服务器正常 (端口5001)")
        else:
            print(f"⚠️ Manim API服务器响应: {response.status_code}")
    except Exception as e:
        print(f"❌ Manim API服务器连接失败: {e}")
    
    # 4. 测试环境变量
    print("\n4️⃣ 检查环境变量...")
    import os
    qwen_key = os.environ.get('VITE_QWEN_API_KEY') or os.environ.get('QWEN_API_KEY')
    if qwen_key:
        print(f"✅ API密钥已配置: {qwen_key[:10]}...")
    else:
        print("❌ API密钥未配置")
    
    print("\n" + "=" * 50)
    print("🎉 系统测试完成！")
    print("\n📋 使用说明:")
    print("1. 前端地址: http://localhost:5173")
    print("2. 在浏览器中打开前端地址")
    print("3. 输入数学问题并点击生成视频")
    print("4. 系统将自动调用QWEN API和Manim渲染")
    
    return True

if __name__ == "__main__":
    test_complete_system() 