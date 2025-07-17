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
        question_text = Text("题目: 化简：(3x + 2)(x - 4)", font_size=28, color=YELLOW)
        question_text.next_to(title, DOWN, buff=1)
        self.play(Write(question_text))
        self.wait(2)
        
        # 淡出标题页
        self.play(FadeOut(title), FadeOut(question_text))
        self.wait(0.5)
        
        # 步骤 1
        step_number_1 = Text("步骤 1", font_size=36, color=BLUE)
        step_number_1.to_edge(UP)
        self.play(Write(step_number_1))
        self.wait(0.5)
        
        step_title_1 = Text("第一步：理解题目", font_size=28, color=GREEN)
        step_title_1.next_to(step_number_1, DOWN, buff=0.8)
        self.play(Write(step_title_1))
        self.wait(1)
        
        
        step_content_1_0 = Text("题目要求我们对两个一次多项式进行乘法运算，并将其结果化简为一个标准的二次多项式。", font_size=22, color=WHITE)
        step_content_1_0.next_to(step_title_1, DOWN, buff=0.5)
        self.play(Write(step_content_1_0))
        self.wait(0.8)
        step_content_1_1 = Text("其中第一个多项式是 3x + 2，第二个多项式是 x - 4。", font_size=22, color=WHITE)
        step_content_1_1.next_to(step_title_1, DOWN, buff=0.9)
        self.play(Write(step_content_1_1))
        self.wait(0.8)
        
        self.wait(2)
        
        # 淡出步骤1
        self.play(
            FadeOut(step_number_1),
            FadeOut(step_title_1),
            FadeOut(step_content_1_0),
            FadeOut(step_content_1_1)
        )
        self.wait(0.5)
        
        # 步骤 2
        step_number_2 = Text("步骤 2", font_size=36, color=BLUE)
        step_number_2.to_edge(UP)
        self.play(Write(step_number_2))
        self.wait(0.5)
        
        step_title_2 = Text("第二步：列出方程/公式", font_size=28, color=GREEN)
        step_title_2.next_to(step_number_2, DOWN, buff=0.8)
        self.play(Write(step_title_2))
        self.wait(1)
        
        
        step_content_2_0 = Text("我们使用乘法分配律（也称为“乘法展开”），即： (a + b)(c +", font_size=22, color=WHITE)
        step_content_2_0.next_to(step_title_2, DOWN, buff=0.5)
        self.play(Write(step_content_2_0))
        self.wait(0.8)
        step_content_2_1 = Text("d) = a c + a d + b c + b d 应用于本题：", font_size=22, color=WHITE)
        step_content_2_1.next_to(step_title_2, DOWN, buff=0.9)
        self.play(Write(step_content_2_1))
        self.wait(0.8)
        step_content_2_2 = Text("(3x + 2)(x - 4) = 3x x + 3x (-4) +", font_size=22, color=WHITE)
        step_content_2_2.next_to(step_title_2, DOWN, buff=1.3)
        self.play(Write(step_content_2_2))
        self.wait(0.8)
        
        self.wait(2)
        
        # 淡出步骤2
        self.play(
            FadeOut(step_number_2),
            FadeOut(step_title_2),
            FadeOut(step_content_2_0),
            FadeOut(step_content_2_1),
            FadeOut(step_content_2_2)
        )
        self.wait(0.5)
        
        # 步骤 3
        step_number_3 = Text("步骤 3", font_size=36, color=BLUE)
        step_number_3.to_edge(UP)
        self.play(Write(step_number_3))
        self.wait(0.5)
        
        step_title_3 = Text("第三步：求解过程", font_size=28, color=GREEN)
        step_title_3.next_to(step_number_3, DOWN, buff=0.8)
        self.play(Write(step_title_3))
        self.wait(1)
        
        
        step_content_3_0 = Text("按照上述展开方式逐步计算： - 第一项：3x x = 3x^2 -", font_size=22, color=WHITE)
        step_content_3_0.next_to(step_title_3, DOWN, buff=0.5)
        self.play(Write(step_content_3_0))
        self.wait(0.8)
        step_content_3_1 = Text("第二项：3x (-4) = -12x - 第三项：2 x = 2x -", font_size=22, color=WHITE)
        step_content_3_1.next_to(step_title_3, DOWN, buff=0.9)
        self.play(Write(step_content_3_1))
        self.wait(0.8)
        step_content_3_2 = Text("第四项：2 (-4) = -8 将这些结果加在一起： 3x^2 -", font_size=22, color=WHITE)
        step_content_3_2.next_to(step_title_3, DOWN, buff=1.3)
        self.play(Write(step_content_3_2))
        self.wait(0.8)
        
        self.wait(2)
        
        # 淡出步骤3
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
        
        step_title_4 = Text("第四步：得出答案", font_size=28, color=GREEN)
        step_title_4.next_to(step_number_4, DOWN, buff=0.8)
        self.play(Write(step_title_4))
        self.wait(1)
        
        
        step_content_4_0 = Text("化简后的结果为： 3x^2 - 10x - 8 ---", font_size=22, color=WHITE)
        step_content_4_0.next_to(step_title_4, DOWN, buff=0.5)
        self.play(Write(step_content_4_0))
        self.wait(0.8)
        
        self.wait(2)
        
        # 淡出步骤4
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
        
        summary_1 = Text("1. 第一步：理解题目", font_size=20, color=WHITE)
        summary_1.next_to(summary_title, DOWN, buff=1)
        self.play(Write(summary_1))
        self.wait(0.5)
        
        summary_2 = Text("2. 第二步：列出方程/公式", font_size=20, color=WHITE)
        summary_2.next_to(summary_1, DOWN, buff=0.5)
        self.play(Write(summary_2))
        self.wait(0.5)
        
        summary_3 = Text("3. 第三步：求解过程", font_size=20, color=WHITE)
        summary_3.next_to(summary_2, DOWN, buff=0.5)
        self.play(Write(summary_3))
        self.wait(0.5)
        
        summary_4 = Text("4. 第四步：得出答案", font_size=20, color=WHITE)
        summary_4.next_to(summary_3, DOWN, buff=0.5)
        self.play(Write(summary_4))
        self.wait(0.5)
        
        self.wait(2)
        
        # 结束
        end_text = Text("谢谢观看!", font_size=32, color=GOLD)
        end_text.next_to(summary_4, DOWN, buff=1)
        self.play(Write(end_text))
        self.wait(2)
