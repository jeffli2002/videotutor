from manim import *
import warnings
warnings.filterwarnings("ignore")

class MathSolutionScene(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        title = Text("AI数学解答", font_size=36, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1)
        self.wait(0.5)
        previous_text = None
        steps = ["题目什么是一元一次方程？","步骤1理解一元的含义","一元指的是方程中只含有一个未知数。通常用字母表示，比如 x y 等。例如","- x + 3 = 5 是一元方程（只有一个未知数 x ）","- x + y = 6 不是一元方程（有两个未知数 x 和 y ）"]
        for i, step_text in enumerate(steps):
            try:
                step_num = Text(f"步骤 {i+1}", font_size=24, color=RED)
                step_content = Text(step_text[:80] + ("..." if len(step_text) > 80 else ""), font_size=18, color=BLACK)
                step_num.next_to(title, DOWN, buff=1)
                step_content.next_to(step_num, DOWN, buff=0.5)
                if previous_text:
                    self.play(FadeOut(previous_text), run_time=0.8)
                self.play(Write(step_num), run_time=1.2)
                self.play(Write(step_content), run_time=1.5)
                self.wait(1.5)
                previous_text = VGroup(step_num, step_content)
            except Exception as e:
                print(f"跳过步骤 {i+1}: {e}")
                continue
        end_text = Text("解答完成!", font_size=32, color=GREEN)
        if previous_text:
            self.play(FadeOut(previous_text), run_time=0.5)
        self.play(Write(end_text), run_time=1)
        self.wait(1)