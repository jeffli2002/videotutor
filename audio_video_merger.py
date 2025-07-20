#!/usr/bin/env python3
"""
音频视频合并服务 - 将生成的视频和TTS音频合并成带声音的最终视频
"""

import os
import subprocess
import logging
import time
from pathlib import Path

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioVideoMerger:
    def __init__(self):
        self.output_dir = "rendered_videos"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def merge_audio_video(self, video_path, audio_path, output_name=None):
        """
        合并视频和音频文件
        
        Args:
            video_path (str): 视频文件路径
            audio_path (str): 音频文件路径
            output_name (str): 输出文件名（可选）
        
        Returns:
            dict: 合并结果
        """
        try:
            # 检查输入文件是否存在
            if not os.path.exists(video_path):
                raise FileNotFoundError(f"视频文件不存在: {video_path}")
            
            if not os.path.exists(audio_path):
                raise FileNotFoundError(f"音频文件不存在: {audio_path}")
            
            # 生成输出文件名
            if not output_name:
                timestamp = int(time.time() * 1000)
                output_name = f"merged_video_{timestamp}"
            
            output_path = os.path.join(self.output_dir, f"{output_name}.mp4")
            
            logger.info(f"🎬 开始合并音频视频...")
            logger.info(f"📹 视频文件: {video_path}")
            logger.info(f"🎵 音频文件: {audio_path}")
            logger.info(f"📁 输出文件: {output_path}")
            
            # 使用ffmpeg合并音频和视频
            cmd = [
                'ffmpeg', '-y',  # 覆盖输出文件
                '-i', video_path,  # 输入视频
                '-i', audio_path,  # 输入音频
                '-c:v', 'copy',  # 复制视频流（不重新编码）
                '-c:a', 'aac',  # 音频编码为AAC
                '-shortest',  # 以最短的流为准
                '-map', '0:v:0',  # 映射第一个输入的视频流
                '-map', '1:a:0',  # 映射第二个输入的音频流
                output_path
            ]
            
            logger.info(f"🔧 执行ffmpeg命令: {' '.join(cmd)}")
            
            # 执行ffmpeg命令
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                logger.error(f"❌ ffmpeg合并失败: {result.stderr}")
                raise Exception(f"ffmpeg合并失败: {result.stderr}")
            
            # 检查输出文件是否生成
            if not os.path.exists(output_path):
                raise Exception("合并后的视频文件未生成")
            
            # 获取文件大小
            file_size = os.path.getsize(output_path)
            logger.info(f"✅ 音频视频合并成功: {output_path}")
            logger.info(f"📊 文件大小: {file_size / 1024 / 1024:.2f} MB")
            
            return {
                'success': True,
                'output_path': output_path,
                'output_url': f'/rendered_videos/{os.path.basename(output_path)}',
                'file_size': file_size,
                'message': '音频视频合并成功'
            }
            
        except Exception as e:
            logger.error(f"❌ 音频视频合并失败: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': '音频视频合并失败'
            }
    
    def check_ffmpeg(self):
        """检查ffmpeg是否可用"""
        try:
            result = subprocess.run(['ffmpeg', '-version'], 
                                  capture_output=True, timeout=5)
            return result.returncode == 0
        except:
            return False
    
    def get_video_duration(self, video_path):
        """获取视频时长"""
        try:
            cmd = [
                'ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                '-of', 'csv=p=0', video_path
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                return float(result.stdout.strip())
            return None
        except:
            return None
    
    def get_audio_duration(self, audio_path):
        """获取音频时长"""
        try:
            cmd = [
                'ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                '-of', 'csv=p=0', audio_path
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                return float(result.stdout.strip())
            return None
        except:
            return None

# 测试函数
def test_audio_video_merger():
    """测试音频视频合并功能"""
    print("🧪 测试音频视频合并功能...")
    
    merger = AudioVideoMerger()
    
    # 检查ffmpeg
    if not merger.check_ffmpeg():
        print("❌ ffmpeg不可用，无法测试合并功能")
        return False
    
    # 查找测试文件
    video_files = list(Path("rendered_videos").glob("*.mp4"))
    audio_files = list(Path("rendered_videos").glob("*.mp3"))
    
    if not video_files:
        print("❌ 未找到测试视频文件")
        return False
    
    if not audio_files:
        print("❌ 未找到测试音频文件")
        return False
    
    # 选择最新的文件进行测试
    video_path = str(video_files[-1])
    audio_path = str(audio_files[-1])
    
    print(f"📹 测试视频: {video_path}")
    print(f"🎵 测试音频: {audio_path}")
    
    # 执行合并
    result = merger.merge_audio_video(video_path, audio_path, "test_merged")
    
    if result['success']:
        print(f"✅ 合并成功: {result['output_path']}")
        
        # 检查时长
        video_duration = merger.get_video_duration(video_path)
        audio_duration = merger.get_audio_duration(audio_path)
        merged_duration = merger.get_video_duration(result['output_path'])
        
        print(f"📊 视频时长: {video_duration:.2f}秒")
        print(f"📊 音频时长: {audio_duration:.2f}秒")
        print(f"📊 合并后时长: {merged_duration:.2f}秒")
        
        return True
    else:
        print(f"❌ 合并失败: {result['error']}")
        return False

if __name__ == "__main__":
    test_audio_video_merger() 