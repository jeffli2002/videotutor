# 🎬 VideoTutor Technical Architecture & Implementation Rules
## Project Rule Document for AI Assistants (Claude)

---

## 1. Project Overview

VideoTutor is an AI-powered math education platform that automatically generates teaching videos with synchronized animations and narration. This document serves as the authoritative technical specification and implementation guide.

**IMPORTANT**: This document defines the canonical technical flow. All implementations must follow these specifications exactly.

---

## 2. Technical Flow (ASCII Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Input (Math Problem)                    │
│  Examples: "Calculate triangle area", "Solve 3x-7>14"          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│               Frontend: VideoGenerationDemo.jsx                  │
│  • Rate limiting: 10 videos/hour                                │
│  • Input validation & sanitization                              │
│  • Authentication check (Supabase)                              │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│           Step 1: Question Analysis (questionAnalyzer.js)        │
│  • analyzeQuestionType() → concrete/theoretical/mixed           │
│  • Language detection (zh/en)                                   │
│  • Mathematical content extraction                              │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              Step 2: AI Solution (KIMI API)                      │
│  • Endpoint: http://localhost:3001/api/kimi/chat               │
│  • Local proxy server (kimi_api_server.js)                     │
│  • Returns: Structured solution with steps                     │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│         Step 3: Script Generation (scriptGenerator.js)           │
│  • Generate pages with timed content                            │
│  • Duration calculation: zh=3.5 chars/sec, en=15 chars/3 words │
│  • Output: {pages: [{text, duration, visual}]}                 │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│       Step 4: Animation Generation (animationGenerator.js)       │
│  • Build Manim script with waterfall effects                   │
│  • Dynamic content positioning                                  │
│  • Total duration passed to Manim server                       │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────────┐ ┌─────────────────────────────┐
│   Step 5A: Video Generation      │ │   Step 5B: TTS Generation    │
│  • Server: real_manim_video      │ │  • Server: tts_api_server.js │
│    _server_v2.py (port 5006)    │ │    (port 3002)               │
│  • Duration-aware rendering      │ │  • Azure TTS primary         │
│  • Output: /rendered_videos/     │ │  • Output: /rendered_videos/  │
└─────────────────────────────────┘ └─────────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│            Step 6: Audio-Video Merge (Port 5002)                │
│  • audio_video_merger_5002.js                                  │
│  • Extends video to match audio duration                        │
│  • Uses tpad filter for last frame extension                   │
│  • Output: public/rendered_videos/merged_*.mp4                 │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              Step 7: Database Storage (Supabase)                 │
│  • Store video metadata and paths                              │
│  • Track user generation history                               │
│  • Enable video sharing and retrieval                          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Step 8: Frontend Playback                     │
│  • Video element with controls                                 │
│  • Progress tracking and replay                                │
│  • Download functionality                                       │
│  • URL: /rendered_videos/filename.mp4                          │
│  • Note: Files in public/rendered_videos/ → served at /rendered_videos/ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Critical Implementation Rules

### 3.1 File Path Rules
```
RULE: All file paths MUST be relative. NO absolute paths allowed.

✅ CORRECT:
- path.join(__dirname, 'public', 'rendered_videos')
- Path(__file__).parent.absolute()
- /rendered_videos/video.mp4 (URL)

❌ INCORRECT:
- /mnt/d/ai/VideoTutor/...
- D:\\ai\\VideoTutor\\...
- C:/Users/...
```

### 3.2 Directory Structure
```
VideoTutor/
├── public/
│   └── rendered_videos/        # ALL generated content goes here
│       ├── *.mp4              # Video files
│       ├── *.mp3              # TTS audio files
│       └── merged_*.mp4       # Final merged videos
├── media/                      # Manim working directory
├── temp/                       # Temporary files (auto-cleaned)
└── src/
    └── services/              # Core service modules
```

**PATH MAPPING CLARIFICATION:**
- Physical location: `public/rendered_videos/video.mp4`
- URL to access: `/rendered_videos/video.mp4`
- Vite automatically serves `public/` directory at root URL
- Example: `public/rendered_videos/merged_123.mp4` → `http://localhost:5173/rendered_videos/merged_123.mp4`

### 3.3 Service Ports & Endpoints
```javascript
// RULE: Use these exact ports and endpoints
const SERVICES = {
  frontend: 5173,              // Vite dev server
  kimi: 3001,                 // KIMI API proxy server
  tts: 3002,                  // TTS API server
  manim_v2: 5006,             // Real Manim server v2
  merger: 5002,               // Audio-video merger
  video_static: 5004,         // Static video server (optional)
}

// RULE: Service communication pattern
const API_PATTERN = {
  kimi: 'http://localhost:3001/api/kimi/chat',
  tts: 'http://localhost:3002/api/tts/generate',
  manim: 'http://localhost:5006/render',
  merge: 'http://localhost:5002/api/merge_audio_video'
}
```

### 3.4 Video Generation Rules
```python
# RULE: Manim scripts MUST include duration parameter
def generate_manim_script(question, solution, duration=20):
    # Calculate wait time
    animation_time = 8  # Estimated animation duration
    final_wait = max(2, duration - animation_time)
    
    # MUST include self.wait(final_wait) at end
    script += f"self.wait({final_wait})"
```

### 3.5 TTS Duration Estimation
```javascript
// RULE: Use these exact character/word rates
const TTS_RATES = {
  zh: 3.5,    // Chinese characters per second
  en: 15/3    // English: 15 chars per 3 words per second
}

// Calculate duration
const duration = language === 'zh' 
  ? Math.max(5, Math.ceil(text.length / TTS_RATES.zh))
  : Math.max(5, Math.ceil(text.length / TTS_RATES.en))
```

### 3.6 Audio-Video Synchronization
```bash
# RULE: Audio duration takes priority
# Video MUST extend to match audio length

# Correct FFmpeg command pattern:
ffmpeg -i video.mp4 -i audio.mp3 \
  -c:v libx264 -c:a aac \
  -t ${audioDuration} \
  -vf "tpad=stop_mode=clone:stop_duration=${audioDuration}" \
  -map 0:v:0 -map 1:a:0 \
  output.mp4 -y
```

---

## 4. Error Handling Rules

### 4.1 Service Failures
```javascript
// RULE: Always implement fallback chains
try {
  // Primary service
  result = await primaryService()
} catch (error) {
  console.log(`⚠️ Primary failed: ${error.message}`)
  try {
    // Fallback service
    result = await fallbackService()
  } catch (fallbackError) {
    // Final fallback
    result = getDefaultResult()
  }
}
```

### 4.2 Path Handling
```javascript
// RULE: Always normalize paths
function normalizeVideoPath(path) {
  if (!path) return null
  
  // Ensure path starts with /rendered_videos/
  if (!path.startsWith('/rendered_videos/')) {
    if (path.startsWith('rendered_videos/')) {
      return '/' + path  // Add missing leading slash
    }
    const filename = path.split('/').pop()
    return `/rendered_videos/${filename}`
  }
  
  return path
}

// CRITICAL: When passing paths between services
// - ALWAYS include leading slash: /rendered_videos/video.mp4
// - NEVER remove leading slash from paths
// - TTS service returns: /rendered_videos/audio.mp3
// - Manim service returns: /rendered_videos/video.mp4
// - Merger expects both paths with leading slash
```

---

## 5. Frontend Integration Rules

### 5.1 Video URL Construction
```jsx
// RULE: Video URLs must follow this pattern
const videoUrl = (() => {
  const path = result.video?.url || result.video?.videoUrl
  
  // Vite serves public/rendered_videos/ as /rendered_videos/
  if (path && path.startsWith('/rendered_videos/')) {
    return path  // Use as-is
  }
  
  // Fix incorrect paths
  return normalizeVideoPath(path)
})()

// IMPORTANT: Path mapping in Vite
// - Files saved to: public/rendered_videos/video.mp4
// - Accessed via: /rendered_videos/video.mp4
// - Do NOT include 'public' in the URL path
```

### 5.2 Component State Management
```jsx
// RULE: Track these states for video generation
const [isGenerating, setIsGenerating] = useState(false)
const [progress, setProgress] = useState(0)
const [result, setResult] = useState(null)
const [error, setError] = useState(null)

// Progress stages
const PROGRESS_STAGES = {
  analyzing: 10,
  solving: 30,
  scriptWriting: 40,
  videoGenerating: 60,
  audioGenerating: 70,
  merging: 90,
  complete: 100
}
```

---

## 6. Deployment Rules

### 6.1 Environment Variables
```bash
# RULE: Use .env for configuration
REACT_APP_AZURE_SPEECH_KEY=your_key_here
REACT_APP_AZURE_REGION=eastasia
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 6.2 Build Process
```bash
# RULE: Production build steps
npm install          # Install dependencies
npm run build       # Build frontend
pm2 start ecosystem.config.js  # Start services
```

---

## 7. Testing Rules

### 7.1 Service Health Checks
```javascript
// RULE: Every service MUST have a /health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'service-name',
    port: PORT,
    timestamp: new Date().toISOString()
  })
})
```

### 7.2 Integration Testing
```bash
# RULE: Test complete flow before deployment
node test_video_tts_sync_fix.js
node verify_relative_paths.js
```

---

## 8. Code Style Rules

### 8.1 Logging
```javascript
// RULE: Use emoji prefixes for log levels
console.log('✅ Success message')
console.log('⚠️ Warning message')
console.log('❌ Error message')
console.log('🔄 Processing message')
console.log('📁 File operation')
console.log('🎬 Video operation')
console.log('🎵 Audio operation')
```

### 8.2 Error Messages
```javascript
// RULE: User-facing errors must be helpful
// ❌ BAD: "Error: ENOENT"
// ✅ GOOD: "Video file not found. Please try generating again."
```

---

## 9. Performance Rules

### 9.1 Parallel Processing
```javascript
// RULE: Run independent operations in parallel
const [videoResult, audioResult] = await Promise.all([
  generateVideo(script),
  generateAudio(text)
])
```

### 9.2 Resource Cleanup
```javascript
// RULE: Always clean up temporary files
finally {
  if (tempFile && fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile)
  }
}
```

---

## 10. Security Rules

### 10.1 Input Validation
```javascript
// RULE: Sanitize all user inputs
function sanitizeInput(input) {
  return input
    .trim()
    .replace(/[<>]/g, '')  // Remove potential HTML
    .substring(0, 500)     // Limit length
}
```

### 10.2 API Key Protection
```javascript
// RULE: Never expose API keys in frontend
// Use backend proxy services for all external APIs
```

---

## Implementation Checklist for New Features

When implementing new features, ensure:

- [ ] All paths are relative
- [ ] Error handling with fallbacks
- [ ] Proper logging with emojis
- [ ] Health endpoint if new service
- [ ] Duration synchronization for media
- [ ] Frontend path normalization
- [ ] Resource cleanup
- [ ] Input validation
- [ ] Integration tests
- [ ] Documentation updates

---

**IMPORTANT**: This document is the single source of truth for VideoTutor implementation. All code changes must conform to these rules. When in doubt, refer to this document.