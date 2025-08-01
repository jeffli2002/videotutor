# Path Handling Rules for VideoTutor

## CRITICAL: Path Format Consistency

### The Golden Rule
**ALL paths passed between services MUST start with `/rendered_videos/`**

### Examples

#### ✅ CORRECT Path Formats
```javascript
// From TTS service
{ audio_url: '/rendered_videos/tts_123456.mp3' }

// From Manim service
{ video_path: '/rendered_videos/ai_solution_123456.mp4' }

// To Merger service
{
  video_path: '/rendered_videos/ai_solution_123456.mp4',
  audio_path: '/rendered_videos/tts_123456.mp3'
}

// Final merged video
{ final_video_path: '/rendered_videos/merged_123456.mp4' }
```

#### ❌ INCORRECT Path Formats
```javascript
// Missing leading slash
{ audio_url: 'rendered_videos/tts_123456.mp3' }  // WRONG!

// Removing leading slash
audioPath = audioPath.slice(1)  // NEVER DO THIS!

// Including 'public' in path
{ video_path: 'public/rendered_videos/video.mp4' }  // WRONG!
```

## Path Normalization Function

Use this function to ensure paths are always correct:

```javascript
function ensureCorrectPath(path) {
  if (!path) return null;
  
  // Already correct
  if (path.startsWith('/rendered_videos/')) {
    return path;
  }
  
  // Missing leading slash
  if (path.startsWith('rendered_videos/')) {
    return '/' + path;
  }
  
  // Extract filename and rebuild path
  const filename = path.split('/').pop();
  return `/rendered_videos/${filename}`;
}
```

## Service-Specific Rules

### 1. TTS Service (tts_api_server.js)
- Returns: `{ audio_url: '/rendered_videos/tts_*.mp3' }`
- Physical location: `public/rendered_videos/tts_*.mp3`

### 2. Manim Service (real_manim_video_server_v2.py)
- Returns: `{ video_path: '/rendered_videos/ai_solution_*.mp4' }`
- Physical location: `public/rendered_videos/ai_solution_*.mp4`

### 3. Merger Service (audio_video_merger_5002.js)
- Expects input paths WITH leading slash
- Returns: `{ final_video_path: '/rendered_videos/merged_*.mp4' }`
- Physical location: `public/rendered_videos/merged_*.mp4`

### 4. Frontend (VideoGenerationDemo.jsx)
- Uses paths directly: `<source src="/rendered_videos/video.mp4" />`
- Vite serves `public/` at root, so URLs work correctly

## Common Issues and Fixes

### Issue 1: Video fails to load
**Symptom**: "❌ 视频加载失败"
**Cause**: Path missing leading slash
**Fix**: Ensure all paths start with `/rendered_videos/`

### Issue 2: Merger can't find files
**Symptom**: "File not found" in merger logs
**Cause**: Inconsistent path format between services
**Fix**: Use `ensureCorrectPath()` function before passing to merger

### Issue 3: 404 errors in browser
**Symptom**: Video element shows 404
**Cause**: Wrong URL format or 'public' included in path
**Fix**: URL must be exactly `/rendered_videos/filename.mp4`

## Implementation Checklist

When working with paths:
- [ ] Service returns paths with leading slash
- [ ] Never remove leading slash with `.slice(1)`
- [ ] Use path normalization before passing between services
- [ ] Frontend URLs start with `/rendered_videos/`
- [ ] Physical files go to `public/rendered_videos/`
- [ ] No 'public' in URL paths

## Testing Path Correctness

```javascript
// Quick test in console
const testPaths = [
  'rendered_videos/video.mp4',           // Should add leading /
  '/rendered_videos/video.mp4',          // Should stay as-is
  'public/rendered_videos/video.mp4',    // Should extract filename
  '/public/rendered_videos/video.mp4',   // Should extract filename
];

testPaths.forEach(path => {
  console.log(`${path} → ${ensureCorrectPath(path)}`);
});
```

Expected output:
```
rendered_videos/video.mp4 → /rendered_videos/video.mp4
/rendered_videos/video.mp4 → /rendered_videos/video.mp4
public/rendered_videos/video.mp4 → /rendered_videos/video.mp4
/public/rendered_videos/video.mp4 → /rendered_videos/video.mp4
```

**Remember**: Consistency is key. All services must follow these rules for the system to work correctly.