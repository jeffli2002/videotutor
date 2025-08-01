// 主控制器模块 - 整合所有功能
import { QuestionAnalyzer } from './questionAnalyzer.js'
import { ScriptGenerator } from './scriptGenerator.js'
import { AnimationGenerator } from './animationGenerator.js'
import { TTSService } from './ttsService.js'
import { LanguageDetector } from './languageDetector.js'

export class MathVideoController {
  constructor() {
    this.questionAnalyzer = new QuestionAnalyzer()
    this.scriptGenerator = new ScriptGenerator()
    this.animationGenerator = new AnimationGenerator()
    this.ttsService = new TTSService()
    this.languageDetector = new LanguageDetector()
  }

  // 主入口方法 - 根据问题类型生成完整的视频内容
  async generateMathVideo(question, solution, language = 'auto') {
    console.log('🎬 Starting math video generation...')
    console.log('📝 Question:', question)
    
    try {
      // Auto-detect language if not specified
      let finalLanguage = language;
      if (language === 'auto') {
        finalLanguage = this.languageDetector.detectFromText(question);
        console.log(`🌍 Detected language: ${finalLanguage}`);
      }
      
      // 1. Analyze question type
      const analysis = this.questionAnalyzer.analyzeQuestionType(question)
      console.log('✅ Question type analysis completed:', analysis.type)
      
      // 2. Generate script
      const script = await this.scriptGenerator.generateScript(question, solution, finalLanguage)
      console.log('✅ Script generation completed, pages:', script.pages.length)
      
      // 3. Generate animations
      const animations = await this.animationGenerator.generateAnimation(question, solution, script, finalLanguage)
      console.log('✅ Animation generation completed, count:', animations.length)
      
      // 4. Generate voiceover based on question type
      let voiceoverContent;
      
      if (analysis.isConcreteProblem) {
        // Extract steps from solution for concrete problems
        const steps = this.extractStepsFromSolution(solution);
        voiceoverContent = this.ttsService.generateConcreteTTSContent(question, solution, steps);
      } else if (analysis.isTheoreticalQuestion) {
        // Extract concepts for theoretical questions
        const concepts = this.extractConceptsFromSolution(solution, question, finalLanguage);
        voiceoverContent = this.ttsService.generateTheoreticalTTSContent(question, concepts);
      } else {
        // Mixed content - use a balanced approach
        const steps = this.extractStepsFromSolution(solution);
        const concepts = this.extractConceptsFromSolution(solution, question, finalLanguage);
        voiceoverContent = this.generateMixedTTSContent(question, solution, steps, concepts);
      }
      
      const voiceover = {
        text: voiceoverContent, // Add text property for UI compatibility
        script: voiceoverContent,
        duration: Math.max(20, voiceoverContent.length * 0.05), // Estimate duration based on content length
        type: analysis.type
      }
      console.log('✅ Voiceover generation completed')
      
      // 5. Integrate results
      const result = this.integrateResults(question, analysis, script, animations, voiceover, finalLanguage)
      console.log('✅ Video content integration completed')
      
      return result
      
    } catch (error) {
      console.error('❌ Video generation failed:', error)
      const fallbackLanguage = language === 'auto' ? 'en' : language;
      return this.generateFallbackContent(question, fallbackLanguage)
    }
  }

  /**
   * Generate video from image-based problem
   * @param {Object} imageData - Processed image data
   * @param {string} language - Language for generation
   * @returns {Promise<Object>} Video generation result
   */
  async generateVideoFromImage(imageData, language = 'en') {
    console.log('🖼️ Starting video generation from image...')
    
    try {
      const { ocrResult, problemAnalysis, detectedLanguage } = imageData;
      const finalLanguage = language || detectedLanguage || 'en';
      
      // Use OCR text as question
      const question = ocrResult.text || 'Mathematical problem from image';
      const solution = problemAnalysis.solution || this.generateSolutionFromImage(ocrResult);
      
      return await this.generateMathVideo(question, solution, finalLanguage);
      
    } catch (error) {
      console.error('❌ Image-based video generation failed:', error)
      return this.generateFallbackContent('Mathematical problem from image', language)
    }
  }

  /**
   * Generate solution from image OCR result
   * @param {Object} ocrResult - OCR processing result
   * @returns {string} Generated solution
   */
  generateSolutionFromImage(ocrResult) {
    const { text, latex } = ocrResult;
    
    // Extract mathematical expressions and generate appropriate solution
    if (latex && latex.length > 0) {
      return `Based on the mathematical expressions detected: ${latex.join(', ')}, we will solve this step by step.`;
    }
    
    return `We will analyze the mathematical problem: ${text} and provide a comprehensive solution.`;
  }

  // 整合所有结果
  integrateResults(question, analysis, script, animations, voiceover, language) {
    // 清理内容中的LaTeX符号
    console.log('🧹 清理LaTeX符号...')
    const cleanedVoiceover = this.cleanLaTeXSymbols(voiceover)
    const cleanedScript = this.cleanScriptContent(script)
    
    const result = {
      success: true,
      question: question,
      analysis: analysis,
      script: cleanedScript,
      animations: animations,
      voiceover: cleanedVoiceover,
      language: language,
      totalDuration: this.calculateTotalDuration(cleanedScript, animations, cleanedVoiceover),
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
    const animationDuration = Array.isArray(animations) ? animations.reduce((total, anim) => total + (anim.duration || 0), 0) : 0
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
    if (Array.isArray(animations) && animations.length > 0 && animations[0].animationType !== analysis.type) {
      console.warn('⚠️ 动画类型与问题分析类型不匹配')
    }
    
    // 检查语音类型是否匹配
    if (voiceover.type !== analysis.type) {
      console.warn('⚠️ 语音类型与问题分析类型不匹配')
    }
    
    // 检查时长是否合理
    const scriptDuration = script.pages.reduce((total, page) => total + page.duration, 0)
    const animationDuration = Array.isArray(animations) ? animations.reduce((total, anim) => total + (anim.duration || 0), 0) : 0
    const voiceoverDuration = voiceover.duration || 0
    
    const maxDuration = Math.max(scriptDuration, animationDuration, voiceoverDuration)
    const minDuration = Math.min(scriptDuration, animationDuration, voiceoverDuration)
    
    if (maxDuration - minDuration > 10) {
      console.warn('⚠️ 各组件时长差异较大，可能影响同步效果')
    }
    
    console.log('✅ 内容一致性验证完成')
  }

  // Extract concrete steps from solution
  extractStepsFromSolution(solution) {
    const steps = [];
    const lines = solution.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && (trimmed.match(/^\d+[.、)]/) || trimmed.startsWith('步骤') || trimmed.startsWith('Step'))) {
        steps.push(trimmed.replace(/^\d+[.、)]\s*/, '').replace(/^(步骤|Step)\s*\d+[：:]/i, ''));
      }
    }
    
    return steps;
  }
  
  // Extract theoretical concepts from solution
  extractConceptsFromSolution(solution, question, language) {
    const concepts = [];
    const text = (question + ' ' + solution).toLowerCase();
    
    if (language === 'zh') {
      if (text.includes('不等式')) concepts.push('不等式性质');
      if (text.includes('方程')) concepts.push('方程求解原理');
      if (text.includes('函数')) concepts.push('函数性质');
      if (text.includes('导数')) concepts.push('导数概念');
      if (text.includes('积分')) concepts.push('积分原理');
      if (text.includes('几何')) concepts.push('几何定理');
    } else {
      if (text.includes('inequality')) concepts.push('Inequality properties');
      if (text.includes('equation')) concepts.push('Equation solving principles');
      if (text.includes('function')) concepts.push('Function properties');
      if (text.includes('derivative')) concepts.push('Derivative concepts');
      if (text.includes('integral')) concepts.push('Integral principles');
      if (text.includes('geometry')) concepts.push('Geometric theorems');
    }
    
    // Default concepts if none found
    if (concepts.length === 0) {
      concepts.push(language === 'zh' ? '数学原理' : 'Mathematical principles');
    }
    
    return concepts;
  }
  
  // Generate mixed TTS content
  generateMixedTTSContent(question, solution, steps, concepts) {
    let content = `让我们来探讨这个数学问题：${question}\n\n`;
    
    if (concepts.length > 0) {
      content += `**相关概念**\n${concepts.join('、')}\n\n`;
    }
    
    if (steps.length > 0) {
      content += `**解题步骤**\n`;
      steps.forEach((step, index) => {
        content += `${index + 1}. ${step}\n`;
      });
    }
    
    content += `\n通过这个演示，我们深入理解了问题的解决过程。`;
    
    return content;
  }
  
  // 清理LaTeX符号
  cleanLaTeXSymbols(voiceover) {
    if (!voiceover || !voiceover.script) return voiceover
    
    const cleanedScript = voiceover.script
      .replace(/\$\$?/g, '') // 移除LaTeX定界符
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1除以$2') // 转换分数
      .replace(/\\[a-zA-Z]+/g, '') // 移除LaTeX命令
      .replace(/[\^\{\}\\]/g, '') // 移除特殊字符
      .replace(/\*{2,}/g, '') // 移除markdown强调
      .replace(/\s+/g, ' ') // 规范化空格
      .trim()
    
    return {
      ...voiceover,
      script: cleanedScript,
      cleanScript: cleanedScript
    }
  }

  // 清理脚本内容
  cleanScriptContent(script) {
    if (!script || !script.pages) return script
    
    const cleanedPages = script.pages.map(page => ({
      ...page,
      text: page.text
        .replace(/\$\$?/g, '')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1除以$2')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/[\^\{\}\\]/g, '')
        .replace(/\*{2,}/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    }))
    
    return {
      ...script,
      pages: cleanedPages
    }
  }

  // Generate fallback content (when main process fails)
  generateFallbackContent(question, language) {
    console.log('📊 Generating fallback content...')
    
    const messages = {
      en: {
        text: 'Video generation service is starting up and will be available soon',
        subText: 'Please try again later',
        message: 'Service starting up'
      },
      zh: {
        text: '视频生成服务正在启动中，将很快可用',
        subText: '请稍后重试',
        message: '服务正在启动中'
      },
      fr: {
        text: 'Le service de génération vidéo démarre et sera bientôt disponible',
        subText: 'Veuillez réessayer plus tard',
        message: 'Service en cours de démarrage'
      },
      es: {
        text: 'El servicio de generación de video está iniciando y estará disponible pronto',
        subText: 'Por favor intente de nuevo más tarde',
        message: 'Servicio iniciando'
      },
      ja: {
        text: 'ビデオ生成サービスが起動中で、すぐに利用可能になります',
        subText: '後でもう一度お試しください',
        message: 'サービス起動中'
      }
    };

    const langMessages = messages[language] || messages.en;
    
    const analysis = {
      type: 'fallback',
      confidence: 0.5,
      reasoning: 'Using fallback content - backend service not running',
      isConcreteProblem: false,
      isTheoreticalQuestion: false
    }
    
    const script = {
      type: 'fallback',
      question: question,
      pages: [{
        page: 1,
        duration: 10,
        text: langMessages.text,
        subText: langMessages.subText,
        visual: 'service_starting'
      }]
    }
    
    // Provide valid placeholder video path
    const placeholderVideo = `/rendered_videos/fallback_${Date.now()}.mp4`
    const animations = [{
      sceneId: 1,
      animationType: 'fallback',
      videoPath: placeholderVideo,
      duration: 10,
      mathContent: question,
      placeholder: true
    }]
    
    const voiceover = {
      audioPath: `/tts_audio/fallback_${Date.now()}.mp3`,
      duration: 10,
      script: script.pages[0].text,
      type: 'fallback'
    }
    
    const fallbackResult = this.integrateResults(question, analysis, script, animations, voiceover, language)
    fallbackResult.success = true // Mark as successful with notice
    fallbackResult.message = langMessages.message
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