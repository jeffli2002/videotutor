// TTS服务模块 - 根据问题类型生成不同的语音内容
import { QuestionAnalyzer } from './questionAnalyzer.js'

export class TTSService {
  constructor() {
    this.questionAnalyzer = new QuestionAnalyzer()
    this.config = {
      tts: {
        endpoint: 'http://localhost:8003/tts'
      }
    }
  }

  // 根据问题类型生成相应的TTS内容
  async generateVoiceover(question, solution, script, language = 'zh') {
    const analysis = this.questionAnalyzer.analyzeQuestionType(question)
    
    if (analysis.isConcreteProblem) {
      return this.generateConcreteProblemVoiceover(question, solution, script, language, analysis)
    } else if (analysis.isTheoreticalQuestion) {
      return this.generateTheoreticalQuestionVoiceover(question, solution, script, language, analysis)
    } else {
      return this.generateMixedVoiceover(question, solution, script, language, analysis)
    }
  }

  // 生成具体求解问题的语音
  async generateConcreteProblemVoiceover(question, solution, script, language, analysis) {
    console.log('🎤 生成具体求解问题语音...')
    
    try {
      // 构建语音脚本
      const voiceScript = this.buildConcreteProblemVoiceScript(script, language)
      
      // 调用TTS服务
      const response = await fetch(this.config.tts.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: voiceScript,
          language: language,
          voice: language === 'zh' ? 'zh-CN-XiaoxiaoNeural' : 'en-US-AriaNeural',
          speed: 0.9,
          pitch: 0,
          volume: 1.0
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.audio_path) {
        console.log('✅ 具体问题语音生成成功:', result.audio_path)
        return {
          audioPath: result.audio_path,
          duration: this.calculateAudioDuration(voiceScript, language),
          script: voiceScript,
          type: 'concrete_problem'
        }
      } else {
        console.warn('❌ 具体问题语音生成失败:', result.error)
        return this.generateFallbackVoiceover(script, language)
      }
      
    } catch (error) {
      console.error('❌ 具体问题语音生成异常:', error)
      return this.generateFallbackVoiceover(script, language)
    }
  }

  // 生成理论解释问题的语音
  async generateTheoreticalQuestionVoiceover(question, solution, script, language, analysis) {
    console.log('🎤 生成理论解释问题语音...')
    
    try {
      // 构建语音脚本
      const voiceScript = this.buildTheoreticalQuestionVoiceScript(script, language)
      
      // 调用TTS服务
      const response = await fetch(this.config.tts.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: voiceScript,
          language: language,
          voice: language === 'zh' ? 'zh-CN-XiaoxiaoNeural' : 'en-US-AriaNeural',
          speed: 0.85, // 理论解释稍微慢一点
          pitch: 0,
          volume: 1.0
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.audio_path) {
        console.log('✅ 理论问题语音生成成功:', result.audio_path)
        return {
          audioPath: result.audio_path,
          duration: this.calculateAudioDuration(voiceScript, language),
          script: voiceScript,
          type: 'theoretical_question'
        }
      } else {
        console.warn('❌ 理论问题语音生成失败:', result.error)
        return this.generateFallbackVoiceover(script, language)
      }
      
    } catch (error) {
      console.error('❌ 理论问题语音生成异常:', error)
      return this.generateFallbackVoiceover(script, language)
    }
  }

  // 生成混合类型问题的语音
  async generateMixedVoiceover(question, solution, script, language, analysis) {
    console.log('🎤 生成混合类型问题语音...')
    
    // 根据问题内容动态选择语音类型
    if (question.includes('拉窗帘') || question.includes('原理')) {
      return this.generateTheoreticalQuestionVoiceover(question, solution, script, language, analysis)
    } else {
      return this.generateConcreteProblemVoiceover(question, solution, script, language, analysis)
    }
  }

  // 构建具体问题的语音脚本
  buildConcreteProblemVoiceScript(script, language) {
    let voiceScript = ''
    
    script.pages.forEach((page, index) => {
      if (index === 0) {
        // 问题介绍
        voiceScript += `${page.text}。`
      } else if (index === script.pages.length - 1) {
        // 验证总结
        voiceScript += `${page.text}。`
      } else {
        // 解题步骤
        voiceScript += `第${index}步，${page.text}。`
      }
      
      // 添加停顿
      if (index < script.pages.length - 1) {
        voiceScript += ' '
      }
    })
    
    return voiceScript
  }

  // 构建理论问题的语音脚本
  buildTheoreticalQuestionVoiceScript(script, language) {
    let voiceScript = ''
    
    script.pages.forEach((page, index) => {
      if (index === 0) {
        // 概念介绍
        voiceScript += `${page.text}。`
      } else if (index === script.pages.length - 2) {
        // 实例演示
        voiceScript += `${page.text}。`
      } else if (index === script.pages.length - 1) {
        // 总结
        voiceScript += `${page.text}。`
      } else {
        // 概念解释
        voiceScript += `接下来，${page.text}。`
      }
      
      // 添加停顿
      if (index < script.pages.length - 1) {
        voiceScript += ' '
      }
    })
    
    return voiceScript
  }

  // 计算音频时长
  calculateAudioDuration(text, language) {
    // 根据文本长度和语言估算时长
    const wordsPerMinute = language === 'zh' ? 200 : 150
    const words = text.split(/\s+/).length
    const minutes = words / wordsPerMinute
    return Math.ceil(minutes * 60) // 返回秒数
  }

  // 生成备用语音（当TTS服务失败时）
  generateFallbackVoiceover(script, language) {
    console.log('📊 生成备用语音...')
    
    const voiceScript = this.buildConcreteProblemVoiceScript(script, language)
    
    return {
      audioPath: null,
      duration: this.calculateAudioDuration(voiceScript, language),
      script: voiceScript,
      type: 'fallback'
    }
  }

  // 处理数学术语
  processMathTerms(text, language) {
    if (language === 'zh') {
      return text
        .replace(/\*/g, '乘以')
        .replace(/\//g, '除以')
        .replace(/\+/g, '加')
        .replace(/-/g, '减')
        .replace(/=/g, '等于')
        .replace(/\^/g, '的')
        .replace(/sqrt/g, '根号')
        .replace(/pi/g, 'π')
    } else {
      return text
        .replace(/\*/g, ' times ')
        .replace(/\//g, ' divided by ')
        .replace(/\+/g, ' plus ')
        .replace(/-/g, ' minus ')
        .replace(/=/g, ' equals ')
        .replace(/\^/g, ' to the power of ')
        .replace(/sqrt/g, 'square root of ')
    }
  }

  // 构建SSML脚本（用于更精细的语音控制）
  buildSSMLScript(text, voice, language) {
    const processedText = this.processMathTerms(text, language)
    
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language === 'zh' ? 'zh-CN' : 'en-US'}">
  <voice name="${voice}">
    <prosody rate="0.9" pitch="0">
      ${processedText}
    </prosody>
  </voice>
</speak>`
  }
} 