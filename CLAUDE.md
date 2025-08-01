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

## 9. BEFORE YOU START CODING

1. Read PRODUCT_TECHNICAL_FLOW_ASCII.md completely
2. Understand the service architecture
3. Check which services need to be running
4. Verify you're using the correct ports
5. Plan error handling and fallbacks

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

## 11. TESTING YOUR CHANGES

```bash
# Run these tests after making changes
node test_video_tts_sync_fix.js    # Test video-audio sync
node verify_relative_paths.js       # Verify no absolute paths
node test_complete_video_generation.js  # Test full pipeline

# Test FFmpeg wrapper
./ffmpeg -version                   # Should show Windows FFmpeg version
```

---

**REMEMBER**: When in doubt, refer to PRODUCT_TECHNICAL_FLOW_ASCII.md. It is the single source of truth for this project's implementation.