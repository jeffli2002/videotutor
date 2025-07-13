import os
import subprocess
import logging
from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
import glob

app = Flask(__name__)
CORS(app)
OUTPUT_DIR = "rendered_videos"

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/manim_render', methods=['POST'])
def manim_render():
    data = request.json
    script = data.get('script')
    output_name = data.get('output_name', 'output')
    scene_name = data.get('scene_name', 'MyScene')

    if not script:
        return jsonify({'success': False, 'error': 'Missing script'}), 400

    logger.info(f"开始渲染视频: {output_name}, 场景: {scene_name}")

    # 保存脚本
    script_path = f"{output_name}.py"
    try:
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script)
        logger.info(f"脚本已保存: {script_path}")
    except Exception as e:
        logger.error(f"保存脚本失败: {e}")
        return jsonify({'success': False, 'error': f'保存脚本失败: {str(e)}'}), 500

    # 渲染视频
    try:
        logger.info("开始执行manim渲染...")
        result = subprocess.run([
            "manim", script_path, scene_name, "-o", f"{output_name}.mp4", "-qk"
        ], check=True, timeout=300, capture_output=True, text=True)
        logger.info(f"Manim渲染成功: {result.stdout}")
    except subprocess.TimeoutExpired:
        logger.error("Manim渲染超时")
        return jsonify({'success': False, 'error': 'Manim渲染超时，请简化问题或稍后重试'}), 504
    except subprocess.CalledProcessError as e:
        logger.error(f"Manim渲染失败: {e.stderr}")
        return jsonify({'success': False, 'error': f'Manim渲染失败: {e.stderr}'}), 500
    except FileNotFoundError:
        logger.error("Manim命令未找到，请确保已正确安装manim")
        return jsonify({'success': False, 'error': 'Manim未安装或未在PATH中'}), 500

    # 自动查找分段mp4并合成
    try:
        # 假设分段mp4在 media/videos/{output_name}/2160p60/partial_movie_files/{scene_name}/ 下
        part_dir = os.path.join("media", "videos", output_name, "2160p60", "partial_movie_files", scene_name)
        if not os.path.exists(part_dir):
            logger.error(f"未找到分段视频目录: {part_dir}")
            return jsonify({'success': False, 'error': f'未找到分段视频目录: {part_dir}'}), 500
        part_files = sorted(glob.glob(os.path.join(part_dir, "*.mp4")))
        # 可选：如需自定义排序规则，可在此处实现
        # part_files = sorted(part_files, key=自定义排序函数)
        filelist_txt = os.path.join(part_dir, "filelist.txt")
        with open(filelist_txt, "w", encoding="utf-8") as f:
            for pf in part_files:
                f.write(f"file '{os.path.abspath(pf)}'\n")
        # 合成输出路径
        final_dir = "rendered_videos"
        os.makedirs(final_dir, exist_ok=True)
        final_mp4 = os.path.join(final_dir, f"{output_name}.mp4")
        # ffmpeg合成，强制30fps，兼容主流播放器
        ffmpeg_cmd = [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", filelist_txt,
            "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", final_mp4
        ]
        logger.info(f"执行ffmpeg合成: {' '.join(ffmpeg_cmd)}")
        ffmpeg_result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        if ffmpeg_result.returncode != 0:
            logger.error(f"ffmpeg合成失败: {ffmpeg_result.stderr}")
            return jsonify({'success': False, 'error': f'ffmpeg合成失败: {ffmpeg_result.stderr}'}), 500
        logger.info(f"视频合成成功: {final_mp4}")
        # 返回最终视频URL
        video_url = f"/rendered_videos/{output_name}.mp4"
        return jsonify({'success': True, 'video_url': video_url}), 200
    except Exception as e:
        logger.error(f"视频合成异常: {e}")
        return jsonify({'success': False, 'error': f'视频合成异常: {str(e)}'}), 500

@app.route('/rendered_videos/<filename>')
def serve_rendered_video(filename):
    return send_from_directory('rendered_videos', filename)

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'manim-api-server'})

if __name__ == '__main__':
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    logger.info(f"启动Manim API服务器，输出目录: {OUTPUT_DIR}")
    app.run(host='0.0.0.0', port=5001) 