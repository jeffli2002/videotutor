#!/usr/bin/env python3
"""
智能Manim API服务器启动脚本
自动检测并解决端口冲突问题
"""
import subprocess
import sys
import time
import requests
import psutil
import os

def print_banner():
    print("🎬" + "=" * 50)
    print("🎥    Manim API 服务器启动器")
    print("🎬" + "=" * 50)

def check_port_in_use(port):
    """检查端口是否被占用"""
    for conn in psutil.net_connections():
        if conn.laddr.port == port:
            return conn.pid
    return None

def kill_process_on_port(port):
    """终止占用指定端口的进程"""
    pid = check_port_in_use(port)
    if pid:
        try:
            process = psutil.Process(pid)
            print(f"🔄 终止占用端口{port}的进程 (PID: {pid})...")
            process.terminate()
            process.wait(timeout=5)
            print(f"✅ 进程 {pid} 已终止")
            return True
        except (psutil.NoSuchProcess, psutil.TimeoutExpired, psutil.AccessDenied) as e:
            print(f"❌ 无法终止进程 {pid}: {e}")
            return False
    return True

def check_manim_installed():
    """检查manim是否已安装"""
    try:
        result = subprocess.run(['manim', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ Manim已安装: {version}")
            return True
        else:
            print(f"❌ Manim版本检查失败: {result.stderr}")
            return False
    except FileNotFoundError:
        print("❌ Manim未安装或未在PATH中")
        return False
    except subprocess.TimeoutExpired:
        print("❌ Manim版本检查超时")
        return False

def check_dependencies():
    """检查Python依赖"""
    required_packages = ['flask', 'flask-cors', 'requests', 'psutil']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - 缺失")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 安装缺失的包:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def test_server_health(max_attempts=10):
    """测试服务器健康状态"""
    print("🩺 检查服务器健康状态...")
    
    for attempt in range(max_attempts):
        try:
            response = requests.get('http://localhost:5001/health', timeout=5)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ 服务器健康: {result}")
                return True
        except requests.exceptions.RequestException:
            if attempt < max_attempts - 1:
                print(f"⏳ 等待服务器启动... ({attempt + 1}/{max_attempts})")
                time.sleep(2)
            else:
                print("❌ 服务器健康检查失败")
                return False
    
    return False

def start_manim_server():
    """启动manim服务器"""
    print("🚀 启动Manim API服务器...")
    
    try:
        # 启动服务器进程
        process = subprocess.Popen(
            [sys.executable, 'manim_api_server.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        print(f"🔄 服务器进程已启动 (PID: {process.pid})")
        
        # 等待一下让服务器启动
        time.sleep(3)
        
        # 检查进程是否还在运行
        if process.poll() is None:
            print("✅ 服务器正在运行")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ 服务器启动失败:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ 启动服务器时出错: {e}")
        return None

def run_quick_test():
    """运行快速测试"""
    print("\n🧪 运行快速测试...")
    
    try:
        result = subprocess.run([sys.executable, 'test_manim_api_simple.py'], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ 快速测试通过")
            print(result.stdout)
            return True
        else:
            print("❌ 快速测试失败")
            print(result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ 测试超时")
        return False
    except Exception as e:
        print(f"❌ 测试出错: {e}")
        return False

def main():
    print_banner()
    
    # 1. 检查依赖
    print("\n📋 检查系统依赖...")
    if not check_dependencies():
        print("❌ 依赖检查失败，请安装缺失的包")
        return False
    
    if not check_manim_installed():
        print("❌ Manim未安装，请运行: pip install manim")
        return False
    
    # 2. 处理端口冲突
    print("\n🔌 检查端口状态...")
    port = 5001
    if check_port_in_use(port):
        print(f"⚠️  端口 {port} 被占用")
        if input("是否终止占用的进程? (y/N): ").lower() == 'y':
            if not kill_process_on_port(port):
                print("❌ 无法解决端口冲突")
                return False
        else:
            print("❌ 端口冲突未解决")
            return False
    else:
        print(f"✅ 端口 {port} 可用")
    
    # 3. 启动服务器
    print("\n🚀 启动服务器...")
    process = start_manim_server()
    if not process:
        return False
    
    # 4. 健康检查
    if not test_server_health():
        print("❌ 服务器未正常启动")
        process.terminate()
        return False
    
    # 5. 运行测试
    test_passed = run_quick_test()
    
    # 6. 显示结果
    print("\n" + "=" * 50)
    if test_passed:
        print("🎉 Manim API服务器启动成功！")
        print(f"🌐 API地址: http://localhost:{port}/api/manim_render")
        print(f"🩺 健康检查: http://localhost:{port}/health")
        print("\n📚 使用方法:")
        print("  - 运行完整测试: python test_manim_fix.py")
        print("  - 查看修复指南: MANIM_FIX_GUIDE.md")
        print("  - 停止服务器: Ctrl+C")
        
        # 保持服务器运行
        try:
            print(f"\n⏳ 服务器运行中... (PID: {process.pid})")
            process.wait()
        except KeyboardInterrupt:
            print("\n🛑 收到停止信号")
            process.terminate()
            process.wait()
            print("✅ 服务器已停止")
    else:
        print("❌ 服务器启动失败，请检查错误信息")
        process.terminate()
        return False
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 启动被用户取消")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 启动脚本出错: {e}")
        sys.exit(1) 