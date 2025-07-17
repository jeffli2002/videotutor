from manim import *
import math

class MathSolutionScene(Scene):
    def construct(self):
        # 设置背景
        self.camera.background_color = "#1a1a1a"
        
        # 第1页：标题页
        title = Text("数学解题视频", font_size=48, color=WHITE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # 题目
        question_text = Text("题目：" + "求底边为8，高为6的三角形面积", 
                           font_size=32, color=YELLOW, line_spacing=1.2)
        question_text.next_to(title, DOWN, buff=0.5)
        question_text.to_edge(LEFT, buff=1)
        self.play(Write(question_text))
        self.wait(3)
        
        # 淡出标题页
        self.play(FadeOut(title), FadeOut(question_text))
        self.wait(0.5)
        
        
        # 第2页：步骤 1
        # 步骤编号
        step_number = Text("步骤 1", font_size=36, color=BLUE)
        step_number.to_edge(UP)
        self.play(Write(step_number))
        self.wait(0.5)
        
        # 步骤标题
        step_title = Text("第一步：理解题目", 
                         font_size=32, color=GREEN)
        step_title.next_to(step_number, DOWN, buff=0.5)
        self.play(Write(step_title))
        self.wait(1)
        
        # 步骤内容
        step_content = Text("题目给出一个三角形，其底边长度为8，高度为6。要求我们求出这个三角形的面积。      - “底边”指的是三角形的一条边，通常作为面积计算的基准；    - “高”是指从底边对应的顶点垂直到底边的距离；    - 三角形的面积与底边和高的乘积成正比。", 
                          font_size=24, color=WHITE, line_spacing=1.2)
        step_content.next_to(step_title, DOWN, buff=0.8)
        step_content.to_edge(LEFT, buff=1)
        self.play(Write(step_content))
        self.wait(3)
        
        # 淡出当前步骤页
        self.play(FadeOut(step_number), FadeOut(step_title), FadeOut(step_content))
        self.wait(0.5)
        
        
        # 最后一页：总结页
        summary_title = Text("解题总结", font_size=36, color=RED)
        summary_title.to_edge(UP)
        self.play(Write(summary_title))
        self.wait(1)
        
        # 显示所有步骤编号
        steps_summary = VGroup()
        
        step_summary_0 = Text("步骤 1: 第一步：理解题目", 
                                   font_size=20, color=WHITE)
        steps_summary.add(step_summary_0)
        
        
        steps_summary.arrange(DOWN, buff=0.3)
        steps_summary.next_to(summary_title, DOWN, buff=0.8)
        self.play(Write(steps_summary))
        self.wait(2)
        
        # 结束语
        end_text = Text("解题完成！", font_size=36, color=GOLD)
        end_text.next_to(steps_summary, DOWN, buff=1)
        self.play(Write(end_text))
        self.wait(2)
        
        # 淡出所有内容
        self.play(FadeOut(summary_title), FadeOut(steps_summary), FadeOut(end_text))
        self.wait(1)
