
from manim import *

class MyScene(Scene):
    def construct(self):
        title = Text("Hello, Manim!").scale(1.5)
        self.play(Write(title))
        self.wait(2)
