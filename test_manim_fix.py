#!/usr/bin/env python3
"""
测试修复后的Manim API服务器
"""
import requests
import time
import os

def test_manim_api():
    print("🧪 测试修复后的Manim API...")
    
    # 测试脚本 - 简单的数学动画
    manim_code = '''
from manim import *

class TestScene(Scene):
    def construct(self):
        # 创建标题
        title = Text("数学动画测试", font="SimHei").scale(1.2)
        self.play(Write(title))
        self.wait(1)
        
        # 移动标题到顶部
        self.play(title.animate.to_edge(UP))
        
        # 创建数学公式
        formula = MathTex("f(x) = x^2 + 2x + 1").scale(1.5)
        self.play(Write(formula))
        self.wait(1)
        
        # 分解公式
        factored = MathTex("f(x) = (x + 1)^2").scale(1.5)
        self.play(Transform(formula, factored))
        self.wait(2)
        
        # 创建图形
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-1, 9, 1],
            tips=False
        ).scale(0.7)
        
        graph = axes.plot(lambda x: x**2 + 2*x + 1, color=BLUE)
        
        self.play(
            FadeOut(formula),
            Create(axes),
            Create(graph)
        )
        self.wait(2)
        
        # 结束
        end_text = Text("测试完成！", font="SimHei").scale(1.0)
        self.play(
            FadeOut(axes),
            FadeOut(graph),
            Write(end_text)
        )
        self.wait(1)
'''

    # API请求参数
    payload = {
        "script": manim_code,
        "output_name": "test_fix",
        "scene_name": "TestScene"
    }
    
    # 发送请求
    try:
        print("📤 发送渲染请求...")
        response = requests.post(
            "http://localhost:5001/api/manim_render",
            json=payload,
            timeout=360  # 6分钟超时
        )
        
        print(f"📨 响应状态码: {response.status_code}")
        result = response.json()
        print(f"📄 响应内容: {result}")
        
        if result.get('success'):
            print("✅ 渲染成功!")
            video_url = result.get('video_url')
            print(f"🎥 视频URL: {video_url}")
            
            # 检查文件是否存在
            video_file = f"rendered_videos/test_fix.mp4"
            if os.path.exists(video_file):
                file_size = os.path.getsize(video_file)
                print(f"📁 视频文件: {video_file}")
                print(f"📏 文件大小: {file_size:,} 字节 ({file_size/1024/1024:.2f} MB)")
                print("🎉 测试完全成功!")
                return True
            else:
                print(f"❌ 视频文件不存在: {video_file}")
                return False
        else:
            print(f"❌ 渲染失败: {result.get('error')}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ 连接失败 - 请确保Manim API服务器正在运行 (python manim_api_server.py)")
        return False
    except requests.exceptions.Timeout:
        print("❌ 请求超时 - 渲染时间过长")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False

def test_health_check():
    """测试健康检查端点"""
    try:
        response = requests.get("http://localhost:5001/health", timeout=5)
        if response.status_code == 200:
            print("✅ 健康检查通过")
            return True
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 健康检查失败: {e}")
        return False

if __name__ == "__main__":
    print("🚀 开始测试修复后的Manim API...")
    print("=" * 50)
    
    # 先测试健康检查
    if test_health_check():
        # 再测试渲染功能
        success = test_manim_api()
        if success:
            print("\n🎊 所有测试通过！Manim API修复成功!")
        else:
            print("\n❌ 测试失败！需要进一步检查问题")
    else:
        print("\n❌ 服务器未运行！请先启动: python manim_api_server.py") 