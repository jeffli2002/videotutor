# QWEN API 连接问题修复指南

## 🔍 问题诊断

根据网络诊断结果，发现以下问题：
1. **QWEN API 端点无法访问** - 所有 dashscope.aliyuncs.com 端点返回 HTTP 错误
2. **SSL 连接问题** - SSL 握手超时
3. **API 密钥未设置** - 环境变量缺失

## 🔧 解决方案

### 1. 检查正确的 API 端点

QWEN API 的正确端点应该是：
```
https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

但根据测试结果，这个域名可能无法直接访问。请尝试以下替代方案：

#### 方案 A: 使用阿里云官方 SDK
```bash
pip install dashscope
```

#### 方案 B: 使用正确的 API 域名
可能的正确域名：
- `https://api.dashscope.com/`
- `https://dashscope.aliyuncs.com/`
- `https://dashscope.cn/`

#### 方案 C: 使用代理或 VPN
如果在中国大陆网络环境，可能需要：
1. 使用 VPN 连接到海外网络
2. 设置代理服务器
3. 使用阿里云内网访问

### 2. 设置 API 密钥

确保正确设置环境变量：

**Windows (PowerShell):**
```powershell
$env:QWEN_API_KEY="sk-your-api-key-here"
$env:REACT_APP_QWEN_API_KEY="sk-your-api-key-here"
$env:VITE_QWEN_API_KEY="sk-your-api-key-here"
```

**Windows (CMD):**
```cmd
set QWEN_API_KEY=sk-your-api-key-here
set REACT_APP_QWEN_API_KEY=sk-your-api-key-here
set VITE_QWEN_API_KEY=sk-your-api-key-here
```

**Linux/macOS:**
```bash
export QWEN_API_KEY="sk-your-api-key-here"
export REACT_APP_QWEN_API_KEY="sk-your-api-key-here"
export VITE_QWEN_API_KEY="sk-your-api-key-here"
```

### 3. 网络连接修复

#### 检查 DNS 设置
```bash
# Windows
nslookup dashscope.aliyuncs.com

# Linux/macOS
dig dashscope.aliyuncs.com
```

#### 使用公共 DNS
- 主要 DNS: `8.8.8.8` (Google)
- 备用 DNS: `114.114.114.114` (114DNS)
- 阿里 DNS: `223.5.5.5`

#### 设置代理（如果需要）
```bash
# 设置代理环境变量
export HTTPS_PROXY="http://proxy-server:port"
export HTTP_PROXY="http://proxy-server:port"
```

### 4. SSL 问题修复

#### 更新 Python 和 OpenSSL
```bash
# 更新 Python
python -m pip install --upgrade pip

# 更新 OpenSSL (如果使用 conda)
conda update openssl
```

#### 禁用 SSL 验证（仅用于测试）
在代码中添加：
```python
import ssl
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE
```

### 5. 使用阿里云官方 SDK

创建 `test_qwen_sdk.py`:
```python
import dashscope
from dashscope import Generation

# 设置 API 密钥
dashscope.api_key = "sk-your-api-key-here"

# 测试调用
response = Generation.call(
    model='qwen-plus',
    messages=[{'role': 'user', 'content': '你好'}]
)

print(response)
```

### 6. 替代方案

如果 QWEN API 无法访问，可以考虑：

#### A. 使用其他 AI 服务
- OpenAI GPT API
- Claude API
- 本地大语言模型

#### B. 使用备用响应机制
当前的备用响应机制已经可以正常工作，可以：
1. 继续使用备用响应进行开发测试
2. 在网络问题解决后再启用真实 API

#### C. 使用模拟 API
创建一个模拟的 QWEN API 服务用于开发测试。

## 🚀 快速修复命令

```bash
# 1. 运行网络诊断
python network_diagnosis.py

# 2. 运行快速修复
python fix_qwen_connection.py

# 3. 测试 API 连接
python test_qwen_api_direct.py

# 4. 重启服务器
python server.py
```

## 📞 获取帮助

如果问题仍然存在：

1. **检查阿里云控制台**
   - 登录阿里云控制台
   - 检查 API 密钥状态
   - 查看 API 调用日志

2. **联系阿里云支持**
   - 阿里云技术支持
   - 通义千问官方文档

3. **社区支持**
   - GitHub Issues
   - 技术论坛

## ✅ 验证修复

修复完成后，运行以下命令验证：

```bash
# 测试网络连接
python network_diagnosis.py

# 测试 API 调用
python test_qwen_api_direct.py

# 启动服务器并测试
python server.py
```

如果所有测试都通过，说明 QWEN API 连接问题已解决。 