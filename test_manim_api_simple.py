import requests

manim_code = '''
from manim import *
class MyScene(Scene):
    def construct(self):
        self.play(Write(Text("Test")))
        self.wait(1)
'''

resp = requests.post(
    "http://localhost:5001/api/manim_render",
    json={
        "script": manim_code,
        "output_name": "test_simple",
        "scene_name": "MyScene"
    }
)
print(resp.json()) 