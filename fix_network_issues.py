#!/usr/bin/env python3
"""
综合网络问题修复脚本
解决SSL连接错误和Supabase查询问题
"""

import os
import sys
import json
import ssl
import socket
import urllib.request
import urllib.parse
from urllib.error import URLError, HTTPError
import time
import subprocess
import platform

def print_header(title):
    """打印标题"""
    print(f"\n{'='*60}")
    print(f"🔧 {title}")
    print(f"{'='*60}")

def test_ssl_connection():
    """测试SSL连接"""
    print_header("SSL连接测试")
    
    test_urls = [
        ('QWEN API', 'https://dashscope.aliyuncs.com'),
        ('阿里云', 'https://www.aliyun.com'),
        ('百度', 'https://www.baidu.com')
    ]
    
    results = {}
    
    for name, url in test_urls:
        try:
            print(f"📡 测试 {name} ({url})...")
            
            # 创建SSL上下文
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')
            
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=15, context=ssl_context) as response:
                print(f"  ✅ {name} SSL连接成功 (状态码: {response.code})")
                results[name] = True
                
        except Exception as e:
            print(f"  ❌ {name} SSL连接失败: {type(e).__name__} - {str(e)}")
            results[name] = False
    
    return results

def test_qwen_api_with_sdk():
    """使用SDK测试QWEN API"""
    print_header("QWEN API SDK测试")
    
    try:
        # 尝试导入dashscope SDK
        import dashscope
        from dashscope import Generation
        print("✅ dashscope SDK 已安装")
        
        # 获取API密钥
        api_key = os.environ.get('QWEN_API_KEY') or os.environ.get('VITE_QWEN_API_KEY')
        if not api_key:
            print("❌ 未找到QWEN API密钥")
            print("请设置环境变量: QWEN_API_KEY 或 VITE_QWEN_API_KEY")
            return False
        
        print(f"🔑 使用API密钥: {api_key[:8]}...")
        
        # 设置API密钥
        dashscope.api_key = api_key
        
        # 测试API调用
        print("📡 发送测试请求...")
        response = Generation.call(
            model='qwen-plus',
            messages=[{'role': 'user', 'content': '你好，请简单回复'}],
            result_format='message',
            max_tokens=50,
            temperature=0.1
        )
        
        if response.status_code == 200:
            print("✅ QWEN API SDK调用成功")
            print(f"💬 响应: {response.output.choices[0].message.content}")
            return True
        else:
            print(f"❌ QWEN API SDK调用失败: {response.message}")
            return False
            
    except ImportError:
        print("❌ dashscope SDK 未安装")
        print("请运行: pip install dashscope")
        return False
    except Exception as e:
        print(f"❌ QWEN API SDK测试失败: {type(e).__name__} - {str(e)}")
        return False

def create_enhanced_server():
    """创建增强的服务器"""
    print_header("创建增强服务器")
    
    server_content = '''#!/usr/bin/env python3
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
            error_data = {
                'error': f'Server error: {str(e)}',
                'code': 'SERVER_ERROR'
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_data).encode('utf-8'))

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
'''
    
    # 写入服务器文件
    with open('enhanced_qwen_server.py', 'w', encoding='utf-8') as f:
        f.write(server_content)
    
    print("✅ 增强服务器文件已创建: enhanced_qwen_server.py")
    return True

def create_supabase_fix():
    """创建Supabase连接修复"""
    print_header("Supabase连接修复")
    
    # 检查环境变量
    env_vars = {
        'VITE_SUPABASE_URL': os.environ.get('VITE_SUPABASE_URL'),
        'VITE_SUPABASE_ANON_KEY': os.environ.get('VITE_SUPABASE_ANON_KEY')
    }
    
    print("🔍 检查Supabase环境变量:")
    for key, value in env_vars.items():
        if value:
            print(f"  ✅ {key}: {value[:20]}...")
        else:
            print(f"  ❌ {key}: 未设置")
    
    # 创建Supabase连接测试脚本
    test_script = '''// Supabase连接测试脚本
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase环境变量未设置')
  console.log('请检查.env文件中的以下变量:')
  console.log('- VITE_SUPABASE_URL')
  console.log('- VITE_SUPABASE_ANON_KEY')
} else {
  console.log('✅ Supabase环境变量已设置')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // 测试连接
  supabase.from('profiles').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase连接失败:', error)
      } else {
        console.log('✅ Supabase连接成功')
      }
    })
    .catch(err => {
      console.error('❌ Supabase连接异常:', err)
    })
}
'''
    
    with open('supabase_test.js', 'w', encoding='utf-8') as f:
        f.write(test_script)
    
    print("✅ Supabase测试脚本已创建: supabase_test.js")
    return True

def provide_solutions(ssl_results, sdk_success):
    """提供解决方案"""
    print_header("问题诊断与解决方案")
    
    print("🔍 问题分析:")
    
    if not any(ssl_results.values()):
        print("❌ 所有网站SSL连接都失败")
        print("🔧 解决方案:")
        print("  1. 检查网络连接是否正常")
        print("  2. 检查防火墙设置")
        print("  3. 尝试重启网络设备")
        print("  4. 联系网络管理员")
        return
    
    if not ssl_results.get('QWEN API', False):
        print("❌ QWEN API SSL连接失败")
        print("🔧 解决方案:")
        print("  1. 检查是否在中国大陆网络环境")
        print("  2. 尝试使用VPN或代理")
        print("  3. 检查DNS设置")
        print("  4. 尝试使用其他DNS服务器（如8.8.8.8）")
    
    if not sdk_success:
        print("❌ QWEN API SDK调用失败")
        print("🔧 解决方案:")
        print("  1. 检查API密钥是否正确")
        print("  2. 确认API密钥有足够权限")
        print("  3. 检查API配额是否用完")
        print("  4. 尝试在阿里云控制台测试API")
    
    print("\n🚀 推荐操作:")
    print("1. 启动增强服务器: python enhanced_qwen_server.py")
    print("2. 更新前端配置使用端口8002")
    print("3. 检查Supabase环境变量设置")
    print("4. 运行Supabase连接测试")

def main():
    """主函数"""
    print_header("综合网络问题修复工具")
    
    # 1. 测试SSL连接
    ssl_results = test_ssl_connection()
    
    # 2. 测试QWEN API SDK
    sdk_success = test_qwen_api_with_sdk()
    
    # 3. 创建增强服务器
    create_enhanced_server()
    
    # 4. 创建Supabase修复
    create_supabase_fix()
    
    # 5. 提供解决方案
    provide_solutions(ssl_results, sdk_success)
    
    print_header("修复完成")
    print("✅ 增强服务器已创建: enhanced_qwen_server.py")
    print("✅ Supabase测试脚本已创建: supabase_test.js")
    print("\n🎯 下一步操作:")
    print("1. 启动增强服务器: python enhanced_qwen_server.py")
    print("2. 更新前端API端点为: http://localhost:8002/api/qwen")
    print("3. 检查.env文件中的Supabase配置")
    print("4. 重新测试应用")

if __name__ == "__main__":
    main() 