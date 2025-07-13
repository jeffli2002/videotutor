#!/usr/bin/env python3
"""
综合 QWEN API 连接问题修复工具
"""

import os
import sys
import subprocess
import platform
import time
import json
import urllib.request
import ssl
import socket
from urllib.error import URLError, HTTPError

def print_header():
    """打印标题"""
    print("🚀 综合 QWEN API 连接问题修复工具")
    print("=" * 60)
    print("🔍 自动检测并修复 QWEN API 连接问题")
    print("=" * 60)

def check_environment():
    """检查环境"""
    print("🔍 检查环境...")
    
    # 检查 Python 版本
    python_version = sys.version_info
    print(f"  🐍 Python 版本: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # 检查操作系统
    system = platform.system()
    print(f"  🖥️  操作系统: {system}")
    
    # 检查网络连接
    print("  🌐 检查网络连接...")
    try:
        urllib.request.urlopen('https://www.baidu.com', timeout=5)
        print("  ✅ 网络连接正常")
    except Exception as e:
        print(f"  ❌ 网络连接异常: {e}")
        return False
    
    return True

def check_api_key():
    """检查 API 密钥"""
    print("\n🔑 检查 API 密钥...")
    
    api_key = os.environ.get('QWEN_API_KEY') or os.environ.get('REACT_APP_QWEN_API_KEY')
    if api_key:
        print(f"  ✅ 找到 API 密钥: {api_key[:8]}...")
        return api_key
    else:
        print("  ❌ 未找到 API 密钥")
        print("  💡 请设置环境变量:")
        print("    Windows: set QWEN_API_KEY=sk-your-api-key")
        print("    Linux/Mac: export QWEN_API_KEY=sk-your-api-key")
        return None

def install_dashscope():
    """安装 dashscope SDK"""
    print("\n📦 检查 dashscope SDK...")
    
    try:
        import dashscope
        print("  ✅ dashscope SDK 已安装")
        return True
    except ImportError:
        print("  📦 正在安装 dashscope SDK...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "dashscope"])
            print("  ✅ dashscope SDK 安装成功")
            return True
        except Exception as e:
            print(f"  ❌ dashscope SDK 安装失败: {e}")
            return False

def test_sdk_connection(api_key):
    """测试 SDK 连接"""
    print("\n🔍 测试 SDK 连接...")
    
    try:
        import dashscope
        from dashscope import Generation
        
        # 设置 API 密钥
        dashscope.api_key = api_key
        
        # 测试调用
        print("  📡 发送测试请求...")
        response = Generation.call(
            model='qwen-plus',
            messages=[{'role': 'user', 'content': '你好，请简单回复'}],
            result_format='message',
            max_tokens=50
        )
        
        if response.status_code == 200:
            print("  ✅ SDK 连接成功")
            print(f"  💬 响应: {response.output.choices[0].message.content}")
            return True
        else:
            print(f"  ❌ SDK 连接失败: {response.message}")
            return False
            
    except Exception as e:
        print(f"  ❌ SDK 测试失败: {type(e).__name__} - {str(e)}")
        return False

def test_http_connection(api_key):
    """测试 HTTP 连接"""
    print("\n🔍 测试 HTTP 连接...")
    
    # 测试不同的端点
    endpoints = [
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        'https://api.dashscope.com/v1/services/aigc/text-generation/generation',
        'https://dashscope.cn/api/v1/services/aigc/text-generation/generation'
    ]
    
    test_data = {
        'model': 'qwen-plus',
        'input': {
            'messages': [{'role': 'user', 'content': '你好'}]
        },
        'parameters': {
            'temperature': 0.1,
            'max_tokens': 50,
            'top_p': 0.8
        }
    }
    
    # 创建 SSL 上下文
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')
    
    for endpoint in endpoints:
        try:
            print(f"  📡 测试端点: {endpoint}")
            
            req = urllib.request.Request(
                endpoint,
                data=json.dumps(test_data).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json',
                    'User-Agent': 'MathTutor-AI/1.0'
                }
            )
            
            with urllib.request.urlopen(req, timeout=30, context=ssl_context) as response:
                response_data = response.read().decode('utf-8')
                print(f"  ✅ HTTP 连接成功 (状态码: {response.code})")
                
                try:
                    response_json = json.loads(response_data)
                    if 'output' in response_json:
                        print(f"  💬 响应: {response_json['output'].get('text', '')[:50]}...")
                    return True
                except json.JSONDecodeError:
                    print(f"  ⚠️  响应不是有效 JSON")
                    
        except HTTPError as e:
            print(f"  ❌ HTTP 错误: {e.code} - {e.reason}")
        except URLError as e:
            print(f"  ❌ URL 错误: {type(e).__name__}")
        except Exception as e:
            print(f"  ❌ 未知错误: {type(e).__name__}")
    
    return False

def create_enhanced_server():
    """创建增强的服务器"""
    print("\n🔧 创建增强的服务器...")
    
    enhanced_server_content = '''#!/usr/bin/env python3
"""
增强的 QWEN API 服务器 - 支持多种连接方式
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

# 尝试导入 dashscope SDK
try:
    import dashscope
    from dashscope import Generation
    SDK_AVAILABLE = True
except ImportError:
    SDK_AVAILABLE = False

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
                api_key = os.environ.get('QWEN_API_KEY')
            
            if not api_key:
                print("❌ 缺少API密钥")
                self.send_error(400, "Missing API key")
                return
            
            print(f"🔑 API密钥: {api_key[:8]}...")
            print(f"💬 消息数量: {len(request_data.get('messages', []))}")
            
            # 尝试多种连接方式
            success = False
            
            # 方式1: 使用 SDK
            if SDK_AVAILABLE and not success:
                success = self.try_sdk_connection(api_key, request_data)
            
            # 方式2: 使用 HTTP 连接
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
            error_data = {
                'error': f'Server error: {str(e)}',
                'code': 'SERVER_ERROR'
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_data).encode('utf-8'))

    def try_sdk_connection(self, api_key, request_data):
        """尝试使用 SDK 连接"""
        try:
            print("🔍 尝试 SDK 连接...")
            
            # 设置 API 密钥
            dashscope.api_key = api_key
            
            # 调用 API
            response = Generation.call(
                model='qwen-plus',
                messages=request_data.get('messages', []),
                result_format='message',
                max_tokens=request_data.get('max_tokens', 1000),
                temperature=request_data.get('temperature', 0.1),
                top_p=request_data.get('top_p', 0.8)
            )
            
            if response.status_code == 200:
                print("✅ SDK 连接成功")
                
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
                print(f"❌ SDK 连接失败: {response.message}")
                return False
                
        except Exception as e:
            print(f"❌ SDK 连接异常: {type(e).__name__} - {str(e)}")
            return False

    def try_http_connection(self, api_key, request_data):
        """尝试使用 HTTP 连接"""
        try:
            print("🔍 尝试 HTTP 连接...")
            
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
            
            # 创建 SSL 上下文
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
                        print(f"✅ HTTP 连接成功 (状态码: {response.code})")
                        
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
            print(f"❌ HTTP 连接异常: {type(e).__name__} - {str(e)}")
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
        math_keywords = ['方程', '求解', '计算', '=', '+', '-', '*', '/', 'x', 'y', '解', '答案']
        is_math = any(keyword in user_question for keyword in math_keywords)
        
        if is_math and '=' in user_question:
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
    print(f"🚀 增强 QWEN API 服务器启动在端口 {port}")
    print(f"📡 服务器地址: http://localhost:{port}")
    print(f"📋 API 端点: http://localhost:{port}/api/qwen")
    print("🔧 功能特点:")
    print("  ✅ 支持 SDK 连接")
    print("  ✅ 支持 HTTP 连接")
    print("  ✅ 增强备用响应")
    print("  ✅ 自动故障转移")
    server.serve_forever()

if __name__ == "__main__":
    run_enhanced_server()
'''
    
    try:
        with open('enhanced_qwen_server.py', 'w', encoding='utf-8') as f:
            f.write(enhanced_server_content)
        print("  ✅ 增强服务器已创建: enhanced_qwen_server.py")
        print("  💡 运行命令: python enhanced_qwen_server.py")
        return True
    except Exception as e:
        print(f"  ❌ 创建增强服务器失败: {e}")
        return False

def create_startup_script():
    """创建启动脚本"""
    print("\n🔧 创建启动脚本...")
    
    if platform.system() == "Windows":
        script_content = '''@echo off
echo 🚀 启动 AI 数学视频讲解平台
echo ================================

REM 设置环境变量
if not defined QWEN_API_KEY (
    echo ⚠️  请设置 QWEN_API_KEY 环境变量
    echo set QWEN_API_KEY=sk-your-api-key-here
    pause
    exit /b 1
)

echo 🔍 检查环境...
python -c "import dashscope" 2>nul || (
    echo 📦 安装 dashscope SDK...
    pip install dashscope
)

echo 🚀 启动增强服务器...
start "QWEN API Server" python enhanced_qwen_server.py

echo 🚀 启动主服务器...
start "Main Server" python server.py

echo 🚀 启动 Manim 服务...
start "Manim Server" python manim_api_server.py

echo 🚀 启动前端...
start "Frontend" npm run dev

echo ✅ 所有服务已启动！
echo 📡 前端地址: http://localhost:5173
echo 📡 主服务器: http://localhost:8000
echo 📡 增强服务器: http://localhost:8002
echo 📡 Manim 服务: http://localhost:5001

pause
'''
        script_file = 'start_all.bat'
    else:
        script_content = '''#!/bin/bash
echo "🚀 启动 AI 数学视频讲解平台"
echo "================================"

# 设置环境变量
if [ -z "$QWEN_API_KEY" ]; then
    echo "⚠️  请设置 QWEN_API_KEY 环境变量"
    echo "export QWEN_API_KEY=sk-your-api-key-here"
    exit 1
fi

echo "🔍 检查环境..."
python3 -c "import dashscope" 2>/dev/null || {
    echo "📦 安装 dashscope SDK..."
    pip3 install dashscope
}

echo "🚀 启动增强服务器..."
python3 enhanced_qwen_server.py &
QWEN_PID=$!

echo "🚀 启动主服务器..."
python3 server.py &
MAIN_PID=$!

echo "🚀 启动 Manim 服务..."
python3 manim_api_server.py &
MANIM_PID=$!

echo "🚀 启动前端..."
npm run dev &
FRONTEND_PID=$!

echo "✅ 所有服务已启动！"
echo "📡 前端地址: http://localhost:5173"
echo "📡 主服务器: http://localhost:8000"
echo "📡 增强服务器: http://localhost:8002"
echo "📡 Manim 服务: http://localhost:5001"

# 等待用户中断
trap "echo '🛑 停止所有服务...'; kill $QWEN_PID $MAIN_PID $MANIM_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
'''
        script_file = 'start_all.sh'
    
    try:
        with open(script_file, 'w', encoding='utf-8') as f:
            f.write(script_content)
        
        if platform.system() != "Windows":
            os.chmod(script_file, 0o755)
        
        print(f"  ✅ 启动脚本已创建: {script_file}")
        print(f"  💡 运行命令: {script_file}")
        return True
    except Exception as e:
        print(f"  ❌ 创建启动脚本失败: {e}")
        return False

def main():
    """主函数"""
    print_header()
    
    # 检查环境
    if not check_environment():
        print("❌ 环境检查失败")
        return
    
    # 检查 API 密钥
    api_key = check_api_key()
    if not api_key:
        print("❌ 未找到 API 密钥，无法继续")
        return
    
    # 安装 SDK
    if not install_dashscope():
        print("❌ SDK 安装失败")
        return
    
    # 测试连接
    print("\n🔍 开始连接测试...")
    
    # 测试 SDK 连接
    sdk_success = test_sdk_connection(api_key)
    
    # 测试 HTTP 连接
    http_success = test_http_connection(api_key)
    
    # 创建增强服务器
    create_enhanced_server()
    
    # 创建启动脚本
    create_startup_script()
    
    # 总结
    print("\n" + "=" * 60)
    print("📊 测试结果总结:")
    print(f"  SDK 连接: {'✅ 成功' if sdk_success else '❌ 失败'}")
    print(f"  HTTP 连接: {'✅ 成功' if http_success else '❌ 失败'}")
    
    if sdk_success or http_success:
        print("\n✅ QWEN API 连接问题已修复！")
        print("\n💡 建议:")
        print("1. 使用增强服务器: python enhanced_qwen_server.py")
        print("2. 使用启动脚本: start_all.bat (Windows) 或 start_all.sh (Linux/Mac)")
        print("3. 前端会自动使用可用的连接方式")
    else:
        print("\n❌ QWEN API 连接仍有问题")
        print("\n💡 建议:")
        print("1. 检查网络连接和防火墙设置")
        print("2. 尝试使用 VPN 或代理")
        print("3. 联系阿里云技术支持")
        print("4. 继续使用备用响应机制进行开发")
    
    print("\n🔧 可用的解决方案:")
    print("1. 增强服务器 (推荐): python enhanced_qwen_server.py")
    print("2. 原始服务器: python server.py")
    print("3. SDK 服务器: python qwen_sdk_server.py")
    print("4. 一键启动: start_all.bat/start_all.sh")

if __name__ == "__main__":
    main() 