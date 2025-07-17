// 修复视频播放问题
import fs from 'fs';
import path from 'path';
import http from 'http';

console.log('🔧 开始修复视频播放问题...');

// 1. 检查当前视频文件
const renderedDir = './rendered_videos';
if (fs.existsSync(renderedDir)) {
  const files = fs.readdirSync(renderedDir);
  console.log(`📁 渲染目录包含 ${files.length} 个文件`);
  
  // 找到最新的视频文件
  const videoFiles = files.filter(file => file.endsWith('.mp4'));
  if (videoFiles.length > 0) {
    const latestVideo = videoFiles[videoFiles.length - 1];
    const videoPath = path.join(renderedDir, latestVideo);
    const stats = fs.statSync(videoPath);
    
    console.log(`🎬 最新视频文件: ${latestVideo}`);
    console.log(`📊 文件大小: ${stats.size} 字节`);
    console.log(`🕒 生成时间: ${stats.mtime.toLocaleString()}`);
    
    // 2. 检查Manim服务器状态
    const checkManimServer = () => {
      return new Promise((resolve) => {
        const req = http.request({
          hostname: 'localhost',
          port: 5001,
          path: '/api/manim_render',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }, (res) => {
          console.log(`✅ Manim服务器状态: ${res.statusCode}`);
          resolve(res.statusCode === 200);
        });
        
        req.on('error', (err) => {
          console.log(`❌ Manim服务器连接失败: ${err.message}`);
          resolve(false);
        });
        
        req.write(JSON.stringify({
          video_id: 'test',
          script: 'from manim import *\n\nclass Test(Scene):\n    def construct(self):\n        self.add(Text("Test"))',
          steps: ['测试']
        }));
        req.end();
      });
    };
    
    checkManimServer().then((serverOk) => {
      if (serverOk) {
        console.log('✅ Manim服务器正常运行');
        console.log('🎯 问题诊断: 前端视频URL构建问题');
        console.log('\n📝 修复建议:');
        console.log('1. 前端应该使用正确的VIDEO_SERVER配置');
        console.log('2. 视频URL应该是: http://localhost:5001/rendered_videos/' + latestVideo);
        console.log('3. 检查前端代码中的VIDEO_SERVER变量');
        
        // 3. 创建测试HTML文件
        const testHtml = `<!DOCTYPE html>
<html>
<head>
    <title>视频播放测试</title>
</head>
<body>
    <h1>视频播放测试</h1>
    <video 
        src="http://localhost:5001/rendered_videos/${latestVideo}" 
        controls 
        width="400"
        onError="console.error('视频加载失败:', event)"
        onLoadedData="console.log('视频加载成功')"
    >
        您的浏览器不支持视频播放
    </video>
    <script>
        console.log('测试视频URL:', 'http://localhost:5001/rendered_videos/${latestVideo}');
    </script>
</body>
</html>`;
        
        fs.writeFileSync('test_video_playback.html', testHtml);
        console.log('\n✅ 已创建测试文件: test_video_playback.html');
        console.log('🌐 请在浏览器中打开此文件测试视频播放');
        
      } else {
        console.log('❌ Manim服务器未运行，请启动服务器');
        console.log('💡 启动命令: python stable_manim_server.py');
      }
    });
  } else {
    console.log('❌ 没有找到MP4视频文件');
  }
} else {
  console.log('❌ 渲染目录不存在');
} 