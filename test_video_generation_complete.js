import { MathVideoController } from './src/services/mathVideoController.js'
import { config } from 'dotenv'

config()

async function testCompleteVideoGeneration() {
  console.log('🧪 Testing complete video generation with steps and TTS...')
  
  const controller = new MathVideoController()
  
  // Test case: Triangle area calculation
  const question = '求底边为8，高为6的三角形面积'
  const solution = `**问题分析**
题目要求我们计算一个三角形的面积，其中：
- 底边长度 = 8
- 高度 = 6

**详细解题步骤**
1. **应用三角形面积公式**
   - 三角形面积公式：A = 底 × 高 ÷ 2
   - 解释：这是计算三角形面积的基本公式

2. **代入已知数值**
   - 将底边 = 8，高 = 6 代入公式
   - A = 8 × 6 ÷ 2

3. **计算乘积**
   - 先计算底边和高的乘积：8 × 6 = 48
   - 中间结果：A = 48 ÷ 2

4. **计算最终结果**
   - 将48除以2：48 ÷ 2 = 24
   - 答案：面积 = 24

**验证**
三角形面积 = 8 × 6 ÷ 2 = 48 ÷ 2 = 24 ✓`

  try {
    console.log('\n📋 测试输入:')
    console.log('问题:', question)
    console.log('解答:', solution.substring(0, 100) + '...')
    
    console.log('\n🚀 开始生成视频...')
    const result = await controller.generateMathVideo(question, solution, 'zh')
    
    console.log('\n✅ 视频生成结果:')
    console.log('- 成功:', result.success)
    console.log('- 问题类型:', result.analysis.type)
    console.log('- 脚本页数:', result.script.pages.length)
    console.log('- 动画数量:', result.animations.length)
    console.log('- 总时长:', result.totalDuration, '秒')
    
    if (result.animations && result.animations[0]) {
      const animation = result.animations[0]
      console.log('\n🎬 动画详情:')
      console.log('- 类型:', animation.animationType)
      console.log('- 视频路径:', animation.videoPath)
      console.log('- 音频路径:', animation.audioPath)
      console.log('- 包含音频:', animation.hasAudio)
      console.log('- 步骤数量:', animation.steps?.length || 0)
      console.log('- TTS内容:', animation.ttsContent ? '已生成' : '未生成')
      
      if (animation.steps && animation.steps.length > 0) {
        console.log('\n📝 生成的步骤:')
        animation.steps.forEach((step, index) => {
          console.log(`${index + 1}. ${step.substring(0, 50)}...`)
        })
      }
    }
    
    console.log('\n📄 脚本内容:')
    result.script.pages.forEach((page, index) => {
      console.log(`页面 ${page.page}: ${page.text.substring(0, 50)}...`)
    })
    
    console.log('\n🎤 语音内容:')
    console.log('- 脚本长度:', result.voiceover.script.length, '字符')
    console.log('- 时长:', result.voiceover.duration, '秒')
    console.log('- 类型:', result.voiceover.type)
    
    console.log('\n✅ 测试完成！')
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error)
    console.error('错误详情:', error.stack)
  }
}

// Run the test
testCompleteVideoGeneration()