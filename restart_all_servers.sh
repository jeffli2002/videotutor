#!/bin/bash

echo "🛑 Stopping all servers..."

# Kill existing processes
echo "Stopping Vite dev server..."
pkill -f "vite" 2>/dev/null || true

echo "Stopping KIMI API server..."
pkill -f "kimi_api_server" 2>/dev/null || true

echo "Stopping TTS server..."
pkill -f "tts_api_server" 2>/dev/null || true

echo "Stopping Audio-Video merger..."
pkill -f "audio_video_merger" 2>/dev/null || true

echo "Stopping Manim servers..."
pkill -f "manim.*server" 2>/dev/null || true

# Wait for processes to die
sleep 2

echo "✅ All servers stopped"
echo ""
echo "🚀 Starting all servers..."

# Start all servers
echo "Starting KIMI API server on port 3001..."
node kimi_api_server.js > logs/kimi_api_server.log 2>&1 &

echo "Starting TTS server on port 3002..."
node tts_api_server.js > logs/tts_api_server.log 2>&1 &

echo "Starting Audio-Video merger on port 5002..."
node audio_video_merger_5002.js > logs/audio_video_merger.log 2>&1 &

echo "Starting Manim server v2 on port 5006..."
python real_manim_video_server_v2.py > logs/manim_server_v2.log 2>&1 &

# Start Vite last so we can see its output
echo "Starting Vite dev server on port 5173..."
npm run dev

echo ""
echo "✅ All servers should be running!"
echo ""
echo "Server URLs:"
echo "- Frontend: http://localhost:5173"
echo "- KIMI API: http://localhost:3001"
echo "- TTS API: http://localhost:3002"
echo "- Audio-Video Merger: http://localhost:5002"
echo "- Manim v2: http://localhost:5006"