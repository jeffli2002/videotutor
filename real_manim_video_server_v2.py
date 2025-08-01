#!/usr/bin/env python3
"""
Real Manim Video Generation Server v2
Stable and robust version for both Chinese and English content
"""

import json
import os
import subprocess
import tempfile
import time
import http.server
import socketserver
from pathlib import Path
import shutil
import re
import hashlib
import platform
import sys

# Configuration
PORT = 5006
# Use relative paths - get base directory from script location
BASE_DIR = Path(__file__).parent.absolute()
RENDERED_VIDEOS_DIR = BASE_DIR / 'public' / 'rendered_videos'
MEDIA_DIR = BASE_DIR / 'media'
TEMP_DIR = BASE_DIR / 'temp'

# Detect environment and set appropriate Python command
is_windows = platform.system() == 'Windows'
is_wsl = 'microsoft' in platform.uname().release.lower() if hasattr(platform.uname(), 'release') else False

# Set Python command based on environment
if is_windows:
    # Native Windows - use python directly
    PYTHON_CMD = sys.executable or 'python'
    USE_POWERSHELL = False
elif is_wsl:
    # WSL - use local WSL Python with Manim
    PYTHON_CMD = sys.executable or 'python3'
    USE_POWERSHELL = False  # Use WSL Manim directly
else:
    # Pure Linux - use local python
    PYTHON_CMD = sys.executable or 'python3'
    USE_POWERSHELL = False

WINDOWS_BASE = None  # Will be set dynamically if needed

# Log the environment
print(f"🖥️  Environment: {'Windows' if is_windows else 'WSL' if is_wsl else 'Linux'}")
print(f"🐍 Python command: {PYTHON_CMD}")
print(f"🔧 Using PowerShell: {USE_POWERSHELL}")

# Ensure directories exist
RENDERED_VIDEOS_DIR.mkdir(exist_ok=True, parents=True)
MEDIA_DIR.mkdir(exist_ok=True, parents=True)
TEMP_DIR.mkdir(exist_ok=True, parents=True)

class RealManimHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/render':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                script_content = data.get('script', '')
                output_name = data.get('output_name', f'manim_{int(time.time())}')
                question = data.get('question', '')
                solution = data.get('solution', '')
                duration = data.get('duration', 20)  # Get duration from request, default 20s
                
                print(f"\n{'='*60}")
                print(f"🎬 Real Manim Render Request at {time.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"📦 Output name: {output_name}")
                print(f"❓ Question: {question[:100]}...")
                print(f"📝 Script length: {len(script_content)} chars")
                print(f"⏱️ Requested duration: {duration} seconds")
                print(f"{'='*60}\n")
                
                # Generate unique Manim script
                if not script_content or len(script_content) < 100:
                    script_content = self.generate_manim_script(question, solution, duration)
                
                # Try to generate the video
                success, video_path, message = self.generate_manim_video(
                    script_content, output_name, question
                )
                
                # If failed, try safe fallback
                if not success:
                    print(f"⚠️ First attempt failed: {message}")
                    print("🔄 Trying safe fallback script...")
                    safe_script = self.generate_safe_script(question, duration)
                    success, video_path, message = self.generate_manim_video(
                        safe_script, output_name, question
                    )
                
                response = {
                    'success': success,
                    'video_path': video_path if success else None,
                    'message': message,
                    'duration': 20,
                    'size': self.get_file_size(video_path) if success else 0,
                    'fallback': False,
                    'generated': success
                }
                
                if success:
                    self.send_json_response(response)
                else:
                    self.send_response(500)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                print(f"❌ Error: {str(e)}")
                import traceback
                traceback.print_exc()
                self.send_error(500, str(e))
    
    def generate_safe_script(self, question, duration=20):
        """Generate a safe, always-working script"""
        # Detect language
        has_chinese = any('\u4e00' <= char <= '\u9fff' for char in question)
        
        # Extract numbers
        numbers = re.findall(r'\d+', question)
        
        script = '''from manim import *

class MathSolution(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a1a"
        
        # Title - Use math notation instead of text for Chinese
        '''
        
        if has_chinese:
            # For Chinese, use mathematical notation only
            script += '''title = MathTex(r"\\text{Math Problem}", font_size=36, color=BLUE)'''
        else:
            script += '''title = Text("Math Problem", font_size=36, color=BLUE)'''
            
        script += '''
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(0.5)
        
        # Content
        '''
        
        if "triangle" in question.lower() or "三角" in question:
            script += self._generate_triangle_content(numbers, has_chinese)
        elif "equation" in question.lower() or "方程" in question:
            script += self._generate_equation_content(numbers, has_chinese)
        elif "inequality" in question.lower() or "不等式" in question:
            script += self._generate_inequality_content(numbers, has_chinese)
        else:
            script += self._generate_generic_content(numbers, has_chinese)
            
        # Calculate wait time based on animation time and requested duration
        # Approximate animation time: 3-4 seconds for basic animations
        animation_time = 4
        final_wait = max(2, duration - animation_time)
        
        script += f'''
        self.wait({final_wait})'''
        
        return script
    
    def _generate_triangle_content(self, numbers, has_chinese):
        """Generate triangle animation content"""
        base = numbers[0] if len(numbers) > 0 else "8"
        height = numbers[1] if len(numbers) > 1 else "6"
        area = str(int(base) * int(height) // 2)
        
        if has_chinese:
            return f'''
        # Triangle
        triangle = Polygon(
            [-2, -1, 0], [2, -1, 0], [0, 2, 0],
            color=GREEN, fill_opacity=0.3
        )
        self.play(Create(triangle))
        
        # Formula
        formula = MathTex(r"A = \\frac{{1}}{{2}} \\times b \\times h", font_size=36)
        formula.next_to(triangle, DOWN, buff=0.5)
        self.play(Write(formula))
        
        # Calculation
        calc = MathTex(r"A = \\frac{{1}}{{2}} \\times {base} \\times {height} = {area}", font_size=32, color=YELLOW)
        calc.next_to(formula, DOWN, buff=0.3)
        self.play(Write(calc))'''
        else:
            return f'''
        # Triangle
        triangle = Polygon(
            [-2, -1, 0], [2, -1, 0], [0, 2, 0],
            color=GREEN, fill_opacity=0.3
        )
        self.play(Create(triangle))
        
        # Formula
        formula = MathTex(r"A = \\frac{{1}}{{2}} \\times base \\times height", font_size=36)
        formula.next_to(triangle, DOWN, buff=0.5)
        self.play(Write(formula))
        
        # Calculation
        calc = MathTex(r"A = \\frac{{1}}{{2}} \\times {base} \\times {height} = {area}", font_size=32, color=YELLOW)
        calc.next_to(formula, DOWN, buff=0.3)
        self.play(Write(calc))'''
    
    def _generate_equation_content(self, numbers, has_chinese):
        """Generate equation animation content"""
        if has_chinese:
            return '''
        # Equation
        equation = MathTex(r"ax + b = c", font_size=48)
        equation.move_to(ORIGIN)
        self.play(Write(equation))
        
        # Solution
        solution = MathTex(r"x = \\frac{c - b}{a}", font_size=36, color=YELLOW)
        solution.next_to(equation, DOWN, buff=0.8)
        self.play(Write(solution))'''
        else:
            return '''
        # Equation
        equation = MathTex(r"ax + b = c", font_size=48)
        equation.move_to(ORIGIN)
        self.play(Write(equation))
        
        # Solution
        solution = MathTex(r"x = \\frac{c - b}{a}", font_size=36, color=YELLOW)
        solution.next_to(equation, DOWN, buff=0.8)
        self.play(Write(solution))'''
    
    def _generate_inequality_content(self, numbers, has_chinese):
        """Generate inequality animation content"""
        # Extract inequality pattern
        pattern = r'(\d*)x\s*([\+\-])\s*(\d+)\s*([><≥≤])\s*(\d+)'
        match = re.search(pattern, self.current_question if hasattr(self, 'current_question') else '')
        
        if match and len(numbers) >= 2:
            a = match.group(1) or "1"
            op = match.group(2)
            b = match.group(3)
            ineq = match.group(4)
            c = match.group(5)
            
            return f'''
        # Inequality
        inequality = MathTex(r"{a}x {op} {b} {ineq} {c}", font_size=48)
        inequality.move_to(ORIGIN)
        self.play(Write(inequality))
        
        # Solution steps
        step1 = MathTex(r"{a}x {ineq} {int(c) - int(b) if op == '+' else int(c) + int(b)}", font_size=36)
        step1.next_to(inequality, DOWN, buff=0.5)
        self.play(Write(step1))
        
        # Final answer
        x_val = (int(c) - int(b) if op == '+' else int(c) + int(b)) // int(a) if int(a) != 0 else 0
        answer = MathTex(r"x {ineq} {x_val}", font_size=40, color=GREEN)
        answer.next_to(step1, DOWN, buff=0.3)
        self.play(Write(answer))'''
        else:
            return '''
        # General inequality
        inequality = MathTex(r"ax + b > c", font_size=48)
        inequality.move_to(ORIGIN)
        self.play(Write(inequality))
        
        # Solution method
        method = Text("Solve by isolating x", font_size=32, color=YELLOW)
        method.next_to(inequality, DOWN, buff=0.8)
        self.play(Write(method))'''
    
    def _generate_generic_content(self, numbers, has_chinese):
        """Generate generic math content"""
        if has_chinese:
            return '''
        # Math content - Use formula instead of Chinese text
        content = MathTex(r"\\text{Solution}", font_size=36)
        content.move_to(ORIGIN)
        self.play(Write(content))
        
        # Show some math
        math_expr = MathTex(r"f(x) = x^2 + 2x + 1", font_size=32, color=YELLOW)
        math_expr.next_to(content, DOWN, buff=0.8)
        self.play(Write(math_expr))'''
        else:
            return '''
        # Math content
        content = Text("Mathematical Solution", font_size=36)
        content.move_to(ORIGIN)
        self.play(Write(content))
        
        # Show some math
        math_expr = MathTex(r"f(x) = x^2 + 2x + 1", font_size=32, color=YELLOW)
        math_expr.next_to(content, DOWN, buff=0.8)
        self.play(Write(math_expr))'''
    
    def generate_manim_script(self, question, solution, duration=20):
        """Generate a complete Manim script based on the question"""
        # Store for use in helper methods
        self.current_question = question
        
        # Detect language
        has_chinese = any('\u4e00' <= char <= '\u9fff' for char in question)
        
        # Clean text for Python strings
        clean_question = question.replace('"', '\\"').replace('\n', ' ')
        clean_solution = solution.replace('"', '\\"').replace('\n', ' ') if solution else ""
        
        # Truncate question for title
        title_text = clean_question[:60] + "..." if len(clean_question) > 60 else clean_question
        
        script = f'''from manim import *
import numpy as np

class MathSolution(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a1a"
        
        # Title
        '''
        
        if has_chinese:
            # Use mathematical notation for title to avoid font issues
            script += f'''title = MathTex(r"\\text{{Problem}}", font_size=32, color=BLUE)'''
        else:
            script += f'''title = Text("{title_text}", font_size=36, color=BLUE)'''
            
        script += '''
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(0.5)
        
        # Main content
        '''
        
        # Add specific content based on question type
        numbers = re.findall(r'\d+', question)
        
        if "triangle" in question.lower() or "三角" in question:
            script += self._generate_advanced_triangle(question, numbers, has_chinese)
        elif "equation" in question.lower() or "方程" in question:
            script += self._generate_advanced_equation(question, numbers, has_chinese)
        elif "inequality" in question.lower() or "不等式" in question:
            script += self._generate_advanced_inequality(question, numbers, has_chinese)
        else:
            script += self._generate_advanced_generic(question, numbers, has_chinese)
        
        # Add solution if provided
        if solution and len(solution) > 2:
            if has_chinese:
                script += f'''
        
        # Solution - Use math notation to avoid font issues
        solution_label = MathTex(r"\\text{{Solution:}}", font_size=32, color=GREEN)
        solution_label.to_edge(DOWN).shift(UP*1.5)
        self.play(Write(solution_label))'''
            else:
                script += f'''
        
        # Solution
        solution_label = Text("Solution:", font_size=32, color=GREEN)
        solution_label.to_edge(DOWN).shift(UP*1.5)
        self.play(Write(solution_label))
        
        solution_text = Text("{clean_solution[:80]}", font_size=24, color=YELLOW)
        solution_text.next_to(solution_label, DOWN, buff=0.3)
        self.play(Write(solution_text))'''
        
        # Calculate final wait based on requested duration
        # Estimated animation time: 6-8 seconds for the basic animations
        animation_time = 8
        final_wait = max(2, duration - animation_time)
        
        script += f'''
        
        self.wait({final_wait})'''
        
        return script
    
    def _generate_advanced_triangle(self, question, numbers, has_chinese):
        """Generate advanced triangle animation"""
        base = numbers[0] if len(numbers) > 0 else "8"
        height = numbers[1] if len(numbers) > 1 else "6"
        area = str(int(base) * int(height) // 2)
        
        return f'''
        # Create triangle
        triangle = Polygon(
            np.array([-2, -1, 0]),
            np.array([2, -1, 0]),
            np.array([0, 2, 0]),
            color=BLUE,
            fill_opacity=0.3,
            stroke_width=3
        )
        self.play(Create(triangle))
        
        # Labels
        label_A = Text("A", font_size=24).next_to(triangle.get_vertices()[0], LEFT)
        label_B = Text("B", font_size=24).next_to(triangle.get_vertices()[1], RIGHT)
        label_C = Text("C", font_size=24).next_to(triangle.get_vertices()[2], UP)
        self.play(Write(label_A), Write(label_B), Write(label_C))
        
        # Base line
        base_line = Line(
            triangle.get_vertices()[0],
            triangle.get_vertices()[1],
            color=YELLOW,
            stroke_width=5
        )
        self.play(Create(base_line))
        
        # Base label - use Text for Chinese/mixed content
        {"base_label = Text('底边 = " + base + "', font='SimHei', font_size=24, color=YELLOW)" if has_chinese else 'base_label = Text("base = ' + base + '", font_size=24, color=YELLOW)'}
        base_label.next_to(base_line, DOWN, buff=0.3)
        self.play(Write(base_label))
        
        # Height line
        height_line = DashedLine(
            triangle.get_vertices()[2],
            np.array([0, -1, 0]),
            color=GREEN,
            stroke_width=4
        )
        self.play(Create(height_line))
        
        # Height label
        {"height_label = Text('高 = " + height + "', font='SimHei', font_size=24, color=GREEN)" if has_chinese else 'height_label = Text("height = ' + height + '", font_size=24, color=GREEN)'}
        height_label.next_to(height_line, RIGHT, buff=0.3)
        self.play(Write(height_label))
        
        # Formula
        formula = MathTex(r"A = \\frac{{1}}{{2}} \\times b \\times h", font_size=36)
        formula.next_to(triangle, DOWN, buff=1.5)
        self.play(Write(formula))
        
        # Calculation
        calc = MathTex(r"A = \\frac{{1}}{{2}} \\times {base} \\times {height}", font_size=32)
        calc.next_to(formula, DOWN, buff=0.3)
        self.play(Write(calc))
        
        # Result
        result = MathTex(r"A = {area}", font_size=40, color=GREEN)
        result.next_to(calc, DOWN, buff=0.3)
        self.play(Write(result))
        
        # Highlight
        box = SurroundingRectangle(result, color=YELLOW, buff=0.2)
        self.play(Create(box))'''
    
    def _generate_advanced_equation(self, question, numbers, has_chinese):
        """Generate advanced equation animation"""
        return '''
        # Equation
        equation = MathTex(r"2x + 5 = 13", font_size=48)
        equation.move_to(ORIGIN + UP)
        self.play(Write(equation))
        
        # Step 1
        step1 = MathTex(r"2x = 13 - 5", font_size=36)
        step1.next_to(equation, DOWN, buff=0.5)
        self.play(Write(step1))
        
        # Step 2
        step2 = MathTex(r"2x = 8", font_size=36)
        step2.next_to(step1, DOWN, buff=0.3)
        self.play(Write(step2))
        
        # Solution
        solution = MathTex(r"x = 4", font_size=40, color=GREEN)
        solution.next_to(step2, DOWN, buff=0.3)
        self.play(Write(solution))
        
        # Verify
        verify = MathTex(r"2(4) + 5 = 8 + 5 = 13 \\checkmark", font_size=32, color=YELLOW)
        verify.next_to(solution, DOWN, buff=0.5)
        self.play(Write(verify))'''
    
    def _generate_advanced_inequality(self, question, numbers, has_chinese):
        """Generate advanced inequality animation"""
        return '''
        # Inequality
        inequality = MathTex(r"3x - 7 > 14", font_size=48)
        inequality.move_to(ORIGIN + UP)
        self.play(Write(inequality))
        
        # Step 1
        step1 = MathTex(r"3x > 14 + 7", font_size=36)
        step1.next_to(inequality, DOWN, buff=0.5)
        self.play(Write(step1))
        
        # Step 2
        step2 = MathTex(r"3x > 21", font_size=36)
        step2.next_to(step1, DOWN, buff=0.3)
        self.play(Write(step2))
        
        # Solution
        solution = MathTex(r"x > 7", font_size=40, color=GREEN)
        solution.next_to(step2, DOWN, buff=0.3)
        self.play(Write(solution))
        
        # Number line
        number_line = NumberLine(
            x_range=[0, 15, 1],
            length=8,
            include_numbers=True,
            numbers_to_include=[0, 7, 14]
        )
        number_line.next_to(solution, DOWN, buff=0.8)
        self.play(Create(number_line))
        
        # Mark solution
        dot = Dot(number_line.n2p(7), color=RED, radius=0.1)
        arrow = Arrow(
            number_line.n2p(7),
            number_line.n2p(12),
            color=GREEN,
            buff=0
        )
        self.play(Create(dot), Create(arrow))'''
    
    def _generate_advanced_generic(self, question, numbers, has_chinese):
        """Generate advanced generic animation"""
        return '''
        # Math visualization
        axes = Axes(
            x_range=[-5, 5, 1],
            y_range=[-5, 5, 1],
            x_length=6,
            y_length=6,
            axis_config={"color": BLUE},
        )
        self.play(Create(axes))
        
        # Function
        func = lambda x: x**2 - 2*x - 3
        graph = axes.plot(func, color=YELLOW)
        self.play(Create(graph))
        
        # Label
        label = MathTex(r"f(x) = x^2 - 2x - 3", font_size=32)
        label.to_edge(RIGHT).shift(UP*2)
        self.play(Write(label))
        
        # Roots
        root1 = Dot(axes.c2p(-1, 0), color=RED)
        root2 = Dot(axes.c2p(3, 0), color=RED)
        self.play(Create(root1), Create(root2))
        
        # Root labels
        root1_label = MathTex(r"x = -1", font_size=24, color=RED)
        root1_label.next_to(root1, DOWN)
        root2_label = MathTex(r"x = 3", font_size=24, color=RED)
        root2_label.next_to(root2, DOWN)
        self.play(Write(root1_label), Write(root2_label))'''
    
    def generate_manim_video(self, script_content, output_name, question):
        """Generate video using Windows Manim installation"""
        try:
            # Create temporary script file
            script_hash = hashlib.md5(script_content.encode()).hexdigest()[:8]
            temp_script = TEMP_DIR / f'manim_script_{script_hash}.py'
            
            # Write script with UTF-8 encoding
            with open(temp_script, 'w', encoding='utf-8') as f:
                f.write(script_content)
            
            print(f"📝 Script written to: {temp_script}")
            
            # Save debug copy
            debug_script = TEMP_DIR / f'debug_{script_hash}.py'
            with open(debug_script, 'w', encoding='utf-8') as f:
                f.write(script_content)
            
            # Convert path format if needed (for cross-platform compatibility)
            windows_script = str(temp_script)
            if windows_script.startswith('/mnt/'):
                # WSL path - convert to Windows format
                drive_letter = windows_script[5].upper()
                windows_script = f"{drive_letter}:\\\\" + windows_script[7:].replace('/', '\\\\')
            
            # Set WINDOWS_BASE if not already set
            global WINDOWS_BASE
            if WINDOWS_BASE is None:
                windows_base = str(BASE_DIR)
                if windows_base.startswith('/mnt/'):
                    drive_letter = windows_base[5].upper()
                    WINDOWS_BASE = f"{drive_letter}:" + windows_base[7:].replace('/', '\\\\')
                else:
                    WINDOWS_BASE = windows_base
            
            # Extract scene name
            scene_match = re.search(r'class\s+(\w+)\s*\(', script_content)
            scene_name = scene_match.group(1) if scene_match else 'MathSolution'
            
            # Prepare Manim command based on environment
            if is_windows:
                # Native Windows
                cmd = [
                    PYTHON_CMD, '-m', 'manim',
                    str(temp_script), scene_name,
                    '-pql', '--format', 'mp4',
                    '--media_dir', str(BASE_DIR / 'media')
                ]
            elif USE_POWERSHELL:
                # WSL - use PowerShell to run Windows Python with UTF-8 encoding
                cmd = [
                    'powershell.exe', '-Command',
                    f'[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $env:PYTHONIOENCODING = "utf-8"; {PYTHON_CMD} -m manim "{windows_script}" {scene_name} -pql --format mp4 --media_dir "{WINDOWS_BASE}\\\\media"'
                ]
            else:
                # WSL or Linux - use local Manim
                cmd = [
                    PYTHON_CMD, '-m', 'manim',
                    str(temp_script), scene_name,
                    '-pql', '--format', 'mp4',
                    '--media_dir', str(BASE_DIR / 'media')
                ]
            
            print(f"🔧 Executing Manim command...")
            print(f"   Scene: {scene_name}")
            
            # Run Manim
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=False,
                timeout=60
            )
            
            # Decode output
            stdout = result.stdout.decode('utf-8', errors='replace') if result.stdout else ""
            stderr = result.stderr.decode('utf-8', errors='replace') if result.stderr else ""
            
            if result.returncode == 0:
                print("✅ Manim execution successful!")
                
                # Find the generated video
                video_path = self.find_generated_video(scene_name, script_hash)
                
                if video_path:
                    # Copy to final location
                    final_path = RENDERED_VIDEOS_DIR / f"{output_name}.mp4"
                    shutil.copy2(video_path, final_path)
                    print(f"✅ Video copied to: {final_path}")
                    
                    # Clean up
                    temp_script.unlink()
                    
                    return True, f'/rendered_videos/{output_name}.mp4', 'Video generated successfully'
                else:
                    return False, None, 'Video file not found after rendering'
            else:
                print(f"❌ Manim execution failed with code {result.returncode}")
                print(f"📜 Stdout: {stdout[:1000]}")
                print(f"📜 Stderr: {stderr[:1000]}")
                
                # Save full error log for debugging
                error_log = TEMP_DIR / f'error_{script_hash}.log'
                with open(error_log, 'w', encoding='utf-8') as f:
                    f.write(f"Command: {' '.join(cmd)}\n")
                    f.write(f"Return code: {result.returncode}\n")
                    f.write(f"=== STDOUT ===\n{stdout}\n")
                    f.write(f"=== STDERR ===\n{stderr}\n")
                print(f"📝 Full error saved to: {error_log}")
                
                # Extract meaningful error
                if "SyntaxError" in stderr:
                    return False, None, f"Syntax error in generated script"
                elif "NameError" in stderr:
                    return False, None, f"Name error in script"
                elif "TypeError" in stderr:
                    return False, None, f"Type error in script"
                elif "LaTeX" in stderr:
                    return False, None, f"LaTeX rendering error - {stderr[:200]}"
                else:
                    return False, None, f"Manim rendering failed - {stderr[:200]}"
                
        except subprocess.TimeoutExpired:
            return False, None, 'Video generation timed out'
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return False, None, f'Error: {str(e)}'
    
    def find_generated_video(self, scene_name, script_hash):
        """Find the video generated by Manim"""
        print(f"🔍 Searching for generated video...")
        
        # Search paths
        search_paths = [
            MEDIA_DIR / 'videos' / f'manim_script_{script_hash}' / '480p15',
            MEDIA_DIR / 'videos' / scene_name / '480p15',
            MEDIA_DIR / 'videos',
        ]
        
        # Look for recent videos
        cutoff_time = time.time() - 300
        
        for path in search_paths:
            if path.exists():
                print(f"   Checking: {path}")
                for video in path.rglob('*.mp4'):
                    if video.stat().st_mtime > cutoff_time:
                        print(f"✅ Found video: {video}")
                        return video
        
        return None
    
    def get_file_size(self, video_path):
        """Get file size of video"""
        try:
            if video_path:
                full_path = BASE_DIR / 'public' / video_path.lstrip('/')
                if full_path.exists():
                    return full_path.stat().st_size
        except:
            pass
        return 0
    
    def send_json_response(self, data):
        """Send JSON response with CORS headers"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_GET(self):
        if self.path == '/health':
            self.send_json_response({
                'status': 'healthy',
                'service': 'real-manim-video-server-v2',
                'port': PORT,
                'timestamp': time.time(),
                'version': '2.0'
            })
        else:
            super().do_GET()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    os.chdir(str(BASE_DIR))
    
    print(f"🚀 Real Manim Video Generation Server v2 starting on port {PORT}...")
    print(f"📡 Health check: http://localhost:{PORT}/health")
    print(f"🎬 Render endpoint: http://localhost:{PORT}/render")
    print(f"🌐 Supports both Chinese and English content")
    print(f"✨ Enhanced stability and error handling")
    
    with socketserver.TCPServer(("0.0.0.0", PORT), RealManimHandler) as httpd:
        httpd.serve_forever()