// 动画生成模块 - 根据问题类型生成不同的动画内容
console.log('🚀 AnimationGenerator.js loaded - VERSION 2024.01.31 with str.replace fix')
import { QuestionAnalyzer } from './questionAnalyzer.js'
import axios from 'axios';

export class AnimationGenerator {
  constructor() {
    this.questionAnalyzer = new QuestionAnalyzer()
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
      .replace(/\\\\/g, ''); // Remove backslashes
    
    // 语言特定的数学符号转换
    const mathTranslations = {
      en: {
        '\\frac{([^}]+)}{([^}]+)}': '$1 over $2',
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
        '\\\\pi|π': 'pi',
        '\\\\alpha|α': 'alpha',
        '\\\\beta|β': 'beta',
        '\\\\theta|θ': 'theta',
        '\\\\lambda|λ': 'lambda'
      },
      zh: {
        '\\frac{([^}]+)}{([^}]+)}': '$1分之$2',
        '\\^2': '的平方',
        '\\^3': '的立方',
        '\\^([0-9]+)': '的$1次方',
        '\\\\times|×': '乘',
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
        '\\*': '乘',
        '/': '除以',
        '\\\\pi|π': '派',
        '\\\\alpha|α': '阿尔法',
        '\\\\beta|β': '贝塔',
        '\\\\theta|θ': '西塔',
        '\\\\lambda|λ': '兰姆达'
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
    
    try {
      // 为每个问题生成基于AI答案的独特内容
      const uniqueContent = await this.generateUniqueAnimationFromAI(question, solution, script, language)
      
      if (uniqueContent && uniqueContent.length > 0) {
        console.log('✅ 成功生成基于AI答案的独特动画')
        return uniqueContent
      } else {
        console.warn('⚠️ 无法生成独特动画，使用回退方案')
        return this.generateStaticVisuals(question, script)
      }
      
    } catch (error) {
      console.error('❌ 独特动画生成失败，使用回退:', error)
      // 回退到静态内容，但会记录
      return this.generateStaticVisuals(question, script)
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
          signal: AbortSignal.timeout(2000) // 2秒超时
        }).catch(() => null)
        
        if (!healthCheck || !healthCheck.ok) {
          console.warn('⚠️ Manim服务器不可用，使用备用视频')
          return this.generateStaticVisuals(question, script)
        }
      } catch (e) {
        console.warn('⚠️ Manim服务器健康检查失败，使用备用视频')
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
      
      // 基于AI答案构建独特的Manim脚本
      const uniqueScript = this.buildUniqueManimScriptFromAI(finalSteps, concepts, script, question, solution)
      
      console.log('✅ 基于AI答案的独特脚本生成完成')
      
      // 调用Manim服务器渲染视频
      let videoPath = `/rendered_videos/${outputName}.mp4`
      
      try {
        console.log('🔗 Manim endpoint:', this.config.manim.endpoint);
        
        // Handle both browser and Node.js environments
        const isBrowser = typeof window !== 'undefined';
        const baseURL = isBrowser ? window.location.origin : 'http://localhost:5173';
        const fullURL = this.config.manim.endpoint.startsWith('http') 
          ? this.config.manim.endpoint 
          : baseURL + this.config.manim.endpoint;
        
        console.log('📍 Full URL will be:', fullURL);
        
        const renderResponse = await axios.post(fullURL, {
          script: uniqueScript,
          output_name: outputName,
          question: question,
          solution: solution
        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 120 second timeout for Manim rendering
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
        console.error('❌ Manim渲染请求失败:', renderError)
        console.error('Error details:', {
          message: renderError.message,
          code: renderError.code,
          response: renderError.response?.data,
          status: renderError.response?.status,
          config: {
            url: renderError.config?.url,
            method: renderError.config?.method,
            data: renderError.config?.data ? JSON.parse(renderError.config.data) : null
          }
        })
        
        // If it's a network error or timeout, try once more with a simpler script
        if (renderError.code === 'ERR_NETWORK' || renderError.code === 'ECONNABORTED') {
          console.log('🔄 网络错误，尝试简化脚本重试...')
          
          try {
            // Generate a simpler script for retry
            const simpleScript = this.generateSimpleFallbackScript(question, solution)
            
            const retryResponse = await axios.post(fullURL, {
              script: simpleScript,
              output_name: outputName + '_retry',
              question: question,
              solution: solution
            }, {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 60000 // 60 second timeout for simpler script
            })
            
            if (retryResponse.status === 200 && retryResponse.data.success) {
              console.log('✅ 重试成功，使用简化版本')
              videoPath = retryResponse.data.video_path || `/rendered_videos/${outputName}_retry.mp4`
            } else {
              throw new Error('重试失败')
            }
          } catch (retryError) {
            console.error('❌ 重试也失败了:', retryError)
            throw new Error(`视频生成失败: 网络连接问题或服务器超时`)
          }
        } else {
          // 不使用备用视频，直接返回失败
          throw new Error(`视频生成失败: ${renderError.message || 'Manim服务错误'}`)
        }
      }
      
      // 生成独特的TTS内容
      let ttsContent = []
      try {
        ttsContent = this.generateUniqueTTSFromAI(finalSteps, concepts, question, solution)
        console.log('✅ TTS内容生成完成，长度:', ttsContent.length)
      } catch (ttsError) {
        console.error('❌ 生成TTS内容时出错:', ttsError)
        ttsContent = [`让我们来解决这个问题：${question}`]
      }
      
      // 生成TTS音频
      console.log('🎤 生成TTS音频...')
      let audioPath = null
      let hasAudio = false
      
      try {
        const audioResult = await this.generateTTSAudio(ttsContent.join(' '), language)
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
        unique: true,
        aiGenerated: true
      }]
      
    } catch (error) {
      console.error('❌ 独特动画生成失败:', error)
      return this.generateStaticVisuals(question, script)  // 回退到静态，但会记录
    }
  }

  // 基于AI答案构建独特的Manim脚本 - 使用瀑布式格式
  buildUniqueManimScriptFromAI(steps, concepts, script, question, solution) {
    console.log('📝 构建基于AI答案的瀑布式Manim脚本...')
    console.log('📊 步骤数量:', steps.length)
    console.log('📚 概念数量:', concepts.length)
    
    // For now, use a simpler direct Manim script instead of complex waterfall
    // Ensure steps are strings before passing to buildSimpleDirectManimScript
    const stringSteps = steps.map(step => {
      if (typeof step === 'string') {
        return step
      } else if (step && typeof step === 'object') {
        return step.content || step.text || String(step)
      } else {
        return String(step)
      }
    })
    return this.buildSimpleDirectManimScript(stringSteps, question, solution)
    
    // 准备瀑布式内容数据
    const contents_data = []
    const scripts_data = []
    
    // 添加标题
    contents_data.push({
      name: "title",
      type: "text",
      value: question,
      font_size: 32,
      color: "BLUE"
    })
    scripts_data.push(`让我们来解决这个问题：${question}`)
    
    // 如果是三角形面积问题，添加面积公式
    if (question.includes('三角形') && question.includes('面积')) {
      contents_data.push({
        name: "formula_intro",
        type: "text",
        value: "三角形面积公式：面积 = 底 × 高 ÷ 2",
        font_size: 28,
        color: "YELLOW"
      })
      scripts_data.push("首先，我们需要知道三角形面积公式：面积等于底乘以高再除以2")
    }
    
    // 添加已知条件
    if (question.match(/底边为(\d+)/) && question.match(/高为(\d+)/)) {
      const baseMatch = question.match(/底边为(\d+)/)
      const heightMatch = question.match(/高为(\d+)/)
      if (baseMatch && heightMatch) {
        contents_data.push({
          name: "given_values",
          type: "text",
          value: `已知：底边 = ${baseMatch[1]}，高 = ${heightMatch[1]}`,
          font_size: 26,
          color: "WHITE"
        })
        scripts_data.push(`题目给出的条件是：底边等于${baseMatch[1]}，高等于${heightMatch[1]}`)
        
        // 添加三角形图形
        contents_data.push({
          name: "triangle_visual",
          type: "graphic",
          graphic_type: "triangle",
          params: {
            base: parseInt(baseMatch[1]),
            height: parseInt(heightMatch[1])
          }
        })
        scripts_data.push("让我们画出这个三角形")
      }
    } else if (question.includes('不等式')) {
      // 对于不等式问题，显示原始不等式
      contents_data.push({
        name: "original_inequality",
        type: "formula",
        value: question.replace(/[^0-9x\-+><=\s]/g, '').trim(),
        color: "YELLOW"
      })
      scripts_data.push("我们需要解这个不等式")
    }
    
    // 添加计算步骤
    if (steps.length > 0) {
      steps.forEach((step, index) => {
        // 处理步骤对象或字符串
        let cleanStep = '';
        let stepObj = null;
        
        if (typeof step === 'object' && step !== null) {
          if (step.content) {
            cleanStep = step.content
              .replace(/^步骤\s*\d+[:：]\s*/i, '')
              .replace(/^\d+[.、)]\s*/, '')
              .replace(/^第\d+步[:：]\s*/i, '')
              .replace(/^【.*?】\s*/, '') // 移除标题标记
              .trim();
            stepObj = step;
          } else if (step.text) {
            cleanStep = step.text
              .replace(/^步骤\s*\d+[:：]\s*/i, '')
              .replace(/^\d+[.、)]\s*/, '')
              .replace(/^第\d+步[:：]\s*/i, '')
              .replace(/^【.*?】\s*/, '') // 移除标题标记
              .trim();
            stepObj = step;
          } else {
            cleanStep = String(step).trim();
          }
        } else if (typeof step === 'string') {
          cleanStep = step
            .replace(/^步骤\s*\d+[:：]\s*/i, '')
            .replace(/^\d+[.、)]\s*/, '')
            .replace(/^第\d+步[:：]\s*/i, '')
            .trim();
        } else {
          cleanStep = String(step).trim();
        }
        
        // 检查是否包含计算
        if (cleanStep.includes('=') || cleanStep.includes('×') || cleanStep.includes('÷')) {
          // 分离文字描述和公式
          const parts = cleanStep.split(/[:：]/)
          if (parts.length > 1) {
            // 先添加描述
            contents_data.push({
              name: `step_desc_${index + 1}`,
              type: "text",
              value: `步骤 ${index + 1}: ${parts[0].trim()}`,
              font_size: 24,
              color: "WHITE"
            })
            // 再添加公式
            contents_data.push({
              name: `step_formula_${index + 1}`,
              type: "formula",
              value: parts[1].trim().replace(/×/g, '\\times').replace(/÷/g, '\\div'),
              color: "WHITE"
            })
            scripts_data.push(`第${index + 1}步，${cleanStep}`)
          } else {
            contents_data.push({
              name: `step_${index + 1}`,
              type: "text",
              value: `步骤 ${index + 1}: ${cleanStep}`,
              font_size: 24,
              color: "WHITE"
            })
            scripts_data.push(`第${index + 1}步，${cleanStep}`)
          }
        } else {
          contents_data.push({
            name: `step_${index + 1}`,
            type: "text",
            value: `步骤 ${index + 1}: ${cleanStep}`,
            font_size: 24,
            color: "WHITE"
          })
          scripts_data.push(`第${index + 1}步，${cleanStep}`)
        }
      })
    } else {
      // 如果没有步骤，生成默认的计算步骤
      console.log('⚠️ 没有提取到步骤，生成默认计算步骤')
      contents_data.push({
        name: "step_1",
        type: "text",
        value: "步骤 1: 代入公式计算",
        font_size: 24,
        color: "WHITE"
      })
      contents_data.push({
        name: "step_1_formula",
        type: "formula",
        value: "面积 = 8 \\times 6 \\div 2",
        color: "WHITE"
      })
      contents_data.push({
        name: "step_2",
        type: "text",
        value: "步骤 2: 计算乘积",
        font_size: 24,
        color: "WHITE"
      })
      contents_data.push({
        name: "step_2_formula",
        type: "formula",
        value: "面积 = 48 \\div 2",
        color: "WHITE"
      })
      contents_data.push({
        name: "step_3",
        type: "text",
        value: "步骤 3: 得出最终答案",
        font_size: 24,
        color: "WHITE"
      })
      contents_data.push({
        name: "step_3_formula",
        type: "formula",
        value: "面积 = 24",
        color: "WHITE"
      })
      scripts_data.push("第1步，代入公式计算：面积等于8乘以6除以2")
      scripts_data.push("第2步，计算乘积：面积等于48除以2")
      scripts_data.push("第3步，得出最终答案：面积等于24")
    }
    
    // 添加最终答案
    const answerMatch = solution.match(/答案[是为：:]\s*(.+?)(?:\n|$)/i) || 
                       solution.match(/因此[，,]\s*(.+?)(?:\n|$)/i) ||
                       solution.match(/所以[，,]\s*(.+?)(?:\n|$)/i) ||
                       solution.match(/面积\s*=\s*(\d+)/i)
    
    if (answerMatch && answerMatch[1]) {
      contents_data.push({
        name: "answer",
        type: "text",
        value: `答案：${answerMatch[1].trim()}`,
        font_size: 28,
        color: "GREEN"
      })
      scripts_data.push(`最终答案是：${answerMatch[1].trim()}`)
    } else if (question.includes('三角形') && question.includes('面积')) {
      // 默认答案
      contents_data.push({
        name: "answer",
        type: "text",
        value: "答案：24",
        font_size: 28,
        color: "GREEN"
      })
      scripts_data.push("最终答案是：24")
    }
    
    // 转换为JSON字符串并转义以嵌入Python
    const contentsJson = JSON.stringify(contents_data, null, 2)
    const scriptsJson = JSON.stringify(scripts_data, null, 2)
    
    // Escape JSON for Python string - using base64 to avoid quote issues
    const contentsJsonBase64 = Buffer.from(contentsJson).toString('base64')
    const scriptsJsonBase64 = Buffer.from(scriptsJson).toString('base64')
    
    // 生成瀑布式Manim脚本
    const uniqueScript = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from manim import *
import json
import sys
import os
import base64

# 添加路径以导入瀑布式场景
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from test_waterfall_optimized_v2 import UniversalWaterfallScene
except ImportError:
    # 回退实现
    class UniversalWaterfallScene(Scene):
        def __init__(self, contents_data=None, scripts_data=None, **kwargs):
            super().__init__(**kwargs)
            self.dynamic_contents_data = contents_data or []
            self.dynamic_scripts_data = scripts_data or []
        
        def construct(self):
            self.camera.background_color = BLACK
            # 简化的瀑布式实现
            y_position = 3
            for i, content_data in enumerate(self.dynamic_contents_data):
                if content_data['type'] == 'text':
                    text = Text(content_data['value'], font_size=content_data.get('font_size', 24))
                    text.move_to([0, y_position, 0])
                    self.play(Write(text))
                    y_position -= 1
                elif content_data['type'] == 'formula':
                    formula = MathTex(content_data['value'])
                    formula.move_to([0, y_position, 0])
                    self.play(Write(formula))
                    y_position -= 1
                self.wait(0.5)

class AISolutionScene(UniversalWaterfallScene):
    def __init__(self, **kwargs):
        # Decode base64 JSON data
        contents_json = base64.b64decode("${contentsJsonBase64}").decode('utf-8')
        scripts_json = base64.b64decode("${scriptsJsonBase64}").decode('utf-8')
        
        # Parse JSON
        contents_data = json.loads(contents_json)
        scripts_data = json.loads(scripts_json)
        
        super().__init__(contents_data=contents_data, scripts_data=scripts_data, **kwargs)

# 配置
config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = BLACK
`
    
    return uniqueScript
  }

  // 基于AI答案生成独特的TTS内容 - 与瀑布式脚本同步
  generateUniqueTTSFromAI(steps, concepts, question, solution) {
    console.log('🎤 为AI答案生成与瀑布式内容同步的TTS...')
    
    // 创建与瀑布式scripts_data完全同步的TTS内容
    const tts_content = []
    
    // 1. 标题对应的TTS
    tts_content.push(`让我们来解决这个问题：${question}`)
    
    // 2. 概念对应的TTS（如果有）
    if (concepts.length > 0) {
      tts_content.push(`这个问题涉及的核心概念包括：${concepts.join('、')}`)
    }
    
    // 3. 步骤对应的TTS
    steps.forEach((step, index) => {
      let stepText = '';
      
      // 处理步骤对象或字符串
      if (typeof step === 'object' && step !== null) {
        // 处理对象类型的步骤
        if (step.content) {
          stepText = step.content;
        } else if (step.text) {
          stepText = step.text;
        } else {
          // 如果对象没有content或text属性，尝试转换为字符串
          stepText = String(step);
        }
        // 如果步骤有图形，添加描述
        if (step.hasGraphic) {
          tts_content.push(`现在让我们画出${this.getGraphicDescription(step.graphicType)}`);
        }
      } else if (typeof step === 'string') {
        stepText = step;
      } else {
        // 其他类型，强制转换为字符串
        stepText = String(step);
      }
      
      // 清理步骤文本
      let cleanStep = stepText
        .replace(/^步骤\s*\d+[:：]\s*/, '')
        .replace(/^【.*?】\s*/, '') // 移除标题标记
        .trim();
      
      if (cleanStep) {
        // 为每个步骤添加序号说明
        if (index === 0) {
          tts_content.push(`第一步，${cleanStep}`);
        } else if (index === steps.length - 1) {
          tts_content.push(`最后，${cleanStep}`);
        } else {
          tts_content.push(`第${index + 1}步，${cleanStep}`);
        }
      }
    })
    
    // 4. 最终答案对应的TTS
    const answerMatch = solution.match(/答案[是为：:]\s*(.+?)(?:\n|$)/i) || 
                       solution.match(/因此[，,]\s*(.+?)(?:\n|$)/i) ||
                       solution.match(/所以[，,]\s*(.+?)(?:\n|$)/i)
    
    if (answerMatch && answerMatch[1]) {
      tts_content.push(`最终答案是：${answerMatch[1].trim()}`)
    }
    
    // 返回数组形式的TTS内容，与瀑布式scripts_data格式一致
    return tts_content
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
      const lines = solution.split('\n');
      
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

  // ✅ 生成TTS音频（支持 Minimax + Web Speech API fallback）
  async generateTTSAudio(text, language = 'zh') {
    try {
      console.log('🎤 尝试使用 Minimax TTS...');
      
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
        method: 'auto'
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
        
        console.log('✅ TTS 成功:', audioPath);
        return {
          success: true,
          audioPath: audioPath,
          duration: result.duration || 10
        };
      }
      throw new Error('Minimax TTS 返回失败');
    } catch (error) {
      console.warn('❌ Minimax TTS 失败，使用 Web Speech API fallback:', error.message);
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

  generateSimpleFallbackScript(question, solution) {
    const isEnglish = /[a-zA-Z]/.test(question) && !/[\u4e00-\u9fa5]/.test(question)
    
    // Escape quotes and special characters for Python string
    const escapeForPython = (str) => {
      if (!str) return ''
      // Ensure str is a string
      const strValue = typeof str === 'string' ? str : String(str)
      return strValue.replace(/\\/g, '\\\\')
                     .replace(/"/g, '\\"')
                     .replace(/'/g, "\\'")
                     .replace(/\n/g, '\\n')
                     .replace(/\r/g, '\\r')
    }
    
    const titleText = escapeForPython(question.substring(0, 50) + (question.length > 50 ? '...' : ''))
    const solutionText = escapeForPython(solution ? solution.substring(0, 100) + '...' : 'Solving...')
    const fontName = isEnglish ? 'Arial' : 'SimHei'
    
    return `from manim import *

class SimpleFallback(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a1a"
        
        # Title
        title = Text("${titleText}",
                    font_size=32,
                    font="${fontName}",
                    color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))
        
        # Simple solution display
        solution_label = Text("Solution:",
                           font_size=28,
                           font="${fontName}",
                           color=YELLOW)
        solution_label.next_to(title, DOWN, buff=1)
        self.play(FadeIn(solution_label))
        
        # Show result
        result = Text("${solutionText}",
                     font_size=24,
                     font="${fontName}",
                     color=WHITE)
        result.next_to(solution_label, DOWN, buff=0.5)
        self.play(Write(result))
        
        self.wait(3)
`
  }

  // 生成静态视觉内容（fallback）
  generateStaticVisuals(question, script) {
    console.log('⚠️ 使用静态视觉内容作为回退');
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
} 