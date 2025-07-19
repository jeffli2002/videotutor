from manim import *
import warnings
warnings.filterwarnings("ignore")

config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

class PythagoreanTheoremScene(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # 标题
        title = Text("勾股定理演示", font_size=36, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1.0)
        self.wait(0.5)
        
        # 创建直角三角形 - 位置调整到左侧，为右侧文字留出空间
        triangle = Polygon(
            ORIGIN, 
            RIGHT * 3, 
            UP * 2, 
            color=BLUE, 
            fill_opacity=0.3
        )
        triangle.move_to(LEFT * 2)  # 向左移动，为右侧文字留出空间
        
        # 显示三角形
        self.play(Create(triangle), run_time=1.5)
        
        # 添加标签 - 位置优化，避免重叠
        A_label = Text("A", font_size=20, color=BLACK).next_to(triangle.get_vertices()[0], DOWN+LEFT, buff=0.3)
        B_label = Text("B", font_size=20, color=BLACK).next_to(triangle.get_vertices()[1], DOWN+RIGHT, buff=0.3)
        C_label = Text("C", font_size=20, color=BLACK).next_to(triangle.get_vertices()[2], UP, buff=0.3)
        
        self.play(Write(A_label), Write(B_label), Write(C_label), run_time=1.0)
        self.wait(1.0)
        
        # 显示勾股定理公式 - 放在右侧空白处
        formula = MathTex(r"a^2 + b^2 = c^2", font_size=32, color=BLACK)
        formula.move_to(RIGHT * 3 + UP * 1.5)  # 放在右侧上方
        self.play(Write(formula), run_time=1.2)
        self.wait(1.5)
        
        # 显示边长标注 - 放在右侧中间
        a_label = MathTex(r"a = 3", font_size=24, color=GREEN)
        a_label.move_to(RIGHT * 3 + UP * 0.5)
        
        b_label = MathTex(r"b = 4", font_size=24, color=GREEN)
        b_label.move_to(RIGHT * 3 + DOWN * 0.5)
        
        c_label = MathTex(r"c = 5", font_size=24, color=GREEN)
        c_label.move_to(RIGHT * 3 + DOWN * 1.5)
        
        self.play(Write(a_label), Write(b_label), Write(c_label), run_time=1.5)
        self.wait(2.0)
        
        # 显示计算过程 - 放在右侧下方
        calc1 = MathTex(r"a^2 = 3^2 = 9", font_size=20, color=BLACK)
        calc1.move_to(RIGHT * 3 + DOWN * 2.5)
        
        calc2 = MathTex(r"b^2 = 4^2 = 16", font_size=20, color=BLACK)
        calc2.move_to(RIGHT * 3 + DOWN * 3.0)
        
        calc3 = MathTex(r"c^2 = a^2 + b^2 = 9 + 16 = 25", font_size=20, color=BLACK)
        calc3.move_to(RIGHT * 3 + DOWN * 3.5)
        
        calc4 = MathTex(r"c = \sqrt{25} = 5", font_size=20, color=BLACK)
        calc4.move_to(RIGHT * 3 + DOWN * 4.0)
        
        self.play(Write(calc1), run_time=0.8)
        self.wait(0.5)
        self.play(Write(calc2), run_time=0.8)
        self.wait(0.5)
        self.play(Write(calc3), run_time=1.0)
        self.wait(0.5)
        self.play(Write(calc4), run_time=0.8)
        self.wait(2.0)
        
        # 总结
        summary = Text("勾股定理验证完成", font_size=28, color=GREEN)
        summary.move_to(DOWN * 2.5)
        self.play(Write(summary), run_time=1.0)
        self.wait(3.0)
