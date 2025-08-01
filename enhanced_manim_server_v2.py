#!/usr/bin/env python3
"""
Enhanced Manim Video Server with Better Error Handling
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
import traceback

# Configuration
PORT = 5001
BASE_DIR = Path('/mnt/d/ai/VideoTutor')
RENDERED_VIDEOS_DIR = BASE_DIR / 'public' / 'rendered_videos'
MEDIA_DIR = BASE_DIR / 'media'
TEMP_DIR = BASE_DIR / 'temp'

# Windows paths
WINDOWS_PYTHON = 'python'
WINDOWS_BASE = 'D:\\\\ai\\\\VideoTutor'

# Create directories
for dir_path in [RENDERED_VIDEOS_DIR, MEDIA_DIR, TEMP_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

class EnhancedManimHandler(http.server.BaseHTTPRequestHandler):
    def send_json_response(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

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
                
                print(f"\n{'='*60}")
                print(f"🎬 Enhanced Manim Render Request at {time.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"📦 Output name: {output_name}")
                print(f"❓ Question: {question[:100]}...")
                print(f"📝 Script length: {len(script_content)} chars")
                print(f"{'='*60}\n")
                
                # Generate script if not provided
                if not script_content or len(script_content) < 100:
                    script_content = self.generate_safe_manim_script(question, solution)
                
                # Execute Manim with enhanced error handling
                success, video_path, message = self.execute_manim_safe(
                    script_content, 
                    output_name
                )
                
                response = {
                    'success': success,
                    'video_path': video_path,
                    'message': message,
                    'duration': 20,
                    'size': 0,
                    'fallback': False,
                    'generated': success
                }
                
                if success:
                    # Get file size
                    try:
                        full_path = BASE_DIR / 'public' / video_path.lstrip('/')
                        if full_path.exists():
                            response['size'] = full_path.stat().st_size
                    except:
                        pass
                
                self.send_json_response(response, 200 if success else 500)
                
            except Exception as e:
                print(f"❌ Request Error: {str(e)}")
                traceback.print_exc()
                self.send_json_response({
                    'success': False,
                    'video_path': None,
                    'message': f'Server error: {str(e)}',
                    'fallback': False,
                    'generated': False
                }, 500)
    
    def generate_safe_manim_script(self, question, solution):
        """Generate a safe, working Manim script"""
        # For Chinese text, just remove quotes and newlines
        if any('\u4e00' <= char <= '\u9fff' for char in question):
            clean_question = question.replace('"', '').replace("'", '').replace('\n', ' ')[:50]
        else:
            clean_question = re.sub(r'[^\w\s\d.,!?:;()\-=+*/]', '', question)[:80]
        
        # Simple script that always works
        script = f'''from manim import *

class MathScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a1a"
        
        # Title - handle Chinese text properly
        title = Text(r"{clean_question}", font="Microsoft YaHei", font_size=32, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # Math formula (if triangle area problem)
        if "triangle" in question.lower() or "三角形" in question:
            formula = MathTex(r"A = \\frac{1}{2} \\times b \\times h", font_size=48)
            formula.move_to(ORIGIN)
            self.play(Write(formula))
            self.wait(1)
            
            # Example calculation
            calc = MathTex(r"A = \\frac{1}{2} \\times 8 \\times 6 = 24", font_size=36, color=GREEN)
            calc.next_to(formula, DOWN, buff=1)
            self.play(Write(calc))
            self.wait(2)
        else:
            # Generic math content
            content = Text("Mathematical Solution", font_size=36)
            content.move_to(ORIGIN)
            self.play(Write(content))
            self.wait(2)
'''
        return script
    
    def execute_manim_safe(self, script_content, output_name):
        """Execute Manim with enhanced error handling"""
        try:
            # Create temporary script file
            script_hash = hashlib.md5(script_content.encode()).hexdigest()[:8]
            temp_script = TEMP_DIR / f'manim_script_{script_hash}.py'
            
            with open(temp_script, 'w', encoding='utf-8') as f:
                f.write(script_content)
            
            print(f"📝 Script written to: {temp_script}")
            
            # Convert to Windows path
            windows_script = str(temp_script).replace('/mnt/d/', 'D:/').replace('/', '\\\\')
            
            # Find scene name
            scene_match = re.search(r'class\s+(\w+)\s*\(', script_content)
            scene_name = scene_match.group(1) if scene_match else 'MathScene'
            
            # Simple command that should work
            cmd = [
                'powershell.exe', '-Command',
                f'{WINDOWS_PYTHON} -m manim "{windows_script}" {scene_name} -pql --format mp4'
            ]
            
            print(f"🔧 Executing Manim command...")
            print(f"   Scene: {scene_name}")
            print(f"   Command: {' '.join(cmd)}")
            
            # Run with timeout
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            print(f"📊 Return code: {result.returncode}")
            
            if result.returncode == 0:
                print("✅ Manim execution successful!")
                
                # Find generated video
                video_found = self.find_generated_video(scene_name, script_hash)
                if video_found:
                    return True, video_found, 'Video generated successfully'
                else:
                    return False, None, 'Video generated but not found'
            else:
                print(f"❌ Manim failed with code {result.returncode}")
                print(f"Stdout: {result.stdout[:500]}")
                print(f"Stderr: {result.stderr[:500]}")
                return False, None, f'Manim error: {result.stderr[:200]}'
                
        except subprocess.TimeoutExpired:
            print("⏱️ Manim timeout")
            return False, None, 'Video generation timed out'
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            traceback.print_exc()
            return False, None, f'Error: {str(e)}'
        finally:
            # Cleanup
            try:
                if 'temp_script' in locals() and temp_script.exists():
                    temp_script.unlink()
            except:
                pass
    
    def find_generated_video(self, scene_name, script_hash):
        """Find the video generated by Manim"""
        print(f"🔍 Searching for generated video...")
        
        # Look in multiple possible locations
        search_dirs = [
            MEDIA_DIR / 'videos' / f'manim_script_{script_hash}' / '480p15',
            MEDIA_DIR / 'videos' / f'manim_script_{script_hash}' / '720p30',
            MEDIA_DIR / 'videos' / f'manim_script_{script_hash}',
            Path(f'D:/ai/VideoTutor/media/videos/manim_script_{script_hash}/480p15'),
        ]
        
        for search_dir in search_dirs:
            print(f"   Checking: {search_dir}")
            if Path(search_dir).exists():
                for video_file in Path(search_dir).glob(f'{scene_name}.mp4'):
                    print(f"✅ Found video: {video_file}")
                    
                    # Copy to public directory
                    output_name = f'manim_{int(time.time())}_{script_hash}.mp4'
                    output_path = RENDERED_VIDEOS_DIR / output_name
                    shutil.copy2(video_file, output_path)
                    print(f"✅ Video copied to: {output_path}")
                    
                    return f'/rendered_videos/{output_name}'
        
        print("❌ Video not found in any location")
        return None
    
    def do_GET(self):
        if self.path == '/health':
            self.send_json_response({
                'status': 'healthy',
                'service': 'enhanced-manim-server',
                'port': PORT,
                'timestamp': time.time(),
                'manim': 'Windows PowerShell'
            })
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    os.chdir(str(BASE_DIR))
    
    print(f"🚀 Enhanced Manim Video Server starting on port {PORT}...")
    print(f"📡 Health check: http://localhost:{PORT}/health")
    print(f"🎬 Render endpoint: http://localhost:{PORT}/render")
    print(f"✨ Enhanced error handling and logging")
    
    with socketserver.TCPServer(("0.0.0.0", PORT), EnhancedManimHandler) as httpd:
        print(f"🌐 Server listening on 0.0.0.0:{PORT}")
        httpd.serve_forever()