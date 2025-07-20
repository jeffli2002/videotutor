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
        title = Text("请解释三角形的面积公式", font_size=32, color=BLUE).to_edge(UP, buff=0.3)
        self.play(Write(title), run_time=1.0)
        self.wait(0.5)
        
        # 创建主要内容区域 - 在标题下方留出足够空间
        main_area = Rectangle(
            width=16, height=8, 
            color=GRAY, fill_opacity=0.1, stroke_opacity=0.3
        ).next_to(title, DOWN, buff=0.5)
        
        # 左侧图形区域 - 调整位置，减少与右侧的间距
        left_area = Rectangle(
            width=6, height=6,
            color=BLUE, fill_opacity=0.05, stroke_opacity=0.2
        ).move_to(main_area.get_left() + RIGHT * 3)
        
        # 右侧文字区域 - 调整位置，靠近左侧图形
        right_area = Rectangle(
            width=6, height=6,
            color=GREEN, fill_opacity=0.05, stroke_opacity=0.2
        ).move_to(main_area.get_right() + LEFT * 3)
        
        # 显示区域框架（可选，用于调试）
        # self.play(Create(main_area), Create(left_area), Create(right_area))
        
        # 在左侧区域创建示例图形（根据主题调整）
        if "geometry" == "geometry":
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
            
        elif "geometry" == "algebra":
            # 代数表达式示例
            equation = MathTex(
                "x^2 + 2x + 1 = 0",
                font_size=36, color=BLUE
            ).move_to(left_area.get_center())
            
            self.play(Write(equation), run_time=1.0)
            
        elif "geometry" == "calculus":
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
        
        # 在右侧区域显示解释内容 - 进一步优化布局，确保在显示区域内
        explanation_lines = []
        solution_text = "三角形的面积公式是底边乘以高再除以二。这个公式适用于所有类型的三角形。"
        max_line_length = 15  # 进一步减少每行字符数，确保不超出显示区
        
        # 智能分割解答文本为多行
        current_line = ""
        words = list(solution_text)
        for i in range(len(words)):
            # 在标点符号处强制换行
            if words[i] in ["，", "。", "；", "！", "？"]:
                current_line += words[i]
                explanation_lines.append(current_line)
                current_line = ""
            # 在达到最大长度时换行
            elif len(current_line) >= max_line_length:
                explanation_lines.append(current_line)
                current_line = words[i]
            else:
                current_line += words[i]
        
        if current_line:
            explanation_lines.append(current_line)
        
        # 限制行数避免超出显示区域
        max_lines = 5  # 进一步减少最大行数
        if len(explanation_lines) > max_lines:
            explanation_lines = explanation_lines[:max_lines-1]
            explanation_lines.append("...")
        
        explanation_group = VGroup()
        for i in range(len(explanation_lines)):
            line = Text(
                explanation_lines[i], 
                font_size=14,  # 进一步减小字体
                color=BLACK
            )
            if i == 0:
                line.move_to(right_area.get_top() + DOWN * 0.5)  # 调整起始位置
            else:
                line.next_to(explanation_group[i-1], DOWN, buff=0.2)  # 减少行间距
            explanation_group.add(line)
        
        self.play(Write(explanation_group), run_time=2.0)
        self.wait(1.0)
        
        # 添加问题文本（如果空间允许）
        if len(explanation_lines) <= 4:  # 减少条件
            question_text = Text(
                "问题：请解释三角形的面积公式", 
                font_size=14,  # 减小字体
                color=GRAY
            ).next_to(explanation_group, DOWN, buff=0.4)
            
            self.play(Write(question_text), run_time=0.8)
        
        # 总结
        summary = Text("演示完成", font_size=24, color=GREEN)
        summary.next_to(main_area, DOWN, buff=0.3)
        self.play(Write(summary), run_time=1.0)
        self.wait(2.0)
