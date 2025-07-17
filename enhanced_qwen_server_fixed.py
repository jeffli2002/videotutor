#!/usr/bin/env python3
"""
修复版增强QWEN API服务器 - 解决连接中断问题
"""

import json
import os
import time
import ssl
import socket
import urllib.request
from urllib.error import URLError, HTTPError
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import sys

# 尝试导入dashscope SDK
try:
    import dashscope
    from dashscope import Generation
    SDK_AVAILABLE = True
    print("✅ dashscope SDK 可用")
except ImportError:
    SDK_AVAILABLE = False
    print("⚠️ dashscope SDK 不可用，将使用HTTP连接")

class FixedQWENHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        try:
            self.send_response(200)
            self.end_headers()
        except (BrokenPipeError, ConnectionAbortedError):
            print("⚠️ 客户端在OPTIONS请求中断开连接")
        except Exception as e:
            print(f"❌ OPTIONS请求错误: {str(e)}")

    def do_POST(self):
        if self.path == '/api/qwen':
            self.handle_qwen_api()
        else:
            try:
                self.send_error(404, "Not Found")
            except (BrokenPipeError, ConnectionAbortedError):
                print("⚠️ 客户端在404响应中断开连接")

    def safe_send_response(self, response_data, status_code=200):
        """安全发送响应，处理连接中断"""
        try:
            self.send_response(status_code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            # 检查连接是否仍然有效
            if hasattr(self, 'wfile') and self.wfile:
                response_json = json.dumps(response_data, ensure_ascii=False)
                self.wfile.write(response_json.encode('utf-8'))
                self.wfile.flush()
                print(f"✅ 成功发送响应 (状态码: {status_code})")
                return True
            else:
                print("⚠️ 连接已关闭，无法发送响应")
                return False
                
        except (BrokenPipeError, ConnectionAbortedError) as e:
            print(f"⚠️ 客户端断开连接: {str(e)}")
            return False
        except Exception as e:
            print(f"❌ 发送响应时出错: {str(e)}")
            return False

    def handle_qwen_api(self):
        try:
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                print("❌ 请求体为空")
                self.safe_send_response({'error': 'Empty request body'}, 400)
                return
                
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            print(f"📥 收到API请求: {self.client_address}")
            
            # 获取API密钥
            api_key = request_data.get('api_key', '')
            if not api_key:
                api_key = os.environ.get('QWEN_API_KEY') or os.environ.get('VITE_QWEN_API_KEY')
            
            if not api_key:
                print("❌ 缺少API密钥")
                self.safe_send_response({'error': 'Missing API key'}, 400)
                return
            
            print(f"🔑 API密钥: {api_key[:8]}...")
            print(f"💬 消息数量: {len(request_data.get('messages', []))}")
            
            # 尝试多种连接方式
            success = False
            
            # 方式1: 使用SDK
            if SDK_AVAILABLE and not success:
                success = self.try_sdk_connection(api_key, request_data)
            
            # 方式2: 使用HTTP连接
            if not success:
                success = self.try_http_connection(api_key, request_data)
            
            # 方式3: 使用备用响应
            if not success:
                print("🔄 使用增强备用响应机制...")
                fallback_response = self.create_enhanced_fallback_response(request_data.get('messages', []))
                print(f"✅ 生成增强备用响应: {len(fallback_response['output']['text'])} 字符")
                
                if not self.safe_send_response(fallback_response):
                    print("❌ 发送备用响应失败")
                
        except json.JSONDecodeError as e:
            print(f"❌ JSON解析错误: {str(e)}")
            self.safe_send_response({'error': 'Invalid JSON'}, 400)
        except Exception as e:
            print(f"❌ 服务器错误: {str(e)}")
            error_data = {
                'error': f'Server error: {str(e)}',
                'code': 'SERVER_ERROR'
            }
            self.safe_send_response(error_data, 500)

    def try_sdk_connection(self, api_key, request_data):
        """尝试使用SDK连接"""
        try:
            print("🔍 尝试SDK连接...")
            
            # 设置API密钥
            dashscope.api_key = api_key
            
            # 调用API
            response = Generation.call(
                model='qwen-plus',
                messages=request_data.get('messages', []),
                result_format='message',
                max_tokens=request_data.get('max_tokens', 1000),
                temperature=request_data.get('temperature', 0.1),
                top_p=request_data.get('top_p', 0.8)
            )
            
            if response.status_code == 200:
                print("✅ SDK连接成功")
                
                # 返回成功响应
                result = {
                    'output': {
                        'text': response.output.choices[0].message.content
                    },
                    'usage': {
                        'input_tokens': response.usage.input_tokens,
                        'output_tokens': response.usage.output_tokens
                    },
                    'request_id': response.request_id,
                    'method': 'sdk'
                }
                
                return self.safe_send_response(result)
            else:
                print(f"❌ SDK连接失败: {response.message}")
                return False
                
        except Exception as e:
            print(f"❌ SDK连接异常: {type(e).__name__} - {str(e)}")
            return False

    def try_http_connection(self, api_key, request_data):
        """尝试使用HTTP连接"""
        try:
            print("🔍 尝试HTTP连接...")
            
            # 准备请求数据
            qwen_data = {
                'model': 'qwen-plus',
                'input': {
                    'messages': request_data.get('messages', [])
                },
                'parameters': {
                    'temperature': request_data.get('temperature', 0.1),
                    'max_tokens': request_data.get('max_tokens', 1000),
                    'top_p': request_data.get('top_p', 0.8)
                }
            }
            
            # 创建SSL上下文
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')
            
            # 尝试不同的端点
            endpoints = [
                'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
                'https://api.dashscope.com/v1/services/aigc/text-generation/generation'
            ]
            
            for endpoint in endpoints:
                try:
                    print(f"  📡 尝试端点: {endpoint}")
                    
                    req = urllib.request.Request(
                        endpoint,
                        data=json.dumps(qwen_data).encode('utf-8'),
                        headers={
                            'Authorization': f'Bearer {api_key}',
                            'Content-Type': 'application/json',
                            'User-Agent': 'MathTutor-AI/1.0'
                        }
                    )
                    
                    with urllib.request.urlopen(req, timeout=30, context=ssl_context) as response:
                        response_data = response.read().decode('utf-8')
                        print(f"✅ HTTP连接成功 (状态码: {response.code})")
                        
                        # 解析响应
                        response_json = json.loads(response_data)
                        if 'output' in response_json:
                            result = {
                                'output': response_json['output'],
                                'usage': response_json.get('usage', {}),
                                'request_id': response_json.get('request_id', ''),
                                'method': 'http'
                            }
                            
                            return self.safe_send_response(result)
                            
                except Exception as e:
                    print(f"  ❌ 端点 {endpoint} 失败: {type(e).__name__}")
                    continue
            
            return False
            
        except Exception as e:
            print(f"❌ HTTP连接异常: {type(e).__name__} - {str(e)}")
            return False

    def create_enhanced_fallback_response(self, messages):
        """创建增强的备用响应"""
        # 提取用户问题
        user_question = ""
        for msg in messages:
            if msg.get('role') == 'user':
                user_question = msg.get('content', '')
                break
        
        # 检测是否为数学问题
        math_keywords = ['方程', '求解', '计算', '=', '+', '-', '*', '/', 'x', 'y', '解', '答案', '不等式']
        is_math = any(keyword in user_question for keyword in math_keywords)
        
        if is_math and ('=' in user_question or '>' in user_question or '<' in user_question):
            response_text = f"""我来帮你分析这个数学问题：

**问题：** {user_question}

**解题步骤：**
1. 首先识别问题类型（方程、不等式、计算等）
2. 整理已知条件和未知数
3. 选择合适的解题方法
4. 逐步求解
5. 验证答案

**示例解答：**
假设这是一个不等式问题，比如 3x - 7 > 14：
- 第一步：3x - 7 > 14
- 第二步：3x > 14 + 7
- 第三步：3x > 21
- 第四步：x > 7

**注意：** 当前使用备用响应模式，网络恢复后将提供完整AI解答。"""
        else:
            response_text = f"""感谢您的问题！

**您的问题：** {user_question}

由于当前网络连接问题，我无法提供完整的AI解答。

**建议：**
1. 请检查网络连接后重试
2. 确保问题描述完整清楚
3. 如果是数学问题，请包含具体的数字和符号

**注意：** 当前使用备用响应模式，网络恢复后将提供完整AI解答。"""

        return {
            'output': {
                'text': response_text
            },
            'usage': {
                'input_tokens': len(user_question),
                'output_tokens': len(response_text)
            },
            'request_id': f'fallback_{int(time.time())}',
            'method': 'fallback',
            'message': 'Enhanced fallback response due to network issues'
        }

    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def run_fixed_server():
    port = 8002
    try:
        server = HTTPServer(('localhost', port), FixedQWENHandler)
        print(f"🚀 修复版增强QWEN API服务器启动在端口 {port}")
        print(f"📡 服务器地址: http://localhost:{port}")
        print(f"📋 API端点: http://localhost:{port}/api/qwen")
        print("🔧 功能特点:")
        print("  ✅ 支持SDK连接")
        print("  ✅ 支持HTTP连接")
        print("  ✅ 增强备用响应")
        print("  ✅ 自动故障转移")
        print("  ✅ 连接中断保护")
        print("  ✅ 安全响应发送")
        print("=" * 50)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 服务器被用户中断")
    except Exception as e:
        print(f"❌ 服务器启动失败: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_fixed_server() 