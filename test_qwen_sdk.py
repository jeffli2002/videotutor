#!/usr/bin/env python3
"""
使用阿里云官方 SDK 测试 QWEN API
"""

import os
import sys

def install_dashscope():
    """安装 dashscope SDK"""
    try:
        import dashscope
        print("✅ dashscope SDK 已安装")
        return True
    except ImportError:
        print("📦 正在安装 dashscope SDK...")
        try:
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "dashscope"])
            print("✅ dashscope SDK 安装成功")
            return True
        except Exception as e:
            print(f"❌ dashscope SDK 安装失败: {e}")
            return False

def test_qwen_sdk():
    """使用 SDK 测试 QWEN API"""
    try:
        import dashscope
        from dashscope import Generation
        
        # 获取 API 密钥
        api_key = os.environ.get('QWEN_API_KEY') or os.environ.get('REACT_APP_QWEN_API_KEY')
        if not api_key:
            print("❌ 未找到 API 密钥")
            print("请设置环境变量: QWEN_API_KEY 或 REACT_APP_QWEN_API_KEY")
            return False
        
        # 设置 API 密钥
        dashscope.api_key = api_key
        print(f"🔑 使用 API 密钥: {api_key[:8]}...")
        
        # 测试调用
        print("📡 发送测试请求...")
        response = Generation.call(
            model='qwen-plus',
            messages=[{'role': 'user', 'content': '你好，请简单回复'}],
            result_format='message'
        )
        
        print(f"✅ API 调用成功")
        print(f"📊 响应状态: {response.status_code}")
        
        if response.status_code == 200:
            print(f"💬 响应内容: {response.output.choices[0].message.content}")
            return True
        else:
            print(f"❌ API 调用失败: {response.message}")
            return False
            
    except Exception as e:
        print(f"❌ SDK 调用失败: {type(e).__name__} - {str(e)}")
        return False

def test_qwen_sdk_alternative():
    """使用 SDK 的替代方法测试"""
    try:
        import dashscope
        from dashscope import Generation
        
        # 获取 API 密钥
        api_key = os.environ.get('QWEN_API_KEY') or os.environ.get('REACT_APP_QWEN_API_KEY')
        if not api_key:
            print("❌ 未找到 API 密钥")
            return False
        
        # 设置 API 密钥
        dashscope.api_key = api_key
        
        # 使用不同的模型和参数
        models = ['qwen-plus', 'qwen-turbo', 'qwen-max']
        
        for model in models:
            try:
                print(f"🔍 测试模型: {model}")
                response = Generation.call(
                    model=model,
                    messages=[{'role': 'user', 'content': '你好'}],
                    result_format='message',
                    max_tokens=50
                )
                
                if response.status_code == 200:
                    print(f"✅ {model} 模型可用")
                    print(f"💬 响应: {response.output.choices[0].message.content}")
                    return True
                else:
                    print(f"❌ {model} 模型不可用: {response.message}")
                    
            except Exception as e:
                print(f"❌ {model} 模型测试失败: {e}")
        
        return False
        
    except Exception as e:
        print(f"❌ 替代方法测试失败: {e}")
        return False

def create_sdk_server():
    """创建使用 SDK 的服务器配置"""
    print("\n🔧 创建 SDK 服务器配置...")
    
    sdk_server_content = '''#!/usr/bin/env python3
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
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
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
            
            # 获取 API 密钥
            api_key = request_data.get('api_key', '')
            if not api_key:
                api_key = os.environ.get('QWEN_API_KEY')
            
            if not api_key:
                self.send_error(400, "Missing API key")
                return
            
            # 设置 API 密钥
            dashscope.api_key = api_key
            
            # 准备消息
            messages = request_data.get('messages', [])
            
            # 调用 QWEN API
            response = Generation.call(
                model='qwen-plus',
                messages=messages,
                result_format='message',
                max_tokens=request_data.get('max_tokens', 1000),
                temperature=request_data.get('temperature', 0.1),
                top_p=request_data.get('top_p', 0.8)
            )
            
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
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
            else:
                # 返回错误响应
                error_result = {
                    'error': response.message,
                    'code': response.status_code
                }
                
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(error_result).encode('utf-8'))
                
        except Exception as e:
            error_result = {
                'error': str(e),
                'code': 'SERVER_ERROR'
            }
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_result).encode('utf-8'))

def run_sdk_server():
    port = 8001
    server = HTTPServer(('localhost', port), QWENSDKHandler)
    print(f"🚀 QWEN SDK 服务器启动在端口 {port}")
    print(f"📡 服务器地址: http://localhost:{port}")
    print(f"📋 API 端点: http://localhost:{port}/api/qwen")
    server.serve_forever()

if __name__ == "__main__":
    run_sdk_server()
'''
    
    try:
        with open('qwen_sdk_server.py', 'w', encoding='utf-8') as f:
            f.write(sdk_server_content)
        print("  ✅ SDK 服务器配置已创建: qwen_sdk_server.py")
        print("  💡 运行命令: python qwen_sdk_server.py")
    except Exception as e:
        print(f"  ❌ 创建 SDK 服务器配置失败: {e}")

def main():
    """主函数"""
    print("🚀 QWEN API SDK 测试工具")
    print("=" * 50)
    
    # 安装 SDK
    if not install_dashscope():
        print("❌ 无法安装 dashscope SDK")
        return
    
    # 测试 SDK
    print("\n🔍 测试 QWEN API SDK...")
    success = test_qwen_sdk()
    
    if not success:
        print("\n🔍 尝试替代方法...")
        success = test_qwen_sdk_alternative()
    
    # 创建 SDK 服务器配置
    create_sdk_server()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ QWEN API SDK 测试成功！")
        print("\n💡 建议:")
        print("1. 使用 SDK 替代直接的 HTTP 请求")
        print("2. 运行 SDK 服务器: python qwen_sdk_server.py")
        print("3. 更新前端配置使用新的 API 端点")
    else:
        print("❌ QWEN API SDK 测试失败")
        print("\n💡 建议:")
        print("1. 检查 API 密钥是否正确")
        print("2. 确认网络连接正常")
        print("3. 尝试使用备用响应机制")

if __name__ == "__main__":
    main() 