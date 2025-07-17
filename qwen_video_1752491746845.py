from manim import *
import warnings
warnings.filterwarnings("ignore")

class MathSolutionScene(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # 标题
        title = Text("AI数学解答", font_size=36, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1)
        self.wait(0.5)
        
        # 显示步骤
        steps = ["题目化简(3x + 2)(x - 4)","分析题目条件","计算得出结果"]
        print(f"Manim渲染步骤数量: {len(steps)}")
        
        previous_text = None
        for i, step_text in enumerate(steps):
            try:
                print(f"渲染步骤 {i+1}: {step_text[:50]}...")
                
                # 步骤编号
                step_num = Text(f"步骤 {i+1}", font_size=24, color=RED)
                step_num.next_to(title, DOWN, buff=1)
                
                # 步骤内容 - 智能处理长文本
                if len(step_text) > 80:
                    # 按标点符号分句
                    import re
                    sentences = re.split(r'[。！？；;.!?]', step_text)
                    sentences = [s.strip() for s in sentences if s.strip()]
                    
                    # 创建多行文本组
                    step_content = VGroup()
                    current_y = 0
                    
                    for j, sentence in enumerate(sentences):
                        if len(sentence) > 40:
                            # 长句子按字数分行
                            words = []
                            while len(sentence) > 40:
                                words.append(sentence[:40])
                                sentence = sentence[40:]
                            if sentence:
                                words.append(sentence)
                        else:
                            words = [sentence]
                        
                        for k, word in enumerate(words):
                            line_text = Text(word, font_size=14, color=BLACK)
                            line_text.next_to(step_num, DOWN, buff=0.5 + current_y * 0.35)
                            step_content.add(line_text)
                            current_y += 1
                else:
                    # 短文本正常显示
                    step_content = Text(step_text, font_size=16, color=BLACK, line_spacing=1.2)
                    step_content.next_to(step_num, DOWN, buff=0.5)
                
                # 淡出前一个步骤
                if previous_text:
                    self.play(FadeOut(previous_text), run_time=0.8)
                
                # 显示新步骤
                self.play(Write(step_num), run_time=1.2)
                self.play(Write(step_content), run_time=1.5)
                
                # 根据内容长度调整等待时间
                wait_time = max(6.0, len(step_text) * 0.08)  # 至少6秒，每字符0.08秒
                self.wait(wait_time)  # 动态等待时间，让用户看清完整步骤
                
                previous_text = VGroup(step_num, step_content)
                
            except Exception as e:
                print(f"跳过步骤 {i+1}: {e}")
                continue
        
        # 结束文本
        end_text = Text("解答完成!", font_size=32, color=GREEN)
        if previous_text:
            self.play(FadeOut(previous_text), run_time=0.5)
        self.play(Write(end_text), run_time=1)
        self.wait(2)
