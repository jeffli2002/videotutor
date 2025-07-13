from manim import *
import warnings
warnings.filterwarnings("ignore")

class MathSolutionScene(Scene):
    def construct(self):
        # 设置背景色
        self.camera.background_color = WHITE
        
        # 标题
        title = Text("AI数学解答", font_size=36, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1)
        self.wait(0.5)
        
        # 步骤展示
        previous_text = None
        steps = ["问题分析","题目要求我们求一个三角形的面积，已知这个三角形的底边长度为8，高为6。","这是一个基础的几何问题，主要考察的是对三角形面积公式的理解和应用。","---","详细解题步骤（每步都要解释原理）","步骤一回忆三角形面积的计算公式"]
        
        for i, step_text in enumerate(steps):
            try:
                # 创建步骤文本 (限制长度避免渲染问题)
                step_num = Text(f"步骤 {i+1}", font_size=24, color=RED)
                step_content = Text(step_text[:60] + ("..." if len(step_text) > 60 else ""), 
                                  font_size=18, color=BLACK)
                
                # 布局
                step_num.next_to(title, DOWN, buff=1)
                step_content.next_to(step_num, DOWN, buff=0.5)
                
                # 动画 (缩短动画时间)
                if previous_text:
                    self.play(FadeOut(previous_text), run_time=0.5)
                
                self.play(Write(step_num), run_time=0.8)
                self.play(Write(step_content), run_time=1)
                self.wait(0.8)
                
                previous_text = VGroup(step_num, step_content)
                
            except Exception as e:
                # 如果某步出错，跳过
                print(f"跳过步骤 {i+1}: {e}")
                continue
        
        # 结束
        end_text = Text("解答完成!", font_size=32, color=GREEN)
        if previous_text:
            self.play(FadeOut(previous_text), run_time=0.5)
        
        self.play(Write(end_text), run_time=1)
        self.wait(1)