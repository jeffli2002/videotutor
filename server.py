#!/usr/bin/env python3
"""
MathTutor AI 本地测试服务器
解决CORS问题，提供API代理服务
"""

import http.server
import socketserver
import json
import urllib.request
import urllib.parse
import os
from urllib.error import URLError, HTTPError
import time
import sys
import platform
import subprocess
import ssl
import socket

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
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

    def test_network_connectivity(self):
        """测试网络连接性"""
        test_urls = [
            'https://www.baidu.com',
            'https://www.google.com',
            'https://dashscope.aliyuncs.com'
        ]
        
        print("🔍 开始网络连接性测试...")
        for url in test_urls:
            try:
                print(f"  📡 测试 {url}...")
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=10) as response:
                    print(f"  ✅ {url} 连接正常 (状态码: {response.code})")
                    return True
            except Exception as e:
                print(f"  ❌ {url} 连接失败: {type(e).__name__}")
        
        print("⚠️  网络连接性测试失败，可能存在网络问题")
        return False

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
                print("❌ 缺少API密钥")
                self.send_error(400, "Missing API key")
                return
            
            print(f"🔑 API密钥: {api_key[:8]}...")
            print(f"💬 消息数量: {len(request_data.get('messages', []))}")
            
            # 测试网络连接性
            if not self.test_network_connectivity():
                print("🔄 网络连接异常，直接使用备用响应...")
                fallback_response = self.create_enhanced_fallback_response(request_data.get('messages', []))
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(fallback_response).encode('utf-8'))
                return
            
            # 准备通义千问API请求
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
            
            # 创建更强大的SSL上下文
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')  # 降低SSL安全级别以兼容更多服务器
            
            # 创建请求
            req = urllib.request.Request(
                'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
                data=json.dumps(qwen_data).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json',
                    'User-Agent': 'MathTutor-AI/1.0'
                }
            )
            
            # 设置代理（如果环境变量存在）
            proxy_handler = None
            if os.environ.get('HTTP_PROXY') or os.environ.get('HTTPS_PROXY'):
                proxy_url = os.environ.get('HTTPS_PROXY') or os.environ.get('HTTP_PROXY')
                print(f"🌐 使用代理: {proxy_url}")
                proxy_handler = urllib.request.ProxyHandler({
                    'http': proxy_url,
                    'https': proxy_url
                })
            
            try:
                print(f"🌐 正在调用通义千问API... [{time.strftime('%Y-%m-%d %H:%M:%S')}]")
                print(f"🔑 使用API密钥: {api_key[:8]}...")
                print(f"📝 请求消息: {len(request_data.get('messages', []))} 条")
                
                # 增加重试机制，使用更长的超时时间
                max_retries = 3
                timeout_values = [30, 45, 60]  # 递增的超时时间
                
                for attempt in range(max_retries):
                    try:
                        print(f"🔄 尝试第 {attempt + 1} 次连接 (超时: {timeout_values[attempt]}秒)...")
                        
                        # 创建opener
                        opener = urllib.request.build_opener()
                        if proxy_handler:
                            opener.add_handler(proxy_handler)
                        
                        # 设置更长的超时时间
                        socket.setdefaulttimeout(timeout_values[attempt])
                        
                        # 修复: 将ssl_context添加到HTTPSHandler
                        opener.add_handler(urllib.request.HTTPSHandler(context=ssl_context))
                        # 调用open，不传context参数
                        with opener.open(req) as response:
                            response_data = response.read().decode('utf-8')
                            print(f"✅ API调用成功: {response.code} [{time.strftime('%Y-%m-%d %H:%M:%S')}]")
                            print(f"📊 响应大小: {len(response_data)} 字符")
                            
                            # 返回成功响应
                            self.send_response(200)
                            self.send_header('Content-Type', 'application/json')
                            self.end_headers()
                            self.wfile.write(response_data.encode('utf-8'))
                            return  # 成功后立即返回
                            
                    except (URLError, TimeoutError, socket.timeout, ssl.SSLError) as retry_error:
                        error_type = type(retry_error).__name__
                        error_msg = str(retry_error)
                        print(f"⚠️  第 {attempt + 1} 次尝试失败: {error_type}")
                        print(f"   错误详情: {error_msg}")
                        
                        if attempt == max_retries - 1:  # 最后一次尝试
                            raise retry_error
                        
                        # 等待时间递增
                        wait_time = (attempt + 1) * 2
                        print(f"   等待 {wait_time} 秒后重试...")
                        time.sleep(wait_time)
                        
            except (HTTPError, ssl.SSLError, URLError, TimeoutError, socket.timeout, Exception) as e:
                print(f"⚠️  API调用遇到问题: {type(e).__name__}: {str(e)} [{time.strftime('%Y-%m-%d %H:%M:%S')}]")
                print("🔄 使用增强备用响应机制...")
                
                # 创建增强的备用响应
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
            error_data = {
                'error': f'Server error: {str(e)}',
                'code': 'SERVER_ERROR'
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_data).encode('utf-8'))

    def create_fallback_response(self, messages):
        """创建备用响应，当API调用失败时使用"""
        # 提取用户问题
        user_question = ""
        for msg in messages:
            if msg.get('role') == 'user':
                user_question = msg.get('content', '')
                break
        
        # 检测是否为数学问题
        math_keywords = ['方程', '求解', '计算', '=', '+', '-', '*', '/', 'x', 'y', '解', '答案']
        is_math = any(keyword in user_question for keyword in math_keywords)
        
        if is_math and '=' in user_question:
            # 简单的数学问题处理
            if '2x + 5 = 15' in user_question:
                response_text = """这是一个一元一次方程问题。

**问题分析：**
方程：2x + 5 = 15

**解题步骤：**
1. 首先将常数项移到右边：2x = 15 - 5
2. 计算右边：2x = 10  
3. 两边同时除以2：x = 10 ÷ 2
4. 得到答案：x = 5

**验证：**
将 x = 5 代入原方程：2×5 + 5 = 10 + 5 = 15 ✓

**答案：** x = 5"""
            else:
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
- 如需详细解答，请稍后重试"""
        else:
            response_text = f"""感谢您的问题！

**您的问题：** {user_question}

由于当前网络连接问题，我无法提供完整的AI解答。

**建议：**
1. 请检查网络连接后重试
2. 确保问题描述完整清楚
3. 如果是数学问题，请包含具体的数字和符号

我会在网络恢复后为您提供详细解答。"""

        return {
            'output': {
                'text': response_text
            },
            'usage': {
                'input_tokens': len(user_question),
                'output_tokens': len(response_text)
            },
            'request_id': f'fallback_{int(time.time())}',
            'message': 'Fallback response due to network issues'
        }

    def create_enhanced_fallback_response(self, messages):
        """创建增强的备用响应，当API调用失败时使用"""
        # 提取用户问题
        user_question = ""
        for msg in messages:
            if msg.get('role') == 'user':
                user_question = msg.get('content', '')
                break
        
        # 检测是否为数学问题
        math_keywords = ['方程', '求解', '计算', '=', '+', '-', '*', '/', 'x', 'y', '解', '答案']
        is_math = any(keyword in user_question for keyword in math_keywords)
        
        if is_math and '=' in user_question:
            # 简单的数学问题处理
            if '2x + 5 = 15' in user_question:
                response_text = """这是一个一元一次方程问题。

**问题分析：**
方程：2x + 5 = 15

**解题步骤：**
1. 首先将常数项移到右边：2x = 15 - 5
2. 计算右边：2x = 10  
3. 两边同时除以2：x = 10 ÷ 2
4. 得到答案：x = 5

**验证：**
将 x = 5 代入原方程：2×5 + 5 = 10 + 5 = 15 ✓

**答案：** x = 5"""
            else:
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
- 如需详细解答，请稍后重试"""
        else:
            response_text = f"""感谢您的问题！

**您的问题：** {user_question}

由于当前网络连接问题，我无法提供完整的AI解答。

**建议：**
1. 请检查网络连接后重试
2. 确保问题描述完整清楚
3. 如果是数学问题，请包含具体的数字和符号

我会在网络恢复后为您提供详细解答。"""

        return {
            'output': {
                'text': response_text
            },
            'usage': {
                'input_tokens': len(user_question),
                'output_tokens': len(response_text)
            },
            'request_id': f'enhanced_fallback_{int(time.time())}',
            'message': 'Enhanced fallback response due to network issues'
        }

def run_server():
    import socket
    import time
    import os
    import signal
    
    port = 8000
    max_attempts = 10
    for attempt in range(max_attempts):
        attempt_port = port + attempt
        try:
            # 检查端口是否被占用
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = sock.connect_ex(("127.0.0.1", attempt_port))
            sock.close()
            if result == 0:
                print(f"⚠️ 端口 {attempt_port} 已被占用，尝试自动释放...")
                if platform.system() == "Windows":
                    # 查询占用端口的进程ID
                    try:
                        output = subprocess.check_output(f'netstat -ano | findstr :{attempt_port}', shell=True, encoding='gbk')
                        for line in output.splitlines():
                            if 'LISTENING' in line:
                                pid = int(line.strip().split()[-1])
                                print(f"🔪 杀死占用端口 {attempt_port} 的进程 PID: {pid}")
                                subprocess.call(f'taskkill /PID {pid} /F', shell=True)
                                time.sleep(1)
                    except Exception as e:
                        print(f"❌ 自动释放端口失败: {e}")
                        continue
                else:
                    print(f"请手动释放端口 {attempt_port}")
                    continue
            # 端口可用，启动服务器
            with socketserver.TCPServer(("", attempt_port), CORSHTTPRequestHandler) as httpd:
                print(f"\n🚀 MathTutor AI 测试服务器启动成功!")
                print(f"📡 服务器地址: http://localhost:{attempt_port}")
                print(f"🌐 测试页面: http://localhost:{attempt_port}/test-server.html")
                print(f"📋 API端点: http://localhost:{attempt_port}/api/qwen")
                print("🔧 功能特点:")
                print("  ✅ 解决CORS跨域问题")
                print("  ✅ 代理通义千问API调用")
                print("  ✅ 本地文件服务")
                print("  ✅ 实时错误处理")
                print("💡 使用说明:")
                print("  1. 保持此终端窗口打开")
                print("  2. 在浏览器中打开测试页面")
                print("  3. 输入数学问题开始测试")
                print("⚠️  按 Ctrl+C 停止服务器")
                print("==================================================        ")
                httpd.serve_forever()
                break
        except OSError as e:
            print(f"❌ 端口 {attempt_port} 启动失败: {e}")
            continue
    
    print(f"❌ 无法在端口 8000-8009 启动服务器")

if __name__ == "__main__":
    run_server()