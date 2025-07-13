# 🔧 Ubuntu 故障排除指南

## 🚨 端口占用问题解决方案

### 问题症状
```
OSError: [Errno 98] Address already in use
```
或
```
OSError: [Errno 48] Address already in use
```

### 快速解决方案

#### 方案1：使用Ubuntu专用启动脚本（推荐）
```bash
# 进入项目目录
cd /path/to/VideoTutor

# 给脚本执行权限
chmod +x start-server-ubuntu.sh

# 运行脚本
./start-server-ubuntu.sh
```

#### 方案2：手动解决端口冲突
```bash
# 1. 查找占用端口8000的进程
sudo lsof -i :8000

# 2. 终止进程（替换<PID>为实际的进程ID）
sudo kill -9 <PID>

# 3. 重新启动服务器
python3 server.py
```

#### 方案3：使用不同的端口
```bash
# 直接启动，服务器会自动尝试端口8000-8009
python3 server.py
```

### 🔍 详细诊断步骤

#### 步骤1：检查系统状态
```bash
# 检查Python3是否安装
python3 --version

# 检查端口占用情况
sudo lsof -i :8000
sudo netstat -tlnp | grep :8000
sudo ss -tlnp | grep :8000
```

#### 步骤2：检查进程
```bash
# 查看所有Python进程
ps aux | grep python

# 查看特定端口的进程
sudo lsof -i :8000 -i :8001 -i :8002
```

#### 步骤3：清理进程
```bash
# 终止所有Python进程（谨慎使用）
pkill -f python

# 或者终止特定端口的进程
sudo kill -9 $(sudo lsof -ti :8000)
```

### 🛠️ 常见问题解决

#### 问题1：权限不足
```bash
# 错误：Permission denied
# 解决：使用sudo
sudo python3 server.py
```

#### 问题2：Python模块缺失
```bash
# 错误：ModuleNotFoundError
# 解决：安装缺失的模块
sudo apt update
sudo apt install python3-pip
pip3 install <module_name>
```

#### 问题3：防火墙阻止
```bash
# 检查防火墙状态
sudo ufw status

# 如果需要，允许端口8000
sudo ufw allow 8000
```

#### 问题4：SELinux阻止（如果启用）
```bash
# 检查SELinux状态
sestatus

# 临时禁用SELinux（重启后恢复）
sudo setenforce 0
```

### 📋 完整的启动流程

```bash
# 1. 进入项目目录
cd /path/to/VideoTutor

# 2. 检查文件是否存在
ls -la server.py

# 3. 检查端口状态
sudo lsof -i :8000

# 4. 如果有进程占用，终止它
sudo kill -9 $(sudo lsof -ti :8000)

# 5. 启动服务器
python3 server.py
```

### 🔧 高级故障排除

#### 检查系统资源
```bash
# 检查内存使用
free -h

# 检查磁盘空间
df -h

# 检查CPU使用
top
```

#### 检查网络配置
```bash
# 检查网络接口
ip addr show

# 检查路由表
ip route show

# 测试本地连接
curl -I http://localhost:8000
```

#### 检查日志
```bash
# 查看系统日志
sudo journalctl -f

# 查看Python错误
python3 server.py 2>&1 | tee server.log
```

### 🚀 自动化解决方案

创建一个一键启动脚本：
```bash
#!/bin/bash
# 保存为 start-math-tutor.sh

echo "🚀 启动MathTutor AI服务器..."

# 检查并终止占用进程
PID=$(sudo lsof -ti :8000 2>/dev/null)
if [ ! -z "$PID" ]; then
    echo "终止占用进程: $PID"
    sudo kill -9 $PID
    sleep 2
fi

# 启动服务器
python3 server.py
```

使用方法：
```bash
chmod +x start-math-tutor.sh
./start-math-tutor.sh
```

### 📞 如果问题仍然存在

1. **重启系统**：`sudo reboot`
2. **检查Python版本**：确保使用Python 3.6+
3. **重新安装Python**：`sudo apt install --reinstall python3`
4. **检查项目文件**：确保所有文件完整且权限正确

### 🎯 成功标志

当您看到以下输出时，表示服务器启动成功：
```
🚀 MathTutor AI 测试服务器启动成功!
📡 服务器地址: http://localhost:8000
🌐 测试页面: http://localhost:8000/test-server.html
📋 API端点: http://localhost:8000/api/qwen
```

---

💡 **提示**：如果仍然遇到问题，请提供完整的错误信息和系统版本，以便获得更精确的帮助。 