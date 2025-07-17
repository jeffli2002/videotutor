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
        step_content = Text("题目给出一个三角形，其底边长度为8个单位，从底边垂直到底边对应顶点的高度为6个单位。目标是求出这个三角形所围成的平面区域的大小，即面积。", 
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
        step_content = Text("三角形的面积计算公式为：    $$    \text{面积} = \frac{1}{2} \times \text{底边} \times \text{高}    $$    其中，“底边”为三角形的一条边，而“高”是从这条底边对应的顶点向底边作的垂线长度。", 
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
        step_content = Text("将题目中给出的数据代入公式：    $$    \text{面积} = \frac{1}{2} \times 8 \times 6    $$    先计算乘法部分：    $$    8 \times 6 = 48    $$    然后计算一半：    $$    \frac{1}{2} \ti", 
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
        step_content = Text("所以，这个三角形的面积是 **24 平方单位**。  ---", 
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
