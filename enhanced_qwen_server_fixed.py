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
            api_error = None
            
            # 方式1: 使用SDK
            if SDK_AVAILABLE and not success:
                success, api_error, result = self.try_sdk_connection(api_key, request_data)
                if success and result:
                    self.safe_send_response(result)
                    return
            
            # 方式2: 使用HTTP连接
            if not success:
                success, api_error, result = self.try_http_connection(api_key, request_data)
                if success and result:
                    self.safe_send_response(result)
                    return
            
            # 方式3: 只有在真正的网络或服务问题时才使用备用响应
            if not success:
                # 检查是否是API密钥问题（优先级最高）
                if api_error and ('Invalid API-key' in str(api_error) or 'unauthorized' in str(api_error).lower() or '401' in str(api_error)):
                    print("❌ API密钥无效，返回错误")
                    self.safe_send_response({'error': 'Invalid API key', 'code': 'INVALID_API_KEY'}, 401)
                    return
                
                # 检查是否是网络连接问题
                if api_error and ('timeout' in str(api_error).lower() or 'connection' in str(api_error).lower() or 'ssl' in str(api_error).lower() or 'tls' in str(api_error).lower()):
                    print("🔄 网络连接问题，使用增强备用响应机制...")
                    fallback_response = self.create_enhanced_fallback_response(request_data.get('messages', []))
                    print(f"✅ 生成增强备用响应: {len(fallback_response['output']['text'])} 字符")
                    
                    if not self.safe_send_response(fallback_response):
                        print("❌ 发送备用响应失败")
                else:
                    # 其他API错误
                    print(f"❌ API调用失败: {api_error}")
                    self.safe_send_response({'error': f'API call failed: {api_error}', 'code': 'API_ERROR'}, 500)
                
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
                
                return True, None, result
            else:
                error_msg = response.message
                print(f"❌ SDK连接失败: {error_msg}")
                return False, error_msg, None
                
        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            print(f"❌ SDK连接异常: {error_msg}")
            return False, error_msg, None

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
            
            last_error = None
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
                    
                    with urllib.request.urlopen(req, timeout=15, context=ssl_context) as response:
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
                            
                            return True, None, result
                        else:
                            # 检查错误响应
                            error_msg = response_json.get('message', 'Unknown HTTP error')
                            last_error = error_msg
                            print(f"  ❌ HTTP响应错误: {error_msg}")
                            
                except urllib.error.HTTPError as e:
                    error_msg = f"HTTP {e.code}: {e.reason}"
                    last_error = error_msg
                    print(f"  ❌ 端点 {endpoint} HTTP错误: {error_msg}")
                    continue
                except urllib.error.URLError as e:
                    error_msg = f"URL Error: {e.reason}"
                    last_error = error_msg
                    print(f"  ❌ 端点 {endpoint} URL错误: {error_msg}")
                    continue
                except Exception as e:
                    error_msg = f"{type(e).__name__}: {str(e)}"
                    last_error = error_msg
                    print(f"  ❌ 端点 {endpoint} 失败: {error_msg}")
                    continue
            
            return False, last_error, None
            
        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            print(f"❌ HTTP连接异常: {error_msg}")
            return False, error_msg, None

    def create_enhanced_fallback_response(self, messages):
        """创建增强的备用响应"""
        # 提取用户问题
        user_question = ""
        for msg in messages:
            if msg.get('role') == 'user':
                user_question = msg.get('content', '')
                break
        
        # 检测问题类型
        problem_type = self.detect_problem_type(user_question)
        complexity = self.detect_problem_complexity(user_question)
        
        # 根据问题类型生成相应的fallback响应
        if problem_type == 'geometry' and ('三角形' in user_question or '面积' in user_question):
            response_text = self.create_geometry_fallback(user_question)
        elif problem_type == 'equation':
            response_text = self.create_equation_fallback(user_question)
        elif problem_type == 'calculus':
            response_text = self.create_calculus_fallback(user_question)
        elif problem_type == 'algebra':
            response_text = self.create_algebra_fallback(user_question)
        elif '视频' in user_question or '讲解' in user_question:
            response_text = self.create_video_request_fallback(user_question, problem_type)
        else:
            response_text = self.create_general_fallback(user_question, problem_type)

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
            'message': f'Enhanced fallback response for {problem_type} problem'
        }

    def detect_problem_type(self, question):
        """检测问题类型"""
        problem_types = {
            'equation': r'方程|equation|solve|解|=',
            'geometry': r'几何|geometry|三角形|面积|体积|图形|length|area|volume|angle',
            'algebra': r'代数|algebra|多项式|polynomial|因式分解|factor',
            'calculus': r'微积分|calculus|积分|integral|导数|derivative|极限|limit',
            'statistics': r'统计|statistics|概率|probability|平均|mean|方差|variance',
            'trigonometry': r'三角|trigonometry|sin|cos|tan|角度|angle',
            'matrix': r'矩阵|matrix|行列式|determinant',
            'sequence': r'数列|sequence|级数|series|等差|等比'
        }
        
        import re
        for problem_type, pattern in problem_types.items():
            if re.search(pattern, question, re.IGNORECASE):
                return problem_type
        return 'general'

    def detect_problem_complexity(self, question):
        """检测问题复杂度"""
        complex_patterns = [
            r'integral|积分|∫',
            r'derivative|导数|微分',
            r'matrix|矩阵',
            r'limit|极限',
            r'sum|∑|sigma',
            r'product|∏|pi',
            r'sqrt|根号|√[^)]*\)|\^{[^{}]*}',
            r'frac|\frac{[^{}]*}{[^{}]*}',
            r'[∑∏∫∂∇∆∞∈∉⊂⊃⊆⊇∩∪]',
            r'\$\$.*?\$\$',
            r'\\\[.*?\\\]'
        ]
        
        import re
        complexity_score = sum(1 for pattern in complex_patterns if re.search(pattern, question, re.IGNORECASE))
        
        if complexity_score >= 3:
            return {'complexity': 'complex', 'useLaTeX': True, 'format': 'detailed'}
        elif complexity_score >= 1:
            return {'complexity': 'intermediate', 'useLaTeX': True, 'format': 'structured'}
        else:
            return {'complexity': 'simple', 'useLaTeX': False, 'format': 'basic'}

    def create_geometry_fallback(self, question):
        """创建几何问题的fallback响应"""
        if '三角形面积' in question and '拉窗帘' in question:
            return f"""我来帮你创建三角形面积拉窗帘原理的讲解视频：

**您的要求：** {question}

**详细解题步骤**

1. **理解三角形面积公式**
   操作：回顾三角形面积的基本公式
   公式：三角形面积 = (底边 × 高) ÷ 2
   解释：这是计算三角形面积的标准公式，适用于所有类型的三角形
   中间结果：面积 = (底边 × 高) ÷ 2

2. **拉窗帘原理的几何意义**
   操作：解释拉窗帘原理的几何含义
   解释：拉窗帘原理说明，如果三角形的顶点沿着平行于底边的直线移动，面积保持不变
   中间结果：面积守恒原理

3. **动画演示过程**
   操作：展示拉窗帘的动画过程
   解释：通过动画展示顶点移动时面积保持不变的原理
   中间结果：视觉化理解面积守恒

4. **数学证明**
   操作：给出数学证明
   解释：使用坐标几何证明面积公式的普遍性
   中间结果：面积 = |(x2-x1)(y3-y1) - (x3-x1)(y2-y1)|/2

5. **实际应用**
   操作：展示实际应用例子
   解释：在不同类型的三角形中应用拉窗帘原理
   中间结果：原理的普遍适用性

**最终答案**
三角形面积拉窗帘原理：当三角形的顶点沿着平行于底边的直线移动时，三角形的面积保持不变。

**相关数学概念**
- 三角形面积公式
- 几何变换
- 面积守恒原理
- 坐标几何

**常见错误提醒**
- 混淆底边和高的概念
- 忽略面积守恒的条件
- 不理解几何变换的本质

**注意：** 当前使用备用响应模式，网络恢复后将提供更详细的AI解答和动画脚本。"""
        else:
            return f"""我来帮你分析这个几何问题：

**问题：** {question}

**详细解题步骤**

1. **理解几何概念**
   操作：明确题目中的几何概念和条件
   解释：仔细分析题目中的几何元素和关系
   中间结果：确定已知条件和求解目标

2. **绘制几何图形**
   操作：根据题目条件绘制相应的几何图形
   解释：图形化有助于理解几何关系
   中间结果：清晰的几何图形

3. **应用几何定理**
   操作：选择合适的几何定理或公式
   解释：根据题目类型应用相应的几何知识
   中间结果：建立数学关系

4. **逐步求解**
   操作：按照几何逻辑逐步求解
   解释：每一步都要有明确的几何依据
   中间结果：得到中间结果

5. **验证答案**
   操作：检查计算过程和结果的合理性
   解释：确保答案符合几何原理
   中间结果：最终答案

**注意：** 当前使用备用响应模式，网络恢复后将提供完整AI解答。"""

    def create_equation_fallback(self, question):
        """创建方程问题的fallback响应"""
        return f"""我来帮你解决这个方程问题：

**问题：** {question}

**详细解题步骤**

1. **理解方程类型**
   操作：识别方程的类型（一元一次、一元二次等）
   解释：不同类型的方程有不同的解法
   中间结果：确定解题策略

2. **整理方程形式**
   操作：将方程整理为标准形式
   解释：标准形式便于应用相应的解法
   中间结果：ax + b = 0 或 ax² + bx + c = 0

3. **应用解法**
   操作：根据方程类型选择合适的解法
   解释：一元一次方程用移项法，一元二次方程用公式法
   中间结果：得到解的形式

4. **计算具体数值**
   操作：代入具体数值进行计算
   解释：按照数学运算规则进行计算
   中间结果：得到数值解

5. **验证解的正确性**
   操作：将解代入原方程验证
   解释：确保解满足原方程
   中间结果：验证通过

**注意：** 当前使用备用响应模式，网络恢复后将提供完整AI解答。"""

    def create_calculus_fallback(self, question):
        """创建微积分问题的fallback响应"""
        return f"""我来帮你解决这个微积分问题：

**问题：** {question}

**详细解题步骤**

1. **识别微积分类型**
   操作：确定是求导、积分还是极限问题
   解释：不同类型的微积分问题有不同的解法
   中间结果：确定解题方向

2. **应用相应公式**
   操作：根据问题类型应用相应的微积分公式
   解释：求导用导数公式，积分用积分公式
   中间结果：得到初步结果

3. **简化表达式**
   操作：对结果进行代数简化
   解释：简化后的结果更易于理解和应用
   中间结果：简化后的表达式

4. **计算具体数值**
   操作：如果有具体数值，进行代入计算
   解释：得到最终的数值结果
   中间结果：数值解

5. **验证结果**
   操作：检查计算过程和结果的合理性
   解释：确保结果符合微积分原理
   中间结果：验证通过

**注意：** 当前使用备用响应模式，网络恢复后将提供完整AI解答。"""

    def create_algebra_fallback(self, question):
        """创建代数问题的fallback响应"""
        return f"""我来帮你解决这个代数问题：

**问题：** {question}

**详细解题步骤**

1. **理解代数表达式**
   操作：分析代数表达式的结构和特点
   解释：理解表达式中各项的含义和关系
   中间结果：明确表达式结构

2. **应用代数运算**
   操作：根据代数运算规则进行计算
   解释：遵循代数运算的优先级和规则
   中间结果：得到运算结果

3. **简化表达式**
   操作：对结果进行代数简化
   解释：合并同类项，化简分式等
   中间结果：简化后的表达式

4. **求解未知数**
   操作：如果涉及未知数，进行求解
   解释：使用代数方法求解方程或不等式
   中间结果：得到解

5. **验证结果**
   操作：检查计算过程和结果的正确性
   解释：确保结果符合代数原理
   中间结果：验证通过

**注意：** 当前使用备用响应模式，网络恢复后将提供完整AI解答。"""

    def create_video_request_fallback(self, question, problem_type):
        """创建视频请求的fallback响应"""
        return f"""我来帮你创建这个教学视频：

**您的要求：** {question}

**教学视频制作步骤**

1. **概念介绍**
   - 解释相关数学概念的基本原理
   - 说明在数学学习中的重要性
   - 展示相关的数学公式和定理

2. **原理演示**
   - 通过动画展示数学原理
   - 解释关键步骤和推理过程
   - 展示不同情况下的应用

3. **实际应用**
   - 给出具体的计算例子
   - 展示解题步骤和技巧
   - 验证结果的正确性

4. **总结归纳**
   - 总结关键要点和公式
   - 提供记忆技巧和方法
   - 给出练习题建议

**详细解题步骤**

1. **理解问题要求**
   操作：明确视频制作的目标和内容
   解释：确定要讲解的数学概念和原理
   中间结果：明确制作方向

2. **设计教学内容**
   操作：规划视频的结构和内容
   解释：按照逻辑顺序组织教学内容
   中间结果：教学内容框架

3. **制作动画脚本**
   操作：设计相应的数学动画
   解释：通过动画直观展示数学原理
   中间结果：动画脚本

4. **生成语音讲解**
   操作：制作配套的语音讲解
   解释：用清晰的语言解释数学概念
   中间结果：语音文件

5. **合成最终视频**
   操作：将动画和语音合成为完整视频
   解释：确保视频的连贯性和教育效果
   中间结果：教学视频

**注意：** 当前使用备用响应模式，网络恢复后将提供更详细的AI解答和动画脚本。"""

    def create_general_fallback(self, question, problem_type):
        """创建通用问题的fallback响应"""
        return f"""我来帮你分析这个数学问题：

**问题：** {question}

**详细解题步骤**

1. **理解问题**
   操作：仔细阅读题目，明确已知条件和要求
   解释：分析题目中的关键词和数学概念
   中间结果：明确解题目标

2. **确定解题思路**
   操作：根据问题类型选择合适的解题方法
   解释：制定解题的整体策略和步骤
   中间结果：解题计划

3. **应用数学知识**
   操作：使用相关的数学公式和定理
   解释：根据问题特点应用相应的数学原理
   中间结果：建立数学关系

4. **逐步求解**
   操作：按照数学逻辑逐步求解
   解释：每一步都要有明确的数学依据
   中间结果：得到中间结果

5. **验证答案**
   操作：检查计算过程和结果的正确性
   解释：确保答案符合数学原理和题目要求
   中间结果：最终答案

**注意：** 当前使用备用响应模式，网络恢复后将提供完整AI解答。"""

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