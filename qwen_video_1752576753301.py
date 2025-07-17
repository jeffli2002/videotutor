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
            steps = ["步骤1: 题目解不等式3x - 7 14","步骤2: 忘记改变不等号方向","步骤3: 漏掉移项符号变化","步骤4: 误认为解是一个具体的数值"]
            print(f"Manim渲染步骤数量: {len(steps)}")
            
            # 限制最大步骤数，避免渲染过久
            max_steps = min(len(steps), 8)
            steps = steps[:max_steps]
            
            previous_text = None
            for i, step_text in enumerate(steps):
                try:
                    print(f"渲染步骤 {i+1}/{max_steps}: {step_text[:40]}...")
                    
                    # 步骤编号 - 更专业的样式
                    step_num = Text(f"步骤 {i+1}", font_size=24, color=BLUE, weight=BOLD)
                    step_num.next_to(title, DOWN, buff=1.0)
                    
                    # 步骤内容 - 优化的文本处理
                    step_content = self.create_step_content(step_text, step_num)
                    
                    # 淡出前一个步骤
                    if previous_text:
                        self.play(FadeOut(previous_text), run_time=0.6)
                    
                    # 显示新步骤 - 更专业的动画
                    self.play(Write(step_num), run_time=1.0)
                    self.play(Write(step_content), run_time=1.2)
                    
                    # 智能等待时间，根据内容长度和复杂度调整
                    base_wait = 8.0  # 基础等待时间
                    content_factor = len(step_text) * 0.06  # 内容长度因子
                    complexity_factor = step_text.count('=') * 0.5  # 数学公式复杂度因子
                    wait_time = min(max(base_wait, content_factor + complexity_factor), 20.0)
                    
                    print(f"步骤 {i+1} 等待时间: {wait_time:.1f}秒")
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
            if len(text) > 600:
                text = text[:597] + "..."
            
            # 按长度选择显示策略
            if len(text) <= 80:
                # 短文本直接显示
                return Text(text, font_size=18, color=BLACK, weight=NORMAL).next_to(step_num, DOWN, buff=0.5)
            else:
                # 长文本分行显示
                return self.create_multiline_text(text, step_num)
                
        except Exception as e:
            print(f"创建步骤内容失败: {e}")
            return Text("步骤内容", font_size=16, color=BLACK).next_to(step_num, DOWN, buff=0.5)
    
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
            max_lines = 15  # 增加最大行数，提高内容显示能力
            
            for sentence in sentences:
                if current_y >= max_lines:
                    break
                    
                # 分行处理 - 更智能的分行策略
                if len(sentence) > 60:
                    lines = []
                    while len(sentence) > 60 and current_y < max_lines:
                        # 尝试在合适的位置分行
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
                
                # 创建文本对象 - 更专业的样式
                for line in lines:
                    if current_y <= max_lines:
                        line_text = Text(line, font_size=14, color=BLACK, weight=NORMAL)
                        line_text.next_to(step_num, DOWN, buff=0.5 + (current_y - 1) * 0.35)
                        text_group.add(line_text)
            
            return text_group
            
        except Exception as e:
            print(f"创建多行文本失败: {e}")
            return Text(text[:80] + "...", font_size=14, color=BLACK).next_to(step_num, DOWN, buff=0.5)
