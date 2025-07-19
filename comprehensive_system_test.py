#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import time
import os

def test_qwen_api():
    """测试QWEN API服务器"""
    print("🧪 测试QWEN API服务器...")
    
    url = "http://localhost:8002/api/qwen"
    headers = {"Content-Type": "application/json"}
    
    test_cases = [
        {
            "name": "几何问题 - 三角形面积",
            "data": {
                "api_key": "test_key",
                "messages": [{"role": "user", "content": "请解释三角形面积拉窗帘原理"}]
            }
        },
        {
            "name": "代数问题 - 方程求解",
            "data": {
                "api_key": "test_key", 
                "messages": [{"role": "user", "content": "解方程：2x + 5 = 15"}]
            }
        },
        {
            "name": "微积分问题",
            "data": {
                "api_key": "test_key",
                "messages": [{"role": "user", "content": "求函数f(x) = x²的导数"}]
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n📝 测试: {test_case['name']}")
        try:
            response = requests.post(url, json=test_case['data'], headers=headers, timeout=10)
            print(f"📊 状态码: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ 成功响应: {len(result.get('output', {}).get('text', ''))} 字符")
                print(f"📄 响应内容: {result.get('output', {}).get('text', '')[:100]}...")
            else:
                print(f"❌ 错误响应: {response.text}")
                
        except Exception as e:
            print(f"❌ 请求失败: {e}")

def test_manim_server():
    """测试Manim服务器"""
    print("\n🎬 测试Manim服务器...")
    
    url = "http://localhost:5001/api/manim_render"
    headers = {"Content-Type": "application/json"}
    
    # 测试几何动画脚本
    geometry_script = '''
from manim import *

class TriangleAreaScene(Scene):
    def construct(self):
        # 创建标题
        title = Text("三角形面积拉窗帘原理", font_size=36)
        self.play(Write(title))
        self.wait(1)
        
        # 创建三角形
        triangle = Polygon([-2, -1, 0], [2, -1, 0], [0, 2, 0], color=BLUE)
        self.play(Create(triangle))
        self.wait(1)
        
        # 显示面积公式
        formula = MathTex(r"S = \frac{1}{2} \times \text{底边} \times \text{高}")
        formula.shift(DOWN * 2)
        self.play(Write(formula))
        self.wait(2)
        
        # 拉窗帘动画
        curtain_line = Line([-3, 1, 0], [3, 1, 0], color=RED)
        self.play(Create(curtain_line))
        self.wait(1)
        
        # 移动顶点
        new_triangle = Polygon([-2, 1, 0], [2, 1, 0], [0, 2, 0], color=GREEN)
        self.play(Transform(triangle, new_triangle))
        self.wait(2)
        
        # 结论
        conclusion = Text("面积保持不变！", font_size=24, color=YELLOW)
        conclusion.shift(DOWN * 3)
        self.play(Write(conclusion))
        self.wait(2)
'''
    
    test_data = {
        "script": geometry_script,
        "output_name": f"test_geometry_{int(time.time())}",
        "scene_name": "TriangleAreaScene",
        "quality": "medium",
        "timeout": 120000
    }
    
    try:
        print("📡 发送Manim渲染请求...")
        response = requests.post(url, json=test_data, headers=headers, timeout=180)
        print(f"📊 状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Manim渲染成功: {result}")
            if result.get('success'):
                video_path = result.get('video_path') or result.get('video_url')
                print(f"🎥 视频路径: {video_path}")
                return video_path
        else:
            print(f"❌ Manim渲染失败: {response.text}")
            
    except Exception as e:
        print(f"❌ Manim请求失败: {e}")
    
    return None

def test_tts_service():
    """测试TTS服务"""
    print("\n🎤 测试TTS服务...")
    
    url = "http://localhost:8003/api/tts"
    headers = {"Content-Type": "application/json"}
    
    test_data = {
        "text": "欢迎使用数学视频生成系统！这是一个测试语音。",
        "language": "zh",
        "voice": "female"
    }
    
    try:
        print("📡 发送TTS请求...")
        response = requests.post(url, json=test_data, headers=headers, timeout=30)
        print(f"📊 状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ TTS生成成功: {result}")
            return result.get('audio_url')
        else:
            print(f"❌ TTS生成失败: {response.text}")
            
    except Exception as e:
        print(f"❌ TTS请求失败: {e}")
    
    return None

def test_video_playback(video_path):
    """测试视频播放"""
    print(f"\n🎥 测试视频播放: {video_path}")
    
    if not video_path:
        print("❌ 没有视频路径")
        return False
    
    # 检查视频文件是否存在
    if video_path.startswith('/rendered_videos/'):
        local_path = video_path[1:]  # 移除开头的斜杠
        if os.path.exists(local_path):
            print(f"✅ 视频文件存在: {local_path}")
            file_size = os.path.getsize(local_path)
            print(f"📊 文件大小: {file_size} 字节")
            return True
        else:
            print(f"❌ 视频文件不存在: {local_path}")
            return False
    else:
        print(f"⚠️ 视频路径格式: {video_path}")
        return False

def test_frontend_integration():
    """测试前端集成"""
    print("\n🌐 测试前端集成...")
    
    # 模拟前端调用流程
    test_question = "求底边为8，高为6的三角形面积"
    
    print(f"📝 测试问题: {test_question}")
    
    # 1. 调用QWEN API
    print("步骤1: 调用QWEN API...")
    qwen_result = test_qwen_api_single(test_question)
    
    # 2. 生成Manim动画
    print("步骤2: 生成Manim动画...")
    video_path = test_manim_server()
    
    # 3. 测试视频播放
    print("步骤3: 测试视频播放...")
    playback_ok = test_video_playback(video_path) if video_path else False
    
    # 4. 测试TTS
    print("步骤4: 测试TTS...")
    tts_result = test_tts_service()
    
    return {
        "qwen_success": bool(qwen_result),
        "manim_success": bool(video_path),
        "playback_success": playback_ok,
        "tts_success": bool(tts_result),
        "video_path": video_path
    }

def test_qwen_api_single(question):
    """测试单个QWEN API调用"""
    url = "http://localhost:8002/api/qwen"
    headers = {"Content-Type": "application/json"}
    
    data = {
        "api_key": "test_key",
        "messages": [{"role": "user", "content": question}]
    }
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=10)
        if response.status_code == 200:
            result = response.json()
            return result.get('output', {}).get('text', '')
        return None
    except:
        return None

def main():
    """主测试函数"""
    print("🚀 开始全面系统测试...")
    print("=" * 50)
    
    # 测试各个服务
    print("\n1️⃣ 测试QWEN API服务器")
    test_qwen_api()
    
    print("\n2️⃣ 测试Manim服务器")
    video_path = test_manim_server()
    
    print("\n3️⃣ 测试TTS服务")
    test_tts_service()
    
    if video_path:
        print("\n4️⃣ 测试视频播放")
        test_video_playback(video_path)
    
    print("\n5️⃣ 测试前端集成")
    integration_result = test_frontend_integration()
    
    # 输出测试结果
    print("\n" + "=" * 50)
    print("📊 测试结果汇总:")
    print(f"QWEN API: {'✅ 正常' if integration_result['qwen_success'] else '❌ 失败'}")
    print(f"Manim动画: {'✅ 正常' if integration_result['manim_success'] else '❌ 失败'}")
    print(f"视频播放: {'✅ 正常' if integration_result['playback_success'] else '❌ 失败'}")
    print(f"TTS服务: {'✅ 正常' if integration_result['tts_success'] else '❌ 失败'}")
    
    if integration_result['video_path']:
        print(f"🎥 生成的视频: {integration_result['video_path']}")
    
    print("\n🏁 测试完成!")

if __name__ == "__main__":
    main() 