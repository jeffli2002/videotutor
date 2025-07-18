#!/usr/bin/env python3
"""
简单的TTS服务 - 替代Mozilla TTS
支持pyttsx3（离线）和gTTS（在线）
"""

import os
import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

# 尝试导入TTS库
try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
    print("✅ pyttsx3 可用")
except ImportError:
    PYTTSX3_AVAILABLE = False
    print("⚠️ pyttsx3 不可用")

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
    print("✅ gTTS 可用")
except ImportError:
    GTTS_AVAILABLE = False
    print("⚠️ gTTS 不可用")

class SimpleTTSHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/tts':
            self.handle_tts_request()
        else:
            self.send_error(404, "Not Found")

    def handle_tts_request(self):
        try:
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, "Empty request body")
                return
                
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            print(f"📥 收到TTS请求: {self.client_address}")
            
            # 获取参数
            text = request_data.get('text', '')
            language = request_data.get('language', 'zh-cn')
            method = request_data.get('method', 'auto')  # auto, pyttsx3, gtts
            
            if not text:
                self.send_error(400, "Missing text parameter")
                return
            
            print(f"📝 文本: {text[:50]}...")
            print(f"🌍 语言: {language}")
            print(f"🔧 方法: {method}")
            
            # 生成音频文件
            audio_path = self.generate_audio(text, language, method)
            
            if audio_path:
                response_data = {
                    'success': True,
                    'audio_path': audio_path,
                    'method': method,
                    'text_length': len(text)
                }
                print(f"✅ TTS生成成功: {audio_path}")
            else:
                response_data = {
                    'success': False,
                    'error': 'Failed to generate audio'
                }
                print("❌ TTS生成失败")
            
            # 发送响应
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON解析错误: {str(e)}")
            self.send_error(400, "Invalid JSON")
        except Exception as e:
            print(f"❌ 服务器错误: {str(e)}")
            error_data = {
                'error': f'Server error: {str(e)}',
                'code': 'SERVER_ERROR'
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_data).encode('utf-8'))

    def generate_audio(self, text, language, method):
        """生成音频文件"""
        try:
            # 确保输出目录存在
            output_dir = "rendered_videos"
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
            
            # 生成文件名
            timestamp = int(time.time() * 1000)
            filename = f"tts_audio_{timestamp}.mp3"
            filepath = os.path.join(output_dir, filename)
            
            # 根据方法选择TTS引擎
            if method == 'pyttsx3' or (method == 'auto' and PYTTSX3_AVAILABLE):
                return self.generate_with_pyttsx3(text, filepath, language)
            elif method == 'gtts' or (method == 'auto' and GTTS_AVAILABLE):
                return self.generate_with_gtts(text, filepath, language)
            else:
                print("❌ 没有可用的TTS引擎")
                return None
                
        except Exception as e:
            print(f"❌ 音频生成失败: {e}")
            return None

    def generate_with_pyttsx3(self, text, filepath, language):
        """使用pyttsx3生成音频"""
        try:
            if not PYTTSX3_AVAILABLE:
                return None
                
            print("🔊 使用pyttsx3生成音频...")
            
            # 初始化引擎
            engine = pyttsx3.init()
            
            # 设置语言
            voices = engine.getProperty('voices')
            for voice in voices:
                if language.startswith('zh') and 'chinese' in voice.name.lower():
                    engine.setProperty('voice', voice.id)
                    break
                elif language.startswith('en') and 'english' in voice.name.lower():
                    engine.setProperty('voice', voice.id)
                    break
            
            # 设置属性
            engine.setProperty('rate', 150)  # 语速
            engine.setProperty('volume', 0.9)  # 音量
            
            # 保存到文件
            engine.save_to_file(text, filepath)
            engine.runAndWait()
            
            if os.path.exists(filepath):
                return f"/rendered_videos/{os.path.basename(filepath)}"
            else:
                return None
                
        except Exception as e:
            print(f"❌ pyttsx3生成失败: {e}")
            return None

    def generate_with_gtts(self, text, filepath, language):
        """使用gTTS生成音频"""
        try:
            if not GTTS_AVAILABLE:
                return None
                
            print("🌐 使用gTTS生成音频...")
            
            # 创建TTS对象
            tts = gTTS(text=text, lang=language, slow=False)
            
            # 保存到文件
            tts.save(filepath)
            
            if os.path.exists(filepath):
                return f"/rendered_videos/{os.path.basename(filepath)}"
            else:
                return None
                
        except Exception as e:
            print(f"❌ gTTS生成失败: {e}")
            return None

    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def run_tts_server():
    port = 8003
    try:
        server = HTTPServer(('localhost', port), SimpleTTSHandler)
        print(f"🚀 简单TTS服务器启动在端口 {port}")
        print(f"📡 服务器地址: http://localhost:{port}")
        print(f"📋 API端点: http://localhost:{port}/api/tts")
        print("🔧 功能特点:")
        print("  ✅ 支持pyttsx3 (离线)")
        print("  ✅ 支持gTTS (在线)")
        print("  ✅ 自动选择最佳引擎")
        print("  ✅ 多语言支持")
        print("  ✅ 跨域支持")
        print("=" * 50)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 服务器被用户中断")
    except Exception as e:
        print(f"❌ 服务器启动失败: {str(e)}")

if __name__ == "__main__":
    run_tts_server() 