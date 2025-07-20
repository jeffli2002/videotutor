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
        title = Text("勾股定理演示", font_size=36, color=BLUE, weight=BOLD).to_edge(UP)
        self.play(Write(title), run_time=1.0)
        self.wait(0.5)
        
        # 副标题
        subtitle = Text("a² + b² = c²", font_size=28, color=BLACK).next_to(title, DOWN, buff=0.3)
        self.play(Write(subtitle), run_time=0.8)
        self.wait(1.0)
        
        # 创建直角三角形
        triangle = Polygon(
            ORIGIN, 
            RIGHT * 3, 
            UP * 4, 
            color=BLUE, 
            fill_opacity=0.3
        )
        triangle.move_to(ORIGIN)
        
        # 显示三角形
        self.play(Create(triangle), run_time=1.5)
        
        # 添加标签
        A_label = Text("A", font_size=20, color=BLACK).next_to(triangle.get_vertices()[0], DOWN+LEFT, buff=0.2)
        B_label = Text("B", font_size=20, color=BLACK).next_to(triangle.get_vertices()[1], DOWN+RIGHT, buff=0.2)
        C_label = Text("C", font_size=20, color=BLACK).next_to(triangle.get_vertices()[2], UP, buff=0.2)
        
        self.play(Write(A_label), Write(B_label), Write(C_label), run_time=1.0)
        self.wait(1.0)
        
        # 显示边长
        a_label = MathTex("a = 3", font_size=24, color=BLACK).next_to(triangle.get_vertices()[0], DOWN, buff=0.5)
        b_label = MathTex("b = 4", font_size=24, color=BLACK).next_to(triangle.get_vertices()[1], RIGHT, buff=0.5)
        c_label = MathTex("c = 5", font_size=24, color=BLACK).next_to(triangle.get_vertices()[2], UP+RIGHT, buff=0.5)
        
        self.play(Write(a_label), Write(b_label), Write(c_label), run_time=1.2)
        self.wait(2.0)
        
        # 显示勾股定理公式
        formula = MathTex(r"a^2 + b^2 = c^2", font_size=32, color=BLACK)
        formula.next_to(triangle, DOWN, buff=1.5)
        self.play(Write(formula), run_time=1.5)
        self.wait(1.0)
        
        # 显示计算过程
        calc1 = MathTex(r"3^2 + 4^2 = 5^2", font_size=28, color=BLACK)
        calc1.next_to(formula, DOWN, buff=0.5)
        self.play(Write(calc1), run_time=1.0)
        self.wait(1.0)
        
        calc2 = MathTex(r"9 + 16 = 25", font_size=28, color=BLACK)
        calc2.next_to(calc1, DOWN, buff=0.3)
        self.play(Write(calc2), run_time=1.0)
        self.wait(1.0)
        
        calc3 = MathTex(r"25 = 25", font_size=28, color=GREEN, weight=BOLD)
        calc3.next_to(calc2, DOWN, buff=0.3)
        self.play(Write(calc3), run_time=1.0)
        self.wait(2.0)
        
        # 结论
        conclusion = Text("勾股定理验证成功！", font_size=32, color=GREEN, weight=BOLD)
        conclusion.next_to(calc3, DOWN, buff=0.8)
        self.play(Write(conclusion), run_time=1.2)
        self.wait(3.0)
        
        # 最终总结
        final_text = Text("在直角三角形中，两直角边的平方和等于斜边的平方", 
                         font_size=20, color=BLACK)
        final_text.next_to(conclusion, DOWN, buff=0.8)
        self.play(Write(final_text), run_time=1.5)
        self.wait(2.0)
