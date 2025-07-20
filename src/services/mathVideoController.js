// 主控制器模块 - 整合所有功能
import { QuestionAnalyzer } from './questionAnalyzer.js'
import { ScriptGenerator } from './scriptGenerator.js'
import { AnimationGenerator } from './animationGenerator.js'
import { TTSService } from './ttsService.js'

export class MathVideoController {
  constructor() {
    this.questionAnalyzer = new QuestionAnalyzer()
    this.scriptGenerator = new ScriptGenerator()
    this.animationGenerator = new AnimationGenerator()
    this.ttsService = new TTSService()
  }

  // 主入口方法 - 根据问题类型生成完整的视频内容
  async generateMathVideo(question, solution, language = 'zh') {
    console.log('🎬 开始生成数学视频...')
    console.log('📝 问题:', question)
    
    try {
      // 1. 分析问题类型
      const analysis = this.questionAnalyzer.analyzeQuestionType(question)
      console.log('✅ 问题类型分析完成:', analysis.type)
      
      // 2. 生成脚本
      const script = await this.scriptGenerator.generateScript(question, solution, language)
      console.log('✅ 脚本生成完成，页数:', script.pages.length)
      
      // 3. 生成动画
      const animations = await this.animationGenerator.generateAnimation(question, solution, script, language)
      console.log('✅ 动画生成完成，数量:', animations.length)
      
      // 4. 生成语音
      const voiceover = await this.ttsService.generateVoiceover(question, solution, script, language)
      console.log('✅ 语音生成完成')
      
      // 5. 整合结果
      const result = this.integrateResults(question, analysis, script, animations, voiceover, language)
      console.log('✅ 视频内容整合完成')
      
      return result
      
    } catch (error) {
      console.error('❌ 视频生成失败:', error)
      return this.generateFallbackContent(question, language)
    }
  }

  // 整合所有结果
  integrateResults(question, analysis, script, animations, voiceover, language) {
    const result = {
      success: true, // 添加success字段
      question: question,
      analysis: analysis,
      script: script,
      animations: animations,
      voiceover: voiceover,
      language: language,
      totalDuration: this.calculateTotalDuration(script, animations, voiceover),
      type: analysis.type,
      timestamp: new Date().toISOString()
    }
    
    // 验证内容一致性
    this.validateContentConsistency(result)
    
    return result
  }

  // 计算总时长
  calculateTotalDuration(script, animations, voiceover) {
    const scriptDuration = script.pages.reduce((total, page) => total + page.duration, 0)
    const animationDuration = animations.reduce((total, anim) => total + (anim.duration || 0), 0)
    const voiceoverDuration = voiceover.duration || 0
    
    // 取最大值作为总时长
    return Math.max(scriptDuration, animationDuration, voiceoverDuration)
  }

  // 验证内容一致性
  validateContentConsistency(result) {
    console.log('🔍 验证内容一致性...')
    
    const { script, animations, voiceover, analysis } = result
    
    // 检查脚本和动画类型是否匹配
    if (script.type !== analysis.type) {
      console.warn('⚠️ 脚本类型与问题分析类型不匹配')
    }
    
    // 检查动画类型是否匹配
    if (animations.length > 0 && animations[0].animationType !== analysis.type) {
      console.warn('⚠️ 动画类型与问题分析类型不匹配')
    }
    
    // 检查语音类型是否匹配
    if (voiceover.type !== analysis.type) {
      console.warn('⚠️ 语音类型与问题分析类型不匹配')
    }
    
    // 检查时长是否合理
    const scriptDuration = script.pages.reduce((total, page) => total + page.duration, 0)
    const animationDuration = animations.reduce((total, anim) => total + (anim.duration || 0), 0)
    const voiceoverDuration = voiceover.duration || 0
    
    const maxDuration = Math.max(scriptDuration, animationDuration, voiceoverDuration)
    const minDuration = Math.min(scriptDuration, animationDuration, voiceoverDuration)
    
    if (maxDuration - minDuration > 10) {
      console.warn('⚠️ 各组件时长差异较大，可能影响同步效果')
    }
    
    console.log('✅ 内容一致性验证完成')
  }

  // 生成备用内容（当主流程失败时）
  generateFallbackContent(question, language) {
    console.log('📊 生成备用内容...')
    
    const analysis = {
      type: 'fallback',
      confidence: 0.5,
      reasoning: '使用备用内容',
      isConcreteProblem: false,
      isTheoreticalQuestion: false
    }
    
    const script = {
      type: 'fallback',
      question: question,
      pages: [{
        page: 1,
        duration: 10,
        text: language === 'zh' ? '抱歉，视频生成遇到问题，请稍后重试' : 'Sorry, video generation encountered an issue, please try again later',
        subText: language === 'zh' ? '备用内容' : 'Fallback content',
        visual: 'error_message'
      }]
    }
    
    const animations = [{
      sceneId: 1,
      animationType: 'fallback',
      videoPath: null,
      duration: 10,
      mathContent: question
    }]
    
    const voiceover = {
      audioPath: null,
      duration: 10,
      script: script.pages[0].text,
      type: 'fallback'
    }
    
    const fallbackResult = this.integrateResults(question, analysis, script, animations, voiceover, language)
    fallbackResult.success = false // 备用内容标记为失败
    return fallbackResult
  }

  // 获取问题类型统计
  getQuestionTypeStats() {
    return {
      concreteProblem: {
        description: '具体求解问题',
        examples: ['解方程：2x + 3 = 7', '计算三角形面积', '求函数导数']
      },
      theoreticalQuestion: {
        description: '理论解释问题',
        examples: ['拉窗帘原理演示', '什么是微积分', '几何变换原理']
      },
      mixed: {
        description: '混合类型问题',
        examples: ['既有具体计算又有概念解释的问题']
      }
    }
  }

  // 测试问题类型分析
  testQuestionAnalysis(questions) {
    console.log('🧪 测试问题类型分析...')
    
    const results = questions.map(question => {
      const analysis = this.questionAnalyzer.analyzeQuestionType(question)
      return {
        question: question,
        analysis: analysis
      }
    })
    
    console.log('📊 测试结果:')
    results.forEach(result => {
      console.log(`问题: ${result.question}`)
      console.log(`类型: ${result.analysis.type}`)
      console.log(`置信度: ${result.analysis.confidence}`)
      console.log(`推理: ${result.analysis.reasoning}`)
      console.log('---')
    })
    
    return results
  }

  // 批量生成视频
  async batchGenerateVideos(questions, solutions, language = 'zh') {
    console.log('🔄 开始批量生成视频...')
    
    const results = []
    
    for (let i = 0; i < questions.length; i++) {
      console.log(`📝 处理第 ${i + 1}/${questions.length} 个问题...`)
      
      try {
        const result = await this.generateMathVideo(questions[i], solutions[i], language)
        results.push(result)
        console.log(`✅ 第 ${i + 1} 个问题处理完成`)
      } catch (error) {
        console.error(`❌ 第 ${i + 1} 个问题处理失败:`, error)
        const fallbackResult = this.generateFallbackContent(questions[i], language)
        results.push(fallbackResult)
      }
      
      // 添加延迟避免服务器过载
      if (i < questions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    console.log('✅ 批量生成完成')
    return results
  }
} 