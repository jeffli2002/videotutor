// 动画生成模块 - 根据问题类型生成不同的动画内容
console.log('🚀 AnimationGenerator.js loaded - VERSION 2024.01.31 with str.replace fix')
import { QuestionAnalyzer } from './questionAnalyzer.js'
import { ImprovedManimScriptGenerator } from './improvedManimScriptGenerator.js'
import { AIDrivenManimGenerator } from './aiDrivenManimGenerator.js'
import { SimplifiedManimGenerator } from './simplifiedManimGenerator.js'
import { SubtitledManimGenerator } from './subtitledManimGenerator.js'
import { AdvancedSubtitleManimGenerator } from './advancedSubtitleManimGenerator.js'
import { TTSService } from './ttsService.js'
import { SubtitleGenerator } from './subtitleGenerator.js'
import axios from 'axios';

export class AnimationGenerator {
  constructor() {
    this.questionAnalyzer = new QuestionAnalyzer()
    this.manimScriptGenerator = new ImprovedManimScriptGenerator()
    this.aiDrivenManimGenerator = new AIDrivenManimGenerator()
    this.aiManimGenerator = new AIDrivenManimGenerator()
    this.simplifiedManimGenerator = new SimplifiedManimGenerator()
    this.subtitledManimGenerator = new SubtitledManimGenerator()
    this.advancedSubtitleGenerator = new AdvancedSubtitleManimGenerator()
    this.subtitleGenerator = new SubtitleGenerator()
    this.config = {
      manim: {
        endpoint: '/api/v2/manim/render'  // Use proxied path for real_manim_video_server_v2
      },
      tts: {
        endpoint: 'http://localhost:3002/api/tts/generate'  // Use tts_api_server for TTS
      },
      merger: {
        endpoint: 'http://localhost:5002/api/merge_audio_video'
      }
    }
  }

  // 统一的TTS文本清理函数 - 支持多语言
  cleanTextForTTS(text, language = 'en') {
    if (!text) return '';
    
    // 清理Markdown格式（所有语言通用）
    let cleanedText = text
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markers
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic markers
      .replace(/#{1,6}\s+/g, '') // Remove heading markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/`([^`]+)`/g, '$1') // Remove inline code markers
      .replace(/```[^`]*```/g, '') // Remove code blocks
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove ordered list markers
      .replace(/\$\s*([^$]+)\s*\$/g, '$1') // Remove $ $ 
      .replace(/\\[a-zA-Z]+/g, '') // Remove remaining LaTeX commands
      .replace(/[{}[\]_^|]/g, '') // Remove LaTeX symbols
      .replace(/\\\\/g, '') // Remove double backslashes
      .replace(/\\/g, ''); // Remove all remaining backslashes
    
    // 语言特定的数学符号转换
    const mathTranslations = {
      en: {
        '\\\\frac{([^}]+)}{([^}]+)}': '$1 over $2',
        '\\^2': ' squared',
        '\\^3': ' cubed',
        '\\^([0-9]+)': ' to the power of $1',
        '\\\\times|×': ' times',
        '\\\\div|÷': ' divided by',
        '\\\\sqrt{([^}]+)}': 'square root of $1',
        '√': 'square root of',
        '\\\\leq|≤': ' less than or equal to',
        '\\\\geq|≥': ' greater than or equal to',
        '\\\\neq|≠': ' not equal to',
        '\\\\approx|≈': ' approximately equal to',
        '\\\\pm|±': ' plus or minus',
        '\\+': ' plus',
        '-': ' minus',
        '=': ' equals',
        '<': ' less than',
        '>': ' greater than',
        '\\*': ' times',
        '/': ' divided by',
        '%': ' percent',
        '\\(': ' open parenthesis',
        '\\)': ' close parenthesis',
        '\\[': ' open bracket',
        '\\]': ' close bracket',
        '\\{': ' open brace',
        '\\}': ' close brace',
        '\\\\pi|π': 'pi',
        '\\\\alpha|α': 'alpha',
        '\\\\beta|β': 'beta',
        '\\\\theta|θ': 'theta',
        '\\\\lambda|λ': 'lambda',
        '\\\\Delta|Δ': 'delta',
        '\\\\sum|∑': 'sum',
        '\\\\int|∫': 'integral',
        '\\\\infty|∞': 'infinity',
        '\\\\rightarrow|→': ' goes to',
        '\\\\Rightarrow|⇒': ' implies',
        '\\\\forall|∀': 'for all',
        '\\\\exists|∃': 'there exists',
        '\\\\in|∈': ' in',
        '\\\\subset|⊂': ' subset of',
        '\\\\cup|∪': ' union',
        '\\\\cap|∩': ' intersection'
      },
      zh: {
        '\\\\frac{([^}]+)}{([^}]+)}': '$1分之$2',
        '\\^2': '的平方',
        '\\^3': '的立方',
        '\\^([0-9]+)': '的$1次方',
        '\\\\times|×': '乘以',
        '\\\\div|÷': '除以',
        '\\\\sqrt{([^}]+)}': '根号$1',
        '√': '根号',
        '\\\\leq|≤': '小于等于',
        '\\\\geq|≥': '大于等于',
        '\\\\neq|≠': '不等于',
        '\\\\approx|≈': '约等于',
        '\\\\pm|±': '正负',
        '\\+': '加',
        '-': '减',
        '=': '等于',
        '<': '小于',
        '>': '大于',
        '\\*': '乘以',
        '/': '除以',
        '%': '百分之',
        '\\(': '左括号',
        '\\)': '右括号',
        '\\[': '左方括号',
        '\\]': '右方括号',
        '\\{': '左花括号',
        '\\}': '右花括号',
        '\\\\pi|π': '派',
        '\\\\alpha|α': '阿尔法',
        '\\\\beta|β': '贝塔',
        '\\\\theta|θ': '西塔',
        '\\\\lambda|λ': '兰姆达',
        '\\\\Delta|Δ': '德尔塔',
        '\\\\sum|∑': '求和',
        '\\\\int|∫': '积分',
        '\\\\infty|∞': '无穷',
        '\\\\rightarrow|→': '趋向于',
        '\\\\Rightarrow|⇒': '推出',
        '\\\\forall|∀': '对于所有',
        '\\\\exists|∃': '存在',
        '\\\\in|∈': '属于',
        '\\\\subset|⊂': '子集',
        '\\\\cup|∪': '并集',
        '\\\\cap|∩': '交集'
      },
      es: {
        '\\frac{([^}]+)}{([^}]+)}': '$1 sobre $2',
        '\\^2': ' al cuadrado',
        '\\^3': ' al cubo',
        '\\^([0-9]+)': ' a la potencia $1',
        '\\\\times|×': ' por',
        '\\\\div|÷': ' dividido por',
        '\\\\sqrt{([^}]+)}': 'raíz cuadrada de $1',
        '√': 'raíz cuadrada de',
        '\\\\leq|≤': ' menor o igual que',
        '\\\\geq|≥': ' mayor o igual que',
        '\\\\neq|≠': ' no igual a',
        '\\\\approx|≈': ' aproximadamente igual a',
        '\\\\pm|±': ' más o menos',
        '\\+': ' más',
        '-': ' menos',
        '=': ' igual a',
        '<': ' menor que',
        '>': ' mayor que',
        '\\*': ' por',
        '/': ' dividido por',
        '\\\\pi|π': 'pi',
        '\\\\alpha|α': 'alfa',
        '\\\\beta|β': 'beta',
        '\\\\theta|θ': 'theta',
        '\\\\lambda|λ': 'lambda'
      },
      ja: {
        '\\frac{([^}]+)}{([^}]+)}': '$2分の$1',
        '\\^2': 'の2乗',
        '\\^3': 'の3乗',
        '\\^([0-9]+)': 'の$1乗',
        '\\\\times|×': 'かける',
        '\\\\div|÷': 'わる',
        '\\\\sqrt{([^}]+)}': '$1の平方根',
        '√': '平方根',
        '\\\\leq|≤': '以下',
        '\\\\geq|≥': '以上',
        '\\\\neq|≠': 'と等しくない',
        '\\\\approx|≈': 'およそ',
        '\\\\pm|±': 'プラスマイナス',
        '\\+': 'たす',
        '-': 'ひく',
        '=': 'は',
        '<': 'より小さい',
        '>': 'より大きい',
        '\\*': 'かける',
        '/': 'わる',
        '\\\\pi|π': 'パイ',
        '\\\\alpha|α': 'アルファ',
        '\\\\beta|β': 'ベータ',
        '\\\\theta|θ': 'シータ',
        '\\\\lambda|λ': 'ラムダ'
      },
      fr: {
        '\\frac{([^}]+)}{([^}]+)}': '$1 sur $2',
        '\\^2': ' au carré',
        '\\^3': ' au cube',
        '\\^([0-9]+)': ' à la puissance $1',
        '\\\\times|×': ' fois',
        '\\\\div|÷': ' divisé par',
        '\\\\sqrt{([^}]+)}': 'racine carrée de $1',
        '√': 'racine carrée de',
        '\\\\leq|≤': ' inférieur ou égal à',
        '\\\\geq|≥': ' supérieur ou égal à',
        '\\\\neq|≠': ' différent de',
        '\\\\approx|≈': ' environ égal à',
        '\\\\pm|±': ' plus ou moins',
        '\\+': ' plus',
        '-': ' moins',
        '=': ' égale',
        '<': ' inférieur à',
        '>': ' supérieur à',
        '\\*': ' fois',
        '/': ' divisé par',
        '\\\\pi|π': 'pi',
        '\\\\alpha|α': 'alpha',
        '\\\\beta|β': 'bêta',
        '\\\\theta|θ': 'thêta',
        '\\\\lambda|λ': 'lambda'
      }
    };
    
    // 获取当前语言的翻译，默认使用英语
    const translations = mathTranslations[language] || mathTranslations.en;
    
    // 应用数学符号翻译
    for (const [pattern, replacement] of Object.entries(translations)) {
      const regex = new RegExp(pattern, 'g');
      cleanedText = cleanedText.replace(regex, replacement);
    }
    
    // 标准化文本（根据语言调整）
    if (language === 'zh' || language === 'ja') {
      // 中文和日文使用特定的标点符号
      cleanedText = cleanedText
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '，')
        .replace(/[.。]+/g, '。')
        .replace(/，+/g, '，')
        .replace(/，。/g, '。')
        .replace(/。，/g, '，')
        .replace(/^\s*[，。]\s*/g, '')
        .replace(/\s*[，。]\s*$/g, '');
    } else {
      // 西方语言使用标准标点
      cleanedText = cleanedText
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ', ')
        .replace(/\.+/g, '.')
        .replace(/,+/g, ',')
        .replace(/,\./g, '.')
        .replace(/\.,/g, ',')
        .replace(/^\s*[,.]\s*/g, '')
        .replace(/\s*[,.]\s*$/g, '');
    }
    
    return cleanedText.trim();
  }

  // 根据问题类型生成相应的动画 - 确保每个问题都有独特的AI答案动画
  async generateAnimation(question, solution, script, language = 'en') {
    const analysis = this.questionAnalyzer.analyzeQuestionType(question)
    
    // 优先使用基于AI答案的独特动画生成
    console.log('🎯 为每个问题生成独特的AI动画内容...')
    console.log('📝 输入参数:', {
      question: question?.substring(0, 50) + '...',
      solutionLength: solution?.length || 0,
      scriptPages: script?.pages?.length || 0,
      language
    })
    
    try {
      // 为每个问题生成基于AI答案的独特内容
      const uniqueContent = await this.generateUniqueAnimationFromAI(question, solution, script, language)
      
      if (uniqueContent && uniqueContent.length > 0) {
        console.log('✅ 成功生成基于AI答案的独特动画')
        console.log('📊 动画详情:', {
          type: uniqueContent[0].animationType,
          videoPath: uniqueContent[0].videoPath,
          hasAudio: uniqueContent[0].hasAudio,
          generated: uniqueContent[0].generated
        })
        return uniqueContent
      } else {
        console.warn('⚠️ 无法生成独特动画，使用回退方案')
        console.log('❓ uniqueContent为空或长度为0')
        return await this.generateStaticVisuals(question, script)
      }
      
    } catch (error) {
      console.error('❌ 独特动画生成失败，使用回退:', error.message)
      console.error('📋 错误堆栈:', error.stack)
      // 回退到静态内容，但会记录
      return await this.generateStaticVisuals(question, script)
    }
  }

  // 生成具体求解问题的动画（瀑布式效果）
  async generateConcreteProblemAnimation(question, solution, script, language, analysis) {
    console.log('🎬 生成具体求解问题动画（瀑布式效果）...')
    
    const steps = this.extractConcreteSteps(solution, question)
    
    try {
      // 使用我们自己的瀑布式脚本生成器
      console.log('🎬 生成瀑布式Manim脚本...')
      const manimScript = this.buildConcreteProblemManimScript(steps, script.pages)
      
      console.log('✅ 瀑布式Manim脚本生成完成，长度:', manimScript.length)
      
      // 初始化音频结果数组
      let audioResults = []
      
      // 生成分步TTS内容
      console.log('🎤 生成分步TTS内容...')
      const ttsSteps = this.generateStepByStepTTSContent(script.pages)
      
      if (!ttsSteps || ttsSteps.length === 0) {
        console.warn('⚠️ TTS步骤内容为空，使用默认内容')
        const defaultTTS = this.generateTTSContentFromPages(script.pages)
        const audioResult = await this.generateTTSAudio(defaultTTS, language)
        
        if (!audioResult.success) {
          console.warn('❌ TTS音频生成失败:', audioResult.error)
          console.log('🔄 TTS失败，创建无音频的动画对象...')
        }
      } else {
        console.log(`✅ 生成${ttsSteps.length}个TTS步骤`)
        
        // 为每个步骤生成TTS音频
        for (let i = 0; i < ttsSteps.length; i++) {
          const step = ttsSteps[i]
          console.log(`🎤 生成第${step.step}步TTS: ${step.text.substring(0, 30)}...`)
          
          const audioResult = await this.generateTTSAudio(step.text, language)
          if (audioResult.success) {
            audioResults.push({
              step: step.step,
              audioPath: audioResult.audioPath,
              duration: step.duration,
              text: step.text
            })
          } else {
            console.warn(`❌ 第${step.step}步TTS生成失败:`, audioResult.error)
          }
        }
        
        console.log(`✅ 成功生成${audioResults.length}个TTS音频文件`)
      }
      
      // 调用Manim服务器生成视频
      console.log('🎬 调用Manim服务器生成瀑布式视频...')
      
      // 先检查Manim服务器是否可用
      try {
        const healthCheck = await fetch(this.config.manim.endpoint.replace('/render', '/health'), {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 增加到5秒超时
        }).catch((err) => {
          console.warn('⚠️ Manim健康检查请求失败:', err.message)
          return null
        })
        
        if (!healthCheck || !healthCheck.ok) {
          console.warn('⚠️ Manim服务器不可用，使用备用视频')
          console.log('Health check response:', healthCheck?.status, healthCheck?.statusText)
          return this.generateStaticVisuals(question, script)
        }
      } catch (e) {
        console.warn('⚠️ Manim服务器健康检查失败，使用备用视频:', e.message)
        return this.generateStaticVisuals(question, script)
      }
      
      const response = await fetch(this.config.manim.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          script: manimScript,
          output_name: `qwen_video_${Date.now()}`,
          scene_name: 'ConcreteProblemScene'
        }),
        signal: AbortSignal.timeout(30000) // 30秒超时
      })
      
      const result = await response.json()
      
      if (result.success && result.video_path) {
        console.log('✅ Manim瀑布式视频生成成功:', result.video_path)
        
        // 检查是否有音频
        if (audioResults && audioResults.length > 0) {
          // 使用Minimax TTS生成的音频文件进行合并
          console.log('🎵 合并Minimax TTS音频和视频...')
          const mergeResult = await this.mergeAudioVideo(result.video_path, audioResults[0].audioPath)
          
          if (mergeResult.success) {
            console.log('✅ 音频视频合并成功:', mergeResult.finalVideoPath)
            return [{
              sceneId: 1,
              animationType: 'concrete_problem_waterfall',
              videoPath: mergeResult.finalVideoPath,
              audioPath: audioResults[0].audioPath,
              duration: Math.max(20, steps.length * 8),
              mathContent: steps.join('; '),
              steps: steps,
              script: script,
              hasAudio: true,
              ttsSteps: audioResults,
              ttsScript: audioResults.map(a => a.text).join(' '), // 完整的TTS脚本
              waterfallEffect: true
            }]
          } else {
            console.warn('❌ 音频视频合并失败:', mergeResult.error)
            // 合并失败时返回无音频的视频
            return [{
              sceneId: 1,
              animationType: 'concrete_problem_waterfall',
              videoPath: result.video_path,
              audioPath: null,
              duration: Math.max(20, steps.length * 8),
              mathContent: steps.join('; '),
              steps: steps,
              script: script,
              hasAudio: false,
              ttsSteps: audioResults,
              ttsScript: audioResults.map(a => a.text).join(' '), // 完整的TTS脚本
              waterfallEffect: true
            }]
          }
        } else {
          console.log('🔄 无TTS音频，返回纯视频动画')
          return [{
            sceneId: 1,
            animationType: 'concrete_problem_waterfall',
            videoPath: result.video_path,
            audioPath: null,
            duration: Math.max(20, steps.length * 8),
            mathContent: steps.join('; '),
            steps: steps,
            script: script,
            hasAudio: false,
            ttsSteps: audioResults,
            waterfallEffect: true
          }]
        }
      } else {
        console.error('❌ Manim视频生成失败:', result.error)
        return this.generateStaticVisuals(question, script)
      }
    } catch (error) {
      console.error('❌ 瀑布式动画生成异常:', error)
      return this.generateStaticVisuals(question, script)
    }
  }

  // 生成基于AI答案的独特动画内容
  async generateUniqueAnimationFromAI(question, solution, script, language = 'zh') {
    console.log('🎬 为AI答案生成独特动画内容...')
    
    // Validate inputs
    if (!question) {
      console.error('❌ No question provided to generateUniqueAnimationFromAI')
      throw new Error('Question is required for animation generation')
    }
    
    // Handle undefined solution and script gracefully
    solution = solution || ''
    script = script || { pages: [] }
    
    // 为每个问题生成唯一的输出文件名
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000)
    const outputName = `ai_solution_${uniqueId}`
    
    try {
      // 从AI解答中提取具体步骤和概念
      const steps = this.extractConcreteSteps(solution, question)
      const concepts = this.extractTheoreticalConcepts(solution, question)
      
      console.log('📊 提取的步骤:', steps.length, '个')
      console.log('📚 提取的概念:', concepts.length, '个')
      
      // 确保我们有步骤或使用脚本中的页面
      let finalSteps = steps
      if (steps.length === 0 && script.pages && script.pages.length > 0) {
        console.log('📝 使用脚本页面作为步骤...')
        // 确保提取的是字符串，而不是对象
        finalSteps = script.pages.map(page => {
          if (typeof page === 'string') {
            return page
          } else if (page && typeof page === 'object' && page.text) {
            return page.text
          } else {
            return String(page) // 强制转换为字符串
          }
        })
      }
      
      // 先生成TTS内容以便用于字幕
      let ttsContent = []
      let cleanedTTSText = ''
      
      try {
        const tts = new TTSService()
        const questionType = this.questionAnalyzer.analyzeQuestionType(question)
        
        if (questionType.type === 'theoretical') {
          ttsContent = [tts.generateTheoreticalTTSContent(question, solution, concepts)]
        } else if (questionType.type === 'geometry') {
          ttsContent = [tts.generateGeometryTTSContent(question, { shapes: concepts })]
        } else {
          ttsContent = [tts.generateConcreteTTSContent(question, solution, finalSteps)]
        }
        
        // Clean TTS content for subtitles
        cleanedTTSText = this.cleanTextForTTS(ttsContent.join(' '), language)
        console.log('🧹 Prepared TTS content for subtitles')
      } catch (ttsError) {
        console.error('❌ 生成TTS内容时出错:', ttsError)
        cleanedTTSText = this.cleanTextForTTS(`让我们来解决这个问题：${question}`, language)
      }

      // 基于AI答案构建独特的Manim脚本（带字幕）
      const uniqueScript = await this.buildUniqueManimScriptFromAI(finalSteps, concepts, script, question, solution, cleanedTTSText)
      
      console.log('✅ 基于AI答案的独特脚本生成完成')
      
      // 调用Manim服务器渲染视频
      let videoPath = `/rendered_videos/${outputName}.mp4`
      
      // Construct URL outside try block for use in catch block
      const isBrowser = typeof window !== 'undefined';
      const baseURL = isBrowser ? window.location.origin : 'http://localhost:5173';
      const fullURL = this.config.manim.endpoint.startsWith('http') 
        ? this.config.manim.endpoint 
        : baseURL + this.config.manim.endpoint;
      
      try {
        console.log('🔗 Manim endpoint:', this.config.manim.endpoint);
        
        console.log('📍 Full URL will be:', fullURL);
        console.log('📜 Script being sent to Manim server:');
        console.log('- Script length:', uniqueScript ? uniqueScript.length : 0);
        console.log('- First 200 chars:', uniqueScript ? uniqueScript.substring(0, 200) : 'NO SCRIPT');
        console.log('- Script type:', typeof uniqueScript);
        console.log('- Is empty script for native:', uniqueScript === '');
        
        // Add duration to the request
        const requestData = {
          script: uniqueScript || '',  // Ensure it's never null/undefined
          output_name: outputName,
          question: question,
          solution: solution,
          duration: 20  // Add duration parameter
        };
        
        console.log('📦 Request data:', JSON.stringify(requestData, null, 2));
        
        const renderResponse = await axios.post(fullURL, requestData, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          timeout: 60000 // 60 second timeout for complex animations
        })
        
        if (renderResponse.status === 200 && renderResponse.data.success) {
          const renderResult = renderResponse.data
          console.log('✅ Manim渲染成功:', renderResult)
          // Use the actual video path from the server response
          if (renderResult.video_path) {
            videoPath = renderResult.video_path
          }
        } else {
          console.error('❌ Manim渲染失败:', renderResponse.status)
          throw new Error(`Manim渲染失败: HTTP ${renderResponse.status}`);
        }
      } catch (renderError) {
        console.error('❌ Manim渲染请求失败:', renderError.message)
        
        // More detailed error logging
        if (renderError.response) {
          console.error('📋 Response error details:', {
            status: renderError.response.status,
            statusText: renderError.response.statusText,
            data: renderError.response.data,
            headers: renderError.response.headers
          })
        } else if (renderError.request) {
          console.error('📋 Request error (no response received):', renderError.request)
        } else {
          console.error('📋 Error setting up request:', renderError.message)
        }
        
        console.error('📋 Request details:', {
          url: renderError.config?.url,
          method: renderError.config?.method,
          data: renderError.config?.data ? JSON.parse(renderError.config.data) : null,
          headers: renderError.config?.headers
        })
        
        // If it's a network error or timeout, try once more with a simpler script
        if (renderError.code === 'ERR_NETWORK' || renderError.code === 'ECONNABORTED') {
          console.log('🔄 网络错误，尝试简化脚本重试...')
          
          try {
            // Generate a simpler script for retry
            const simpleScript = await this.generateSimpleFallbackScript(question, solution)
            
            const retryResponse = await axios.post(fullURL, {
              script: simpleScript,
              output_name: outputName + '_retry',
              question: question,
              solution: solution
            }, {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 30000 // 30 second timeout for simpler script
            })
            
            if (retryResponse.status === 200 && retryResponse.data.success) {
              console.log('✅ 重试成功，使用简化版本')
              videoPath = retryResponse.data.video_path || `/rendered_videos/${outputName}_retry.mp4`
            } else {
              throw new Error('重试失败')
            }
          } catch (retryError) {
            console.error('❌ 重试也失败了:', retryError)
            
            // Ultimate fallback - create a very simple but guaranteed-to-work video
            console.log('🔄 使用终极简单脚本...');
            try {
              const ultraSimpleScript = this.generateUltraSimpleScript(question, solution);
              const ultimateResponse = await axios.post(fullURL, {
                script: ultraSimpleScript,
                output_name: 'ultimate_fallback_' + Date.now(),
                question: question,
                solution: solution || 'Solving...',
                duration: 20
              }, {
                headers: {
                  'Content-Type': 'application/json'
                },
                timeout: 30000
              });
              
              if (ultimateResponse.status === 200 && ultimateResponse.data.success) {
                console.log('✅ 终极简单脚本成功');
                videoPath = ultimateResponse.data.video_path;
              } else {
                throw new Error('终极简单脚本失败');
              }
            } catch (ultimateError) {
              console.error('❌ 终极简单脚本也失败了:', ultimateError);
              throw new Error(`视频生成失败: 网络连接问题或服务器超时`);
            }
          }
        } else {
          // 不使用备用视频，直接返回失败
          throw new Error(`视频生成失败: ${renderError.message || 'Manim服务错误'}`)
        }
      }
      
      // TTS内容已经在前面生成并清理过了，直接使用
      console.log('📢 使用之前准备的TTS内容生成音频')
      
      // 生成TTS音频
      console.log('🎤 生成TTS音频...')
      let audioPath = null
      let hasAudio = false
      
      try {
        // Use the already cleaned TTS text
        console.log('🧹 Using pre-cleaned TTS text (first 100 chars):', cleanedTTSText.substring(0, 100));
        
        const audioResult = await this.generateTTSAudio(cleanedTTSText, language)
        if (audioResult.success) {
          audioPath = audioResult.audioPath
          hasAudio = true
          console.log('🔍 DEBUG - audioResult.audioPath:', audioResult.audioPath)
          console.log('🔍 DEBUG - audioPath after assignment:', audioPath)
          console.log('✅ TTS音频生成成功:', audioPath)
          
          // 合并音频和视频
          const mergeResult = await this.mergeAudioVideo(videoPath, audioPath)
          if (mergeResult.success) {
            videoPath = mergeResult.finalVideoPath
            console.log('✅ 音频视频合并成功:', videoPath)
          }
        }
      } catch (audioError) {
        console.error('❌ TTS音频生成失败:', audioError)
      }
      
      // Ensure videoPath starts with /
      if (videoPath && !videoPath.startsWith('/')) {
        videoPath = '/' + videoPath
      }
      
      // Generate subtitles from TTS content
      let subtitleData = null
      let subtitleFilePath = null
      try {
        const duration = Math.max(20, (finalSteps.length + concepts.length) * 6)
        subtitleData = this.subtitleGenerator.generateSubtitleData(cleanedTTSText, finalSteps, duration)
        console.log('✅ 字幕生成成功，包含', subtitleData.segments.length, '个片段')
        
        // Save subtitle files
        if (subtitleData && subtitleData.vtt) {
          const subtitleFileName = `subtitles_${uniqueId}.vtt`
          subtitleFilePath = `/rendered_videos/${subtitleFileName}`
          
          // Save VTT file via an API endpoint (we'll need to create this)
          try {
            await this.saveSubtitleFile(subtitleFileName, subtitleData.vtt)
            console.log('💾 字幕文件已保存:', subtitleFilePath)
          } catch (saveError) {
            console.error('⚠️ 字幕文件保存失败:', saveError)
            subtitleFilePath = null
          }
        }
      } catch (subtitleError) {
        console.error('⚠️ 字幕生成失败:', subtitleError)
      }
      
      return [{
        sceneId: 1,
        animationType: 'ai_generated_unique',
        uniqueId: uniqueId,
        outputName: outputName,
        videoPath: videoPath,
        audioPath: audioPath,
        hasAudio: hasAudio,
        duration: Math.max(20, (finalSteps.length + concepts.length) * 6),
        mathContent: solution,
        steps: finalSteps,
        concepts: concepts,
        script: uniqueScript,
        ttsContent: ttsContent,
        ttsScript: ttsContent.join(' '), // 完整的TTS脚本
        subtitles: subtitleData, // 添加字幕数据
        subtitleFilePath: subtitleFilePath, // 字幕文件路径
        unique: true,
        aiGenerated: true
      }]
      
    } catch (error) {
      console.error('❌ 独特动画生成失败:', error)
      return this.generateStaticVisuals(question, script)  // 回退到静态，但会记录
    }
  }

  // 基于AI答案构建独特的Manim脚本 - 使用瀑布式格式
  async buildUniqueManimScriptFromAI(steps, concepts, script, question, solution, ttsContent = '') {
    console.log('📝 构建基于AI答案的瀑布式Manim脚本...')
    console.log('📊 步骤数量:', steps.length)
    console.log('📚 概念数量:', concepts.length)
    console.log('🎤 TTS内容长度:', ttsContent.length)
    
    // Check if we should use native Manim generation for better problem-specific visualizations
    const useNativeManim = this.shouldUseNativeManim(question, solution);
    
    if (useNativeManim) {
      console.log('🎯 使用原生Manim生成器以获得更好的问题特定可视化');
      // Return empty string to let the server generate its own script
      return '';
    }
    
    // Use AI-driven generator as the primary choice
    try {
      console.log('🎯 使用AI驱动的Manim生成器作为主要方案...');
      const aiGeneratedScript = await this.aiDrivenManimGenerator.generateManimScript(question, solution, 20);
      console.log('✅ 成功使用AI驱动的生成器创建了动画');
      return aiGeneratedScript;
    } catch (aiError) {
      console.error('❌ AI驱动的生成器失败:', aiError.message);
      
      // Fallback to advanced subtitle generator for better TTS synchronization
      try {
        console.log('🎬 尝试使用高级字幕同步Manim生成器...');
        console.log('📝 TTS内容预览:', ttsContent.substring(0, 100) + '...');
        
        // Use the advanced subtitle generator with TTS content
        const advancedScript = await this.advancedSubtitleGenerator.generateManimScript(
          question, 
          solution, 
          ttsContent || solution, // Use TTS content if available, otherwise use solution
          20
        );
        console.log('✅ 成功使用高级字幕同步生成器创建了动画');
        return advancedScript;
      } catch (advError) {
        console.error('❌ 高级字幕生成器也失败了:', advError.message);
        console.error('Stack:', advError.stack);
      }
    }
      
    // Final fallback to improved script generator
    try {
      console.log('⚠️ 尝试使用改进的脚本生成器作为最终备选...');
        const improvedScript = this.manimScriptGenerator.generateQuestionSpecificScript(
          question,
          steps,
          { shapes: concepts }
        );
        console.log('✅ 使用改进的脚本生成器创建了动画');
        return improvedScript;
      } catch (improvedError) {
        console.error('❌ 改进的脚本生成器也失败了:', improvedError.message);
        
        // Simple fallback - basic script that should always work
        console.log('⚠️ 使用简单的备用脚本...');
        return await this.generateSimpleFallbackScript(question, solution);
      }
  }
  // 当无法提取步骤时的动态内容生成
  generateDynamicContentFromAIAnswer(question, solution, outputName) {
    console.log('🎬 基于完整的AI答案生成动态内容...')
    
    // 将完整的AI解答转换为可视化内容
    const problemText = question.replace(/"/g, '\\"')
    const solutionText = solution.replace(/"/g, '\\"')
    
    const manimScript = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from manim import *

class AIDynamicContentScene(Scene):
    def construct(self):
        self.camera.background_color = BLACK
        
        # 问题展示
        title = Text("数学解答", font_size=32, color=BLUE)
        question_text = Text("${problemText}", font_size=24, color=WHITE)
        question_text.next_to(title, DOWN)
        
        # 解答内容（滚动显示）
        solution_lines = ["${solutionText.split('\n').join('", "').replace(/"/g, '\\"')}"]
        solution_group = VGroup()
        
        for line in solution_lines:
            if line.trim():
                text_line = Text(line.strip(), font_size=20, color=YELLOW)
                solution_group.add(text_line)
        
        solution_group.arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        solution_group.scale_to_fit_width(10)
        solution_group.next_to(question_text, DOWN, buff=1)
        
        # 瀑布式动画
        self.play(Write(title))
        self.play(Write(question_text))
        
        for text_line in solution_group:
            self.play(Write(text_line), run_time=1.5)
            self.wait(0.3)
        
        self.wait(2)

config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.output_file = "${outputName}"
`
    
    return manimScript
  }

  // 提取理论概念
  extractTheoreticalConcepts(solution, question) {
    console.log('🔍 提取理论概念...')
    
    // 清理LaTeX符号的函数
    function cleanText(text) {
      return text
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
        .replace(/\\times/g, '乘以')
        .replace(/\\div/g, '除以')
        .replace(/\\sqrt\{([^}]+)\}/g, '根号$1')
        .replace(/\\pi/g, 'π')
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\theta/g, 'θ')
        .replace(/\\[\\$\\\\{}\\\\[\\\\]_\\\\^\\\\|<>]/g, '')
        .replace(/\\s+/g, ' ')
        .replace(/\\n/g, ' ')
        .replace(/\\./g, '。')
        .replace(/\\(.*?\\)/g, '')
        .replace(/\*\*/g, '')
        .replace(/^\*\s*/, '')
        .replace(/\\s+$/g, '')
        .replace(/\*/g, '')
        .trim();
    }
    
    try {
      // 从问题中提取关键概念
      const questionConcepts = [];
      // Extract concepts based on actual question content
      const questionWords = cleanText(question).split(' ');
      
      // Math operation concepts
      if (question.includes('不等式') || question.includes('inequality')) questionConcepts.push('不等式求解');
      if (question.includes('方程') || question.includes('equation')) questionConcepts.push('方程求解');
      if (question.includes('函数') || question.includes('function')) questionConcepts.push('函数分析');
      if (question.includes('导数') || question.includes('derivative')) questionConcepts.push('导数计算');
      if (question.includes('积分') || question.includes('integral')) questionConcepts.push('积分计算');
      if (question.includes('三角形面积')) questionConcepts.push('三角形面积公式');
      if (question.includes('拉窗帘原理')) questionConcepts.push('拉窗帘原理');
      if (question.includes('几何') || question.includes('geometry')) questionConcepts.push('几何原理');
      
      // 从解答中提取关键概念
      const solutionConcepts = [];
      const lines = solution ? solution.split('\n') : [];
      
      for (const line of lines) {
        const cleanLine = cleanText(line);
        if (cleanLine.includes('面积公式') || cleanLine.includes('A =')) {
          solutionConcepts.push('面积计算公式');
        }
        if (cleanLine.includes('底边') && cleanLine.includes('高')) {
          solutionConcepts.push('底边与高的关系');
        }
        if (cleanLine.includes('平行') && cleanLine.includes('移动')) {
          solutionConcepts.push('平行移动原理');
        }
        if (cleanLine.includes('不变') && cleanLine.includes('面积')) {
          solutionConcepts.push('面积不变原理');
        }
      }
      
      // 合并并去重
      const allConcepts = [...new Set([...questionConcepts, ...solutionConcepts])];
      
      // 如果没有提取到概念，基于问题类型生成概念
      if (allConcepts.length === 0) {
        if (question.includes('解') || question.includes('求') || question.includes('计算')) {
          allConcepts.push('数学计算', '求解步骤', '结果验证');
        } else if (question.includes('证明') || question.includes('推导')) {
          allConcepts.push('数学证明', '逻辑推理', '定理应用');
        } else {
          allConcepts.push('数学概念', '原理解释', '实例演示');
        }
      }
      
      console.log('📚 提取的理论概念:', allConcepts);
      return allConcepts;
      
    } catch (error) {
      console.error('❌ 提取理论概念失败:', error);
      return ['几何原理', '数学概念'];
    }
  }

  // 生成理论问题的动画（瀑布式效果）
  async generateTheoreticalQuestionAnimation(question, solution, script, language, analysis) {
    console.log('🎬 生成理论问题动画（瀑布式效果）...')
    
    const concepts = this.extractTheoreticalConcepts(solution, question)
    
    try {
      // 生成TTS内容
      console.log('🎤 生成理论问题TTS内容...')
      let ttsContent = this.generateTTSContentForTheoretical(question, concepts, language)
      
      if (!ttsContent || typeof ttsContent !== 'string' || ttsContent.trim() === '') {
        console.warn('⚠️ TTS文本内容为空，自动填充为"无内容"')
        ttsContent = '无内容'
      }
      
      const audioResult = await this.generateTTSAudio(ttsContent, language)
      
      if (!audioResult.success) {
        console.warn('❌ TTS音频生成失败:', audioResult.error)
        console.log('🔄 TTS失败，创建无音频的动画对象...')
      }
      
      // 构建瀑布式Manim脚本
      console.log('🤖 构建瀑布式理论问题Manim脚本...')
      const manimScript = this.buildTheoreticalQuestionManimScript(concepts, question)
      
      console.log('✅ 瀑布式Manim脚本生成完成，长度:', manimScript.length)
      
      // 调用Manim服务器生成视频
      console.log('🎬 调用Manim服务器生成瀑布式理论视频...')
      const response = await fetch(this.config.manim.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          script: manimScript,
          output_name: `qwen_video_${Date.now()}`,
          scene_name: 'TheoreticalQuestionScene'
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.video_path) {
        console.log('✅ Manim瀑布式理论视频生成成功:', result.video_path)
        
        // 检查是否有音频
        if (audioResult.success) {
          // 合并音频和视频
          console.log('🎵 合并音频和视频...')
          const mergeResult = await this.mergeAudioVideo(result.video_path, audioResult.audioPath)
          
          if (mergeResult.success) {
            console.log('✅ 音频视频合并成功:', mergeResult.finalVideoPath)
            return [{
              sceneId: 1,
              animationType: 'theoretical_question_waterfall',
              videoPath: mergeResult.finalVideoPath,
              audioPath: audioResult.audioPath,
              duration: Math.max(15, concepts.length * 6),
              mathContent: concepts.join('; '),
              concepts: concepts,
              script: script,
              hasAudio: true,
              waterfallEffect: true
            }]
          } else {
            console.warn('❌ 音频视频合并失败:', mergeResult.error)
            return [{
              sceneId: 1,
              animationType: 'theoretical_question_waterfall',
              videoPath: result.video_path,
              audioPath: null,
              duration: Math.max(15, concepts.length * 6),
              mathContent: concepts.join('; '),
              concepts: concepts,
              script: script,
              hasAudio: false,
              waterfallEffect: true
            }]
          }
        } else {
          console.log('🔄 无TTS音频，返回纯视频动画')
          return [{
            sceneId: 1,
            animationType: 'theoretical_question_waterfall',
            videoPath: result.video_path,
            audioPath: null,
            duration: Math.max(15, concepts.length * 6),
            mathContent: concepts.join('; '),
            concepts: concepts,
            script: script,
            hasAudio: false,
            waterfallEffect: true
          }]
        }
      } else {
        console.error('❌ Manim理论视频生成失败:', result.error)
        return this.generateStaticVisuals(question, script)
      }
    } catch (error) {
      console.error('❌ 瀑布式理论动画生成异常:', error)
      return this.generateStaticVisuals(question, script)
    }
  }

  // 生成混合类型问题的动画（瀑布式效果）
  async generateMixedAnimation(question, solution, script, language, analysis) {
    console.log('🎬 生成混合类型问题动画（瀑布式效果）...')
    
    // 对于混合类型，优先使用具体问题的瀑布式动画
    return this.generateConcreteProblemAnimation(question, solution, script, language, analysis)
  }

  // 生成理论问题的TTS内容
  generateTTSContentForTheoretical(question, concepts, language) {
    console.log('🎤 生成理论问题TTS内容...')
    
    // 清理文本的函数
    function cleanText(text) {
      return text
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
        .replace(/\\times/g, '乘以')
        .replace(/\\div/g, '除以')
        .replace(/\\sqrt\{([^}]+)\}/g, '根号$1')
        .replace(/\\pi/g, 'π')
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\theta/g, 'θ')
        .replace(/\\[\\$\\\\{}\\[\\]_\\^\\|<>]/g, '')
        .replace(/\\s+/g, ' ')
        .replace(/\\n/g, ' ')
        .replace(/\\./g, '。')
        .replace(/\\(.*?\\)/g, '')
        .replace(/\*\*/g, '')
        .replace(/^\*\s*/, '')
        .replace(/\\s+$/g, '')
        .replace(/\*/g, '')
        .trim();
    }
    
    try {
      const cleanQuestion = cleanText(question);
      const cleanConcepts = concepts.map(concept => cleanText(concept));
      
      let ttsContent = `让我们来学习${cleanConcepts.join('、')}。`;
      ttsContent += `今天我们要探讨的问题是：${cleanQuestion}。`;
      
      // 根据概念添加具体内容
      if (cleanConcepts.includes('三角形面积公式')) {
        ttsContent += `首先，我们需要理解三角形面积的计算公式。三角形面积等于底乘以高再除以2。`;
      }
      
      if (cleanConcepts.includes('拉窗帘原理')) {
        ttsContent += `拉窗帘原理告诉我们，当三角形的底边固定，顶点在与底边平行的直线上移动时，三角形的高保持不变，因此面积也不变。`;
      }
      
      if (cleanConcepts.includes('平行移动原理')) {
        ttsContent += `平行移动原理是几何学中的重要概念，它帮助我们理解图形在平移过程中哪些性质保持不变。`;
      }
      
      if (cleanConcepts.includes('面积不变原理')) {
        ttsContent += `面积不变原理是几何变换中的基本定理，它确保在特定条件下，图形的面积在变换过程中保持恒定。`;
      }
      
      ttsContent += `通过这个动画演示，我们可以直观地看到这些原理是如何在几何图形中体现的。`;
      
      console.log('✅ TTS内容生成完成:', ttsContent.substring(0, 100) + '...');
      return ttsContent;
      
    } catch (error) {
      console.error('❌ 生成TTS内容失败:', error);
      return `让我们来学习${concepts.join('、')}。今天我们要探讨的问题是：${question}。`;
    }
  }

  // 生成TTS内容（更简洁，支持多语言）
  generateTTSContentFromPages(pages, language = 'en') {
    if (!pages || pages.length === 0) return '';
    
    // 语言特定的介绍词
    const introductionPhrases = {
      en: ['Let\'s solve this problem', 'Problem:', 'Question:'],
      zh: ['让我们来解决这个数学问题', '题目：', '问题：'],
      es: ['Resolvamos este problema', 'Problema:', 'Pregunta:'],
      ja: ['この問題を解きましょう', '問題：', '質問：'],
      fr: ['Résolvons ce problème', 'Problème:', 'Question:']
    };
    
    const phrases = introductionPhrases[language] || introductionPhrases.en;
    
    // 过滤和清理页面内容
    const processedContent = [];
    let hasIntro = false;
    
    pages.forEach((page, index) => {
      const cleanContent = this.cleanTextForTTS(page.text, language);
      
      // 跳过空内容
      if (!cleanContent || cleanContent.length < 5) return;
      
      // 检查是否是介绍性内容
      const isIntro = phrases.some(phrase => cleanContent.includes(phrase));
      if (isIntro) {
        if (!hasIntro) {
          processedContent.push(cleanContent);
          hasIntro = true;
        }
        return;
      }
      
      // 跳过重复内容
      const isDuplicate = processedContent.some(content => 
        content.includes(cleanContent) || cleanContent.includes(content)
      );
      if (isDuplicate) return;
      
      processedContent.push(cleanContent);
    });
    
    // 构建简洁的TTS内容
    let ttsContent = '';
    const separator = language === 'zh' || language === 'ja' ? '。' : '. ';
    
    processedContent.forEach((content, index) => {
      // 限制每段内容的长度
      const truncatedContent = content.length > 100 
        ? content.substring(0, 97) + '...' 
        : content;
      
      ttsContent += truncatedContent;
      
      // 添加适当的分隔符
      if (index < processedContent.length - 1) {
        ttsContent += separator;
      }
    });
    
    // 确保内容不会太长（TTS限制）
    const maxLength = 500;
    if (ttsContent.length > maxLength) {
      ttsContent = ttsContent.substring(0, maxLength - 3) + '...';
    }
    
    return ttsContent;
  }

  // 为瀑布式动画生成分步TTS内容
  generateStepByStepTTSContent(pages, language = 'en') {
    if (!pages || pages.length === 0) return [];
    
    const ttsSteps = [];
    const processedTexts = new Set();
    
    pages.forEach((page, index) => {
      const cleanContent = this.cleanTextForTTS(page.text, language);
      
      // 跳过空内容或太短的内容
      if (!cleanContent || cleanContent.length < 5) return;
      
      // 跳过已处理的重复内容
      if (processedTexts.has(cleanContent)) return;
      processedTexts.add(cleanContent);
      
      // 为每个步骤创建简洁的TTS内容
      const stepNumber = ttsSteps.length + 1;
      const maxStepLength = 80; // 每步最大长度
      
      const truncatedContent = cleanContent.length > maxStepLength 
        ? cleanContent.substring(0, maxStepLength - 3) + '...' 
        : cleanContent;
      
      ttsSteps.push({
        step: stepNumber,
        text: truncatedContent,
        duration: Math.max(2.0, truncatedContent.length * 0.05) // 简化的时长计算
      });
    });
    
    return ttsSteps;
  }

  // ✅ 统一使用 UniversalWaterfallScene 的模板
  buildUniversalSceneScript(contents, scripts) {
    // 清理和编码数据
    const cleanContents = contents.map(item => {
      if (!item) return null;
      return {
        ...item,
        value: item.value ? item.value.replace(/[^\x00-\x7F]/g, '') : (item.value || '')
      };
    }).filter(item => item !== null); // 过滤掉null项
    
    // 处理scripts参数，确保是字符串数组
    const cleanScripts = scripts.map(script => {
      if (typeof script === 'string') {
        return script.replace(/[^\x00-\x7F]/g, '');
      } else if (script && typeof script === 'object' && script.text) {
        return script.text.replace(/[^\x00-\x7F]/g, '');
      } else {
        return 'Step content';
      }
    });

    return `# -*- coding: utf-8 -*-
from manim import *
import json
from test_waterfall_optimized_v2 import UniversalWaterfallScene

class GeneratedUniversalScene(UniversalWaterfallScene):
    def __init__(self, **kwargs):
        # 使用JSON字符串避免编码问题
        contents_data = json.loads('''${JSON.stringify(cleanContents).replace(/'/g, "\\'")}''')
        scripts_data = json.loads('''${JSON.stringify(cleanScripts).replace(/'/g, "\\'")}''')
        
        super().__init__(
            contents_data=contents_data,
            scripts_data=scripts_data,
            **kwargs
        )
`;
  }

  // ✅ 具体问题的内容构造 - 增强版，支持图形
  buildConcreteProblemManimScript(steps, scripts) {
    const contents = [];
    
    // 处理每个步骤
    steps.forEach((step, index) => {
      // 如果步骤需要图形，先添加图形
      if (step.hasGraphic) {
        contents.push({
          name: `graphic_${index + 1}`,
          type: 'graphic',
          graphic_type: step.graphicType || 'triangle',
          params: this.getGraphicParams(step.graphicType)
        });
      }
      
      // 处理步骤内容
      if (step.type === 'formula') {
        // 分离文字说明和公式
        const parts = step.content.split(/[:：]/);
        if (parts.length > 1) {
          // 先添加说明文字
          contents.push({
            name: `step_text_${index + 1}`,
            type: 'text',
            value: parts[0].trim(),
            font_size: 26,
            color: 'WHITE'
          });
          // 再添加公式
          contents.push({
            name: `formula_${index + 1}`,
            type: 'formula',
            value: parts[1].trim(),
            color: 'YELLOW'
          });
        } else {
          contents.push({
            name: `formula_${index + 1}`,
            type: 'formula',
            value: step.content,
            color: 'YELLOW'
          });
        }
      } else {
        contents.push({
          name: `step_${index + 1}`,
          type: 'text',
          value: step.content || `步骤 ${index + 1}`,
          font_size: 26,
          color: 'WHITE'
        });
      }
    });

    // 清理和编码数据
    const cleanContents = contents.map(item => {
      if (!item) return null;
      return {
        ...item,
        value: item.value ? item.value.replace(/[^\x00-\x7F]/g, '') : (item.value || '')
      };
    }).filter(item => item !== null); // 过滤掉null项
    
    // 处理scripts参数，确保是字符串数组
    const cleanScripts = scripts.map(script => {
      if (typeof script === 'string') {
        return script.replace(/[^\x00-\x7F]/g, '');
      } else if (script && typeof script === 'object' && script.text) {
        return script.text.replace(/[^\x00-\x7F]/g, '');
      } else {
        return 'Step content';
      }
    });

    const pyScript = `
# -*- coding: utf-8 -*-
from manim import *
import sys
import os
import json

# 添加当前目录到路径，确保能导入 test_waterfall_optimized_v2
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from test_waterfall_optimized_v2 import UniversalWaterfallScene

class GeneratedUniversalScene(UniversalWaterfallScene):
    def __init__(self, **kwargs):
        # 使用JSON字符串避免编码问题
        contents_data = json.loads('''${JSON.stringify(cleanContents).replace(/'/g, "\\'")}''')
        scripts_data = json.loads('''${JSON.stringify(cleanScripts).replace(/'/g, "\\'")}''')
        
        super().__init__(
            contents_data=contents_data,
            scripts_data=scripts_data,
            **kwargs
        )

# 配置 Manim 输出
config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = BLACK
config.output_file = "generated_universal"
`;

    return pyScript.trim();
  }

  // ✅ 理论问题的内容构造
  buildTheoreticalQuestionManimScript(concepts, question) {
    const contents = [
      { name: "title", type: "text", value: "概念理解", font_size: 32, color: "BLUE" },
      { name: "question", type: "text", value: question, font_size: 24, color: "WHITE" },
      ...concepts.slice(0, 4).map((c, i) => ({
        name: `concept_${i + 1}`,
        type: "text",
        value: `概念 ${i + 1}：${c}`,
        font_size: 20,
        color: "WHITE"
      }))
    ];
    const scripts = [
      "让我们来学习数学概念",
      `今天我们要探讨的问题是：${question}`,
      ...concepts.slice(0, 4).map(c => `关键概念：${c}`),
      "概念理解完成"
    ];
    return this.buildUniversalSceneScript(contents, scripts);
  }

  // ✅ 勾股定理的内容构造
  buildPythagoreanTheoremManimScript(question) {
    const contents = [
      { name: "title", type: "text", value: "勾股定理演示", font_size: 32, color: "BLUE" },
      { name: "triangle", type: "graphic", graphic_type: "triangle" },
      { name: "formula", type: "formula", value: "a^2 + b^2 = c^2", color: "WHITE" },
      { name: "calc", type: "formula", value: "3^2 + 4^2 = 5^2", color: "WHITE" }
    ];
    const scripts = [
      "勾股定理演示开始",
      "我们构造一个直角三角形",
      "根据勾股定理：a² + b² = c²",
      "代入数值：3² + 4² = 5²，验证成立"
    ];
    return this.buildUniversalSceneScript(contents, scripts);
  }

  // ✅ 拉窗帘原理的内容构造
  buildCurtainPrincipleManimScript(question) {
    const contents = [
      { name: "title", type: "text", value: "拉窗帘原理演示", font_size: 32, color: "BLUE" },
      { name: "triangle", type: "graphic", graphic_type: "triangle" },
      { name: "principle", type: "text", value: "三角形面积不变原理", font_size: 24, color: "WHITE" }
    ];
    const scripts = [
      "拉窗帘原理演示开始",
      "我们构造一个三角形",
      "无论顶点如何平行移动，面积保持不变"
    ];
    return this.buildUniversalSceneScript(contents, scripts);
  }

  // Build Manim script for equation solving
  buildEquationSolvingManimScript(question, steps, solution) {
    console.log('🔢 生成方程求解Manim脚本...')
    
    // Extract the equation from the question
    const equationMatch = question.match(/([^：:]+[=][^。.]+)/) || question.match(/(\d+\s*[a-zA-Z]\s*[+\-*/]\s*\d+\s*=\s*\d+)/)
    const equation = equationMatch ? equationMatch[1].trim() : '2x + 5 = 15'
    
    return `from manim import *

class EquationSolving(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a1a"
        
        # Title
        title = Text("${question}", font="SimHei", font_size=32, color=BLUE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))
        self.wait(1)
        
        # Original equation
        equation = MathTex("${equation}")
        equation.scale(1.5)
        equation.move_to(ORIGIN + UP)
        self.play(Write(equation))
        self.wait(2)
        
        # Step 1: Move constant to right side
        step1_text = Text("Step 1: 移项", font="SimHei", font_size=24, color=YELLOW)
        step1_text.next_to(equation, DOWN, buff=1)
        self.play(FadeIn(step1_text))
        self.wait(1)
        
        # For equation 2x + 5 = 15
        if "2x" in "${equation}" and "+5" in "${equation}":
            # Transform to 2x = 15 - 5
            equation2 = MathTex("2x", "=", "15", "-", "5")
            equation2.scale(1.5)
            equation2.move_to(equation.get_center())
            
            self.play(
                TransformMatchingTex(equation, equation2),
                FadeOut(step1_text)
            )
            self.wait(2)
            
            # Simplify: 2x = 10
            equation3 = MathTex("2x", "=", "10")
            equation3.scale(1.5)
            equation3.move_to(equation2.get_center())
            
            step2_text = Text("Step 2: 计算", font="SimHei", font_size=24, color=YELLOW)
            step2_text.next_to(equation2, DOWN, buff=1)
            self.play(FadeIn(step2_text))
            self.wait(1)
            
            self.play(
                TransformMatchingTex(equation2, equation3),
                FadeOut(step2_text)
            )
            self.wait(2)
            
            # Divide both sides: x = 5
            equation4 = MathTex("x", "=", "\\\\frac{10}{2}")
            equation4.scale(1.5)
            equation4.move_to(equation3.get_center())
            
            step3_text = Text("Step 3: 除以系数", font="SimHei", font_size=24, color=YELLOW)
            step3_text.next_to(equation3, DOWN, buff=1)
            self.play(FadeIn(step3_text))
            self.wait(1)
            
            self.play(
                TransformMatchingTex(equation3, equation4),
                FadeOut(step3_text)
            )
            self.wait(2)
            
            # Final answer
            answer = MathTex("x", "=", "5")
            answer.scale(2)
            answer.move_to(equation4.get_center())
            answer.set_color(GREEN)
            
            self.play(TransformMatchingTex(equation4, answer))
            
            # Highlight the answer
            box = SurroundingRectangle(answer, color=YELLOW, buff=0.2)
            self.play(Create(box))
            
            # Success message
            success_text = Text("方程求解完成！", font="SimHei", font_size=36, color=GREEN)
            success_text.next_to(answer, DOWN, buff=1)
            self.play(FadeIn(success_text))
            
        else:
            # Generic equation solving animation
            step_group = VGroup()
            for i, step in enumerate(["Step 1", "Step 2"]):
                step_text = Text(f"Step {i+1}: {step[:50]}...", font="SimHei", font_size=20)
                step_text.move_to(ORIGIN + DOWN * (i + 1))
                step_group.add(step_text)
            
            self.play(Write(step_group))
            
            # Final answer
            answer_text = Text("Answer: x = ?", font="SimHei", font_size=28, color=GREEN)
            answer_text.move_to(ORIGIN + DOWN * 3)
            self.play(Write(answer_text))
        
        self.wait(3)
`
  }

  // Build Manim script for geometry problems
  buildGeometryManimScript(question, steps, solution) {
    console.log('📐 生成几何问题Manim脚本...')
    
    // Extract values from the question
    const baseMatch = question.match(/底边[为是：:]*(\d+)/) || question.match(/base\s*[=:]\s*(\d+)/i)
    const heightMatch = question.match(/高[为是：:]*(\d+)/) || question.match(/height\s*[=:]\s*(\d+)/i)
    
    const base = baseMatch ? baseMatch[1] : '8'
    const height = heightMatch ? heightMatch[1] : '6'
    const area = parseInt(base) * parseInt(height) / 2
    
    return `from manim import *

class TriangleArea(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a1a"
        
        # Title
        title = Text("${question}", font="SimHei", font_size=32, color=BLUE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))
        self.wait(1)
        
        # Draw triangle
        triangle = Polygon(
            [-3, -2, 0],  # Bottom left
            [3, -2, 0],   # Bottom right  
            [0, 2, 0],    # Top
            color=WHITE,
            stroke_width=3
        )
        self.play(Create(triangle))
        self.wait(1)
        
        # Add labels
        base_label = MathTex(f"b = {base}", color=YELLOW)
        base_label.next_to(triangle, DOWN)
        
        # Height line
        height_line = DashedLine(
            start=[0, -2, 0],
            end=[0, 2, 0],
            color=GREEN,
            stroke_width=2
        )
        height_label = MathTex(f"h = {height}", color=GREEN)
        height_label.next_to(height_line, RIGHT)
        
        self.play(
            Create(height_line),
            Write(base_label),
            Write(height_label)
        )
        self.wait(2)
        
        # Formula
        formula = MathTex("A = \\\\frac{1}{2} \\\\times b \\\\times h")
        formula.scale(1.2)
        formula.to_edge(RIGHT).shift(UP)
        self.play(Write(formula))
        self.wait(1)
        
        # Substitute values
        substitution = MathTex(f"A = \\\\frac{{1}}{{2}} \\\\times {base} \\\\times {height}")
        substitution.scale(1.2)
        substitution.move_to(formula.get_center() + DOWN * 1.5)
        self.play(TransformFromCopy(formula, substitution))
        self.wait(2)
        
        # Calculate
        calculation = MathTex(f"A = \\\\frac{{{base} \\\\times {height}}}{{2}} = \\\\frac{{{int(base) * int(height)}}}{{2}}")
        calculation.scale(1.2)
        calculation.move_to(substitution.get_center() + DOWN * 1.5)
        self.play(TransformFromCopy(substitution, calculation))
        self.wait(2)
        
        # Final answer
        answer = MathTex(f"A = {area}", color=GREEN)
        answer.scale(1.5)
        answer.move_to(calculation.get_center() + DOWN * 1.5)
        self.play(Write(answer))
        
        # Highlight
        box = SurroundingRectangle(answer, color=YELLOW, buff=0.2)
        self.play(Create(box))
        
        # Fill the triangle
        filled_triangle = triangle.copy()
        filled_triangle.set_fill(BLUE, opacity=0.3)
        self.play(FadeIn(filled_triangle))
        
        self.wait(3)
`
  }

  // 提取具体解题步骤（重构：每一大步为一页，内容完整，顺序严格）
  extractConcreteSteps(solution, question) {
    if (typeof solution !== 'string') return [];

    console.log('📋 开始提取具体步骤，原始解答长度:', solution.length)
    
    let steps = [];

    // 方法1: 尝试提取"详细解题步骤"块
    const detailMatch = solution.match(/\*\*详细解题步骤\*\*([\s\S]*?)(\n\s*\*\*|---|$)/);
    if (detailMatch) {
      console.log('✅ 找到"详细解题步骤"标记')
      const stepsBlock = detailMatch[1];
      const stepMatches = [...stepsBlock.matchAll(/(\d+)\.\s*\*\*(.*?)\*\*([\s\S]*?)(?=\n\d+\.\s*\*\*|$)/g)];
      steps = stepMatches.map(m => {
        const title = m[2].trim();
        const content = m[3].replace(/^\s*[\-\*]\s*/gm, '').replace(/\n{2,}/g, '\n').trim();
        return `【${title}】\n${content}`;
      });
    }

    // 方法2: 如果没有找到，尝试提取带数字的步骤
    if (steps.length === 0) {
      console.log('⚠️ 未找到详细解题步骤，尝试其他格式...')
      
      // 匹配各种步骤格式
      const stepPatterns = [
        /步骤\s*(\d+)[:：]([^步骤]*?)(?=步骤\s*\d+[:：]|$)/gs,
        /第\s*(\d+)\s*步[:：]([^第]*?)(?=第\s*\d+\s*步[:：]|$)/gs,
        /(\d+)[.、]\s*([^0-9][^\n]*(?:\n(?!\d+[.、])[^\n]*)*)/g,
        /Step\s*(\d+)[:：]([^Step]*?)(?=Step\s*\d+[:：]|$)/gis
      ];
      
      for (const pattern of stepPatterns) {
        const matches = [...solution.matchAll(pattern)];
        if (matches.length > 0) {
          console.log(`✅ 使用模式 ${pattern} 找到 ${matches.length} 个步骤`)
          steps = matches.map(match => {
            const stepNum = match[1];
            const content = match[2].trim();
            return `步骤 ${stepNum}: ${content}`;
          });
          break;
        }
      }
    }

    // 方法3: 如果还是没有找到，尝试从解答中提取关键步骤
    if (steps.length === 0) {
      console.log('⚠️ 仍未找到步骤，尝试分析内容...')
      
      const lines = solution.split('\n');
      let currentStep = '';
      let stepIndex = 1;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // 检查是否包含解题关键词
        if (trimmed.includes('首先') || trimmed.includes('然后') || 
            trimmed.includes('接着') || trimmed.includes('最后') ||
            trimmed.includes('第一') || trimmed.includes('第二') ||
            trimmed.includes('移项') || trimmed.includes('计算') ||
            trimmed.includes('化简') || trimmed.includes('求解')) {
          
          if (currentStep) {
            steps.push(`步骤 ${stepIndex}: ${currentStep}`);
            stepIndex++;
          }
          currentStep = trimmed;
        } else if (currentStep && trimmed && !trimmed.startsWith('*')) {
          currentStep += ' ' + trimmed;
        }
      }
      
      if (currentStep) {
        steps.push(`步骤 ${stepIndex}: ${currentStep}`);
      }
    }

    // 如果仍然没有步骤，根据问题类型生成默认步骤
    if (steps.length === 0) {
      console.log('⚠️ 无法提取步骤，生成默认步骤')
      
      if (question.includes('不等式')) {
        steps = [
          '步骤 1: 将常数项移到不等号右边',
          '步骤 2: 将含x的项移到不等号左边',
          '步骤 3: 化简并求解x的范围',
          '步骤 4: 写出最终答案'
        ];
      } else if (question.includes('方程')) {
        steps = [
          '步骤 1: 整理方程，将所有项移到一边',
          '步骤 2: 合并同类项',
          '步骤 3: 求解未知数',
          '步骤 4: 验证答案'
        ];
      } else {
        steps = [
          '步骤 1: 分析题目条件',
          '步骤 2: 应用相关公式或原理',
          '步骤 3: 进行计算',
          '步骤 4: 得出结论'
        ];
      }
    }

    console.log(`📊 最终提取到 ${steps.length} 个步骤`)
    
    // 转换为详细的步骤对象
    const detailedSteps = steps.map((step, index) => {
      // 检查步骤内容类型
      const hasFormula = typeof step === 'string' && (step.includes('=') || step.includes('×') || step.includes('÷') || step.includes('公式'));
      const isGeometry = this.isGeometryQuestion(question, solution);
      const needsGraphic = isGeometry && (index === 0 || (typeof step === 'string' && (step.includes('图') || step.includes('三角形') || step.includes('矩形'))));
      
      // 如果step已经是对象，保留其属性
      if (typeof step === 'object' && step.content) {
        return {
          ...step,
          type: step.type || (hasFormula ? 'formula' : 'text'),
          index: index + 1,
          hasGraphic: step.hasGraphic || needsGraphic,
          graphicType: step.graphicType || (needsGraphic ? this.detectGraphicType(question, step.content) : null)
        };
      }
      
      // 如果step是字符串，创建新对象
      return {
        type: hasFormula ? 'formula' : 'text',
        content: step,
        index: index + 1,
        hasGraphic: needsGraphic,
        graphicType: needsGraphic ? this.detectGraphicType(question, step) : null
      };
    });
    
    return detailedSteps;
  }

  // ✅ 生成TTS音频（支持 Azure + Web Speech API fallback）
  async generateTTSAudio(text, language = 'zh') {
    try {
      console.log('🎤 尝试使用 Azure TTS...');
      
      // 先检查TTS服务器是否可用
      try {
        const healthCheckUrl = 'http://localhost:3002/health';
        console.log('🔍 检查TTS服务器健康状态:', healthCheckUrl);
        
        const healthCheck = await fetch(healthCheckUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2秒超时
        }).catch((err) => {
          console.error('❌ TTS健康检查请求失败:', err.message);
          return null;
        });
        
        if (!healthCheck) {
          console.warn('⚠️ TTS服务器无响应，使用Web Speech API');
          return await this.generateWebSpeechTTS(text, language);
        }
        
        if (!healthCheck.ok) {
          console.warn('⚠️ TTS服务器返回错误状态:', healthCheck.status);
          return await this.generateWebSpeechTTS(text, language);
        }
        
        console.log('✅ TTS服务器健康检查通过');
      } catch (e) {
        console.warn('⚠️ TTS服务器健康检查异常:', e.message);
        return await this.generateWebSpeechTTS(text, language);
      }
      
      // Use the configured endpoint directly (already has /api/tts/generate)
      const ttsEndpoint = this.config.tts.endpoint;
      console.log('📡 发送TTS请求到:', ttsEndpoint);
      console.log('📝 TTS文本长度:', text.length);
      
      // Create axios instance with specific timeout
      const axiosInstance = axios.create({
        timeout: 120000, // 120 seconds
        timeoutErrorMessage: 'TTS request timeout after 120 seconds'
      });
      
      const axiosResp = await axiosInstance.post(ttsEndpoint, {
        text: text,
        language: language,
        provider: 'azure', // Explicitly use Azure TTS
        voice: 'female', // Use female voice for better clarity
        speed: 1.0
      });
      
      const result = axiosResp.data;
      if (result.success && (result.audio_url || result.audio_path || result.local_path)) {
        // TTS service returns audio_url with relative path like /rendered_videos/xxx.mp3
        let audioPath = result.audio_url || result.audio_path || result.local_path;
        console.log('🎵 TTS返回的音频路径:', audioPath);
        
        // Ensure path starts with /rendered_videos/
        if (!audioPath.startsWith('/rendered_videos/')) {
          if (audioPath.startsWith('rendered_videos/')) {
            audioPath = '/' + audioPath;
          } else if (!audioPath.startsWith('/')) {
            audioPath = '/rendered_videos/' + audioPath.split('/').pop();
          }
        }
        
        console.log('✅ Azure TTS 成功:', audioPath);
        return {
          success: true,
          audioPath: audioPath,
          duration: result.duration || 10
        };
      }
      throw new Error('Azure TTS 返回失败');
    } catch (error) {
      console.warn('❌ Azure TTS 失败，使用 Web Speech API fallback:', error.message);
      console.warn('错误类型:', error.code);
      console.warn('完整错误:', error);
      
      // If it's a timeout error, log additional info
      if (error.message.includes('timeout') || error.code === 'ECONNABORTED') {
        console.warn('⏱️ TTS超时详情: 配置的超时时间为120秒，但请求仍然失败');
      }
      
      return await this.generateWebSpeechTTS(text, language);
    }
  }

  // ✅ Node.js 和浏览器兼容的 TTS fallback
  async generateWebSpeechTTS(text, language = 'zh') {
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser && 'speechSynthesis' in window) {
      // 浏览器环境 - 使用 Web Speech API
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;

        const audioBlob = new Blob([], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        resolve({
          success: true,
          audioPath: audioUrl,
          duration: Math.ceil(text.length / 5),
          isFallback: true,
          isBrowser: true
        });
      });
    } else {
      // Node.js 环境 - 创建模拟音频文件
      console.log('🎤 Node.js 环境 - 创建模拟TTS音频...');
      
      // 创建模拟音频文件路径
      const mockAudioPath = `mock_tts_${Date.now()}.mp3`;
      
      return {
        success: true,
        audioPath: mockAudioPath,
        duration: Math.ceil(text.length / 5),
        isFallback: true,
        isNode: true,
        isMock: true
      };
    }
  }

  // 合并音频和视频
  async mergeAudioVideo(videoPath, audioPath) {
    try {
      console.log('🎬 合并音频和视频...')
      
      // 检查是否是blob URL
      if (audioPath && audioPath.startsWith('blob:')) {
        console.log('⚠️ 检测到blob URL音频，跳过合并，返回原视频')
        return {
          success: true,
          finalVideoPath: videoPath,
          fileSize: 0,
          message: 'Blob audio detected, returning original video'
        }
      }
      
      // 浏览器环境下的路径处理
      let fixedVideoPath = videoPath.replace(/[\\/]/g, '/');
      let fixedAudioPath = audioPath.replace(/[\\/]/g, '/');
      
      // 确保路径以 /rendered_videos/ 开头
      if (!fixedVideoPath.startsWith('/rendered_videos/')) {
        if (fixedVideoPath.startsWith('rendered_videos/')) {
          fixedVideoPath = '/' + fixedVideoPath;
        } else if (!fixedVideoPath.startsWith('/')) {
          fixedVideoPath = '/rendered_videos/' + fixedVideoPath.split('/').pop();
        }
      }
      
      if (!fixedAudioPath.startsWith('/rendered_videos/')) {
        if (fixedAudioPath.startsWith('rendered_videos/')) {
          fixedAudioPath = '/' + fixedAudioPath;
        } else if (!fixedAudioPath.startsWith('/')) {
          fixedAudioPath = '/rendered_videos/' + fixedAudioPath.split('/').pop();
        }
      }
      
      console.log('📹 视频文件:', fixedVideoPath)
      console.log('🎵 音频文件:', fixedAudioPath)
      
      // 在浏览器环境中，我们直接调用合并API，不检查文件存在性
      // 服务器端会处理文件检查
      const response = await fetch(this.config.merger.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_path: fixedVideoPath,
          audio_path: fixedAudioPath
        })
      })
      
      const result = await response.json()
      if (result.success && result.final_video_path) {
        const finalVideoPath = result.final_video_path.replace(/[\\/]/g, '/')
        console.log('✅ 音频视频合并成功:', finalVideoPath)
        return {
          success: true,
          finalVideoPath: finalVideoPath,
          fileSize: result.file_size
        }
      } else {
        console.error('❌ 音频视频合并失败:', result.error)
        return {
          success: false,
          error: result.error
        }
      }
    } catch (error) {
      console.error('❌ 音频视频合并异常:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  // 检测是否为几何题
  isGeometryQuestion(question, solution = '') {
    const geometryKeywords = ['三角形', '矩形', '正方形', '圆', '面积', '周长', '体积', '角度', '边长', '底边', '高'];
    const combined = question + ' ' + solution;
    return geometryKeywords.some(keyword => combined.includes(keyword));
  }
  
  // 检测需要的图形类型
  detectGraphicType(question, content = '') {
    const combined = question + ' ' + content;
    if (combined.includes('三角形')) return 'triangle';
    if (combined.includes('矩形') || combined.includes('长方形')) return 'rectangle';
    if (combined.includes('正方形')) return 'square';
    if (combined.includes('圆')) return 'circle';
    return 'triangle'; // 默认三角形
  }
  
  // 判断是否应该使用原生Manim生成器
  shouldUseNativeManim(question, solution) {
    // DISABLE native Manim for now - waterfall works better for showing actual content
    // Native Manim is generating generic placeholder videos
    return false;
    
    // Original logic kept for reference:
    // Only use native Manim for problems that REALLY benefit from specific visualizations
    // const combined = (question + ' ' + solution).toLowerCase();
    // 
    // // Check for specific patterns that need native visualization
    // const needsNativePatterns = [
    //   // Inequalities with number line visualization
    //   /[<>≤≥].*x|x.*[<>≤≥]/,
    //   // Geometry problems that need shape visualization
    //   /三角形.*面积|triangle.*area|圆.*半径|circle.*radius/,
    //   // Functions that need graphing
    //   /y\s*=.*x|f\(x\)\s*=|函数.*图像|graph.*function/,
    // ];
    // 
    // const hasNativePattern = needsNativePatterns.some(pattern => pattern.test(combined));
    // 
    // // Exclude simple calculations or straightforward problems
    // const isSimpleProblem = /化简|simplify|计算|calculate|求值|evaluate/.test(combined) && 
    //                        !hasNativePattern;
    // 
    // return hasNativePattern && !isSimpleProblem;
  }
  
  // 获取图形参数
  getGraphicParams(graphicType) {
    switch(graphicType) {
      case 'triangle':
        return { base: 8, height: 6 }; // 默认参数
      case 'rectangle':
        return { width: 10, height: 6 };
      case 'square':
        return { side: 8 };
      case 'circle':
        return { radius: 5 };
      default:
        return {};
    }
  }
  
  // Build equation solving Manim script with proper animations
  buildEquationSolvingManimScript(question, steps, solution) {
    console.log('🔢 Building equation solving Manim script...')
    
    // Extract the equation from the question
    const equationMatch = question.match(/([^：:]+[=][^。.]+)/) || 
                         question.match(/(\d+\s*[a-zA-Z]\s*[+\-*/]\s*\d+\s*=\s*\d+)/) ||
                         question.match(/([a-zA-Z\d\s+\-*/=]+)/)
    const equation = equationMatch ? equationMatch[1].trim() : '2x + 5 = 15'
    
    // Detect if it's in Chinese or English
    const isEnglish = /[a-zA-Z]/.test(question) && !/[\u4e00-\u9fa5]/.test(question)
    const fontName = isEnglish ? 'Arial' : 'SimHei'
    
    return `from manim import *

class MathSolution(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a1a"
        
        # Title
        title = Text("${question.replace(/"/g, '\\"').substring(0, 50)}", 
                    font="${fontName}", font_size=32, color=BLUE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))
        self.wait(1)
        
        # Show original equation
        try:
            equation = MathTex("${equation.replace(/\\/g, '\\\\')}", font_size=48)
            equation.move_to(ORIGIN + UP * 0.5)
            self.play(Write(equation))
            self.wait(2)
        except:
            # Fallback if MathTex fails
            equation = Text("${equation}", font="${fontName}", font_size=48)
            equation.move_to(ORIGIN + UP * 0.5)
            self.play(Write(equation))
            self.wait(2)
        
        # Show steps
        step_text = Text("${isEnglish ? 'Step-by-step solution:' : '步骤解析：'}", 
                        font="${fontName}", font_size=24, color=YELLOW)
        step_text.next_to(equation, DOWN, buff=0.8)
        self.play(FadeIn(step_text))
        self.wait(1)
        
        # For equation solving, show transformation
        if "=" in "${equation}":
            # Simple animation showing the solution
            solution_text = Text("${isEnglish ? 'Solution: ' : '解：'}${solution.substring(0, 30)}", 
                               font="${fontName}", font_size=28, color=GREEN)
            solution_text.next_to(step_text, DOWN, buff=0.5)
            self.play(
                FadeOut(step_text),
                Write(solution_text)
            )
            self.wait(2)
            
            # Highlight the answer
            box = SurroundingRectangle(solution_text, color=GREEN, buff=0.3)
            self.play(Create(box))
            self.wait(2)
        
        # Final wait
        self.wait(3)`
  }

  // Build geometry problem Manim script with shapes
  buildGeometryManimScript(question, steps, solution) {
    console.log('📐 Building geometry Manim script...')
    
    // Extract values from the question
    const baseMatch = question.match(/底边[为是：:]*(\d+)/) || question.match(/base\s*[=:]\s*(\d+)/i)
    const heightMatch = question.match(/高[为是：:]*(\d+)/) || question.match(/height\s*[=:]\s*(\d+)/i)
    
    const base = baseMatch ? baseMatch[1] : '8'
    const height = heightMatch ? heightMatch[1] : '6'
    const area = parseInt(base) * parseInt(height) / 2
    
    const isEnglish = /[a-zA-Z]/.test(question) && !/[\u4e00-\u9fa5]/.test(question)
    const fontName = isEnglish ? 'Arial' : 'SimHei'
    
    return `from manim import *

class MathSolution(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a1a"
        
        # Title
        title = Text("${question.replace(/"/g, '\\"').substring(0, 50)}", 
                    font="${fontName}", font_size=32, color=BLUE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))
        self.wait(1)
        
        # Draw triangle
        triangle = Polygon(
            [-3, -2, 0],  # Bottom left
            [3, -2, 0],   # Bottom right  
            [0, 2, 0],    # Top
            color=WHITE,
            stroke_width=3
        )
        self.play(Create(triangle))
        self.wait(1)
        
        # Add labels
        base_label = Text("${isEnglish ? 'base' : '底边'} = ${base}", 
                         font="${fontName}", font_size=24, color=YELLOW)
        base_label.next_to(triangle, DOWN)
        
        # Height line
        height_line = DashedLine(
            start=[0, -2, 0],
            end=[0, 2, 0],
            color=GREEN,
            stroke_width=2
        )
        height_label = Text("${isEnglish ? 'height' : '高'} = ${height}", 
                           font="${fontName}", font_size=24, color=GREEN)
        height_label.next_to(height_line, RIGHT)
        
        self.play(
            Create(height_line),
            Write(base_label),
            Write(height_label)
        )
        self.wait(2)
        
        # Show formula
        formula_text = Text("${isEnglish ? 'Area = base × height ÷ 2' : '面积 = 底 × 高 ÷ 2'}", 
                           font="${fontName}", font_size=28, color=WHITE)
        formula_text.move_to(ORIGIN + DOWN * 0.5)
        self.play(Write(formula_text))
        self.wait(2)
        
        # Calculate
        calc_text = Text("${isEnglish ? 'Area' : '面积'} = ${base} × ${height} ÷ 2 = ${area}", 
                        font="${fontName}", font_size=32, color=GREEN)
        calc_text.move_to(formula_text.get_center())
        self.play(Transform(formula_text, calc_text))
        self.wait(3)`
  }

  // Generate a simple fallback script for network retry
  // Build a simple direct Manim script without complex dependencies
  buildSimpleDirectManimScript(steps, question, solution) {
    const isEnglish = /[a-zA-Z]/.test(question) && !/[\u4e00-\u9fa5]/.test(question)
    const fontName = isEnglish ? 'Arial' : 'SimHei'
    
    // Escape for Python
    const escapeForPython = (str) => {
      if (!str) return ''
      // Ensure str is a string
      const strValue = typeof str === 'string' ? str : String(str)
      return strValue.replace(/\\/g, '\\\\')
                     .replace(/"/g, '\\"')
                     .replace(/'/g, "\\'")
                     .replace(/\n/g, ' ')  // Replace newlines with spaces
                     .replace(/\r/g, '')
                     .replace(/\*/g, '')   // Remove markdown stars
                     .substring(0, 200)    // Limit length
    }
    
    const titleText = escapeForPython(question)
    
    // Ensure steps are strings before processing
    const stringSteps = steps.map(step => {
      if (typeof step === 'string') {
        return step
      } else if (step && typeof step === 'object') {
        return step.content || step.text || String(step)
      } else {
        return String(step)
      }
    })
    
    const stepsText = stringSteps.map((step, i) => `${i + 1}. ${escapeForPython(step)}`).join('\\n')
    
    return `from manim import *
import numpy as np
import re

class MathSolution(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a1a"
        
        # Helper function to detect if text contains math expressions
        def has_math_content(text):
            # Check for common math symbols and patterns
            math_patterns = [
                r'[+\-*/=<>≤≥≠]',  # Basic math operators
                r'\\d+\\s*[+\-*/]\\s*\\d+',  # Numbers with operators
                r'[a-zA-Z]\\s*[+\-*/=<>]',  # Variables with operators
                r'\\^|\\*\\*',  # Exponents
                r'sqrt|\\\\frac|\\\\times|\\\\div',  # LaTeX commands
                r'[()].*[+\-*/].*[()]',  # Expressions in parentheses
            ]
            import re
            for pattern in math_patterns:
                if re.search(pattern, text):
                    return True
            return False
        
        # Helper function to convert text to LaTeX format
        def text_to_latex(text):
            # Replace common math symbols with LaTeX equivalents
            latex_text = text
            latex_text = latex_text.replace('×', '\\\\times ')
            latex_text = latex_text.replace('÷', '\\\\div ')
            latex_text = latex_text.replace('≤', '\\\\leq ')
            latex_text = latex_text.replace('≥', '\\\\geq ')
            latex_text = latex_text.replace('≠', '\\\\neq ')
            latex_text = latex_text.replace('*', '\\\\times ')
            latex_text = latex_text.replace('/', '\\\\div ')
            # Handle fractions
            latex_text = re.sub(r'(\\d+)/(\\d+)', r'\\\\frac{\\1}{\\2}', latex_text)
            return latex_text
        
        # Helper function to create text or math content with proper formatting
        def create_content_safe(text, font, font_size, color, max_width=10, is_math_auto=True):
            # Check if this is pure math content
            if is_math_auto and has_math_content(text):
                # Extract the math part and any surrounding text
                import re
                # Try to extract math expression
                math_match = re.search(r'([^:：]*[:：])?\\s*(.+)', text)
                if math_match and math_match.group(1):  # Has label before math
                    label = math_match.group(1).strip()
                    math_expr = math_match.group(2).strip()
                    # Create label as text and math as MathTex
                    label_obj = Text(label, font=font, font_size=font_size, color=color)
                    math_obj = MathTex(text_to_latex(math_expr), font_size=font_size, color=color)
                    result = VGroup(label_obj, math_obj)
                    result.arrange(RIGHT, buff=0.3)
                    return result
                else:
                    # Pure math expression
                    try:
                        return MathTex(text_to_latex(text), font_size=font_size, color=color)
                    except:
                        # Fallback to text if MathTex fails
                        pass
            
            # Regular text handling with wrapping
            words = text.split(' ')
            lines = []
            current_line = []
            
            # Estimate characters per line based on font size
            chars_per_line = int(max_width * 2.5 / (font_size / 24))
            
            for word in words:
                test_line = ' '.join(current_line + [word])
                if len(test_line) > chars_per_line and current_line:
                    lines.append(' '.join(current_line))
                    current_line = [word]
                else:
                    current_line.append(word)
            
            if current_line:
                lines.append(' '.join(current_line))
            
            # Limit to 2 lines for readability
            if len(lines) > 2:
                lines = lines[:2]
                lines[1] = lines[1][:chars_per_line-3] + "..."
            
            # Create text objects for each line
            if len(lines) > 1:
                text_lines = [Text(line, font=font, font_size=font_size, color=color) for line in lines]
                text_group = VGroup(*text_lines)
                text_group.arrange(DOWN, center=False, aligned_edge=LEFT, buff=0.2)
                # Keep the group's reference point at the first line's baseline
                text_group.set_y(text_lines[0].get_y())
                return text_group
            else:
                return Text(lines[0] if lines else text, font=font, font_size=font_size, color=color)
        
        # Title with standard font size
        title = create_content_safe("${titleText}", "${fontName}", 36, BLUE, max_width=11)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(0.5)
        
        # Create steps with proper bullet alignment
        step_texts = []
        ${stringSteps.map((step, i) => `
        # Step ${i + 1}
        # Create bullet number separately
        bullet${i + 1} = Text("${i + 1}.", font="${fontName}", font_size=24, color=WHITE)
        
        # Create step text without the number
        step_text${i + 1} = create_content_safe("${escapeForPython(step)}", 
                                               "${fontName}", 
                                               24, 
                                               WHITE,
                                               max_width=11)
        
        # Align bullet and text on same baseline
        step${i + 1} = VGroup(bullet${i + 1}, step_text${i + 1})
        step${i + 1}.arrange(RIGHT, buff=0.3, aligned_edge=UP)
        
        step_texts.append(step${i + 1})`).join('')}
        
        # Arrange steps vertically with proper spacing
        if step_texts:
            step_group = VGroup(*step_texts)
            step_group.arrange(DOWN, aligned_edge=LEFT, buff=0.5)
            step_group.next_to(title, DOWN, buff=1.0)
            
            # Center the group if needed
            if step_group.height < 4:
                step_group.center()
                step_group.shift(UP * 0.5)
            
            # Center the group
            step_group.move_to(ORIGIN).shift(DOWN * 0.5)
            
            # Animate each step
            for step in step_texts:
                self.play(Write(step), run_time=1.5)
                self.wait(0.8)
        
        # Add a highlight box around the final answer if present
        if len(step_texts) > 0:
            final_step = step_texts[-1]
            box = SurroundingRectangle(final_step, color=YELLOW, buff=0.1)
            self.play(Create(box))
        
        self.wait(2)
`
  }

  generateUltraSimpleScript(question, solution) {
    // Ultra-simple script that will always work and shows actual content
    const isEnglish = /[a-zA-Z]/.test(question) && !/[\u4e00-\u9fa5]/.test(question);
    const fontName = isEnglish ? 'Arial' : 'SimHei';
    
    const escapeForPython = (str) => {
      if (!str) return '';
      return String(str).replace(/\\/g, '\\\\')
                       .replace(/"/g, '\\"')
                       .replace(/'/g, "\\'")
                       .replace(/\n/g, ' ')
                       .replace(/\r/g, ' ');
    };
    
    const safeQuestion = escapeForPython(question).substring(0, 80);
    
    // Extract a simple math expression from the question
    const mathMatch = question.match(/[\d\+\-\*\/\=\>\<\(\)]+/g);
    const hasMath = mathMatch && mathMatch.length > 0;
    const mathExpr = hasMath ? escapeForPython(mathMatch[0]) : '';
    
    return `from manim import *

class MathSolution(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # Title with question
        title = Text("${safeQuestion}",
                    font="${fontName}",
                    color=BLUE,
                    font_size=26).to_edge(UP)
        self.play(FadeIn(title), run_time=0.5)
        self.wait(1)
        
        # Show math expression if found
        ${hasMath ? `try:
            math_expr = MathTex("${mathExpr}", font_size=40, color=BLACK)
            math_expr.move_to(ORIGIN + UP * 0.5)
            self.play(Write(math_expr), run_time=0.8)
            self.wait(1)
        except:
            # Fallback if MathTex fails
            math_text = Text("${mathExpr}", font="${fontName}", font_size=36, color=BLACK)
            math_text.move_to(ORIGIN + UP * 0.5)
            self.play(Write(math_text), run_time=0.8)
            self.wait(1)` : ''}
        
        # Three simple steps
        step1 = Text("${isEnglish ? 'Step 1: Analyze' : '步骤 1: 分析问题'}", 
                    font="${fontName}", color=BLUE_D, font_size=22)
        step1.move_to(ORIGIN ${hasMath ? '+ DOWN * 0.5' : ''})
        self.play(FadeIn(step1, shift=DOWN*0.2), run_time=0.4)
        self.wait(0.5)
        
        step2 = Text("${isEnglish ? 'Step 2: Calculate' : '步骤 2: 计算答案'}", 
                    font="${fontName}", color=BLUE_D, font_size=22)
        step2.next_to(step1, DOWN, buff=0.3)
        self.play(FadeIn(step2, shift=DOWN*0.2), run_time=0.4)
        self.wait(0.5)
        
        step3 = Text("${isEnglish ? 'Step 3: Verify' : '步骤 3: 验证结果'}", 
                    font="${fontName}", color=BLUE_D, font_size=22)
        step3.next_to(step2, DOWN, buff=0.3)
        self.play(FadeIn(step3, shift=DOWN*0.2), run_time=0.4)
        self.wait(1)
        
        # Success indicator
        done = Text("✓ ${isEnglish ? 'Complete!' : '完成！'}",
                   font="${fontName}",
                   color=GREEN,
                   font_size=28)
        done.next_to(step3, DOWN, buff=0.5)
        self.play(FadeIn(done, scale=0.5), run_time=0.5)
        self.wait(2)
`;
  }

  async generateSimpleFallbackScript(question, solution) {
    console.log('📝 生成安全的回退脚本...');
    
    // Enhanced fallback that shows actual problem content
    const isEnglish = /[a-zA-Z]/.test(question) && !/[\u4e00-\u9fa5]/.test(question);
    const fontName = isEnglish ? 'Arial' : 'SimHei';
    
    // Escape quotes and special characters for Python string
    const escapeForPython = (str) => {
      if (!str) return '';
      const strValue = typeof str === 'string' ? str : String(str);
      return strValue.replace(/\\/g, '\\\\')
                     .replace(/"/g, '\\"')
                     .replace(/'/g, "\\'")
                     .replace(/\n/g, '\\n')
                     .replace(/\r/g, '\\r');
    };
    
    // Extract key information from the solution
    const questionEscaped = escapeForPython(question);
    let steps = [];
    
    // Try to extract steps from the solution
    if (solution) {
      // Look for numbered steps or bullet points
      const stepMatches = solution.match(/\d+\.\s*[^\n]+|\*\s*[^\n]+/g);
      if (stepMatches) {
        steps = stepMatches.slice(0, 5).map(s => escapeForPython(s.trim()));
      } else {
        // Split solution into sentences as steps
        const sentences = solution.match(/[^.!?]+[.!?]+/g) || [];
        steps = sentences.slice(0, 5).map(s => escapeForPython(s.trim()));
      }
    }
    
    // Generate a more meaningful fallback script
    return `from manim import *

class SimpleFallback(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # Title
        title = Text("${questionEscaped}",
                    font_size=32,
                    font="${fontName}",
                    color=BLUE).to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # Solution steps
        current_y = 1.5
        ${steps.map((step, index) => `
        step${index + 1} = Text("${step}",
                           font_size=24,
                           font="${fontName}",
                           color=BLACK).move_to([0, ${current_y - index * 0.8}, 0])
        self.play(FadeIn(step${index + 1}))
        self.wait(2)
        `).join('')}
        
        # Final message
        complete = Text("${isEnglish ? 'Solution Complete' : '解答完成'}",
                       font_size=28,
                       font="${fontName}",
                       color=GREEN).to_edge(DOWN)
        self.play(Write(complete))
        self.wait(2)
`;
  }

  // 生成静态视觉内容（fallback）- 现在会生成真实的视频
  async generateStaticVisuals(question, script) {
    console.log('⚠️ 使用回退方案生成真实视频');
    
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
    const outputName = `fallback_${uniqueId}`;
    
    try {
      // 生成简单的Manim脚本
      const simpleScript = await this.generateSimpleFallbackScript(question, script?.solution || '');
      
      // 调用Manim服务器生成视频
      const isBrowser = typeof window !== 'undefined';
      const baseURL = isBrowser ? window.location.origin : 'http://localhost:5173';
      const fullURL = this.config.manim.endpoint.startsWith('http') 
        ? this.config.manim.endpoint 
        : baseURL + this.config.manim.endpoint;
      
      const response = await axios.post(fullURL, {
        script: simpleScript,
        output_name: outputName,
        question: question,
        solution: script?.solution || '',
        duration: 20
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });
      
      if (response.status === 200 && response.data.success) {
        console.log('✅ 回退视频生成成功:', response.data.video_path);
        return [{
          sceneId: 1,
          animationType: 'generated_fallback',
          videoPath: response.data.video_path,
          duration: 20,
          mathContent: question,
          steps: ['显示问题', '展示解答'],
          hasAudio: false,
          fallback: true,
          generated: true
        }];
      }
    } catch (error) {
      console.error('❌ 回退视频生成也失败了:', error.message);
    }
    
    // 如果连简单视频都生成失败，返回最终的静态备用
    console.log('❌ 所有视频生成方案都失败，使用最终静态备用');
    return [{
      sceneId: 1,
      animationType: 'static_fallback',
      videoPath: '/rendered_videos/test_final_universal.mp4',
      duration: 20,
      mathContent: question,
      steps: ['步骤 1', '步骤 2', '步骤 3'],
      hasAudio: false,
      static: true
    }];
  }
  
  // 获取图形描述
  getGraphicDescription(graphicType) {
    const descriptions = {
      'triangle': '三角形',
      'square': '正方形',
      'circle': '圆形',
      'rectangle': '矩形'
    };
    return descriptions[graphicType] || '图形';
  }

  // 保存字幕文件
  async saveSubtitleFile(filename, content) {
    try {
      // 使用现有的文件写入API或创建新的端点
      const response = await fetch('http://localhost:5002/api/save_subtitle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: filename,
          content: content
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save subtitle file: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('❌ Error saving subtitle file:', error);
      throw error;
    }
  }
} 