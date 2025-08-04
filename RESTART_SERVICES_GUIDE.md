# Restart Services Guide

To ensure the subtitle fixes work properly, restart the services:

## 1. Stop All Services
```bash
# Stop any existing processes
pkill -f "real_manim_video_server_v2.py"
pkill -f "kimi_api_server.js"
pkill -f "tts_api_server.js"
pkill -f "audio_video_merger"
```

## 2. Start Services in Order

### Option A: Use the Ultra Start Script (Recommended)
```bash
./start_services_ultra.sh
```

### Option B: Start Individually
```bash
# 1. Start KIMI API proxy (port 3001)
node kimi_api_server.js &

# 2. Start TTS service (port 3002)
node tts_api_server.js &

# 3. Start Audio-Video merger (port 5002)
node audio_video_merger_5002.js &

# 4. Start Manim server (port 5006)
./start_manim_server.sh
```

## 3. Start Frontend
```bash
npm run dev
```

## 4. Verify Services
Check that all services are running:
```bash
curl http://localhost:3001/health
curl http://localhost:3002/health  
curl http://localhost:5002/health
curl http://localhost:5006/health
```

All should return healthy status.

## 5. Test Video Generation
Try generating a video with a question like:
- "举例说明什么是一元二次方程？"
- "What is the area of a triangle with base 8 and height 6?"

The generated video should now include subtitles at the bottom!