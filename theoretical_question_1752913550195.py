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
        title = Text("帮我生成一个关于概率分布的动画讲解", font_size=36, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1.0)
        self.wait(0.5)
        
        # 显示问题
        question_text = Text("帮我生成一个关于概率分布的动画讲解", 
                           font_size=20, color=BLACK).next_to(title, DOWN, buff=0.8)
        self.play(Write(question_text), run_time=1.0)
        self.wait(1.0)
        
        # 显示解答内容
        solution_text = Text("概率分布描述了随机变量取不同值的概率。常见的概率分布包括正态分布、二项分布、泊松分布等。正态分布是最重要的连续概率分布，具有钟形曲线特征。", 
                           font_size=18, color=BLACK).next_to(question_text, DOWN, buff=1.0)
        self.play(Write(solution_text), run_time=1.5)
        self.wait(2.0)
        
        # 总结
        summary = Text("解答完成", font_size=28, color=GREEN)
        summary.next_to(solution_text, DOWN, buff=1.0)
        self.play(Write(summary), run_time=1.0)
        self.wait(3.0)
