#!/usr/bin/env python3
"""
完整的端到端集成测试
验证QWEN API + Manim渲染的完整流程
"""

import requests
import json
import time

def test_qwen_api():
    """测试QWEN API是否正常工作"""
    print("🤖 测试QWEN API...")
    
    # 测试数学问题
    test_question = "计算三角形的面积，底边长8，高为6"
    
    qwen_payload = {
        "api_key": "sk-be28f1deacb548a4932a35dd58e1ed85",  # 您的API密钥
        "messages": [
            {
                "role": "user", 
                "content": f"请详细解答这个数学问题，分步骤说明：{test_question}"
            }
        ],
        "temperature": 0.1,
        "max_tokens": 500
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/qwen",
            json=qwen_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if 'output' in result and 'text' in result['output']:
                content = result['output']['text']
                print("✅ QWEN API测试成功!")
                print(f"📄 解答内容: {content[:100]}...")
                return content
            else:
                print(f"❌ QWEN API响应格式异常: {result}")
                return None
        else:
            print(f"❌ QWEN API请求失败: {response.status_code}")
            print(f"响应: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ QWEN API测试失败: {e}")
        return None

def test_optimized_manim_with_qwen_content(qwen_content):
    """使用QWEN内容测试优化的Manim渲染"""
    print("\n🎬 测试QWEN内容的Manim渲染...")
    
    if not qwen_content:
        print("❌ 没有QWEN内容可供测试")
        return False
    
    # 模拟前端的步骤分割逻辑
    steps = []
    lines = qwen_content.split('\n')
    for line in lines:
        line = line.strip()
        if line and len(line) > 5:  # 过滤太短的行
            # 清理文本
            cleaned_line = line.replace('*', '').replace('#', '').replace('`', '')
            if len(cleaned_line) < 150:  # 限制长度
                steps.append(cleaned_line)
    
    # 限制步骤数量
    steps = steps[:6]
    if len(steps) < 2:
        steps = ["开始解答数学问题", "应用三角形面积公式", "计算得出结果"]
    
    print(f"📝 提取的步骤 ({len(steps)}个):")
    for i, step in enumerate(steps):
        print(f"  {i+1}. {step[:50]}...")
    
    # 生成优化的Manim脚本
    steps_str = json.dumps(steps, ensure_ascii=False)
    
    manim_script = f'''from manim import *
import warnings
warnings.filterwarnings("ignore")

class QwenMathSolutionScene(Scene):
    def construct(self):
        # 设置背景
        self.camera.background_color = WHITE
        
        # 标题
        title = Text("AI数学解答", font_size=32, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1)
        self.wait(0.5)
        
        # 步骤展示
        previous_text = None
        steps = {steps_str}
        
        for i, step_text in enumerate(steps):
            try:
                # 创建步骤文本（限制长度）
                step_num = Text(f"步骤 {{i+1}}", font_size=22, color=RED)
                step_content = Text(step_text[:50] + ("..." if len(step_text) > 50 else ""), 
                                  font_size=16, color=BLACK)
                
                # 布局
                step_num.next_to(title, DOWN, buff=1)
                step_content.next_to(step_num, DOWN, buff=0.5)
                
                # 动画（缩短时间）
                if previous_text:
                    self.play(FadeOut(previous_text), run_time=0.4)
                
                self.play(Write(step_num), run_time=0.6)
                self.play(Write(step_content), run_time=0.8)
                self.wait(0.6)
                
                previous_text = VGroup(step_num, step_content)
                
            except Exception as e:
                print(f"跳过步骤 {{i+1}}: {{e}}")
                continue
        
        # 结束
        end_text = Text("解答完成!", font_size=28, color=GREEN)
        if previous_text:
            self.play(FadeOut(previous_text), run_time=0.4)
        
        self.play(Write(end_text), run_time=0.8)
        self.wait(0.8)
'''

    # 发送到Manim API
    payload = {
        "script": manim_script,
        "output_name": f"qwen_integration_test_{int(time.time())}",
        "scene_name": "QwenMathSolutionScene"
    }
    
    try:
        print("🎬 发送Manim渲染请求...")
        response = requests.post(
            "http://localhost:5001/api/manim_render",
            json=payload,
            timeout=120  # 2分钟超时
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ 集成测试成功!")
                print(f"🎥 生成视频: {result.get('video_url')}")
                return True
            else:
                print(f"❌ Manim渲染失败: {result.get('error')}")
                return False
        else:
            print(f"❌ Manim API请求失败: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Manim渲染超时")
        return False
    except Exception as e:
        print(f"❌ 集成测试失败: {e}")
        return False

def test_system_status():
    """检查系统状态"""
    print("🔍 检查系统状态...")
    
    services = []
    
    # 检查QWEN API代理
    try:
        response = requests.get("http://localhost:8000", timeout=5)
        services.append(("QWEN API代理 (端口8000)", "✅ 运行中"))
    except:
        services.append(("QWEN API代理 (端口8000)", "❌ 未运行"))
    
    # 检查Manim API
    try:
        response = requests.get("http://localhost:5001/health", timeout=5)
        if response.status_code == 200:
            services.append(("Manim API (端口5001)", "✅ 运行中"))
        else:
            services.append(("Manim API (端口5001)", "❌ 异常"))
    except:
        services.append(("Manim API (端口5001)", "❌ 未运行"))
    
    print("\n📊 系统状态:")
    for service, status in services:
        print(f"  {service}: {status}")
    
    return all("✅" in status for _, status in services)

def main():
    """主测试流程"""
    print("🚀 开始完整的端到端集成测试")
    print("=" * 60)
    
    # 1. 检查系统状态
    if not test_system_status():
        print("\n❌ 系统服务未完全启动，请检查:")
        print("  - python server.py (QWEN API代理)")
        print("  - python manim_api_server.py (Manim API)")
        return False
    
    print("\n" + "-" * 40)
    
    # 2. 测试QWEN API
    qwen_content = test_qwen_api()
    
    print("\n" + "-" * 40)
    
    # 3. 测试集成渲染
    if qwen_content:
        integration_success = test_optimized_manim_with_qwen_content(qwen_content)
    else:
        print("⚠️  跳过集成测试（QWEN API失败）")
        integration_success = False
    
    print("\n" + "=" * 60)
    
    # 4. 总结
    if qwen_content and integration_success:
        print("🎉 完整集成测试通过！")
        print("\n✅ 系统完全正常:")
        print("  ✅ QWEN API正常响应")
        print("  ✅ Manim渲染无超时")
        print("  ✅ 中文内容处理正常")
        print("  ✅ 前端后端集成成功")
        print("\n🎯 可以正常使用前端界面了!")
        print("📱 访问: http://localhost:8000/test-server.html")
        return True
    else:
        print("❌ 集成测试未完全通过")
        if not qwen_content:
            print("  - QWEN API需要检查")
        if not integration_success:
            print("  - Manim集成需要优化")
        return False

if __name__ == "__main__":
    main() 