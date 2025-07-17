import requests

manim_code = '''
from manim import *

class MyScene(Scene):
    def construct(self):
        title = Text("Hello, Manim!").scale(1.5)
        self.play(Write(title))
        self.wait(2)
'''

resp = requests.post(
    "http://localhost:5001/api/manim_render",
    json={
        "script": manim_code,
        "output_name": "demo1",
        "scene_name": "MyScene"
    }
)
print(resp.json()) 