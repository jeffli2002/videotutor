#!/usr/bin/env python3
"""
测试前端与 SDK 的完整集成
"""

import requests
import json

def test_frontend_sdk_integration():
    print("🔍 测试前端与 SDK 的完整集成...")
    print("=" * 60)
    
    # 模拟前端的 API 调用
    api_key = "sk-1899f80e08854bdcbe0b3bc64b661ef4"
    question = "解方程 2x + 5 = 15"
    language = "zh"
    
    # 构建提示词（模拟前端逻辑）
    prompt = f"""请详细解答这个K12数学问题：

题目：{question}

请严格按照以下结构回答，确保每个步骤都详细且按顺序：

**问题分析**
简要分析题目类型和解题思路

**详细解题步骤**
请按顺序列出每个解题步骤，每个步骤都要包含：
1. 步骤编号（1、2、3...）
2. 具体操作（如：移项、化简、代入等）
3. 详细解释（为什么要这样做）
4. 中间结果（显示计算过程）

**最终答案**
明确给出最终答案"""
    
    # 模拟前端的请求数据
    request_data = {
        "api_key": api_key,
        "messages": [
            {
                "role": "system",
                "content": "你是专业的K12数学老师，请用清晰的中文解释数学概念和解题步骤。"
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.1,
        "max_tokens": 1000,
        "top_p": 0.8
    }
    
    print("📤 发送请求到 SDK 服务器...")
    print(f"   URL: http://localhost:8002/api/qwen")
    print(f"   API Key: {api_key[:8]}...")
    print(f"   问题: {question}")
    
    try:
        response = requests.post(
            'http://localhost:8002/api/qwen',
            json=request_data,
            timeout=30
        )
        
        print(f"\n📊 响应状态: {response.status_code} {response.reason}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SDK 调用成功！")
            
            if 'output' in data and 'text' in data['output']:
                content = data['output']['text']
                print(f"📝 返回内容长度: {len(content)} 字符")
                print(f"🔑 使用模型: {data.get('model', 'unknown')}")
                print(f"📊 Token 使用: {data.get('usage', {})}")
                
                # 显示内容的前200个字符
                print(f"\n📄 内容预览:")
                print("-" * 40)
                print(content[:200] + "..." if len(content) > 200 else content)
                print("-" * 40)
                
                return True
            else:
                print("❌ 响应格式不正确")
                print(f"📄 响应数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
                return False
        else:
            print(f"❌ SDK 调用失败: {response.status_code}")
            print(f"📄 错误信息: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ 请求超时")
        return False
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False

def test_manim_server():
    print("\n🔍 测试 Manim 服务器...")
    try:
        response = requests.get('http://localhost:5001/health', timeout=5)
        print(f"   Manim 服务器状态: {response.status_code}")
        return response.status_code == 200
    except:
        print("   Manim 服务器连接失败")
        return False

def main():
    print("🚀 前端 SDK 集成测试")
    print("=" * 60)
    
    # 测试 SDK 服务器
    sdk_ok = test_frontend_sdk_integration()
    
    # 测试 Manim 服务器
    manim_ok = test_manim_server()
    
    print("\n" + "=" * 60)
    print("📊 测试结果总结:")
    print("=" * 60)
    print(f"   SDK 服务器: {'✅ 正常' if sdk_ok else '❌ 异常'}")
    print(f"   Manim 服务器: {'✅ 正常' if manim_ok else '❌ 异常'}")
    
    if sdk_ok and manim_ok:
        print("\n🎉 所有服务正常！")
        print("✅ 前端应该能够正常生成视频")
        print("💡 如果前端仍有问题，请检查浏览器控制台的错误信息")
    else:
        print("\n⚠️  存在问题，请检查服务状态")
    
    print("=" * 60)

if __name__ == "__main__":
    main() 