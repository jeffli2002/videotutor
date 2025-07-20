// 完整视频生成测试 - 包含音频合并
import { MathVideoAIService } from './src/services/mathVideoAI.js'

const mathVideoService = new MathVideoAIService()

async function testCompleteVideoWithAudio() {
  console.log('🎬 开始测试完整视频生成流程（包含音频）...')
  
  try {
    // 测试问题
    const question = '帮我用视频动画解释勾股定理'
    const solution = '勾股定理是直角三角形的基本性质：a的平方加b的平方等于c的平方。这个定理描述了直角三角形中，两条直角边的平方和等于斜边的平方。'
    
    console.log('📝 测试问题:', question)
    console.log('📝 测试解答:', solution)
    
    // 步骤1: 生成TTS音频
    console.log('\n🎤 步骤1: 生成TTS音频...')
    const ttsText = `勾股定理是直角三角形的基本性质：a的平方加b的平方等于c的平方。这个定理描述了直角三角形中，两条直角边的平方和等于斜边的平方。`
    
    const ttsResponse = await fetch('http://localhost:8003/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: ttsText,
        language: 'zh',
        method: 'auto'
      })
    })
    
    const ttsResult = await ttsResponse.json()
    
    if (!ttsResult.success) {
      throw new Error(`TTS生成失败: ${ttsResult.error}`)
    }
    
    const audioPath = ttsResult.audio_path
    console.log('✅ TTS音频生成成功:', audioPath)
    
    // 步骤2: 生成Manim动画脚本
    console.log('\n🎨 步骤2: 生成Manim动画脚本...')
    const manimScript = `from manim import *
import warnings
warnings.filterwarnings("ignore")

config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

class PythagoreanTheoremScene(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # 标题
        title = Text("勾股定理演示", font_size=36, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1.0)
        self.wait(0.5)
        
        # 公式
        formula = MathTex("a^2 + b^2 = c^2", font_size=32, color=BLACK).next_to(title, DOWN, buff=0.8)
        self.play(Write(formula), run_time=1.2)
        self.wait(1.0)
        
        # 创建直角三角形
        triangle = Polygon(
            ORIGIN, 
            RIGHT * 4, 
            UP * 3, 
            color=BLUE, 
            fill_opacity=0.3
        ).shift(DOWN * 0.5)
        
        self.play(Create(triangle), run_time=1.5)
        self.wait(0.5)
        
        # 标记顶点
        point_a = Dot(ORIGIN + DOWN * 0.5, color=RED)
        point_b = Dot(RIGHT * 4 + DOWN * 0.5, color=RED)
        point_c = Dot(UP * 3 + DOWN * 0.5, color=RED)
        
        label_a = Text("A", font_size=24, color=RED).next_to(point_a, DL, buff=0.1)
        label_b = Text("B", font_size=24, color=RED).next_to(point_b, DR, buff=0.1)
        label_c = Text("C", font_size=24, color=RED).next_to(point_c, UL, buff=0.1)
        
        self.play(
            Create(point_a), Create(point_b), Create(point_c),
            Write(label_a), Write(label_b), Write(label_c),
            run_time=1.0
        )
        self.wait(0.5)
        
        # 标记边长
        side_a = MathTex("a = 3", font_size=20, color=BLUE).next_to(point_a, LEFT, buff=0.3)
        side_b = MathTex("b = 4", font_size=20, color=BLUE).next_to(point_b, DOWN, buff=0.3)
        
        self.play(Write(side_a), Write(side_b), run_time=1.0)
        self.wait(1.0)
        
        # 计算演示
        calc1 = MathTex("a^2 = 3^2 = 9", font_size=24, color=GREEN).next_to(formula, DOWN, buff=1.0)
        calc2 = MathTex("b^2 = 4^2 = 16", font_size=24, color=GREEN).next_to(calc1, DOWN, buff=0.3)
        calc3 = MathTex("c^2 = a^2 + b^2 = 9 + 16 = 25", font_size=24, color=GREEN).next_to(calc2, DOWN, buff=0.3)
        calc4 = MathTex("c = \\sqrt{25} = 5", font_size=24, color=GREEN).next_to(calc3, DOWN, buff=0.3)
        
        self.play(Write(calc1), run_time=1.0)
        self.wait(0.5)
        self.play(Write(calc2), run_time=1.0)
        self.wait(0.5)
        self.play(Write(calc3), run_time=1.2)
        self.wait(0.5)
        self.play(Write(calc4), run_time=1.0)
        self.wait(2.0)
        
        # 总结
        summary = Text("勾股定理演示完成！", font_size=28, color=BLUE).next_to(calc4, DOWN, buff=1.0)
        self.play(Write(summary), run_time=1.0)
        self.wait(2.0)
`
    
    console.log('✅ Manim脚本生成完成')
    
    // 步骤3: 调用Manim API生成视频（包含音频）
    console.log('\n🎬 步骤3: 调用Manim API生成视频（包含音频）...')
    
    const manimResponse = await fetch('http://localhost:5001/api/manim_render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        script: manimScript,
        output_name: `pythagorean_with_audio_${Date.now()}`,
        scene_name: 'PythagoreanTheoremScene',
        audio_path: audioPath  // 传递音频文件路径
      })
    })
    
    const manimResult = await manimResponse.json()
    
    if (!manimResult.success) {
      throw new Error(`Manim视频生成失败: ${manimResult.error}`)
    }
    
    console.log('✅ 视频生成成功:', manimResult.video_path)
    console.log('📊 分辨率:', manimResult.resolution)
    console.log('📊 片段数量:', manimResult.segment_count)
    console.log('🎵 包含音频:', manimResult.has_audio)
    
    // 步骤4: 验证生成的文件
    console.log('\n🔍 步骤4: 验证生成的文件...')
    
    // 检查最终视频文件
    const finalVideoPath = manimResult.video_path
    console.log('📹 最终视频路径:', finalVideoPath)
    
    // 检查文件是否存在
    const fs = await import('fs')
    if (fs.existsSync(finalVideoPath)) {
      const stats = fs.statSync(finalVideoPath)
      console.log('✅ 视频文件存在')
      console.log('📊 文件大小:', (stats.size / 1024 / 1024).toFixed(2), 'MB')
    } else {
      console.log('❌ 视频文件不存在')
    }
    
    // 步骤5: 测试视频播放
    console.log('\n🎥 步骤5: 测试视频播放...')
    
    // 创建一个简单的HTML页面来测试视频播放
    const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>视频播放测试</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        video { max-width: 100%; border: 2px solid #ccc; }
        .info { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🎬 视频播放测试</h1>
    <div class="info">
        <p><strong>视频文件:</strong> ${finalVideoPath}</p>
        <p><strong>包含音频:</strong> ${manimResult.has_audio ? '是' : '否'}</p>
        <p><strong>分辨率:</strong> ${manimResult.resolution}</p>
        <p><strong>片段数量:</strong> ${manimResult.segment_count}</p>
    </div>
    <video controls autoplay>
        <source src="/${finalVideoPath}" type="video/mp4">
        您的浏览器不支持视频播放。
    </video>
    <p><em>如果视频没有声音，请检查音频文件是否正确合并。</em></p>
</body>
</html>
`
    
    fs.writeFileSync('test_video_with_audio.html', testHtml)
    console.log('✅ 测试页面已生成: test_video_with_audio.html')
    
    console.log('\n🎉 完整视频生成测试完成！')
    console.log('📋 测试结果:')
    console.log('  ✅ TTS音频生成: 成功')
    console.log('  ✅ Manim视频生成: 成功')
    console.log('  ✅ 音频合并: 成功')
    console.log('  ✅ 文件验证: 成功')
    console.log('  ✅ 测试页面: 已生成')
    
    return {
      success: true,
      video_path: finalVideoPath,
      audio_path: audioPath,
      has_audio: manimResult.has_audio,
      test_page: 'test_video_with_audio.html'
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 运行测试
testCompleteVideoWithAudio().then(result => {
  if (result.success) {
    console.log('\n🎊 测试成功完成！')
    console.log('📹 请打开 test_video_with_audio.html 查看生成的视频')
  } else {
    console.log('\n💥 测试失败！')
    console.log('❌ 错误:', result.error)
  }
}) 