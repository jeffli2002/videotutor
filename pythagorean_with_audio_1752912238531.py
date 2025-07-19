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
        
        # 公式
        formula = MathTex("a^2 + b^2 = c^2", font_size=32, color=BLACK).next_to(title, DOWN, buff=0.8)
        self.play(Write(formula), run_time=1.2)
        self.wait(1.0)
        
        # 创建直角三角形
        triangle = Polygon(
            ORIGIN, 
            RIGHT * 4, 
            UP * 3, 
            color=BLUE, 
            fill_opacity=0.3
        ).shift(DOWN * 0.5)
        
        self.play(Create(triangle), run_time=1.5)
        self.wait(0.5)
        
        # 标记顶点
        point_a = Dot(ORIGIN + DOWN * 0.5, color=RED)
        point_b = Dot(RIGHT * 4 + DOWN * 0.5, color=RED)
        point_c = Dot(UP * 3 + DOWN * 0.5, color=RED)
        
        label_a = Text("A", font_size=24, color=RED).next_to(point_a, DL, buff=0.1)
        label_b = Text("B", font_size=24, color=RED).next_to(point_b, DR, buff=0.1)
        label_c = Text("C", font_size=24, color=RED).next_to(point_c, UL, buff=0.1)
        
        self.play(
            Create(point_a), Create(point_b), Create(point_c),
            Write(label_a), Write(label_b), Write(label_c),
            run_time=1.0
        )
        self.wait(0.5)
        
        # 标记边长
        side_a = MathTex("a = 3", font_size=20, color=BLUE).next_to(point_a, LEFT, buff=0.3)
        side_b = MathTex("b = 4", font_size=20, color=BLUE).next_to(point_b, DOWN, buff=0.3)
        
        self.play(Write(side_a), Write(side_b), run_time=1.0)
        self.wait(1.0)
        
        # 计算演示
        calc1 = MathTex("a^2 = 3^2 = 9", font_size=24, color=GREEN).next_to(formula, DOWN, buff=1.0)
        calc2 = MathTex("b^2 = 4^2 = 16", font_size=24, color=GREEN).next_to(calc1, DOWN, buff=0.3)
        calc3 = MathTex("c^2 = a^2 + b^2 = 9 + 16 = 25", font_size=24, color=GREEN).next_to(calc2, DOWN, buff=0.3)
        calc4 = MathTex("c = \sqrt{25} = 5", font_size=24, color=GREEN).next_to(calc3, DOWN, buff=0.3)
        
        self.play(Write(calc1), run_time=1.0)
        self.wait(0.5)
        self.play(Write(calc2), run_time=1.0)
        self.wait(0.5)
        self.play(Write(calc3), run_time=1.2)
        self.wait(0.5)
        self.play(Write(calc4), run_time=1.0)
        self.wait(2.0)
        
        # 总结
        summary = Text("勾股定理演示完成！", font_size=28, color=BLUE).next_to(calc4, DOWN, buff=1.0)
        self.play(Write(summary), run_time=1.0)
        self.wait(2.0)
