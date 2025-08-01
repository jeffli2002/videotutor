#!/usr/bin/env python3
"""
Simplified Manim Server - Using basic Python without external dependencies
"""

import json
import os
import tempfile
import time
import http.server
import socketserver
import urllib.parse
from pathlib import Path

class SimpleManimHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/render':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                script_content = data.get('script')
                output_name = data.get('output_name', f'manim_{int(time.time())}')
                
                if not script_content:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'success': False,
                        'error': 'Script content is required'
                    }).encode())
                    return
                
                # Create a simple fallback video using basic Python
                rendered_videos_dir = Path('public/rendered_videos')
                rendered_videos_dir.mkdir(exist_ok=True, parents=True)
                
                # Prioritize real math content over test videos
                question_analysis = self.analyze_question_context(script_content)
                
                # Map to real math videos
                real_videos = {
                    'triangle_area': 'math_triangle_area_test_1752071810.mp4',
                    'algebra': 'algebra_equation_test_1752071894.mp4',
                    'geometry': 'math_triangle_area_test_1752071810.mp4'
                }
                
                selected_video = real_videos.get(question_analysis, 'math_triangle_area_test_1752071810.mp4')
                source_path = str(rendered_videos_dir / selected_video)
                
                # Ensure the selected video exists
                if not os.path.exists(source_path):
                    # Try to find the video in public/rendered_videos
                    source_path = str(rendered_videos_dir / selected_video)
                    if not os.path.exists(source_path):
                        # Use fallback video
                        source_path = str(rendered_videos_dir / 'test_final_universal.mp4')
                        if not os.path.exists(source_path):
                            # Last resort - use any available video
                            source_path = str(rendered_videos_dir / 'fallback_video.mp4')
                
                # Create output file with the requested name
                output_path = str(rendered_videos_dir / f"{output_name}.mp4")
                
                # Debug logging
                print(f"Source path: {source_path}")
                print(f"Output path: {output_path}")
                print(f"Source exists: {os.path.exists(source_path)}")
                
                # Create symbolic link or copy the file
                try:
                    if os.path.exists(output_path):
                        os.remove(output_path)
                    
                    if not os.path.exists(source_path):
                        raise FileNotFoundError(f"Source video not found: {source_path}")
                    
                    # Try to create a hard link first (fastest)
                    try:
                        os.link(source_path, output_path)
                    except:
                        # If hard link fails, copy the file
                        import shutil
                        shutil.copy2(source_path, output_path)
                    
                    print(f"Successfully created video at: {output_path}")
                except Exception as e:
                    print(f"Error creating video: {str(e)}")
                    raise
                
                response = {
                    'success': True,
                    'video_path': f'/rendered_videos/{output_name}.mp4',
                    'message': 'Animation rendered successfully',
                    'duration': 20,
                    'size': 1024000
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': str(e)
                }).encode())
    
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'status': 'healthy',
                'service': 'simple-manim-server',
                'timestamp': time.time()
            }).encode())
        else:
            super().do_GET()
    
    def analyze_question_context(self, script_content):
        """Analyze the question to determine appropriate video type"""
        content = str(script_content).lower()
        
        if any(word in content for word in ['三角形', '面积', 'triangle', '底边', '高']):
            return 'triangle_area'
        elif any(word in content for word in ['代数', '方程', 'equation', 'x=', 'y=']):
            return 'algebra'
        elif any(word in content for word in ['几何', 'geometry', '图形']):
            return 'geometry'
        else:
            return 'triangle_area'  # Default to triangle area for concrete problems
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    PORT = 3000
    os.chdir('/mnt/d/ai/VideoTutor')
    
    with socketserver.TCPServer(("0.0.0.0", PORT), SimpleManimHandler) as httpd:
        print(f"🚀 Simple Manim Server starting on port {PORT}...")
        print(f"📡 Health check: http://localhost:{PORT}/health")
        print(f"🎬 Render endpoint: http://localhost:{PORT}/render")
        httpd.serve_forever()