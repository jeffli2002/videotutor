from manim import *
import math

class MathSolutionScene(Scene):
    def construct(self):
        # 设置背景
        self.camera.background_color = "#1a1a1a"
        
        # 标题页
        title = Text("数学解题视频", font_size=48, color=WHITE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # 题目
        question_text = Text("题目: 解方程：2x + 5 = 15", 
                           font_size=28, color=YELLOW)
        question_text.next_to(title, DOWN, buff=1)
        self.play(Write(question_text))
        self.wait(2)
        
        # 淡出标题页
        self.play(FadeOut(title), FadeOut(question_text))
        self.wait(0.5)
        
        # 按顺序显示每个步骤 (1, 2, 3, 4)
        
        # 步骤 1
        step_number_1 = Text("步骤 1", font_size=36, color=BLUE)
        step_number_1.to_edge(UP)
        self.play(Write(step_number_1))
        self.wait(0.5)
        
        # 步骤标题
        step_title_1 = Text("第一步：理解题目", font_size=28, color=GREEN)
        step_title_1.next_to(step_number_1, DOWN, buff=0.8)
        self.play(Write(step_title_1))
        self.wait(1)
        
        # 步骤内容 (分行显示)
        
        step_content_1_0 = Text("题目要求我们找出满足等式 2x + 5 = 15 的 x", font_size=22, color=WHITE)
        step_content_1_0.next_to(step_title_1, DOWN, buff=0.5)
        self.play(Write(step_content_1_0))
        self.wait(0.8)
        step_content_1_1 = Text("值。其中，“2x”表示 x", font_size=22, color=WHITE)
        step_content_1_1.next_to(step_title_1, DOWN, buff=0.9)
        self.play(Write(step_content_1_1))
        self.wait(0.8)
        step_content_1_2 = Text("的两倍，“+5”表示再加上5，整个表达式等于15。我们需要找到这个 x", font_size=22, color=WHITE)
        step_content_1_2.next_to(step_title_1, DOWN, buff=1.3)
        self.play(Write(step_content_1_2))
        self.wait(0.8)
        
        self.wait(2)
        
        # 淡出当前步骤
        self.play(
            FadeOut(step_number_1),
            FadeOut(step_title_1),
            FadeOut(step_content_1_0),
            FadeOut(step_content_1_1),
            FadeOut(step_content_1_2)
        )
        self.wait(0.5)

        # 步骤 2
        step_number_2 = Text("步骤 2", font_size=36, color=BLUE)
        step_number_2.to_edge(UP)
        self.play(Write(step_number_2))
        self.wait(0.5)
        
        # 步骤标题
        step_title_2 = Text("第二步：列出方程/公式", font_size=28, color=GREEN)
        step_title_2.next_to(step_number_2, DOWN, buff=0.8)
        self.play(Write(step_title_2))
        self.wait(1)
        
        # 步骤内容 (分行显示)
        
        step_content_2_0 = Text("根据题目直接给出的信息，我们可以写出原始方程： 2x + 5 = 15", font_size=22, color=WHITE)
        step_content_2_0.next_to(step_title_2, DOWN, buff=0.5)
        self.play(Write(step_content_2_0))
        self.wait(0.8)
        
        self.wait(2)
        
        # 淡出当前步骤
        self.play(
            FadeOut(step_number_2),
            FadeOut(step_title_2),
            FadeOut(step_content_2_0)
        )
        self.wait(0.5)

        # 步骤 3
        step_number_3 = Text("步骤 3", font_size=36, color=BLUE)
        step_number_3.to_edge(UP)
        self.play(Write(step_number_3))
        self.wait(0.5)
        
        # 步骤标题
        step_title_3 = Text("第三步：求解过程", font_size=28, color=GREEN)
        step_title_3.next_to(step_number_3, DOWN, buff=0.8)
        self.play(Write(step_title_3))
        self.wait(1)
        
        # 步骤内容 (分行显示)
        
        step_content_3_0 = Text("- 第一步操作：消去常数项（5） 我们希望把含有 x", font_size=22, color=WHITE)
        step_content_3_0.next_to(step_title_3, DOWN, buff=0.5)
        self.play(Write(step_content_3_0))
        self.wait(0.8)
        step_content_3_1 = Text("的项单独留在一边，因此先从两边同时减去5： 2x + 5 - 5 =", font_size=22, color=WHITE)
        step_content_3_1.next_to(step_title_3, DOWN, buff=0.9)
        self.play(Write(step_content_3_1))
        self.wait(0.8)
        step_content_3_2 = Text("15 - 5 简化后得到： 2x = 10 -", font_size=22, color=WHITE)
        step_content_3_2.next_to(step_title_3, DOWN, buff=1.3)
        self.play(Write(step_content_3_2))
        self.wait(0.8)
        
        self.wait(2)
        
        # 淡出当前步骤
        self.play(
            FadeOut(step_number_3),
            FadeOut(step_title_3),
            FadeOut(step_content_3_0),
            FadeOut(step_content_3_1),
            FadeOut(step_content_3_2)
        )
        self.wait(0.5)

        # 步骤 4
        step_number_4 = Text("步骤 4", font_size=36, color=BLUE)
        step_number_4.to_edge(UP)
        self.play(Write(step_number_4))
        self.wait(0.5)
        
        # 步骤标题
        step_title_4 = Text("第四步：得出答案", font_size=28, color=GREEN)
        step_title_4.next_to(step_number_4, DOWN, buff=0.8)
        self.play(Write(step_title_4))
        self.wait(1)
        
        # 步骤内容 (分行显示)
        
        step_content_4_0 = Text("经过上述运算，我们得到了未知数 x 的值为： x = 5 ---", font_size=22, color=WHITE)
        step_content_4_0.next_to(step_title_4, DOWN, buff=0.5)
        self.play(Write(step_content_4_0))
        self.wait(0.8)
        
        self.wait(2)
        
        # 淡出当前步骤
        self.play(
            FadeOut(step_number_4),
            FadeOut(step_title_4),
            FadeOut(step_content_4_0)
        )
        self.wait(0.5)
        
        # 总结页
        summary_title = Text("解题完成", font_size=36, color=RED)
        summary_title.to_edge(UP)
        self.play(Write(summary_title))
        self.wait(1)
        
        # 显示所有步骤总结
        
        summary_1 = Text("1. 第一步：理解题目", font_size=20, color=WHITE)
        summary_1.next_to(summary_title, DOWN, buff=1)
        self.play(Write(summary_1))
        self.wait(0.5)
        summary_2 = Text("2. 第二步：列出方程/公式", font_size=20, color=WHITE)
        summary_2.next_to(summary_title, DOWN, buff=1.5)
        self.play(Write(summary_2))
        self.wait(0.5)
        summary_3 = Text("3. 第三步：求解过程", font_size=20, color=WHITE)
        summary_3.next_to(summary_title, DOWN, buff=2)
        self.play(Write(summary_3))
        self.wait(0.5)
        summary_4 = Text("4. 第四步：得出答案", font_size=20, color=WHITE)
        summary_4.next_to(summary_title, DOWN, buff=2.5)
        self.play(Write(summary_4))
        self.wait(0.5)
        
        self.wait(2)
        
        # 结束
        end_text = Text("谢谢观看!", font_size=32, color=GOLD)
        end_text.next_to(summary_4, DOWN, buff=1)
        self.play(Write(end_text))
        self.wait(2)
