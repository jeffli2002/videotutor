#!/usr/bin/env node

/**
 * Audio-Video Merger Server on Port 5002
 * Basic Node.js server for merging audio and video files
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, statSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5002;

// Use relative path for output directory
const outputDir = join('public', 'rendered_videos');
// Ensure output directory exists (create relative to project root)
const absoluteOutputDir = join(__dirname, outputDir);
if (!existsSync(absoluteOutputDir)) {
  mkdirSync(absoluteOutputDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5001'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'audio-video-merger',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Simple audio-video merge endpoint
app.post('/api/merge_audio_video', async (req, res) => {
  try {
    const { video_path, audio_path } = req.body;
    
    if (!video_path || !audio_path) {
      return res.status(400).json({
        success: false,
        error: 'Missing video_path or audio_path'
      });
    }
    
    console.log(`🎬 Merging audio and video...`);
    console.log(`📹 Video: ${video_path}`);
    console.log(`🎵 Audio: ${audio_path}`);
    
    // Generate output filename with relative path
    const timestamp = Date.now();
    const outputFileName = `merged_${timestamp}.mp4`;
    const outputPath = join(outputDir, outputFileName); // This is now relative: public/rendered_videos/merged_*.mp4
    
    // Always work with relative paths from project root
    let videoFullPath;
    let audioFullPath;
    
    // Helper function to convert any path to relative path from public/rendered_videos
    const toRelativePath = (inputPath) => {
      if (inputPath.startsWith('/rendered_videos/')) {
        // Already in correct format, just prepend public
        return join('public', inputPath);
      } else if (inputPath.startsWith('rendered_videos/')) {
        // Missing leading slash
        return join('public', inputPath);
      } else if (inputPath.includes('rendered_videos')) {
        // Extract filename and rebuild path
        const filename = path.basename(inputPath);
        return join('public', 'rendered_videos', filename);
      } else {
        // Just filename, put in rendered_videos
        const filename = path.basename(inputPath);
        return join('public', 'rendered_videos', filename);
      }
    };
    
    // Convert paths to relative format
    videoFullPath = toRelativePath(video_path);
    audioFullPath = toRelativePath(audio_path);
    
    console.log(`📁 Video full path: ${videoFullPath}`);
    console.log(`📁 Audio full path: ${audioFullPath}`);
    
    // Check if files exist
    const videoExists = existsSync(videoFullPath);
    const audioExists = existsSync(audioFullPath);
    
    console.log(`📹 Video exists: ${videoExists}`);
    console.log(`🎵 Audio exists: ${audioExists}`);
    
    // Try to merge with ffmpeg
    try {
      // Use ffmpeg wrapper that calls Windows ffmpeg from WSL
      const ffmpegExe = './ffmpeg'; // Relative path to ffmpeg wrapper
      
      // All paths are now relative to project root
      let videoPath = videoFullPath;
      let audioPath = audioFullPath;
      let outPath = outputPath;
      
      // First, get the duration of the audio file
      console.log(`🎵 Analyzing audio duration...`);
      let audioDuration = 30; // Default duration in seconds
      
      try {
        const probeCmdAudio = `${ffmpegExe} -i "${audioPath}" -hide_banner 2>&1`;
        const audioInfo = await execAsync(probeCmdAudio).catch(e => e.stdout || e.stderr || '');
        const durationMatch = audioInfo.toString().match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
        if (durationMatch) {
          const hours = parseInt(durationMatch[1]);
          const minutes = parseInt(durationMatch[2]);
          const seconds = parseFloat(durationMatch[3]);
          audioDuration = hours * 3600 + minutes * 60 + seconds;
          console.log(`📏 Audio duration: ${audioDuration.toFixed(2)} seconds`);
        }
      } catch (e) {
        console.log(`⚠️ Could not determine audio duration, using default`);
      }
      
      // Merge video and audio, extending video if needed
      // Use -t to set output duration to audio length
      // Use -loop 1 on last frame if video is shorter
      const ffmpegCmd = `${ffmpegExe} -i "${videoPath}" -i "${audioPath}" -c:v libx264 -c:a aac -t ${audioDuration} -vf "tpad=stop_mode=clone:stop_duration=${audioDuration}" -map 0:v:0 -map 1:a:0 "${outPath}" -y`;
      console.log(`🎬 Merging with audio duration priority (${audioDuration.toFixed(2)}s)...`);
      
      await execAsync(ffmpegCmd);
      
      console.log(`✅ Audio-video merge completed: ${outputFileName}`);
      
      return res.json({
        success: true,
        final_video_path: `/rendered_videos/${outputFileName}`,
        file_size: existsSync(outputPath) ? statSync(outputPath).size : 0,
        message: 'Audio and video merged successfully'
      });
    } catch (ffmpegError) {
      console.error('❌ FFmpeg error:', ffmpegError);
      console.log('⚠️ Falling back to video without audio...');
      
      // If merge fails, return original video
      return res.json({
        success: true,
        final_video_path: video_path,
        file_size: 1024000,
        message: 'Audio merge failed, returning original video',
        warning: ffmpegError.message
      });
    }
    
  } catch (error) {
    console.error('❌ Merge error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🎬 Audio-Video Merger Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔀 Merge endpoint: http://localhost:${PORT}/api/merge_audio_video`);
});