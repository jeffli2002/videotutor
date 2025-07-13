// 测试VIDEO_SERVER的值
const VIDEO_SERVER = import.meta.env.VITE_VIDEO_SERVER || 'http://localhost:5001';
console.log('VIDEO_SERVER:', VIDEO_SERVER);
console.log('import.meta.env.VITE_VIDEO_SERVER:', import.meta.env.VITE_VIDEO_SERVER);

// 测试视频URL构建
const videoUrl = '/rendered_videos/qwen_video_1752446361173.mp4';
const fullUrl = `${VIDEO_SERVER}${videoUrl}`;
console.log('构建的完整URL:', fullUrl);

// 测试fetch请求
async function testVideoUrl() {
  try {
    console.log('测试URL:', fullUrl);
    const response = await fetch(fullUrl, { method: 'HEAD' });
    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.error('请求失败:', error);
  }
}

testVideoUrl(); 