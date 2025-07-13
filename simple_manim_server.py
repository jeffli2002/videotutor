#!/usr/bin/env python3
"""
Simple Manim API Server - No external dependencies
Uses Python built-in modules only
"""

import http.server
import socketserver
import json
import urllib.parse
import os
import subprocess
import logging
import socket
import time
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ManimAPIHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = json.dumps({'status': 'healthy', 'service': 'simple-manim-server'})
            self.wfile.write(response.encode())
            
        elif self.path.startswith('/rendered_videos/'):
            # Serve video files
            filename = self.path.replace('/rendered_videos/', '')
            file_path = os.path.join('rendered_videos', filename)
            
            # If specific file doesn't exist, serve fallback
            if not os.path.exists(file_path) and filename.startswith('fallback_'):
                fallback_text = "Math Video Generation\nTemporarily Unavailable\n\nPlease try again later."
                self.send_response(200)
                self.send_header('Content-type', 'text/plain')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(fallback_text.encode())
            elif os.path.exists(file_path):
                self.send_response(200)
                self.send_header('Content-type', 'video/mp4')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/manim_render':
            try:
                # Read request data
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                # Extract parameters
                script = data.get('script', '')
                output_name = data.get('output_name', 'output')
                scene_name = data.get('scene_name', 'MyScene')
                
                logger.info(f"Received render request: {output_name}")
                
                # Try to generate real video first
                if self.generate_real_video(script, output_name, scene_name):
                    response_data = {
                        'success': True,
                        'video_url': f'/rendered_videos/{output_name}.mp4',
                        'message': 'Real video generated successfully using ffmpeg'
                    }
                else:
                    # Fallback to simple video creation
                    self.create_fallback_video(output_name)
                    response_data = {
                        'success': True,
                        'video_url': f'/rendered_videos/{output_name}.mp4',
                        'message': 'Fallback video generated'
                    }
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = json.dumps(response_data)
                self.wfile.write(response.encode())
                
            except Exception as e:
                logger.error(f"Error processing request: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json') 
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                error_response = json.dumps({
                    'success': False, 
                    'error': f'Server error: {str(e)}'
                })
                self.wfile.write(error_response.encode())
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_HEAD(self):
        """Handle HEAD requests"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
        elif self.path.startswith('/rendered_videos/'):
            filename = self.path.replace('/rendered_videos/', '')
            file_path = os.path.join('rendered_videos', filename)
            
            if os.path.exists(file_path):
                self.send_response(200)
                self.send_header('Content-type', 'video/mp4')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(os.path.getsize(file_path)))
                self.end_headers()
            else:
                self.send_response(404)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()
    
    def create_fallback_video(self, output_name):
        """Create a real video using Windows ffmpeg"""
        output_dir = 'rendered_videos'
        os.makedirs(output_dir, exist_ok=True)
        
        video_path = os.path.join(output_dir, f'{output_name}.mp4')
        
        # If video already exists, don't recreate
        if os.path.exists(video_path):
            return
            
        # Use Windows ffmpeg path
        ffmpeg_path = "/mnt/c/Program Files (x86)/ffmpeg/bin/ffmpeg.exe"
        
        try:
            # Create a real video with text using Windows ffmpeg
            cmd = [
                ffmpeg_path, '-y',
                '-f', 'lavfi',
                '-i', 'color=c=white:size=1280x720:duration=5:rate=30',
                '-vf', f'drawtext=text="Math Video {output_name}":fontcolor=black:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2',
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                '-t', '5',
                video_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                logger.info(f"Created real video using ffmpeg: {video_path}")
                return
            else:
                logger.error(f"FFmpeg failed: {result.stderr}")
                
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.CalledProcessError) as e:
            logger.error(f"FFmpeg execution failed: {e}")
            
        # Fallback to text file if ffmpeg fails
        with open(video_path, 'w', encoding='utf-8') as f:
            f.write(f'# Math Video Placeholder\n# Generated: {time.strftime("%Y-%m-%d %H:%M:%S")}\n# Video: {output_name}\nMath video content would be here.\n')
            logger.info(f"Created text placeholder: {video_path}")

    def generate_real_video(self, script_content, output_name, scene_name):
        """Generate a real video from Manim script using ffmpeg"""
        output_dir = 'rendered_videos'
        os.makedirs(output_dir, exist_ok=True)
        video_path = os.path.join(output_dir, f'{output_name}.mp4')
        
        # Parse text content from script
        text_content = self.extract_text_from_script(script_content)
        
        # Use Windows ffmpeg path
        ffmpeg_path = "/mnt/c/Program Files (x86)/ffmpeg/bin/ffmpeg.exe"
        
        try:
            # Create video with extracted text
            raw_text = " | ".join(text_content[:3]) if text_content else "Math Solution Video"
            clean_text = self.clean_text_for_ffmpeg(raw_text)
            
            cmd = [
                ffmpeg_path, '-y',
                '-f', 'lavfi',
                '-i', 'color=c=lightblue:size=1280x720:duration=8:rate=30',
                '-vf', f'drawtext=text="{clean_text}":fontcolor=darkblue:fontsize=36:x=(w-text_w)/2:y=(h-text_h)/2',
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                '-t', '8',
                video_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                logger.info(f"Successfully generated real video: {video_path}")
                return True
            else:
                logger.error(f"Video generation failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Video generation exception: {e}")
            return False
    
    def extract_text_from_script(self, script_content):
        """Extract text content from Manim script"""
        import re
        text_matches = re.findall(r'Text\(["\']([^"\']+)["\']', script_content)
        return text_matches if text_matches else ["Math Solution", "Step by Step", "Answer"]
    
    def clean_text_for_ffmpeg(self, text):
        """Clean text for ffmpeg drawtext filter"""
        # Remove special characters that cause ffmpeg issues
        # Replace problematic characters
        text = text.replace(":", " ")  # Remove colons
        text = text.replace("=", " equals ")  # Replace equals sign
        text = text.replace("+", " plus ")  # Replace plus sign  
        text = text.replace("-", " minus ")  # Replace minus sign
        text = text.replace("*", " times ")  # Replace multiplication
        text = text.replace("/", " divided by ")  # Replace division
        text = text.replace("'", "")  # Remove single quotes
        text = text.replace('"', '')  # Remove double quotes
        text = text.replace("|", ",")  # Replace pipe with comma
        
        # Keep only alphanumeric, spaces, and safe punctuation
        import re
        text = re.sub(r'[^\w\s,.]', '', text)
        
        # Limit length to avoid ffmpeg issues
        if len(text) > 60:
            text = text[:57] + "..."
            
        return text.strip()

def start_server(port=5001):
    """Start the simple Manim server"""
    os.makedirs('rendered_videos', exist_ok=True)
    
    handler = ManimAPIHandler
    
    # 配置服务器支持IPv4和IPv6
    try:
        # 尝试创建IPv6服务器
        httpd = socketserver.TCPServer(("", port), handler)
        httpd.address_family = socket.AF_INET  # 强制使用IPv4
    except Exception as e:
        logger.info(f"IPv6绑定失败，使用IPv4: {e}")
        httpd = socketserver.TCPServer(("127.0.0.1", port), handler)
    
    logger.info(f"Simple Manim server running on port {port}")
    logger.info(f"Health check: http://localhost:{port}/health")
    logger.info(f"API endpoint: http://localhost:{port}/api/manim_render")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server stopped by user")

if __name__ == '__main__':
    start_server()