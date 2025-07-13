from manim import *
import warnings
warnings.filterwarnings("ignore")

class MathSolutionScene(Scene):
    def construct(self):
        # Set background color
        self.camera.background_color = WHITE
        
        # Title
        title = Text("Math Solution: 2x + 5 = 15", font_size=36, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1)
        self.wait(0.5)
        
        # Steps
        steps = [
            "Step 1: Move constant term",
            "2x = 15 - 5",
            "Step 2: Simplify",
            "2x = 10",
            "Step 3: Divide by 2",
            "x = 5"
        ]
        
        previous_text = None
        
        for i, step_text in enumerate(steps):
            try:
                step_obj = Text(step_text, font_size=24, color=BLACK)
                step_obj.next_to(title, DOWN, buff=1 + i*0.5)
                
                if previous_text:
                    self.play(FadeOut(previous_text), run_time=0.3)
                
                self.play(Write(step_obj), run_time=0.8)
                self.wait(0.8)
                
                previous_text = step_obj
                
            except Exception as e:
                print(f"Skip step {i+1}: {e}")
                continue
        
        # Final answer
        final_text = Text("Answer: x = 5", font_size=32, color=GREEN)
        if previous_text:
            self.play(FadeOut(previous_text), run_time=0.5)
        
        self.play(Write(final_text), run_time=1)
        self.wait(2)