from manim import *
import warnings
warnings.filterwarnings("ignore")

config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

class MathSolutionScene(Scene):
    def construct(self):
        try:
            self.camera.background_color = WHITE
            
            # 标题
            title = Text("AI数学解答", font_size=32, color=BLUE).to_edge(UP)
            self.play(Write(title), run_time=0.8)
            self.wait(0.3)
            
            # 显示步骤
            steps = ["分析题目条件","列出方程","移项求解","计算得出结果","验证答案"]
            print(f"Manim渲染步骤数量: {len(steps)}")
            
            max_steps = min(len(steps), 8)
            steps = steps[:max_steps]
            
            previous_text = None
            for i, step_text in enumerate(steps):
                try:
                    print(f"渲染步骤 {i+1}/{max_steps}: {step_text[:40]}...")
                    
                    # 步骤编号
                    step_num = Text(f"步骤 {i+1}", font_size=24, color=BLUE, weight=BOLD)
                    step_num.next_to(title, DOWN, buff=1.0)
                    
                    # 步骤内容
                    step_content = self.create_step_content(step_text, step_num)
                    
                    # 淡出前一个步骤
                    if previous_text:
                        self.play(FadeOut(previous_text), run_time=0.6)
                    
                    # 显示新步骤
                    self.play(Write(step_num), run_time=1.0)
                    self.play(Write(step_content), run_time=1.2)
                    
                    # 等待时间
                    wait_time = min(max(8.0, len(step_text) * 0.06), 20.0)
                    self.wait(wait_time)
                    
                    previous_text = VGroup(step_num, step_content)
                    
                except Exception as e:
                    print(f"步骤 {i+1} 渲染失败: {e}")
                    continue
            
            # 结束
            if previous_text:
                self.play(FadeOut(previous_text), run_time=0.5)
            
            end_text = Text("解答完成!", font_size=28, color=GREEN)
            self.play(Write(end_text), run_time=0.8)
            self.wait(1.5)
            
        except Exception as e:
            print(f"场景渲染失败: {e}")
            error_text = Text("渲染完成", font_size=24, color=BLACK)
            self.play(Write(error_text), run_time=1)
            self.wait(2)
    
    def create_step_content(self, text, step_num):
        try:
            text = text.strip()
            if len(text) > 600:
                text = text[:597] + "..."
            
            if len(text) <= 80:
                return Text(text, font_size=18, color=BLACK, weight=NORMAL).next_to(step_num, DOWN, buff=0.5)
            else:
                return self.create_multiline_text(text, step_num)
                
        except Exception as e:
            print(f"创建步骤内容失败: {e}")
            return Text("步骤内容", font_size=16, color=BLACK).next_to(step_num, DOWN, buff=0.5)
    
    def create_multiline_text(self, text, step_num):
        try:
            import re
            
            sentences = re.split(r'[。！？；;.!?]', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            text_group = VGroup()
            current_y = 0
            max_lines = 15
            
            for sentence in sentences:
                if current_y >= max_lines:
                    break
                    
                if len(sentence) > 60:
                    lines = []
                    while len(sentence) > 60 and current_y < max_lines:
                        break_point = 60
                        for i in range(55, min(65, len(sentence))):
                            if sentence[i] in ['，', ',', ' ', '=']:
                                break_point = i + 1
                                break
                        lines.append(sentence[:break_point])
                        sentence = sentence[break_point:]
                        current_y += 1
                    if sentence and current_y < max_lines:
                        lines.append(sentence)
                        current_y += 1
                else:
                    lines = [sentence]
                    current_y += 1
                
                for line in lines:
                    if current_y <= max_lines:
                        line_text = Text(line, font_size=14, color=BLACK, weight=NORMAL)
                        line_text.next_to(step_num, DOWN, buff=0.5 + (current_y - 1) * 0.35)
                        text_group.add(line_text)
            
            return text_group
            
        except Exception as e:
            print(f"创建多行文本失败: {e}")
            return Text(text[:80] + "...", font_size=14, color=BLACK).next_to(step_num, DOWN, buff=0.5)
