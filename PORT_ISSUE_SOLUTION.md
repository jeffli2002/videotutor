# 🔧 端口占用问题解决指南

## 🚨 问题症状
当您看到以下错误时：
```
OSError: [WinError 10048] 通常每个套接字地址(协议/网络地址/端口)只允许使用一次。
```

这表示端口8000已被占用。

## 💡 解决方案

### 方案1：使用智能启动脚本（推荐）

#### Windows用户
```powershell
# 右键点击PowerShell，选择"以管理员身份运行"
.\start-server.ps1
```

#### Linux/macOS用户
```bash
chmod +x start-server.sh
./start-server.sh
```

### 方案2：手动解决

#### Windows系统
1. **查找占用端口的进程**
   ```cmd
   netstat -ano | findstr :8000
   ```

2. **终止占用进程**
   ```cmd
   taskkill /PID <进程ID> /F
   ```

3. **重新启动服务器**
   ```cmd
   python server.py
   ```

#### Linux/macOS系统
1. **查找占用端口的进程**
   ```bash
   lsof -i :8000
   ```

2. **终止占用进程**
   ```bash
   kill -9 <进程ID>
   ```

3. **重新启动服务器**
   ```bash
   python3 server.py
   ```

## 🔄 完整解决步骤

### 步骤1：停止旧进程
```bash
# Windows
taskkill /PID $(netstat -ano | findstr :8000 | %{$_.split()[-1]}) /F

# Linux/macOS
kill -9 $(lsof -ti :8000)
```

### 步骤2：验证端口释放
```bash
# Windows
netstat -ano | findstr :8000

# Linux/macOS
lsof -i :8000
```

### 步骤3：重新启动服务器
```bash
python server.py
```

## 🛠️ 预防措施

1. **使用Ctrl+C正确关闭服务器**
   - 不要直接关闭终端窗口
   - 使用Ctrl+C优雅地停止服务器

2. **使用智能启动脚本**
   - 自动检测并解决端口冲突
   - 提供详细的状态信息

3. **检查后台进程**
   ```bash
   # Windows
   tasklist | findstr python
   
   # Linux/macOS
   ps aux | grep python
   ```

## 📋 故障排除清单

- [ ] 检查是否有其他服务占用端口8000
- [ ] 确认Python进程是否正常终止
- [ ] 验证防火墙设置是否正确
- [ ] 检查是否有其他MathTutor实例在运行

## 🆘 如果问题仍然存在

1. **重启计算机**（最后手段）
2. **更改端口号**（修改server.py中的端口设置）
3. **检查防火墙和安全软件**

## 📞 技术支持

如果上述方法都无效，请提供：
- 操作系统版本
- Python版本
- 完整的错误信息
- 端口占用检查结果 