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
        
        # 标题 - 使用较小的字体避免占用太多空间
        title = Text("什么是二次方程的求根公式？", font_size=32, color=BLUE).to_edge(UP, buff=0.3)
        self.play(Write(title), run_time=1.0)
        self.wait(0.5)
        
        # 创建主要内容区域 - 在标题下方留出足够空间
        main_area = Rectangle(
            width=16, height=8, 
            color=GRAY, fill_opacity=0.1, stroke_opacity=0.3
        ).next_to(title, DOWN, buff=0.5)
        
        # 左侧图形区域
        left_area = Rectangle(
            width=7, height=7,
            color=BLUE, fill_opacity=0.05, stroke_opacity=0.2
        ).move_to(main_area.get_left() + RIGHT * 3.5)
        
        # 右侧文字区域
        right_area = Rectangle(
            width=7, height=7,
            color=GREEN, fill_opacity=0.05, stroke_opacity=0.2
        ).move_to(main_area.get_right() + LEFT * 3.5)
        
        # 显示区域框架（可选，用于调试）
        # self.play(Create(main_area), Create(left_area), Create(right_area))
        
        # 在左侧区域创建示例图形（根据主题调整）
        if "algebra" == "geometry":
            # 几何图形示例
            triangle = Polygon(
                ORIGIN, RIGHT * 2, UP * 1.5,
                color=BLUE, fill_opacity=0.3
            ).move_to(left_area.get_center())
            
            # 边长标签 - 显示在边的外侧，不压在图形上
            a_label = Text("a=2", font_size=16, color=BLACK).next_to(
                triangle.get_bottom(), DOWN, buff=0.2
            )
            b_label = Text("b=1.5", font_size=16, color=BLACK).next_to(
                triangle.get_right(), RIGHT, buff=0.2
            )
            c_label = Text("c=2.5", font_size=16, color=BLACK).next_to(
                triangle.get_top(), UP + LEFT * 0.5, buff=0.2
            )
            
            self.play(Create(triangle), run_time=1.0)
            self.play(Write(a_label), Write(b_label), Write(c_label), run_time=0.8)
            
        elif "algebra" == "algebra":
            # 代数表达式示例
            equation = MathTex(
                "x^2 + 2x + 1 = 0",
                font_size=36, color=BLUE
            ).move_to(left_area.get_center())
            
            self.play(Write(equation), run_time=1.0)
            
        elif "algebra" == "calculus":
            # 微积分示例
            derivative = MathTex(
                "\\frac{d}{dx}(x^2) = 2x",
                font_size=32, color=BLUE
            ).move_to(left_area.get_center())
            
            self.play(Write(derivative), run_time=1.0)
            
        else:
            # 通用示例
            circle = Circle(radius=1.5, color=BLUE, fill_opacity=0.3).move_to(left_area.get_center())
            radius_label = Text("r=1.5", font_size=16, color=BLACK).next_to(
                circle.get_right(), RIGHT, buff=0.3
            )
            
            self.play(Create(circle), run_time=1.0)
            self.play(Write(radius_label), run_time=0.5)
        
        # 在右侧区域显示解释内容 - 使用VGroup确保良好的行间距
        explanation_lines = []
        const solutionText = "二次方程ax²+bx+c=0的求根公式是x=(-b±√(b²-4ac))/(2a)。这个公式可以求解所有二次方程，其中b²-4ac称为判别式，用来判断方程根的性质。当判别式大于零时，方程有两个不同的实根；当判别式等于零时，方程有一个重根；当判别式小于零时，方程有两个共轭复根。"
        const maxLineLength = 25 // 每行最大字符数
        
        // 分割解答文本为多行
        let currentLine = ""
        const words = solutionText.split("")
        for (let i = 0; i < words.length; i++) {
            if (currentLine.length >= maxLineLength && words[i] === "，") {
                explanation_lines.push(currentLine + words[i])
                currentLine = ""
            } else {
                currentLine += words[i]
            }
        }
        if (currentLine) {
            explanation_lines.push(currentLine)
        }
        
        // 限制行数避免超出显示区域
        const maxLines = 8
        if (explanation_lines.length > maxLines) {
            explanation_lines = explanation_lines.slice(0, maxLines - 1)
            explanation_lines.push("...")
        }
        
        const explanationGroup = VGroup()
        for (let i = 0; i < explanation_lines.length; i++) {
            const line = Text(
                explanation_lines[i], 
                font_size=18, 
                color=BLACK
            )
            if (i === 0) {
                line.move_to(right_area.get_top() + DOWN * 0.8)
            } else {
                line.next_to(explanationGroup[i-1], DOWN, buff=0.3)
            }
            explanationGroup.add(line)
        }
        
        self.play(Write(explanationGroup), run_time=2.0)
        self.wait(1.0)
        
        # 添加问题文本（如果空间允许）
        if (explanation_lines.length <= 6) {
            question_text = Text(
                "问题：什么是二次方程的求根公式？", 
                font_size=16, 
                color=GRAY
            ).next_to(explanationGroup, DOWN, buff=0.5)
            
            self.play(Write(question_text), run_time=0.8)
        }
        
        # 总结
        summary = Text("演示完成", font_size=24, color=GREEN)
        summary.next_to(main_area, DOWN, buff=0.3)
        self.play(Write(summary), run_time=1.0)
        self.wait(2.0)
