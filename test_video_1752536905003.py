from manim import *
import math

class MathSolutionScene(Scene):
    def construct(self):
        # 设置背景
        self.camera.background_color = "#1a1a1a"
        
        # 标题
        title = Text("数学解题视频", font_size=48, color=WHITE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # 题目
        question_text = Text("题目：" + "解方程：2x + 5 = 15", 
                           font_size=32, color=YELLOW, line_spacing=1.2)
        question_text.next_to(title, DOWN, buff=0.5)
        question_text.to_edge(LEFT, buff=1)
        self.play(Write(question_text))
        self.wait(2)
        
        # 步骤标题
        steps_title = Text("解题步骤", font_size=36, color=BLUE)
        steps_title.next_to(question_text, DOWN, buff=1)
        self.play(Write(steps_title))
        self.wait(1)
        
        # 渲染每个步骤
        current_y = steps_title.get_bottom()[1] - 1
        
        
        # 步骤 1: 第一步：理解题目
        step1_title = Text("步骤 1: 第一步：理解题目", 
                                      font_size=28, color=GREEN)
        step1_title.move_to([-4, current_y, 0])
        self.play(Write(step1_title))
        self.wait(1)
        
        # 步骤内容
        step1_content = Text("题目要求我们找出使得等式 2x + 5 = 15 成立的 x 值。也就是说，我们需要找到一个数 x，当它乘以 2 并加上 5 后，结果等于 15。", 
                                        font_size=20, color=WHITE, line_spacing=1.1)
        step1_content.next_to(step1_title, DOWN, buff=0.3)
        step1_content.to_edge(LEFT, buff=1)
        self.play(Write(step1_content))
        self.wait(2)
        
        current_y -= 1.5
        
        
        # 最终答案
        answer_title = Text("最终答案", font_size=32, color=RED)
        answer_title.move_to([0, current_y, 0])
        self.play(Write(answer_title))
        self.wait(1)
        
        # 结束
        end_text = Text("解题完成！", font_size=36, color=GOLD)
        end_text.move_to([0, -2, 0])
        self.play(Write(end_text))
        self.wait(2)
        
        # 淡出所有内容
        all_objects = [title, question_text, steps_title, step1_title, step1_content, answer_title, end_text]
        self.play(*[FadeOut(obj) for obj in all_objects])
        self.wait(1)
