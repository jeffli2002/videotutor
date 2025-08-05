# Claude Development Rules for VideoTutor Project

**IMPORTANT**: This is the authoritative development guide for AI assistants working on VideoTutor. Always follow these rules exactly.

## 1. READ THESE DOCUMENTS FIRST

Before making ANY changes to the codebase, you MUST read:

1. **PRODUCT_TECHNICAL_FLOW_ASCII.md** - The complete technical architecture and implementation rules
2. **DEPLOYMENT_READY_PATHS.md** - Path configuration and deployment guidelines
3. **VIDEO_PATH_FIX_SUMMARY.md** - Video path handling specifics
4. **PATH_HANDLING_RULES.md** - CRITICAL path format requirements

## 2. CORE DEVELOPMENT PRINCIPLES

### 2.1 Always Use Relative Paths
```javascript
// ❌ NEVER DO THIS
const videoPath = '/mnt/d/ai/VideoTutor/public/rendered_videos/video.mp4'
const videoPath = 'D:\\ai\\VideoTutor\\public\\rendered_videos\\video.mp4'

// ✅ ALWAYS DO THIS
const videoPath = path.join(__dirname, 'public', 'rendered_videos', 'video.mp4')
const videoUrl = '/rendered_videos/video.mp4'
```

### 2.2 Service Architecture
The project uses a microservices architecture. NEVER combine services:

- **Port 3001**: KIMI API proxy (kimi_api_server.js)
- **Port 3002**: TTS service (tts_api_server.js)
- **Port 5002**: Audio-video merger (audio_video_merger_5002.js)
- **Port 5006**: Manim server v2 (real_manim_video_server_v2.py)
- **Port 5173**: Frontend (Vite)

### 2.3 API Usage
```javascript
// RULE: We use KIMI API, not QWEN or other AIs
const AI_SERVICE = 'http://localhost:3001/api/kimi/chat'

// RULE: Always use the proxy, never call external APIs directly from frontend
// ❌ WRONG: fetch('https://api.moonshot.cn/v1/chat/completions')
// ✅ RIGHT: fetch('http://localhost:3001/api/kimi/chat')
```

## 3. FILE AND DIRECTORY RULES

### 3.1 Output Directory
All generated content MUST go to `public/rendered_videos/`:
- Video files: `public/rendered_videos/*.mp4`
- Audio files: `public/rendered_videos/*.mp3`
- Merged files: `public/rendered_videos/merged_*.mp4`

### 3.2 URL Mapping
```javascript
// Physical file: public/rendered_videos/video.mp4
// URL to access: /rendered_videos/video.mp4
// Vite serves public/ at root, so DON'T include 'public' in URLs

// CRITICAL: All paths passed between services MUST start with /rendered_videos/
// ❌ WRONG: 'rendered_videos/video.mp4' (missing leading slash)
// ✅ RIGHT: '/rendered_videos/video.mp4'
```

## 4. IMPLEMENTATION CHECKLIST

When implementing ANY feature, verify:

- [ ] No absolute paths in code
- [ ] Using correct service ports
- [ ] Following the technical flow in PRODUCT_TECHNICAL_FLOW_ASCII.md
- [ ] Video duration matches audio duration
- [ ] Error handling with fallbacks
- [ ] Proper logging with emoji prefixes
- [ ] Path normalization for video URLs
- [ ] Resource cleanup (temp files)

## 5. VIDEO GENERATION FLOW

```
User Input → Question Analysis → KIMI API → Script Generation → 
→ Parallel: [Manim Video Generation | TTS Audio Generation] →
→ Audio-Video Merge (with duration sync) → Frontend Playback
```

### 5.1 Duration Synchronization
```javascript
// TTS duration estimation (MUST use these rates)
const CHINESE_RATE = 3.5  // characters per second
const ENGLISH_RATE = 5    // characters per second (15 chars = 3 words)

// Video MUST extend to match audio duration
// Use tpad filter in FFmpeg to hold last frame
```

### 5.2 Manim Script Requirements

#### AI-Driven Manim Generation (Preferred Approach)
The system now uses AI to dynamically generate Manim scripts for any math problem:

```javascript
// Located in: src/services/aiDrivenManimGenerator.js
const generator = new AIDrivenManimGenerator();
const script = await generator.generateManimScript(question, solution, duration);
```

**Key Features:**
- **No hardcoded templates** - AI understands the problem and creates appropriate visualizations
- **Universal support** - Handles equations, inequalities, geometry, calculus, etc.
- **Language aware** - Automatically uses SimHei for Chinese, Arial for English
- **Context sensitive** - Creates relevant animations based on problem type

**Implementation Flow:**
1. AI analyzes the question and solution
2. Generates appropriate Manim code with proper objects (MathTex, Text, shapes)
3. Includes step-by-step animations matching the solution
4. Ensures duration matches TTS audio length

#### Legacy Template-Based Approach (Fallback)
```python
def generate_manim_script(question, solution, duration=20):
    # MUST accept duration parameter
    # MUST calculate final wait time
    animation_time = 8  # estimated
    final_wait = max(2, duration - animation_time)
    # MUST include: self.wait(final_wait)
```

## 6. ERROR HANDLING PATTERN

```javascript
// ALWAYS use this pattern for service calls
try {
  result = await primaryService()
} catch (error) {
  console.log(`⚠️ Primary service failed: ${error.message}`)
  try {
    result = await fallbackService()
  } catch (fallbackError) {
    console.log(`❌ Fallback failed: ${fallbackError.message}`)
    result = getDefaultResult()
  }
}
```

## 7. LOGGING STANDARDS

```javascript
console.log('✅ Success: Operation completed')
console.log('⚠️ Warning: Non-critical issue')
console.log('❌ Error: Operation failed')
console.log('🔄 Processing: Operation in progress')
console.log('📁 File: File operation')
console.log('🎬 Video: Video operation')
console.log('🎵 Audio: Audio operation')
console.log('🤖 AI: AI service operation')
```

## 8. COMMON MISTAKES TO AVOID

1. **Adding absolute paths** - Always use relative paths
2. **Forgetting duration sync** - Video must match audio length
3. **Direct API calls** - Always use proxy services
4. **Wrong output directory** - Everything goes to public/rendered_videos/
5. **Including 'public' in URLs** - URLs start with /rendered_videos/
6. **Not reading technical flow** - Always follow PRODUCT_TECHNICAL_FLOW_ASCII.md
7. **Removing leading slash from paths** - NEVER do `path.slice(1)` on /rendered_videos/ paths
8. **Inconsistent path formats** - All service paths must start with /rendered_videos/
9. **Hardcoding problem types** - Use AI-driven Manim generation instead of templates
10. **Creating rigid categorizations** - Let AI understand context dynamically

## 9. BEFORE YOU START CODING

1. Read PRODUCT_TECHNICAL_FLOW_ASCII.md completely
2. Understand the service architecture
3. Check which services need to be running
4. Verify you're using the correct ports
5. Plan error handling and fallbacks
6. Ensure video content separation (math only in video, narration in subtitles)

## 10. FFMPEG HANDLING

### 10.1 FFmpeg Configuration
The project uses Windows FFmpeg through a WSL wrapper for audio-video merging:

```bash
# FFmpeg wrapper location: ./ffmpeg
# Windows FFmpeg: C:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe
```

### 10.2 Path Handling in FFmpeg
```javascript
// The merger service MUST use relative paths
const ffmpegExe = './ffmpeg'; // Relative to project root

// All file paths MUST be relative to project root
const videoPath = 'public/rendered_videos/video.mp4';
const audioPath = 'public/rendered_videos/audio.mp3';
const outputPath = 'public/rendered_videos/merged.mp4';
```

### 10.3 FFmpeg Wrapper Rules
1. **NEVER use absolute paths** in FFmpeg commands
2. **Always use the ./ffmpeg wrapper** - it handles WSL-to-Windows path conversion
3. **Test with relative paths** from the project root
4. **The wrapper automatically converts**:
   - Relative paths → Windows absolute paths
   - WSL paths (/mnt/d/) → Windows paths (D:\)

### 10.4 Directory Symlink
A symlink exists for backward compatibility:
```bash
/mnt/d/ai/VideoTutor/rendered_videos -> /mnt/d/ai/VideoTutor/public/rendered_videos
```
This ensures TTS and video files are in the same location.

## 11. MANIM SERVER RELIABILITY TOOLS

### 11.1 Ultra-Reliable Startup
**ALWAYS use the ultra-reliable startup script for development:**

```bash
# Recommended: Ultra-reliable startup with all checks
./start_services_ultra.sh

# Alternative: Basic startup
./start_manim_server.sh
```

### 11.2 Diagnostic and Monitoring Tools

```bash
# Run comprehensive diagnostic
./manim_server_diagnostic.sh

# Validate environment (development or production)
./validate_environment.sh [development|production]

# Real-time health monitoring dashboard
./health_monitor_dashboard.js

# Auto-recovery monitoring (runs in background)
./manim_server_monitor.sh --daemon

# Check service status
./check_services_status.sh
```

### 11.3 Troubleshooting

**When encountering issues:**
1. First run: `./manim_server_diagnostic.sh`
2. Check logs: `tail -f logs/manim_server.log`
3. Consult: `MANIM_SERVER_TROUBLESHOOTING.md`

**Quick fixes:**
```bash
# Restart specific service
./restart_service.sh [manim|kimi|tts|merger|all]

# Stop all services
./stop_all_services.sh

# Full reset and restart
./manim_server_monitor.sh --restart
```

## 12. MANIM SERVER STARTUP RULES

### 11.1 Development Environment
The Manim server MUST be started with the correct Python virtual environment:

```bash
# ALWAYS use the startup script
./start_manim_server.sh

# OR manually with environment variable
export PYTHON_CMD="/mnt/d/ai/VideoTutor/manim_env/bin/python"
$PYTHON_CMD real_manim_video_server_v2.py
```

### 11.2 Production Deployment
For production, create a systemd service or use a process manager:

```bash
# Production startup script
./start_manim_production.sh

# Environment variables for production
export PYTHON_CMD="/path/to/production/venv/bin/python"
export MANIM_PORT=5006
```

### 11.3 Virtual Environment Requirements
- **CRITICAL**: The server MUST use a Python environment with Manim installed
- The server automatically checks in this order:
  1. `manim_wsl_env/bin/python` (WSL environment with Manim pre-installed)
  2. `manim_env/bin/python` (fallback environment)
  3. System Python (if environment variable PYTHON_CMD is set)
- Always verify Manim is accessible: `$PYTHON_CMD -m manim --version`
- **Note**: The `manim_wsl_env` is the recommended environment as it has all dependencies properly installed

### 11.4 Common Issues
- **500 Errors**: Usually means Manim module not found - check Python environment
- **Port conflicts**: Kill existing processes with `pkill -f real_manim_video_server_v2.py`
- **Module not found**: Ensure virtual environment is activated or PYTHON_CMD is set

## 12. CHINESE FONT REQUIREMENTS

### 12.1 Font Installation is MANDATORY
The Manim server **REQUIRES** Chinese fonts to be installed for proper video generation. Without these fonts, videos will fall back to simple templates instead of rich content.

### 12.2 Quick Setup
```bash
# For development (WSL/Ubuntu)
./setup_chinese_fonts.sh

# Alternative: Local user installation (no sudo required)
./setup_fonts_local.sh
```

### 12.3 Required Fonts
The system needs at least one of these fonts:
- **SimHei** (黑体) - Primary choice
- **Noto Sans CJK SC** - Recommended fallback
- **Microsoft YaHei** (微软雅黑) - Windows font
- **WenQuanYi Micro Hei** - Open source alternative

### 12.4 Verification
```bash
# Check if fonts are installed
fc-list | grep -i "simhei\|noto.*cjk\|yahei"

# Test Manim with Chinese text
export PYTHON_CMD="/mnt/d/ai/VideoTutor/manim_wsl_env/bin/python"
$PYTHON_CMD test_chinese_font.py
```

### 12.5 Production Deployment
For Docker/Production environments, add to Dockerfile:
```dockerfile
RUN apt-get update && apt-get install -y \
    fontconfig \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*
```

### 12.6 Troubleshooting
- **Symptom**: Videos are only ~62KB (simple fallback)
- **Cause**: Missing Chinese fonts
- **Solution**: Install fonts and restart Manim server

See `SIMHEI_FONT_INSTALLATION.md` for detailed installation guide.

## 13. VIDEO CONTENT AND SUBTITLE RULES

### 13.1 Content Separation Principle
**CRITICAL**: Narrative text must NEVER appear as visual elements in the video.

```javascript
// ❌ WRONG - Narrative text in video
Text("首先，我们需要将不等式中的常数项移到右边", font="SimHei")

// ✅ RIGHT - Only mathematical expressions in video
MathTex("3x - 7 > 141", color=BLACK)
MathTex("3x > 141 + 7", color=BLACK)
MathTex("3x > 148", color=BLACK)
```

### 13.2 Subtitle Implementation
```javascript
// All narration goes to subtitles
const subtitleGen = new SubtitleGenerator();
const subtitles = subtitleGen.generateSubtitleData(ttsText, steps, duration);

// Subtitle features:
// - WebVTT format for browser compatibility
// - Synchronized with TTS audio timing
// - Clean text without escape characters (\, {, })
// - White background with dark text for readability
```

### 13.3 Video Player Configuration
```jsx
// Subtitle overlay styling
style={{
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: '#333',
  fontSize: '14px',
  fontFamily: '"Microsoft YaHei", Arial, sans-serif',
  bottom: '50px',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
}}
```

### 13.4 Complete Content Display
- **Video**: Show ALL mathematical expressions for each step
- **Audio**: Full narration with step descriptions
- **Subtitles**: Synchronized text matching audio exactly

## 14. TESTING YOUR CHANGES

```bash
# Run these tests after making changes
node test_video_tts_sync_fix.js    # Test video-audio sync
node verify_relative_paths.js       # Verify no absolute paths
node test_complete_video_generation.js  # Test full pipeline
node test_subtitle_integration.js   # Test subtitle generation

# Test FFmpeg wrapper
./ffmpeg -version                   # Should show Windows FFmpeg version

# Test Manim server
curl http://localhost:5006/health   # Should return healthy status

# Test Chinese font support
fc-list | grep -i simhei            # Should show SimHei font
```

---

**REMEMBER**: When in doubt, refer to PRODUCT_TECHNICAL_FLOW_ASCII.md. It is the single source of truth for this project's implementation.