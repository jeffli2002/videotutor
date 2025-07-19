#!/usr/bin/env python3
"""
增强版Manim脚本生成器 - 专门处理几何问题
支持真正的几何动画，不仅仅是文字显示
"""

import json
import re
import os
import time
from typing import List, Dict, Any

class EnhancedManimGenerator:
    def __init__(self):
        self.geometry_templates = {
            'triangle_area': self.generate_triangle_area_animation,
            'triangle_curtain': self.generate_triangle_curtain_animation,
            'circle_area': self.generate_circle_area_animation,
            'rectangle_area': self.generate_rectangle_area_animation,
            'pythagorean': self.generate_pythagorean_animation,
            'general_geometry': self.generate_general_geometry_animation
        }
    
    def detect_geometry_type(self, question: str) -> str:
        """检测几何问题类型"""
        question_lower = question.lower()
        
        if '三角形' in question and ('面积' in question or '拉窗帘' in question):
            if '拉窗帘' in question:
                return 'triangle_curtain'
            else:
                return 'triangle_area'
        elif '圆' in question and '面积' in question:
            return 'circle_area'
        elif '矩形' in question or '长方形' in question:
            return 'rectangle_area'
        elif '勾股' in question or 'pythagorean' in question_lower:
            return 'pythagorean'
        else:
            return 'general_geometry'
    
    def generate_manim_script(self, question: str, steps: List[str], scene_name: str = "GeometryScene") -> str:
        """生成增强的Manim脚本"""
        geometry_type = self.detect_geometry_type(question)
        
        if geometry_type in self.geometry_templates:
            return self.geometry_templates[geometry_type](question, steps, scene_name)
        else:
            return self.generate_general_geometry_animation(question, steps, scene_name)
    
    def generate_triangle_curtain_animation(self, question: str, steps: List[str], scene_name: str) -> str:
        """生成三角形拉窗帘原理动画"""
        return f'''from manim import *
import numpy as np

class {scene_name}(Scene):
    def construct(self):
        # 设置背景
        self.camera.background_color = "#1a1a1a"
        
        # 标题
        title = Text("三角形面积拉窗帘原理", font_size=36, color=WHITE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # 创建初始三角形
        triangle = Polygon(
            [-2, -1, 0],  # 底边左端点
            [2, -1, 0],   # 底边右端点
            [0, 2, 0],    # 顶点
            color=BLUE,
            fill_opacity=0.3
        )
        
        # 显示三角形
        self.play(Create(triangle))
        self.wait(1)
        
        # 标注底边和高
        base_label = Text("底边 = b", font_size=24, color=YELLOW)
        base_label.next_to(triangle, DOWN)
        self.play(Write(base_label))
        
        height_label = Text("高 = h", font_size=24, color=YELLOW)
        height_label.next_to(triangle, RIGHT)
        self.play(Write(height_label))
        self.wait(2)
        
        # 清除标注
        self.play(FadeOut(base_label), FadeOut(height_label))
        
        # 绘制中线
        mid_point = np.array([0, -1, 0])  # 底边中点
        median = Line([0, 2, 0], mid_point, color=RED, stroke_width=3)
        self.play(Create(median))
        self.wait(1)
        
        # 分割三角形
        left_triangle = Polygon(
            [-2, -1, 0],
            [0, -1, 0],
            [0, 2, 0],
            color=GREEN,
            fill_opacity=0.3
        )
        
        right_triangle = Polygon(
            [0, -1, 0],
            [2, -1, 0],
            [0, 2, 0],
            color=ORANGE,
            fill_opacity=0.3
        )
        
        self.play(
            FadeOut(triangle),
            Create(left_triangle),
            Create(right_triangle)
        )
        self.wait(2)
        
        # 旋转右侧三角形
        right_triangle_rotated = right_triangle.copy()
        right_triangle_rotated.rotate(PI, axis=UP)
        right_triangle_rotated.move_to([-1, -1, 0])
        
        self.play(Transform(right_triangle, right_triangle_rotated))
        self.wait(2)
        
        # 形成矩形
        rectangle = Rectangle(
            width=4,
            height=3,
            color=GREEN,
            fill_opacity=0.3
        )
        rectangle.move_to([0, 0.5, 0])
        
        self.play(
            FadeOut(left_triangle),
            FadeOut(right_triangle),
            Create(rectangle)
        )
        self.wait(2)
        
        # 显示面积公式
        formula = MathTex(
            r"\\text{{三角形面积}} = \\frac{{1}}{{2}} \\times \\text{{底边}} \\times \\text{{高}}",
            font_size=32,
            color=WHITE
        )
        formula.next_to(rectangle, DOWN, buff=1)
        self.play(Write(formula))
        self.wait(3)
        
        # 最终答案
        answer = Text("面积 = (底边 × 高) ÷ 2", font_size=28, color=GREEN)
        answer.next_to(formula, DOWN)
        self.play(Write(answer))
        self.wait(2)
        
        # 结束
        self.play(FadeOut(Group(title, rectangle, formula, answer)))
        self.wait(1)
'''
    
    def generate_triangle_area_animation(self, question: str, steps: List[str], scene_name: str) -> str:
        """生成三角形面积计算动画"""
        return f'''from manim import *
import numpy as np

class {scene_name}(Scene):
    def construct(self):
        # 设置背景
        self.camera.background_color = "#1a1a1a"
        
        # 标题
        title = Text("三角形面积计算", font_size=36, color=WHITE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # 创建三角形
        triangle = Polygon(
            [-2, -1, 0],
            [2, -1, 0],
            [0, 2, 0],
            color=BLUE,
            fill_opacity=0.3
        )
        
        self.play(Create(triangle))
        self.wait(1)
        
        # 显示步骤
        for i, step in enumerate(steps[:4]):  # 限制步骤数量
            step_text = Text(f"步骤 {i+1}: {step[:50]}...", font_size=20, color=WHITE)
            step_text.next_to(title, DOWN, buff=1)
            self.play(Write(step_text))
            self.wait(2)
            self.play(FadeOut(step_text))
        
        # 显示公式
        formula = MathTex(
            r"S = \\frac{{1}}{{2}} \\times b \\times h",
            font_size=32,
            color=YELLOW
        )
        formula.next_to(triangle, DOWN)
        self.play(Write(formula))
        self.wait(2)
        
        # 结束
        self.play(FadeOut(Group(title, triangle, formula)))
        self.wait(1)
'''
    
    def generate_circle_area_animation(self, question: str, steps: List[str], scene_name: str) -> str:
        """生成圆形面积动画"""
        return f'''from manim import *
import numpy as np

class {scene_name}(Scene):
    def construct(self):
        # 设置背景
        self.camera.background_color = "#1a1a1a"
        
        # 标题
        title = Text("圆形面积计算", font_size=36, color=WHITE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # 创建圆形
        circle = Circle(radius=2, color=BLUE, fill_opacity=0.3)
        self.play(Create(circle))
        self.wait(1)
        
        # 显示半径
        radius_line = Line(ORIGIN, [2, 0, 0], color=RED, stroke_width=3)
        radius_label = Text("r", font_size=24, color=RED)
        radius_label.next_to(radius_line, UP)
        
        self.play(Create(radius_line), Write(radius_label))
        self.wait(2)
        
        # 显示公式
        formula = MathTex(
            r"S = \\pi r^2",
            font_size=32,
            color=YELLOW
        )
        formula.next_to(circle, DOWN)
        self.play(Write(formula))
        self.wait(2)
        
        # 结束
        self.play(FadeOut(Group(title, circle, radius_line, radius_label, formula)))
        self.wait(1)
'''
    
    def generate_rectangle_area_animation(self, question: str, steps: List[str], scene_name: str) -> str:
        """生成矩形面积动画"""
        return f'''from manim import *
import numpy as np

class {scene_name}(Scene):
    def construct(self):
        # 设置背景
        self.camera.background_color = "#1a1a1a"
        
        # 标题
        title = Text("矩形面积计算", font_size=36, color=WHITE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # 创建矩形
        rectangle = Rectangle(width=4, height=3, color=BLUE, fill_opacity=0.3)
        self.play(Create(rectangle))
        self.wait(1)
        
        # 标注长和宽
        length_label = Text("长 = l", font_size=24, color=YELLOW)
        length_label.next_to(rectangle, RIGHT)
        
        width_label = Text("宽 = w", font_size=24, color=YELLOW)
        width_label.next_to(rectangle, DOWN)
        
        self.play(Write(length_label), Write(width_label))
        self.wait(2)
        
        # 显示公式
        formula = MathTex(
            r"S = l \\times w",
            font_size=32,
            color=GREEN
        )
        formula.next_to(rectangle, DOWN, buff=1)
        self.play(Write(formula))
        self.wait(2)
        
        # 结束
        self.play(FadeOut(Group(title, rectangle, length_label, width_label, formula)))
        self.wait(1)
'''
    
    def generate_pythagorean_animation(self, question: str, steps: List[str], scene_name: str) -> str:
        """生成勾股定理动画"""
        return f'''from manim import *
import numpy as np

class {scene_name}(Scene):
    def construct(self):
        # 设置背景
        self.camera.background_color = "#1a1a1a"
        
        # 标题
        title = Text("勾股定理", font_size=36, color=WHITE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # 创建直角三角形
        triangle = Polygon(
            [0, 0, 0],
            [3, 0, 0],
            [3, 4, 0],
            color=BLUE,
            fill_opacity=0.3
        )
        
        self.play(Create(triangle))
        self.wait(1)
        
        # 标注边长
        a_label = MathTex("a = 3", font_size=24, color=YELLOW)
        a_label.next_to(triangle, DOWN)
        
        b_label = MathTex("b = 4", font_size=24, color=YELLOW)
        b_label.next_to(triangle, RIGHT)
        
        c_label = MathTex("c = 5", font_size=24, color=YELLOW)
        c_label.next_to(triangle, UP)
        
        self.play(Write(a_label), Write(b_label), Write(c_label))
        self.wait(2)
        
        # 显示公式
        formula = MathTex(
            r"a^2 + b^2 = c^2",
            font_size=32,
            color=GREEN
        )
        formula.next_to(triangle, DOWN, buff=1)
        self.play(Write(formula))
        self.wait(2)
        
        # 结束
        self.play(FadeOut(Group(title, triangle, a_label, b_label, c_label, formula)))
        self.wait(1)
'''
    
    def generate_general_geometry_animation(self, question: str, steps: List[str], scene_name: str) -> str:
        """生成通用几何动画"""
        return f'''from manim import *
import numpy as np

class {scene_name}(Scene):
    def construct(self):
        # 设置背景
        self.camera.background_color = "#1a1a1a"
        
        # 标题
        title = Text("几何问题解答", font_size=36, color=WHITE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # 显示问题
        question_text = Text(f"问题: {question[:50]}...", font_size=24, color=YELLOW)
        question_text.next_to(title, DOWN, buff=0.5)
        self.play(Write(question_text))
        self.wait(2)
        
        # 显示步骤
        for i, step in enumerate(steps[:4]):
            step_text = Text(f"步骤 {i+1}: {step[:60]}...", font_size=20, color=WHITE)
            step_text.next_to(question_text, DOWN, buff=0.5 + i * 0.4)
            self.play(Write(step_text))
            self.wait(2)
        
        # 创建简单的几何图形
        square = Square(side_length=2, color=BLUE, fill_opacity=0.3)
        square.move_to([3, 0, 0])
        self.play(Create(square))
        self.wait(2)
        
        # 结束
        self.play(FadeOut(Group(title, question_text, square)))
        self.wait(1)
'''

def generate_enhanced_manim_script(question: str, steps: List[str], scene_name: str = "GeometryScene") -> str:
    """生成增强的Manim脚本的主函数"""
    generator = EnhancedManimGenerator()
    return generator.generate_manim_script(question, steps, scene_name)

def test_enhanced_generator():
    """测试增强生成器"""
    question = "请用动画帮我解释三角形面积的拉窗帘原理"
    steps = [
        "理解三角形面积公式",
        "拉窗帘原理的几何意义", 
        "动画演示过程",
        "数学证明",
        "实际应用"
    ]
    
    script = generate_enhanced_manim_script(question, steps, "TriangleCurtainScene")
    print("生成的增强Manim脚本:")
    print("=" * 50)
    print(script)
    print("=" * 50)
    
    return script

if __name__ == "__main__":
    test_enhanced_generator() 