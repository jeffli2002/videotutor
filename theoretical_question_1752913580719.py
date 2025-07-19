from manim import *
import warnings
warnings.filterwarnings("ignore")

config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

class SceneScene(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # 标题
        title = Text("什么是三角函数？", font_size=36, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1.0)
        self.wait(0.5)
        
        # 显示问题
        question_text = Text("什么是三角函数？", 
                           font_size=20, color=BLACK).next_to(title, DOWN, buff=0.8)
        self.play(Write(question_text), run_time=1.0)
        self.wait(1.0)
        
        # 显示解答内容
        solution_text = Text("三角函数是数学中重要的函数类型，包括正弦、余弦、正切等。它们在几何、物理等领域有广泛应用。正弦函数描述周期性的波动，余弦函数是正弦函数的相位移动。", 
                           font_size=18, color=BLACK).next_to(question_text, DOWN, buff=1.0)
        self.play(Write(solution_text), run_time=1.5)
        self.wait(2.0)
        
        # 总结
        summary = Text("解答完成", font_size=28, color=GREEN)
        summary.next_to(solution_text, DOWN, buff=1.0)
        self.play(Write(summary), run_time=1.0)
        self.wait(3.0)
