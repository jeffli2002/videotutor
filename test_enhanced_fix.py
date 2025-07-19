#!/usr/bin/env python3
"""
测试增强修复 - 验证QWEN API fallback和Manim几何动画
"""

import requests
import json
import time
from enhanced_manim_generator import generate_enhanced_manim_script

def test_qwen_fallback():
    """测试QWEN API服务器的fallback机制"""
    print("🧪 测试QWEN API fallback机制...")
    
    # 测试用例
    test_cases = [
        {
            "name": "三角形拉窗帘原理",
            "api_key": "invalid-key",
            "messages": [{"role": "user", "content": "请用动画帮我解释三角形面积的拉窗帘原理"}]
        },
        {
            "name": "圆形面积计算", 
            "api_key": "timeout-key",
            "messages": [{"role": "user", "content": "如何计算圆的面积？"}]
        }
    ]
    
    for test_case in test_cases:
        print(f"\n📝 测试: {test_case['name']}")
        
        try:
            response = requests.post(
                "http://localhost:8002/api/qwen",
                json={
                    "api_key": test_case["api_key"],
                    "messages": test_case["messages"]
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 成功获取fallback响应")
                print(f"📊 响应长度: {len(data.get('output', {}).get('text', ''))} 字符")
                print(f"🔧 方法: {data.get('method', 'unknown')}")
            else:
                print(f"❌ HTTP错误: {response.status_code}")
                
        except Exception as e:
            print(f"❌ 请求失败: {e}")

def test_enhanced_manim():
    """测试增强的Manim生成器"""
    print("\n🎬 测试增强Manim生成器...")
    
    test_cases = [
        {
            "name": "三角形拉窗帘原理",
            "question": "请用动画帮我解释三角形面积的拉窗帘原理",
            "steps": [
                "理解三角形面积公式",
                "拉窗帘原理的几何意义",
                "动画演示过程",
                "数学证明",
                "实际应用"
            ]
        },
        {
            "name": "圆形面积计算",
            "question": "如何计算圆的面积？",
            "steps": [
                "理解圆的定义",
                "半径的概念",
                "面积公式推导",
                "实际计算"
            ]
        }
    ]
    
    for test_case in test_cases:
        print(f"\n📝 测试: {test_case['name']}")
        
        try:
            script = generate_enhanced_manim_script(
                test_case["question"],
                test_case["steps"],
                f"{test_case['name'].replace(' ', '')}Scene"
            )
            
            print(f"✅ 成功生成Manim脚本")
            print(f"📊 脚本长度: {len(script)} 字符")
            
            # 检查是否包含几何动画元素
            if "Polygon" in script or "Circle" in script or "Rectangle" in script:
                print("🎨 包含几何动画元素")
            else:
                print("⚠️ 未检测到几何动画元素")
                
        except Exception as e:
            print(f"❌ 生成失败: {e}")

def test_manim_server():
    """测试Manim服务器"""
    print("\n🎬 测试Manim服务器...")
    
    try:
        # 生成测试脚本
        script = generate_enhanced_manim_script(
            "请用动画帮我解释三角形面积的拉窗帘原理",
            ["步骤1", "步骤2", "步骤3"],
            "TestScene"
        )
        
        response = requests.post(
            "http://localhost:5001/api/manim_render",
            json={
                "script": script,
                "output_name": "test_enhanced_fix",
                "scene_name": "TestScene",
                "quality": "medium"
            },
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ Manim服务器工作正常")
                print(f"📹 视频路径: {data.get('video_path', 'N/A')}")
            else:
                print(f"❌ Manim渲染失败: {data.get('error', 'Unknown error')}")
        else:
            print(f"❌ HTTP错误: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Manim服务器测试失败: {e}")

def main():
    """主测试函数"""
    print("🚀 开始测试增强修复...")
    print("=" * 50)
    
    # 测试QWEN API fallback
    test_qwen_fallback()
    
    # 测试增强Manim生成器
    test_enhanced_manim()
    
    # 测试Manim服务器
    test_manim_server()
    
    print("\n" + "=" * 50)
    print("✅ 测试完成")

if __name__ == "__main__":
    main() 