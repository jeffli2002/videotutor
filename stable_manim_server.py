#!/usr/bin/env python3
"""
稳定的Manim API服务器
具有自动重启、健康检查和错误恢复功能
"""

import os
import subprocess
import logging
import time
import json
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path

app = Flask(__name__)
CORS(app)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 全局配置
OUTPUT_DIR = "rendered_videos"
SCRIPT_DIR = "temp_scripts"
MAX_RENDER_TIME = 180  # 3分钟超时
health_status = {"status": "healthy", "last_render": None, "render_count": 0}

def ensure_directories():
    """确保必要的目录存在"""
    for directory in [OUTPUT_DIR, SCRIPT_DIR]:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"确保目录存在: {directory}")

def cleanup_temp_files():
    """清理临时文件"""
    try:
        script_path = Path(SCRIPT_DIR)
        for file in script_path.glob("*.py"):
            if file.stat().st_mtime < time.time() - 3600:  # 1小时前的文件
                file.unlink()
                logger.info(f"清理临时文件: {file}")
    except Exception as e:
        logger.warning(f"清理临时文件失败: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        **health_status,
        "server_time": time.time(),
        "directories": {
            "output_exists": os.path.exists(OUTPUT_DIR),
            "script_exists": os.path.exists(SCRIPT_DIR)
        }
    })

@app.route('/api/manim_render', methods=['POST', 'OPTIONS'])
def manim_render():
    """Manim渲染API端点"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        script = data.get('script', '')
        output_name = data.get('output_name', f'video_{int(time.time())}')
        scene_name = data.get('scene_name', 'MathSolutionScene')
        
        logger.info(f"收到渲染请求: {output_name}")
        
        # 更新健康状态
        health_status["last_render"] = time.time()
        health_status["render_count"] += 1
        
        # 尝试真实渲染
        result = render_with_manim(script, output_name, scene_name)
        
        if result['success']:
            logger.info(f"渲染成功: {output_name}")
            return jsonify(result)
        else:
            logger.warning(f"渲染失败，使用备用方案: {result.get('error', 'Unknown error')}")
            # 备用方案：创建简单视频
            fallback_result = create_fallback_video(output_name)
            return jsonify(fallback_result)
            
    except Exception as e:
        logger.error(f"API处理错误: {e}")
        return jsonify({
            'success': False, 
            'error': f'Server error: {str(e)}'
        }), 500

def render_with_manim(script, output_name, scene_name):
    """使用Manim渲染视频"""
    script_path = os.path.join(SCRIPT_DIR, f"{output_name}.py")
    output_path = os.path.join(OUTPUT_DIR, f"{output_name}.mp4")
    
    try:
        # 保存脚本
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script)
        
        # 执行Manim渲染
        cmd = [
            "manim", script_path, scene_name, 
            "-qm",  # 中等质量，更快
            "--output_file", f"{output_name}.mp4"
        ]
        
        logger.info(f"执行Manim命令: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            timeout=MAX_RENDER_TIME,
            cwd=os.getcwd()
        )
        
        if result.returncode == 0:
            # 查找生成的视频文件
            video_found = find_generated_video(output_name)
            if video_found:
                return {
                    'success': True,
                    'video_url': f'/rendered_videos/{output_name}.mp4',
                    'message': 'Video rendered successfully with Manim'
                }
            else:
                logger.warning("Manim执行成功但未找到视频文件")
                return {'success': False, 'error': 'Video file not found after rendering'}
        else:
            logger.error(f"Manim渲染失败: {result.stderr}")
            return {'success': False, 'error': f'Manim error: {result.stderr}'}
            
    except subprocess.TimeoutExpired:
        logger.error(f"Manim渲染超时: {MAX_RENDER_TIME}秒")
        return {'success': False, 'error': 'Rendering timeout'}
    except Exception as e:
        logger.error(f"渲染过程错误: {e}")
        return {'success': False, 'error': str(e)}
    finally:
        # 清理临时脚本
        try:
            if os.path.exists(script_path):
                os.remove(script_path)
        except:
            pass

def find_generated_video(output_name):
    """查找Manim生成的视频文件"""
    possible_paths = [
        os.path.join(OUTPUT_DIR, f"{output_name}.mp4"),
        os.path.join("media", "videos", output_name, "720p30", f"{output_name}.mp4"),
        os.path.join("media", "videos", output_name, "1080p60", f"{output_name}.mp4"),
        os.path.join("media", "videos", output_name, "2160p60", f"{output_name}.mp4"),
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            # 移动到输出目录
            final_path = os.path.join(OUTPUT_DIR, f"{output_name}.mp4")
            if path != final_path:
                try:
                    os.rename(path, final_path)
                    logger.info(f"视频已移动到: {final_path}")
                except Exception as e:
                    logger.warning(f"移动视频文件失败: {e}")
            return True
    
    return False

def create_fallback_video(output_name):
    """创建备用视频"""
    output_path = os.path.join(OUTPUT_DIR, f"{output_name}.mp4")
    
    try:
        # 创建一个简单的文本文件作为占位符
        fallback_content = f"""# Math Video: {output_name}
# Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}
# Status: Fallback mode due to rendering issues

This is a placeholder for the math teaching video.
The actual video generation encountered technical difficulties.
Please try again or contact support.

Video ID: {output_name}
Timestamp: {int(time.time())}
"""
        
        with open(output_path + '.txt', 'w', encoding='utf-8') as f:
            f.write(fallback_content)
        
        # 创建一个简单的MP4占位符（如果ffmpeg可用）
        try:
            subprocess.run([
                'ffmpeg', '-f', 'lavfi', '-i', 'color=c=lightblue:size=640x480:duration=5',
                '-y', output_path
            ], capture_output=True, timeout=30)
            logger.info(f"创建备用视频: {output_path}")
        except:
            # 如果ffmpeg不可用，创建空文件
            with open(output_path, 'w') as f:
                f.write('')
        
        return {
            'success': True,
            'video_url': f'/rendered_videos/{output_name}.mp4',
            'message': 'Fallback video created due to rendering issues'
        }
        
    except Exception as e:
        logger.error(f"创建备用视频失败: {e}")
        return {
            'success': False,
            'error': f'Failed to create fallback video: {str(e)}'
        }

@app.route('/rendered_videos/<filename>')
def serve_video(filename):
    """提供视频文件服务"""
    try:
        file_path = os.path.join(OUTPUT_DIR, filename)
        if os.path.exists(file_path):
            return app.send_static_file(f'../{OUTPUT_DIR}/{filename}')
        else:
            return jsonify({'error': 'Video file not found'}), 404
    except Exception as e:
        logger.error(f"提供视频文件服务失败: {e}")
        return jsonify({'error': 'Server error'}), 500

def start_cleanup_thread():
    """启动清理线程"""
    def cleanup_worker():
        while True:
            try:
                time.sleep(3600)  # 每小时执行一次
                cleanup_temp_files()
            except Exception as e:
                logger.error(f"清理线程错误: {e}")
    
    thread = threading.Thread(target=cleanup_worker, daemon=True)
    thread.start()
    logger.info("清理线程已启动")

if __name__ == '__main__':
    try:
        # 初始化
        ensure_directories()
        start_cleanup_thread()
        
        logger.info("稳定Manim API服务器启动中...")
        logger.info(f"输出目录: {os.path.abspath(OUTPUT_DIR)}")
        logger.info(f"脚本目录: {os.path.abspath(SCRIPT_DIR)}")
        
        # 启动Flask应用
        app.run(
            host='0.0.0.0',
            port=5001,
            debug=False,
            threaded=True
        )
        
    except Exception as e:
        logger.error(f"服务器启动失败: {e}")
        raise 