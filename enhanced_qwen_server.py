#!/usr/bin/env python3
"""
增强的QWEN API服务器 - 解决SSL和网络问题
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

# 尝试导入dashscope SDK
try:
    import dashscope
    from dashscope import Generation
    SDK_AVAILABLE = True
    print("✅ dashscope SDK 可用")
except ImportError:
    SDK_AVAILABLE = False
    print("⚠️ dashscope SDK 不可用，将使用HTTP连接")

class EnhancedQWENHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
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
            
            print(f"📥 收到API请求: {self.client_address}")
            
            # 获取API密钥
            api_key = request_data.get('api_key', '')
            if not api_key:
                api_key = os.environ.get('QWEN_API_KEY') or os.environ.get('VITE_QWEN_API_KEY')
            
            if not api_key:
                print("❌ 缺少API密钥")
                self.send_error(400, "Missing API key")
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
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(fallback_response).encode('utf-8'))
                
        except json.JSONDecodeError as e:
            print(f"❌ JSON解析错误: {str(e)}")
            self.send_error(400, "Invalid JSON")
        except Exception as e:
            print(f"❌ 服务器错误: {str(e)}")
            try:
                error_data = {
                    'error': f'Server error: {str(e)}',
                    'code': 'SERVER_ERROR'
                }
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(error_data).encode('utf-8'))
            except:
                # 如果发送错误响应也失败，忽略异常
                pass

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
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
                return True
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
                            
                            self.send_response(200)
                            self.send_header('Content-Type', 'application/json')
                            self.end_headers()
                            self.wfile.write(json.dumps(result).encode('utf-8'))
                            return True
                            
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
        
        # 检测问题类型
        question_lower = user_question.lower()
        
        # 检测是否为理论问题（如勾股定理、拉窗帘原理等）
        theory_keywords = ['勾股定理', '拉窗帘', '原理', '定理', '概念', '解释', '动画', '视频', '演示']
        is_theory = any(keyword in question_lower for keyword in theory_keywords)
        
        # 检测是否为具体数学问题
        math_keywords = ['方程', '求解', '计算', '=', '+', '-', '*', '/', 'x', 'y', '解', '答案', '求']
        is_math = any(keyword in question_lower for keyword in math_keywords)
        
        # 调试信息
        print(f"🔍 问题类型检测:")
        print(f"   问题: {user_question}")
        print(f"   小写: {question_lower}")
        print(f"   理论关键词匹配: {[k for k in theory_keywords if k in question_lower]}")
        print(f"   数学关键词匹配: {[k for k in math_keywords if k in question_lower]}")
        print(f"   是否为理论问题: {is_theory}")
        print(f"   是否为数学问题: {is_math}")
        
        if is_theory:
            print("✅ 识别为理论问题，生成概念分析响应")
            # 理论问题响应
            response_text = f"""我来帮你解释这个数学概念：

**问题：** {user_question}

**概念分析：**
这是一个数学理论概念的解释问题，需要从以下几个方面来理解：

1. **基本定义** - 理解概念的核心含义
2. **几何意义** - 从图形角度理解
3. **应用场景** - 实际应用和例子
4. **证明过程** - 数学证明和推导

**详细解释：**
由于当前网络连接问题，我无法提供完整的AI解答。

**建议：**
- 请检查网络连接后重试
- 确保问题描述完整清楚
- 如需详细解答，请稍后重试

**注意：** 当前使用备用响应模式，网络恢复后将提供完整AI解答。"""
        
        elif is_math and '=' in question_lower:
            print("✅ 识别为数学问题，生成解题提示响应")
            # 方程求解问题响应
            response_text = f"""我来帮你分析这个数学问题：

**问题：** {user_question}

**解题提示：**
1. 首先识别问题类型（方程、计算等）
2. 整理已知条件和未知数
3. 选择合适的解题方法
4. 逐步求解
5. 验证答案

由于当前网络连接问题，建议：
- 检查问题是否完整
- 确认所有条件都已给出
- 如需详细解答，请稍后重试

**注意：** 当前使用备用响应模式，网络恢复后将提供完整AI解答。"""
        
        else:
            print("✅ 识别为通用问题，生成通用响应")
            # 通用问题响应
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

def run_enhanced_server():
    port = 8002
    server = HTTPServer(('localhost', port), EnhancedQWENHandler)
    print(f"🚀 增强QWEN API服务器启动在端口 {port}")
    print(f"📡 服务器地址: http://localhost:{port}")
    print(f"📋 API端点: http://localhost:{port}/api/qwen")
    print("🔧 功能特点:")
    print("  ✅ 支持SDK连接")
    print("  ✅ 支持HTTP连接")
    print("  ✅ 增强备用响应")
    print("  ✅ 自动故障转移")
    server.serve_forever()

if __name__ == "__main__":
    run_enhanced_server()
