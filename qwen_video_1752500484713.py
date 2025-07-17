from manim import *
import warnings
import sys
import traceback
warnings.filterwarnings("ignore")

# 设置渲染配置，提高稳定性
config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

class MathSolutionScene(Scene):
    def construct(self):
        try:
            # 设置场景属性
            self.camera.background_color = WHITE
            
            # 标题
            title = Text("AI数学解答", font_size=32, color=BLUE).to_edge(UP)
            self.play(Write(title), run_time=0.8)
            self.wait(0.3)
            
            # 显示步骤
            steps = ["题目求底边为8，高为6的三角形面积","忘记乘以 frac12","混淆底边和高"]
            print(f"Manim渲染步骤数量: {len(steps)}")
            
            # 限制最大步骤数，避免渲染过久
            max_steps = min(len(steps), 8)
            steps = steps[:max_steps]
            
            previous_text = None
            for i, step_text in enumerate(steps):
                try:
                    print(f"渲染步骤 {i+1}/{max_steps}: {step_text[:40]}...")
                    
                    # 步骤编号
                    step_num = Text(f"步骤 {i+1}", font_size=20, color=RED)
                    step_num.next_to(title, DOWN, buff=0.8)
                    
                    # 步骤内容 - 优化的文本处理
                    step_content = self.create_step_content(step_text, step_num)
                    
                    # 淡出前一个步骤
                    if previous_text:
                        self.play(FadeOut(previous_text), run_time=0.5)
                    
                    # 显示新步骤
                    self.play(Write(step_num), run_time=0.8)
                    self.play(Write(step_content), run_time=1.0)
                    
                    # 优化的等待时间
                    wait_time = min(max(6.0, len(step_text) * 0.08), 15.0)  # 6-15秒
                    self.wait(wait_time)
                    
                    previous_text = VGroup(step_num, step_content)
                    
                except Exception as e:
                    print(f"步骤 {i+1} 渲染失败: {e}")
                    traceback.print_exc()
                    continue
            
            # 结束文本
            if previous_text:
                self.play(FadeOut(previous_text), run_time=0.5)
            
            end_text = Text("解答完成!", font_size=28, color=GREEN)
            self.play(Write(end_text), run_time=0.8)
            self.wait(1.5)
            
        except Exception as e:
            print(f"场景渲染失败: {e}")
            traceback.print_exc()
            # 显示错误信息
            error_text = Text("渲染完成", font_size=24, color=BLACK)
            self.play(Write(error_text), run_time=1)
            self.wait(2)
    
    def create_step_content(self, text, step_num):
        """创建步骤内容，优化文本显示"""
        try:
            # 清理文本
            text = text.strip()
            if len(text) > 400:
                text = text[:397] + "..."
            
            # 按长度选择显示策略
            if len(text) <= 60:
                # 短文本直接显示
                return Text(text, font_size=16, color=BLACK).next_to(step_num, DOWN, buff=0.4)
            else:
                # 长文本分行显示
                return self.create_multiline_text(text, step_num)
                
        except Exception as e:
            print(f"创建步骤内容失败: {e}")
            return Text("步骤内容", font_size=14, color=BLACK).next_to(step_num, DOWN, buff=0.4)
    
    def create_multiline_text(self, text, step_num):
        """创建多行文本"""
        try:
            import re
            
            # 按标点符号分句
            sentences = re.split(r'[。！？；;.!?]', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            # 创建文本组
            text_group = VGroup()
            current_y = 0
            max_lines = 12  # 限制最大行数
            
            for sentence in sentences:
                if current_y >= max_lines:
                    break
                    
                # 分行处理
                if len(sentence) > 50:
                    lines = []
                    while len(sentence) > 50 and current_y < max_lines:
                        lines.append(sentence[:50])
                        sentence = sentence[50:]
                        current_y += 1
                    if sentence and current_y < max_lines:
                        lines.append(sentence)
                        current_y += 1
                else:
                    lines = [sentence]
                    current_y += 1
                
                # 创建文本对象
                for line in lines:
                    if current_y <= max_lines:
                        line_text = Text(line, font_size=12, color=BLACK)
                        line_text.next_to(step_num, DOWN, buff=0.4 + (current_y - 1) * 0.3)
                        text_group.add(line_text)
            
            return text_group
            
        except Exception as e:
            print(f"创建多行文本失败: {e}")
            return Text(text[:50] + "...", font_size=12, color=BLACK).next_to(step_num, DOWN, buff=0.4)
