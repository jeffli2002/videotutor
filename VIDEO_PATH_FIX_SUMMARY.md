# Video Path Configuration Summary

## Overview
This document explains how video paths are configured in the VideoTutor application after fixing the synchronization issues.

## Directory Structure
```
VideoTutor/
├── public/
│   └── rendered_videos/     # All videos (generated and merged) are stored here
├── rendered_videos/         # OLD location (deprecated) - TTS was saving here
└── src/
    └── components/
        └── VideoGenerationDemo.jsx  # Main component handling video playback
```

## Path Configuration

### 1. Video Generation Services
- **Manim Server** (`real_manim_video_server_v2.py`): Saves to `public/rendered_videos/`
- **TTS Service** (`tts_api_server.js`): Now saves to `public/rendered_videos/` (was `rendered_videos/`)
- **Merge Service** (`audio_video_merger_5002.js`): Saves merged videos to `public/rendered_videos/`

### 2. Frontend Video URLs
All video URLs should use the format: `/rendered_videos/filename.mp4`

- Vite automatically serves files from `public/` directory at the root
- So `public/rendered_videos/video.mp4` is accessible at `/rendered_videos/video.mp4`

### 3. Video Element Usage
```jsx
<video controls>
  <source src="/rendered_videos/video.mp4" type="video/mp4" />
</video>
```

## Fixed Issues

### 1. Path Inconsistency
- **Problem**: TTS files were saved to `rendered_videos/` while videos were in `public/rendered_videos/`
- **Solution**: Updated TTS service to save to `public/rendered_videos/`

### 2. Video Duration
- **Problem**: Videos were cut short when TTS audio was longer
- **Solution**: 
  - Removed `-shortest` flag from ffmpeg command
  - Added duration detection for audio files
  - Extended video with last frame if audio is longer

### 3. URL Format
- **Problem**: Inconsistent URL formats in frontend
- **Solution**: Standardized all video URLs to use `/rendered_videos/` prefix

## Testing

To test the video path configuration:

1. Open `http://localhost:5173/test_video_path.html` in your browser
2. This test page will:
   - Test if videos can be loaded from `/rendered_videos/`
   - Try to find and play available videos
   - Show the correct path format

## Service Ports
- Frontend (Vite): 5173
- TTS Service: 3002
- Video Static Server: 5004 (optional, for production)
- Manim Server v2: 5006
- Audio-Video Merger: 5002

## Important Notes

1. All new videos should be saved to `public/rendered_videos/`
2. Frontend should always use URLs starting with `/rendered_videos/`
3. The video will now play for the full duration of the TTS audio
4. Script generator estimates TTS duration more accurately (3.5 chars/sec for Chinese)