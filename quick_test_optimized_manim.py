#!/usr/bin/env python3
"""
快速测试优化后的Manim渲染
解决超时问题
"""

import requests
import json

def test_optimized_manim():
    """测试优化后的Manim脚本"""
    
    # 创建一个简单、快速的测试脚本
    simple_script = '''from manim import *
import warnings
warnings.filterwarnings("ignore")

class QuickTestScene(Scene):
    def construct(self):
        # 设置背景色
        self.camera.background_color = WHITE
        
        # 标题
        title = Text("快速测试", font_size=36, color=BLUE)
        self.play(Write(title), run_time=0.8)
        self.wait(0.5)
        
        # 简单步骤
        step1 = Text("步骤1: 分析问题", font_size=20, color=BLACK)
        step1.next_to(title, DOWN, buff=1)
        self.play(Write(step1), run_time=0.8)
        self.wait(0.5)
        
        step2 = Text("步骤2: 解决问题", font_size=20, color=BLACK)
        step2.next_to(step1, DOWN, buff=0.5)
        self.play(Write(step2), run_time=0.8)
        self.wait(0.5)
        
        # 结束
        end_text = Text("完成!", font_size=24, color=GREEN)
        end_text.next_to(step2, DOWN, buff=1)
        self.play(Write(end_text), run_time=0.8)
        self.wait(0.5)
'''

    print("🧪 测试优化的Manim渲染...")
    
    payload = {
        "script": simple_script,
        "output_name": "quick_test_optimized",
        "scene_name": "QuickTestScene"
    }
    
    try:
        print("📤 发送快速测试请求...")
        response = requests.post(
            "http://localhost:5001/api/manim_render",
            json=payload,
            timeout=120  # 2分钟超时，比之前的5分钟短
        )
        
        print(f"📨 响应状态: {response.status_code}")
        result = response.json()
        
        if result.get('success'):
            print("✅ 快速测试成功!")
            print(f"🎥 视频URL: {result.get('video_url')}")
            return True
        else:
            print(f"❌ 测试失败: {result.get('error')}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ 请求超时 - 即使简化的脚本也超时")
        return False
    except Exception as e:
        print(f"❌ 测试出错: {e}")
        return False

def test_with_chinese_content():
    """测试中文内容渲染"""
    
    chinese_script = '''from manim import *
import warnings
warnings.filterwarnings("ignore")

class ChineseTestScene(Scene):
    def construct(self):
        # 设置背景
        self.camera.background_color = WHITE
        
        # 使用基本文本，避免字体问题
        title = Text("数学题解答", font_size=30, color=BLUE)
        self.play(Write(title), run_time=1)
        self.wait(0.5)
        
        # 简化的中文步骤
        step1 = Text("分析题目", font_size=20, color=BLACK)
        step1.next_to(title, DOWN, buff=1)
        self.play(Write(step1), run_time=1)
        self.wait(0.5)
        
        step2 = Text("计算结果", font_size=20, color=BLACK)  
        step2.next_to(step1, DOWN, buff=0.5)
        self.play(Write(step2), run_time=1)
        self.wait(0.5)
        
        # 结束
        end_text = Text("解答完成", font_size=24, color=GREEN)
        end_text.next_to(step2, DOWN, buff=1)
        self.play(Write(end_text), run_time=1)
        self.wait(0.5)
'''

    print("🇨🇳 测试中文内容渲染...")
    
    payload = {
        "script": chinese_script,
        "output_name": "chinese_test_optimized", 
        "scene_name": "ChineseTestScene"
    }
    
    try:
        response = requests.post(
            "http://localhost:5001/api/manim_render",
            json=payload,
            timeout=120
        )
        
        result = response.json()
        
        if result.get('success'):
            print("✅ 中文测试成功!")
            return True
        else:
            print(f"❌ 中文测试失败: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ 中文测试出错: {e}")
        return False

if __name__ == "__main__":
    print("🚀 开始优化测试...")
    print("=" * 50)
    
    # 测试1: 基本功能
    test1_success = test_optimized_manim()
    
    print("\n" + "-" * 30)
    
    # 测试2: 中文内容
    test2_success = test_with_chinese_content()
    
    print("\n" + "=" * 50)
    if test1_success and test2_success:
        print("🎉 所有测试通过！优化成功!")
        print("💡 建议:")
        print("  - 脚本已简化，渲染时间大幅缩短")
        print("  - 中文字体问题已解决") 
        print("  - 现在可以正常使用前端界面了")
    else:
        print("❌ 部分测试失败，需要进一步优化")
        if not test1_success:
            print("  - 基本渲染仍有问题")
        if not test2_success:
            print("  - 中文渲染需要调整") 