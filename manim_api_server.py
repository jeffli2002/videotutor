import os
import subprocess
import logging
from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
import glob
import time
import subprocess
import os

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
            "manim", script_path, scene_name, "-o", f"{output_name}.mp4", "-qh"
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
        # 优化：自动降级查找实际存在的分辨率目录
        possible_resolutions = [
            "1080p30", "1080p60", "720p30", "2160p60"  # 优先1080p30，因为Manim默认生成这个
        ]
        part_dir = None
        actual_resolution = None
        for res in possible_resolutions:
            dir_path = os.path.join("media", "videos", output_name, res, "partial_movie_files", scene_name)
            if os.path.exists(dir_path):
                part_dir = dir_path
                actual_resolution = res
                logger.info(f"✅ 找到分段视频目录: {part_dir}")
                break
        
        if not part_dir:
            logger.error(f"❌ 未找到分段视频目录，尝试过的路径: {[os.path.join('media', 'videos', output_name, r, 'partial_movie_files', scene_name) for r in possible_resolutions]}")
            # 输出media/videos/output_name下所有目录
            media_videos_dir = os.path.join("media", "videos", output_name)
            if os.path.exists(media_videos_dir):
                logger.info(f"📁 media/videos目录存在: {media_videos_dir}")
                # 列出该目录下的所有子目录和文件
                subdirs = [d for d in os.listdir(media_videos_dir) if os.path.isdir(os.path.join(media_videos_dir, d))]
                files = [f for f in os.listdir(media_videos_dir) if os.path.isfile(os.path.join(media_videos_dir, f))]
                logger.info(f"📂 找到的子目录: {subdirs}")
                logger.info(f"📄 找到的文件: {files}")
                # 尝试查找任何包含partial_movie_files的目录
                for subdir in subdirs:
                    partial_dir = os.path.join(media_videos_dir, subdir, "partial_movie_files", scene_name)
                    if os.path.exists(partial_dir):
                        part_dir = partial_dir
                        actual_resolution = subdir
                        logger.info(f"🔍 通过备用方法找到分段视频目录: {part_dir}")
                        break
            raise Exception(f"无法找到分段视频目录，请检查Manim渲染是否成功")
        
        # 查找分段mp4文件
        mp4_files = [f for f in os.listdir(part_dir) if f.endswith('.mp4') and not f.startswith('filelist')]
        if not mp4_files:
            raise Exception(f"分段视频目录中没有找到mp4文件: {part_dir}")
        
        logger.info(f"📹 找到 {len(mp4_files)} 个分段视频文件")
        
        # 创建filelist.txt，确保按正确顺序合成
        filelist_path = os.path.join(part_dir, "filelist.txt")
        with open(filelist_path, 'w', encoding='utf-8') as f:
            for mp4_file in sorted(mp4_files):  # 按文件名排序确保顺序
                f.write(f"file '{mp4_file}'\n")
        
        logger.info(f"📝 已创建filelist.txt: {filelist_path}")
        
        # 执行ffmpeg合成
        output_video_path = os.path.join("rendered_videos", f"{output_name}.mp4")
        ffmpeg_cmd = f'ffmpeg -y -f concat -safe 0 -i "{filelist_path}" -r 30 -c:v libx264 -pix_fmt yuv420p "{output_video_path}"'
        
        logger.info(f"🎬 执行ffmpeg合成: {ffmpeg_cmd}")
        
        # 执行ffmpeg命令
        result = subprocess.run(ffmpeg_cmd, shell=True, capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"❌ ffmpeg合成失败: {result.stderr}")
            raise Exception(f"ffmpeg合成失败: {result.stderr}")
        
        logger.info(f"✅ 视频合成成功: {output_video_path}")
        
        # 尝试合并音频（如果提供了音频文件）
        audio_path = data.get('audio_path')
        final_video_path = output_video_path
        
        if audio_path and os.path.exists(audio_path):
            try:
                logger.info(f"🎵 开始合并音频: {audio_path}")
                
                # 生成带音频的最终视频文件名
                timestamp = int(time.time() * 1000)
                final_output_name = f"{output_name}_with_audio_{timestamp}"
                final_video_path = os.path.join("rendered_videos", f"{final_output_name}.mp4")
                
                # 使用ffmpeg合并音频和视频
                merge_cmd = [
                    'ffmpeg', '-y',
                    '-i', output_video_path,
                    '-i', audio_path,
                    '-c:v', 'copy',
                    '-c:a', 'aac',
                    '-shortest',
                    '-map', '0:v:0',
                    '-map', '1:a:0',
                    final_video_path
                ]
                
                logger.info(f"🔧 执行音频合并命令: {' '.join(merge_cmd)}")
                
                merge_result = subprocess.run(merge_cmd, capture_output=True, text=True, timeout=300)
                
                if merge_result.returncode == 0 and os.path.exists(final_video_path):
                    logger.info(f"✅ 音频合并成功: {final_video_path}")
                    # 删除原始无音频视频文件
                    try:
                        os.remove(output_video_path)
                        logger.info(f"🗑️ 已删除原始无音频视频: {output_video_path}")
                    except:
                        pass
                else:
                    logger.warning(f"⚠️ 音频合并失败，使用原始视频: {merge_result.stderr}")
                    final_video_path = output_video_path
                    
            except Exception as e:
                logger.warning(f"⚠️ 音频合并异常，使用原始视频: {str(e)}")
                final_video_path = output_video_path
        
        # 返回成功响应
        response_data = {
            'success': True,
            'message': '视频渲染和合成成功',
            'video_path': final_video_path,
            'resolution': actual_resolution,
            'segment_count': len(mp4_files),
            'has_audio': audio_path and os.path.exists(audio_path)
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"❌ 视频合成失败: {str(e)}")
        error_response = {
            'success': False,
            'error': str(e),
            'message': '视频合成失败'
        }
        
        return jsonify(error_response), 500

@app.route('/rendered_videos/<filename>')
def serve_rendered_video(filename):
    return send_from_directory('rendered_videos', filename)

@app.route('/api/merge_audio_video', methods=['POST'])
def merge_audio_video():
    try:
        data = request.get_json()
        video_path = data.get('video_path')
        audio_path = data.get('audio_path')
        
        if not video_path or not audio_path:
            return jsonify({'success': False, 'error': '缺少视频或音频文件路径'}), 400
        
        if not os.path.exists(video_path):
            return jsonify({'success': False, 'error': f'视频文件不存在: {video_path}'}), 400
        
        if not os.path.exists(audio_path):
            return jsonify({'success': False, 'error': f'音频文件不存在: {audio_path}'}), 400
        
        logger.info(f"🎵 开始合并音频和视频...")
        logger.info(f"📹 视频文件: {video_path}")
        logger.info(f"🎤 音频文件: {audio_path}")
        
        # 生成带音频的最终视频文件名
        timestamp = int(time.time() * 1000)
        video_name = os.path.splitext(os.path.basename(video_path))[0]
        final_video_path = os.path.join("rendered_videos", f"{video_name}_with_audio_{timestamp}.mp4")
        
        # 使用ffmpeg合并音频和视频
        merge_cmd = [
            'ffmpeg', '-y',
            '-i', video_path,
            '-i', audio_path,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-shortest',
            '-map', '0:v:0',
            '-map', '1:a:0',
            final_video_path
        ]
        
        logger.info(f"🔧 执行音频合并命令: {' '.join(merge_cmd)}")
        
        merge_result = subprocess.run(merge_cmd, capture_output=True, text=True, timeout=300)
        
        if merge_result.returncode == 0 and os.path.exists(final_video_path):
            logger.info(f"✅ 音频合并成功: {final_video_path}")
            
            # 检查文件大小
            file_size = os.path.getsize(final_video_path)
            logger.info(f"📊 最终视频文件大小: {file_size} 字节")
            
            return jsonify({
                'success': True,
                'message': '音频视频合并成功',
                'final_video_path': final_video_path,
                'file_size': file_size
            }), 200
        else:
            logger.error(f"❌ 音频合并失败: {merge_result.stderr}")
            return jsonify({
                'success': False,
                'error': f'音频合并失败: {merge_result.stderr}'
            }), 500
            
    except Exception as e:
        logger.error(f"❌ 音频合并异常: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'音频合并异常: {str(e)}'
        }), 500

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'manim-api-server'})

if __name__ == '__main__':
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    logger.info(f"启动Manim API服务器，输出目录: {OUTPUT_DIR}")
    app.run(host='0.0.0.0', port=5001) 