#!/usr/bin/env python3
"""
优化的Manim脚本生成器
解决渲染超时和中文字体问题
"""

def generate_optimized_manim_script(steps, scene_name="MathSolutionScene"):
    """
    生成优化的Manim脚本，避免渲染超时
    """
    
    # 限制步骤数量，避免脚本过长
    max_steps = 8
    if len(steps) > max_steps:
        # 合并相似步骤
        steps = merge_similar_steps(steps, max_steps)
    
    # 清理和优化文本内容
    cleaned_steps = []
    for step in steps:
        if step and step.strip():
            # 移除特殊字符和markdown标记
            cleaned_step = clean_text_for_manim(step.strip())
            if len(cleaned_step) < 200:  # 限制单步文本长度
                cleaned_steps.append(cleaned_step)
    
    # 如果步骤太少，添加基础步骤
    if len(cleaned_steps) < 2:
        cleaned_steps = [
            "开始解答数学问题",
            "分析题目条件",
            "应用数学公式",
            "计算得出结果"
        ]
    
    # 生成优化的Manim代码
    script = f"""from manim import *
import warnings
warnings.filterwarnings("ignore")
config.frame_rate = 30

class {scene_name}(Scene):
    def construct(self):
        # 设置背景色
        self.camera.background_color = WHITE
        
        # 标题
        title = Text("AI数学解答", font_size=36, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1)
        self.wait(0.5)
        
        # 步骤展示
        previous_text = None
        step_count = min(len({repr(cleaned_steps)}), 6)  # 限制最多6步
        
        for i, step_text in enumerate({repr(cleaned_steps)}[:step_count]):
            try:
                # 创建步骤文本
                step_num = Text(f"步骤 {{i+1}}", font_size=24, color=RED)
                step_content = Text(step_text[:80], font_size=20, color=BLACK)  # 限制文本长度
                
                # 布局
                step_num.next_to(title, DOWN, buff=1)
                step_content.next_to(step_num, DOWN, buff=0.5)
                
                # 动画
                if previous_text:
                    self.play(
                        FadeOut(previous_text),
                        Write(step_num),
                        run_time=0.8
                    )
                else:
                    self.play(Write(step_num), run_time=0.8)
                
                self.play(Write(step_content), run_time=1.5)
                self.wait(1.5)
                
                previous_text = VGroup(step_num, step_content)
                
            except Exception as e:
                # 如果某步出错，跳过
                print(f"跳过步骤 {{i+1}}: {{e}}")
                continue
        
        # 结束
        end_text = Text("解答完成!", font_size=32, color=GREEN)
        if previous_text:
            self.play(
                FadeOut(previous_text),
                Write(end_text),
                run_time=1
            )
        else:
            self.play(Write(end_text), run_time=1)
        
        self.wait(1)
"""
    
    return script

def clean_text_for_manim(text):
    """清理文本，移除可能导致渲染问题的字符"""
    import re
    
    # 移除markdown标记
    text = re.sub(r'[#*`]', '', text)
    
    # 移除特殊符号
    text = re.sub(r'[^\w\s\u4e00-\u9fff,.，。！？()（）=+\-*/÷×]', '', text)
    
    # 移除多余空格
    text = ' '.join(text.split())
    
    # 限制长度
    if len(text) > 100:
        text = text[:97] + "..."
    
    return text

def merge_similar_steps(steps, max_count):
    """合并相似的步骤以减少复杂度"""
    if len(steps) <= max_count:
        return steps
    
    # 简单的合并策略：保留关键步骤
    key_indices = [0]  # 总是保留第一步
    
    # 添加中间的关键步骤
    step_size = len(steps) // max_count
    for i in range(1, max_count - 1):
        idx = i * step_size
        if idx < len(steps):
            key_indices.append(idx)
    
    # 总是保留最后一步
    if len(steps) - 1 not in key_indices:
        key_indices.append(len(steps) - 1)
    
    return [steps[i] for i in sorted(key_indices)]

def test_optimized_generator():
    """测试优化的生成器"""
    test_steps = [
        "这是一个关于三角形面积的问题",
        "我们知道三角形的底边长度为8",
        "高度为6",
        "使用公式：面积 = 1/2 × 底 × 高",
        "代入数值：面积 = 1/2 × 8 × 6",
        "计算结果：面积 = 24",
        "所以三角形的面积是24平方单位"
    ]
    
    script = generate_optimized_manim_script(test_steps)
    print("生成的优化脚本:")
    print("=" * 50)
    print(script)
    print("=" * 50)
    
    return script

if __name__ == "__main__":
    test_optimized_generator() 