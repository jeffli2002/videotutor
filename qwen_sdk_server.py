#!/usr/bin/env python3
"""
使用阿里云 SDK 的 QWEN API 服务器
"""

import dashscope
from dashscope import Generation
import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

class QWENSDKHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        """发送CORS头"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '86400')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/qwen':
            self.handle_qwen_api()
        else:
            self.send_error(404, "Not Found")

    def handle_qwen_api(self):
        try:
            # 读取请求体
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            # 兼容prompt字段格式
            if 'prompt' in request_data and 'messages' not in request_data:
                request_data['messages'] = [{
                    'role': 'user',
                    'content': request_data['prompt']
                }]
            
            print(f"📥 收到API请求: {request_data.get('messages', [])[-1]['content'][:50]}...")
            
            # 获取 API 密钥
            api_key = request_data.get('api_key', '')
            if not api_key:
                api_key = os.environ.get('QWEN_API_KEY')
            
            if not api_key:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                error_result = {'error': 'Missing API key', 'code': 'MISSING_API_KEY'}
                self.wfile.write(json.dumps(error_result).encode('utf-8'))
                return
            
            # 设置 API 密钥
            dashscope.api_key = api_key
            
            # 准备消息
            messages = request_data.get('messages', [])
            
            print(f"🤖 调用QWEN API，模型: qwen-plus")
            
            # 调用 QWEN API
            response = Generation.call(
                model='qwen-plus',
                messages=messages,
                result_format='message',
                max_tokens=request_data.get('max_tokens', 1000),
                temperature=request_data.get('temperature', 0.1),
                top_p=request_data.get('top_p', 0.8)
            )
            
            print(f"✅ QWEN API调用成功，状态码: {response.status_code}")
            
            if response.status_code == 200:
                # 返回成功响应
                result = {
                    'output': {
                        'text': response.output.choices[0].message.content
                    },
                    'usage': {
                        'input_tokens': response.usage.input_tokens,
                        'output_tokens': response.usage.output_tokens
                    },
                    'request_id': response.request_id
                }
                
                # 确保响应完整发送
                response_data = json.dumps(result).encode('utf-8')
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(response_data)))
                self.send_cors_headers()
                self.end_headers()
                
                # 分块发送响应数据，避免连接中断
                chunk_size = 512  # 减小块大小
                try:
                    for i in range(0, len(response_data), chunk_size):
                        chunk = response_data[i:i + chunk_size]
                        try:
                            self.wfile.write(chunk)
                            self.wfile.flush()
                            # 添加小延迟，避免发送过快
                            import time
                            time.sleep(0.001)
                        except (ConnectionAbortedError, BrokenPipeError) as conn_err:
                            print(f"❌ 连接中断: {conn_err}")
                            break
                        except Exception as write_err:
                            print(f"❌ 发送响应数据失败: {write_err}")
                            break
                    print(f"📤 响应发送完成，数据长度: {len(response_data)}")
                except Exception as send_err:
                    print(f"❌ 整体发送响应失败: {send_err}")
                
            else:
                # 返回错误响应
                error_result = {
                    'error': response.message,
                    'code': response.status_code
                }
                
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(error_result).encode('utf-8'))
                
        except Exception as e:
            print(f"❌ 处理API请求时出错: {str(e)}")
            error_result = {
                'error': str(e),
                'code': 'SERVER_ERROR'
            }
            
            try:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                try:
                    self.wfile.write(json.dumps(error_result).encode('utf-8'))
                except (ConnectionAbortedError, BrokenPipeError) as conn_err:
                    print(f"❌ 发送错误响应时连接中断: {conn_err}")
                except Exception as send_error:
                    print(f"❌ 发送错误响应失败: {str(send_error)}")
            except (ConnectionAbortedError, BrokenPipeError) as conn_err:
                print(f"❌ 发送错误响应头时连接中断: {conn_err}")
            except Exception as send_error:
                print(f"❌ 发送错误响应头失败: {str(send_error)}")

def run_sdk_server():
    port = 8002
    server = HTTPServer(('localhost', port), QWENSDKHandler)
    print(f"🚀 QWEN SDK 服务器启动在端口 {port}")
    print(f"📡 服务器地址: http://localhost:{port}")
    print(f"📋 API 端点: http://localhost:{port}/api/qwen")
    server.serve_forever()

if __name__ == "__main__":
    run_sdk_server()
