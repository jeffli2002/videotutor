#!/bin/bash

echo "🚀 MathTutor AI Ubuntu 启动脚本"
echo "================================"
echo ""

# 检查Python3是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装 Python3"
    echo "运行: sudo apt update && sudo apt install python3 python3-pip"
    exit 1
fi

# 检查文件是否存在
if [ ! -f "server.py" ]; then
    echo "❌ 找不到 server.py 文件"
    echo "请确保在包含 server.py 的目录中运行此脚本"
    exit 1
fi

echo "🔍 检查端口8000状态..."

# 使用多种方法检查端口占用
PORT_IN_USE=false
PID=""

# 方法1: 使用lsof
if command -v lsof &> /dev/null; then
    PID=$(lsof -ti :8000 2>/dev/null)
    if [ ! -z "$PID" ]; then
        PORT_IN_USE=true
    fi
fi

# 方法2: 使用netstat
if [ "$PORT_IN_USE" = false ] && command -v netstat &> /dev/null; then
    if netstat -tlnp 2>/dev/null | grep -q ":8000.*LISTEN"; then
        PORT_IN_USE=true
        PID=$(netstat -tlnp 2>/dev/null | grep ":8000.*LISTEN" | awk '{print $7}' | cut -d/ -f1)
    fi
fi

# 方法3: 使用ss
if [ "$PORT_IN_USE" = false ] && command -v ss &> /dev/null; then
    if ss -tlnp 2>/dev/null | grep -q ":8000"; then
        PORT_IN_USE=true
        PID=$(ss -tlnp 2>/dev/null | grep ":8000" | awk '{print $6}' | cut -d, -f2)
    fi
fi

if [ "$PORT_IN_USE" = true ]; then
    echo "⚠️  端口8000已被占用"
    
    if [ ! -z "$PID" ]; then
        echo "发现占用进程 PID: $PID"
        echo "正在终止进程..."
        
        # 尝试优雅终止
        kill $PID 2>/dev/null
        sleep 2
        
        # 检查进程是否还在运行
        if kill -0 $PID 2>/dev/null; then
            echo "进程仍在运行，强制终止..."
            kill -9 $PID 2>/dev/null
            sleep 1
        fi
        
        # 最终检查
        if kill -0 $PID 2>/dev/null; then
            echo "❌ 无法终止进程 $PID，请手动处理"
            echo "运行: sudo kill -9 $PID"
            exit 1
        else
            echo "✅ 进程 $PID 已终止"
        fi
    else
        echo "⚠️  无法确定占用进程，请手动检查"
        echo "运行: sudo lsof -i :8000"
        exit 1
    fi
else
    echo "✅ 端口8000可用"
fi

echo ""
echo "🔧 检查Python依赖..."

# 检查必要的Python包
python3 -c "import http.server, socketserver, json, urllib.request, urllib.parse, os, time, sys, platform, subprocess" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  某些Python模块可能缺失，但服务器应该仍能运行"
fi

echo ""
echo "🚀 启动MathTutor AI服务器..."
echo "📡 服务器地址: http://localhost:8000"
echo "🌐 测试页面: http://localhost:8000/test-server.html"
echo "📋 API端点: http://localhost:8000/api/qwen"
echo ""
echo "⚠️  按 Ctrl+C 停止服务器"
echo "================================================"

# 启动服务器
python3 server.py 