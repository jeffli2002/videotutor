# 🔧 Manim渲染修复指南

## 📋 已修复的问题

### ✅ 主要问题和解决方案

1. **视频文件路径问题**
   - **问题**: Manim输出的视频文件路径是嵌套的 `media/videos/{name}/2160p60/{name}.mp4`，而API服务器期望的是 `media/videos/{name}.mp4`
   - **修复**: 更新了 `manim_api_server.py` 中的路径查找逻辑，支持多种可能的输出路径
   - **代码改进**: 添加了多路径检查机制

2. **错误处理不足**
   - **问题**: 原始代码缺乏详细的错误信息和日志记录
   - **修复**: 添加了完整的日志记录和错误捕获
   - **改进**: 增加了健康检查端点 `/health`

3. **文件清理问题**
   - **问题**: 临时脚本文件没有被清理
   - **修复**: 添加了自动清理机制
   - **改进**: 更好的资源管理

## 🚀 修复后的功能

### 新增功能
- ✅ **智能路径检测**: 自动查找manim生成的视频文件
- ✅ **详细日志记录**: 完整的渲染过程日志
- ✅ **健康检查**: `/health` 端点用于服务状态检查
- ✅ **错误详情**: 返回详细的错误信息
- ✅ **资源清理**: 自动清理临时文件

### 支持的视频质量
- 🎥 **2160p60** (4K, 60fps) - 默认高质量
- 🎥 **1080p60** (1080p, 60fps) - 备选高质量
- 🎥 **720p30** (720p, 30fps) - 备选标准质量

## 📖 使用指南

### 1. 启动Manim API服务器

```bash
# 启动服务器
python manim_api_server.py

# 服务器将在以下地址运行：
# http://localhost:5001
```

### 2. 测试API连接

```bash
# 运行健康检查
curl http://localhost:5001/health

# 期望响应:
# {"status": "healthy", "service": "manim-api-server"}
```

### 3. 运行完整测试

```bash
# 运行修复验证测试
python test_manim_fix.py

# 运行简单测试
python test_manim_api_simple.py
```

### 4. API使用示例

```javascript
// 前端调用示例
const response = await fetch('http://localhost:5001/api/manim_render', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    script: manimPythonCode,
    output_name: 'my_video',
    scene_name: 'MyScene'
  })
});

const result = await response.json();
if (result.success) {
  console.log('视频URL:', result.video_url);
} else {
  console.error('渲染失败:', result.error);
}
```

## 🛠️ 故障排除

### 常见问题

#### 1. 端口占用错误
```bash
# 症状: OSError: [WinError 10048]
# 解决方案:
netstat -ano | findstr :5001
taskkill /PID <进程ID> /F
```

#### 2. Manim未找到
```bash
# 症状: "Manim未安装或未在PATH中"
# 解决方案:
pip install manim
# 或
conda install -c conda-forge manim
```

#### 3. 视频生成失败
- 检查Python脚本语法
- 验证场景名称是否正确
- 确认manim版本兼容性

#### 4. 连接失败
```bash
# 确保服务器正在运行
python manim_api_server.py

# 检查防火墙设置
# 确认端口5001未被阻止
```

### 日志分析

服务器启动时会显示：
```
INFO:__main__:启动Manim API服务器，输出目录: rendered_videos
INFO:__main__:开始渲染视频: test_video, 场景: TestScene
INFO:__main__:脚本已保存: test_video.py
INFO:__main__:开始执行manim渲染...
INFO:__main__:Manim渲染成功: [manim输出]
INFO:__main__:找到生成的视频: media/videos/test_video/2160p60/test_video.mp4
INFO:__main__:视频已移动到: rendered_videos/test_video.mp4
INFO:__main__:临时脚本已清理: test_video.py
```

## 📁 文件结构

```
VideoTutor/
├── manim_api_server.py          # 修复后的API服务器
├── test_manim_fix.py           # 完整测试脚本
├── test_manim_api_simple.py    # 简单测试脚本
├── rendered_videos/            # 输出视频目录
│   ├── demo1.mp4
│   ├── test_simple.mp4
│   └── test_fix.mp4
└── media/                      # Manim临时文件
    └── videos/
        ├── demo1/
        ├── test_simple/
        └── test_fix/
```

## 🔧 维护建议

### 定期清理
```bash
# 清理临时media文件 (保留rendered_videos)
rm -rf media/videos/*
```

### 性能优化
- 使用适当的视频质量设置
- 定期清理临时文件
- 监控磁盘空间使用

### 监控
- 检查API响应时间
- 监控内存使用
- 记录错误频率

## 📊 测试结果

最新测试结果：
- ✅ 健康检查通过
- ✅ 简单视频生成成功
- ✅ 复杂数学动画生成成功
- ✅ 文件正确移动到输出目录
- ✅ 临时文件正确清理

## 🎉 修复完成！

Manim渲染系统现在已经完全修复并优化。所有已知问题都已解决，系统可以稳定运行。如果遇到新问题，请参考故障排除部分或查看日志获取详细信息。 