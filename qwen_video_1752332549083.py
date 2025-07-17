from manim import *
import warnings
warnings.filterwarnings("ignore")

class MathSolutionScene(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # 标题
        title = Text("AI数学解答", font_size=36, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1)
        self.wait(0.5)
        
        # 显示步骤
        steps = ["题目求底边为8，高为6的三角形面积","问题分析","详细解题步骤","最终答案","验证过程","相关数学概念","常见错误提醒"]
        print(f"Manim渲染步骤数量: {len(steps)}")
        
        previous_text = None
        for i, step_text in enumerate(steps):
            try:
                print(f"渲染步骤 {i+1}: {step_text[:50]}...")
                
                # 步骤编号
                step_num = Text(f"步骤 {i+1}", font_size=24, color=RED)
                step_num.next_to(title, DOWN, buff=1)
                
                # 步骤内容 - 支持长文本自动换行
                step_content = Text(step_text, font_size=16, color=BLACK, line_spacing=1.2)
                step_content.next_to(step_num, DOWN, buff=0.5)
                
                # 如果内容太长，自动调整位置
                if len(step_text) > 100:
                    step_content.scale(0.9)
                
                # 淡出前一个步骤
                if previous_text:
                    self.play(FadeOut(previous_text), run_time=0.8)
                
                # 显示新步骤
                self.play(Write(step_num), run_time=1.2)
                self.play(Write(step_content), run_time=1.5)
                self.wait(3.0)  # 增加等待时间，让用户看清完整步骤
                
                previous_text = VGroup(step_num, step_content)
                
            except Exception as e:
                print(f"跳过步骤 {i+1}: {e}")
                continue
        
        # 结束文本
        end_text = Text("解答完成!", font_size=32, color=GREEN)
        if previous_text:
            self.play(FadeOut(previous_text), run_time=0.5)
        self.play(Write(end_text), run_time=1)
        self.wait(2)