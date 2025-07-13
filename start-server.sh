#!/bin/bash

echo "🚀 MathTutor AI 测试服务器启动脚本"
echo "=================================="
echo ""

# 检查Python3是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装 Python3"
    exit 1
fi

# 检查文件是否存在
if [ ! -f "server.py" ]; then
    echo "❌ 找不到 server.py 文件"
    echo "请确保在包含 server.py 的目录中运行此脚本"
    exit 1
fi

if [ ! -f "test-server.html" ]; then
    echo "❌ 找不到 test-server.html 文件"
    echo "请确保在包含 test-server.html 的目录中运行此脚本"
    exit 1
fi

echo "🔍 检查端口8000状态..."
PORT_CHECK=$(netstat -an 2>/dev/null | grep ":8000.*LISTEN" || lsof -i :8000 2>/dev/null || ss -tuln 2>/dev/null | grep ":8000")

if [ ! -z "$PORT_CHECK" ]; then
    echo "⚠️  端口8000已被占用，正在停止旧进程..."
    
    # 尝试找到并终止占用端口8000的进程
    PID=$(lsof -ti :8000 2>/dev/null || netstat -tlnp 2>/dev/null | grep ":8000" | awk '{print $7}' | cut -d/ -f1)
    
    if [ ! -z "$PID" ]; then
        echo "正在终止进程 PID: $PID"
        kill -9 $PID 2>/dev/null
        sleep 2
        echo "✅ 旧进程已终止"
    else
        echo "⚠️  无法自动终止旧进程，请手动关闭占用端口8000的程序"
    fi
else
    echo "✅ 端口8000可用"
fi

echo ""
echo "✅ 检查通过，开始启动服务器..."
echo ""

# 启动服务器
python3 server.py