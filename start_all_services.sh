#!/bin/bash

echo "🚀 Starting all VideoTutor services..."
echo "===================================="

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$1 "; then
        return 0
    else
        return 1
    fi
}

# Kill existing processes
echo "🔄 Stopping any existing services..."
pkill -f "vite" 2>/dev/null
pkill -f "kimi_api_server" 2>/dev/null
pkill -f "real_manim_video_server" 2>/dev/null
pkill -f "tts_api_server" 2>/dev/null
pkill -f "node.*3001" 2>/dev/null
pkill -f "python.*5001" 2>/dev/null
pkill -f "node.*8003" 2>/dev/null
sleep 2

# Clear caches
echo "🧹 Clearing caches..."
rm -rf node_modules/.vite 2>/dev/null

# Start Frontend Dev Server
echo ""
echo "1️⃣ Starting Frontend Dev Server (Port 5173)..."
npm run dev &
FRONTEND_PID=$!
sleep 5

# Start KIMI API Proxy Server
echo ""
echo "2️⃣ Starting KIMI API Proxy Server (Port 3001)..."
if [ -f "kimi_api_server.js" ]; then
    node kimi_api_server.js &
    KIMI_PID=$!
else
    echo "⚠️  kimi_api_server.js not found!"
fi
sleep 3

# Start Manim Server
echo ""
echo "3️⃣ Starting Manim Server (Port 5006)..."
if [ -f "real_manim_video_server_v2.py" ]; then
    python3 real_manim_video_server_v2.py &
    MANIM_PID=$!
elif [ -f "real_manim_video_server.py" ]; then
    python3 real_manim_video_server.py &
    MANIM_PID=$!
elif [ -f "unicode_safe_manim_server_simple.py" ]; then
    python3 unicode_safe_manim_server_simple.py &
    MANIM_PID=$!
elif [ -f "unicode_safe_manim_server.py" ]; then
    python unicode_safe_manim_server.py &
    MANIM_PID=$!
elif [ -f "final_manim_server.py" ]; then
    python final_manim_server.py &
    MANIM_PID=$!
else
    echo "⚠️  No Manim server found!"
fi
sleep 3

# Start TTS Server
echo ""
echo "4️⃣ Starting TTS Server (Port 8003)..."
if [ -f "tts_api_server.js" ]; then
    node tts_api_server.js &
    TTS_PID=$!
else
    echo "⚠️  tts_api_server.js not found!"
fi
sleep 3

# Check services status
echo ""
echo "===================================="
echo "📊 Service Status Check:"
echo "===================================="

if check_port 5173; then
    echo "✅ Frontend Dev Server: Running on http://localhost:5173"
else
    echo "❌ Frontend Dev Server: Not running"
fi

if check_port 3001; then
    echo "✅ KIMI API Proxy: Running on http://localhost:3001"
else
    echo "❌ KIMI API Proxy: Not running"
fi

if check_port 5006; then
    echo "✅ Manim Server: Running on http://localhost:5006"
elif check_port 5001; then
    echo "✅ Manim Server: Running on http://localhost:5001 (legacy)"
else
    echo "⚠️  Manim Server: Not running (optional for chatbot)"
fi

if check_port 8003; then
    echo "✅ TTS Server: Running on http://localhost:8003"
else
    echo "⚠️  TTS Server: Not running (optional for chatbot)"
fi

echo ""
echo "===================================="
echo "🎯 Quick Access Links:"
echo "===================================="
echo "📱 Chatbot: http://localhost:5173/#/chatbot"
echo "🎬 Video Demo: http://localhost:5173/#/video-demo"
echo "🏠 Home: http://localhost:5173/"
echo ""
echo "💡 Tips:"
echo "- Use Incognito/Private mode to avoid cache issues"
echo "- Clear browser cache if you see old debug messages"
echo "- Press Ctrl+C to stop all services"
echo ""
echo "🟢 All services started! Keeping them running..."
echo "Press Ctrl+C to stop all services."

# Wait and keep services running
wait