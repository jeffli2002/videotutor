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
        question_text = Text("题目：" + "求函数 f(x) = 2x + 3 在 x = 4 时的值", 
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
        step_content = Text("题目要求我们求函数 $ f(x) = 2x + 3 $ 在 $ x = 4 $ 时的值。也就是说，当输入值为 4 时，输出值是多少。这是一个典型的函数代入问题，只需要将 $ x $ 替换为 4 即可。", 
                          font_size=24, color=WHITE, line_spacing=1.2)
        step_content.next_to(step_title, DOWN, buff=0.8)
        step_content.to_edge(LEFT, buff=1)
        self.play(Write(step_content))
        self.wait(3)
        
        # 淡出当前步骤页
        self.play(FadeOut(step_number), FadeOut(step_title), FadeOut(step_content))
        self.wait(0.5)
        

        # 第3页：步骤 2
        # 步骤编号
        step_number = Text("步骤 2", font_size=36, color=BLUE)
        step_number.to_edge(UP)
        self.play(Write(step_number))
        self.wait(0.5)
        
        # 步骤标题
        step_title = Text("第二步：列出方程/公式", 
                         font_size=32, color=GREEN)
        step_title.next_to(step_number, DOWN, buff=0.5)
        self.play(Write(step_title))
        self.wait(1)
        
        # 步骤内容
        step_content = Text("已知函数表达式为：    $$    f(x) = 2x + 3    $$", 
                          font_size=24, color=WHITE, line_spacing=1.2)
        step_content.next_to(step_title, DOWN, buff=0.8)
        step_content.to_edge(LEFT, buff=1)
        self.play(Write(step_content))
        self.wait(3)
        
        # 淡出当前步骤页
        self.play(FadeOut(step_number), FadeOut(step_title), FadeOut(step_content))
        self.wait(0.5)
        

        # 第4页：步骤 3
        # 步骤编号
        step_number = Text("步骤 3", font_size=36, color=BLUE)
        step_number.to_edge(UP)
        self.play(Write(step_number))
        self.wait(0.5)
        
        # 步骤标题
        step_title = Text("第三步：求解过程", 
                         font_size=32, color=GREEN)
        step_title.next_to(step_number, DOWN, buff=0.5)
        self.play(Write(step_title))
        self.wait(1)
        
        # 步骤内容
        step_content = Text("将 $ x = 4 $ 代入上述函数表达式中：    $$    f(4) = 2 \times 4 + 3    $$    先进行乘法运算：    $$    2 \times 4 = 8    $$    然后进行加法运算：    $$    8 + 3 = 11    $$", 
                          font_size=24, color=WHITE, line_spacing=1.2)
        step_content.next_to(step_title, DOWN, buff=0.8)
        step_content.to_edge(LEFT, buff=1)
        self.play(Write(step_content))
        self.wait(3)
        
        # 淡出当前步骤页
        self.play(FadeOut(step_number), FadeOut(step_title), FadeOut(step_content))
        self.wait(0.5)
        

        # 第5页：步骤 4
        # 步骤编号
        step_number = Text("步骤 4", font_size=36, color=BLUE)
        step_number.to_edge(UP)
        self.play(Write(step_number))
        self.wait(0.5)
        
        # 步骤标题
        step_title = Text("第四步：得出答案", 
                         font_size=32, color=GREEN)
        step_title.next_to(step_number, DOWN, buff=0.5)
        self.play(Write(step_title))
        self.wait(1)
        
        # 步骤内容
        step_content = Text("因此，函数 $ f(x) = 2x + 3 $ 在 $ x = 4 $ 时的值为：    $$    \boxed{11}    $$  ---", 
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
        

        step_summary_1 = Text("步骤 2: 第二步：列出方程/公式", 
                                   font_size=20, color=WHITE)
        steps_summary.add(step_summary_1)
        

        step_summary_2 = Text("步骤 3: 第三步：求解过程", 
                                   font_size=20, color=WHITE)
        steps_summary.add(step_summary_2)
        

        step_summary_3 = Text("步骤 4: 第四步：得出答案", 
                                   font_size=20, color=WHITE)
        steps_summary.add(step_summary_3)
        
        
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
