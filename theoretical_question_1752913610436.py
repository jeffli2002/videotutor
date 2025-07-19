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
        title = Text("请解释因式分解的方法", font_size=36, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1.0)
        self.wait(0.5)
        
        # 显示问题
        question_text = Text("请解释因式分解的方法", 
                           font_size=20, color=BLACK).next_to(title, DOWN, buff=0.8)
        self.play(Write(question_text), run_time=1.0)
        self.wait(1.0)
        
        # 显示解答内容
        solution_text = Text("因式分解是将多项式表示为几个因式乘积的过程。常用的方法包括提取公因式、公式法、分组分解法等。因式分解在解方程、化简表达式等方面有重要应用。", 
                           font_size=18, color=BLACK).next_to(question_text, DOWN, buff=1.0)
        self.play(Write(solution_text), run_time=1.5)
        self.wait(2.0)
        
        # 总结
        summary = Text("解答完成", font_size=28, color=GREEN)
        summary.next_to(solution_text, DOWN, buff=1.0)
        self.play(Write(summary), run_time=1.0)
        self.wait(3.0)
