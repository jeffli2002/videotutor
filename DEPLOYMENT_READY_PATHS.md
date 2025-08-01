# Deployment-Ready Path Configuration

## Overview
All file paths have been converted to relative paths to ensure the application can be deployed in any environment without path issues.

## Changes Made

### 1. TTS Service (`tts_api_server.js`)
- ✅ Audio files saved to: `join(__dirname, 'public', 'rendered_videos')`
- ✅ No hardcoded absolute paths

### 2. Audio-Video Merger (`audio_video_merger_5002.js`)
- ✅ Output directory: `join(__dirname, 'public', 'rendered_videos')`
- ✅ Removed Windows-specific FFmpeg path detection
- ✅ Uses system FFmpeg from PATH
- ✅ Smart path resolution for video/audio inputs

### 3. Manim Servers
#### `real_manim_video_server_v2.py`
- ✅ Base directory: `Path(__file__).parent.absolute()`
- ✅ Dynamic WSL path conversion when needed
- ✅ No hardcoded paths

#### `stable_manim_server.py`
- ✅ Base directory: `Path(__file__).parent.absolute()`
- ✅ Relative media directory lookup
- ✅ Cross-platform path handling

### 4. Frontend
- ✅ Video URLs use `/rendered_videos/` prefix
- ✅ Vite serves `public/rendered_videos/` at this URL
- ✅ No absolute paths in components

## Directory Structure
```
VideoTutor/
├── public/
│   └── rendered_videos/    # All generated content goes here
│       ├── *.mp4          # Video files
│       ├── *.mp3          # TTS audio files
│       └── merged_*.mp4   # Merged video+audio files
├── media/                  # Manim working directory
├── temp/                   # Temporary files
└── src/
    └── services/          # All use relative imports
```

## Deployment Checklist

### Prerequisites
1. **FFmpeg**: Must be installed and available in system PATH
   ```bash
   # Ubuntu/Debian
   sudo apt-get install ffmpeg
   
   # CentOS/RHEL
   sudo yum install ffmpeg
   
   # macOS
   brew install ffmpeg
   ```

2. **Python Dependencies**: For Manim
   ```bash
   pip install manim
   ```

3. **Node.js**: Version 16 or higher

### Environment Variables
Create a `.env` file in production:
```env
# API Keys (if using cloud TTS)
REACT_APP_AZURE_SPEECH_KEY=your_key_here
REACT_APP_AZURE_REGION=eastasia

# Service Ports (optional, defaults shown)
TTS_PROXY_PORT=3002
VITE_PORT=5173

# CORS Origins (update for production)
CORS_ORIGINS=https://yourdomain.com
```

### Service Configuration

1. **Node.js Services** (using PM2):
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start services
   pm2 start tts_api_server.js --name tts-service
   pm2 start audio_video_merger_5002.js --name merger-service
   pm2 start video_static_server.js --name video-server
   
   # Save configuration
   pm2 save
   pm2 startup
   ```

2. **Python Services** (using supervisord):
   ```ini
   [program:manim-server-v2]
   command=python3 real_manim_video_server_v2.py
   directory=/path/to/VideoTutor
   autostart=true
   autorestart=true
   stderr_logfile=/var/log/manim-v2.err.log
   stdout_logfile=/var/log/manim-v2.out.log
   ```

3. **Frontend** (Nginx example):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /path/to/VideoTutor/dist;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /rendered_videos/ {
           alias /path/to/VideoTutor/public/rendered_videos/;
           add_header Cache-Control "public, max-age=3600";
       }
   }
   ```

### Build for Production
```bash
# Install dependencies
npm install

# Build frontend
npm run build

# The dist folder contains the production build
```

### Verify Deployment
1. Check all services are running:
   ```bash
   pm2 status
   supervisorctl status
   ```

2. Test video generation:
   ```bash
   node test_video_tts_sync_fix.js
   ```

3. Verify paths:
   ```bash
   node verify_relative_paths.js
   ```

## Important Notes

1. **No Absolute Paths**: All file operations use relative paths from the service's location
2. **Cross-Platform**: Works on Linux, macOS, and Windows (with WSL)
3. **Docker-Ready**: Can be containerized without path modifications
4. **Cloud-Ready**: Can be deployed to AWS, Azure, GCP without changes

## Troubleshooting

1. **FFmpeg not found**: Ensure FFmpeg is in PATH
2. **Permission denied**: Check write permissions for `public/rendered_videos/`
3. **CORS errors**: Update CORS origins in service configurations
4. **File not found**: Ensure all services are running from the project root