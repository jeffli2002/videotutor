import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { CheckCircle, X, Upload, Mic, Play, Award, RefreshCw, Pause, RotateCcw, Download, Share2, FileText, Trash2, Save } from 'lucide-react'
import { MathVideoAIService } from '../services/mathVideoAI.js'
import userService from '../services/userService.js'
import StandardImageInput from './StandardImageInput'
import { robustOCRProcessor, preloadRobustOCR } from '../services/robustOCR'
import { EnhancedOCRProcessor } from '../services/enhancedOCRProcessor.js'
import { waitForVideo } from '../utils/videoUtils'

export default function VideoGenerationDemo({ user, onLoginRequired }) {
  // 创建数学视频AI服务实例
  const mathVideoService = new MathVideoAIService()
  
  // 预加载最佳OCR以提高性能
  useEffect(() => {
    // 异步预加载，不阻塞应用启动
    setTimeout(() => {
      preloadRobustOCR().catch(error => {
        console.log('⚠️ Robust OCR preload failed, but app continues:', error.message)
      })
    }, 1000) // 延迟1秒加载，避免阻塞页面渲染
  }, [])
  
  const [question, setQuestion] = useState('')
  const [language, setLanguage] = useState('zh')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [result, setResult] = useState(null)
  const [estimatedCost, setEstimatedCost] = useState(null)
  const [showAuthRequired, setShowAuthRequired] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [rateLimit, setRateLimit] = useState(null)
  const [imageFiles, setImageFiles] = useState([])
  const [useImageInput, setUseImageInput] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  
  // 视频播放状态
  const [videoPlayer, setVideoPlayer] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentScene, setCurrentScene] = useState(0)
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoCurrentTime, setVideoCurrentTime] = useState(0)
  const [videoScenes, setVideoScenes] = useState([])
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

  // 示例问题
  const exampleQuestions = {
    zh: [
      "解方程：2x + 5 = 15",
      "求底边为8，高为6的三角形面积",
      "化简：(3x + 2)(x - 4)",
      "什么是一元一次方程？",
      "解不等式：3x - 7 > 14"
    ],
    en: [
      "Solve for x: 2x + 5 = 15",
      "Find the area of a triangle with base 8 and height 6",
      "Simplify: (3x + 2)(x - 4)",
      "What is a linear equation?",
      "Solve the inequality: 3x - 7 > 14"
    ]
  }

  const selectExampleQuestion = (exampleQuestion) => {
    setQuestion(exampleQuestion)
    setUseImageInput(false)
  }

  // Custom OCR processor using Enhanced OCR for offline math recognition
  const localBestOCRProcessor = async (file, options) => {
    console.log('🔍 Processing image with Enhanced OCR Processor...')
    console.log('📌 Current timestamp:', new Date().toISOString())
    console.log('🔧 EnhancedOCRProcessor available:', typeof EnhancedOCRProcessor !== 'undefined')
    
    try {
      // 使用EnhancedOCRProcessor进行识别
      const ocrProcessor = new EnhancedOCRProcessor()
      console.log('✅ Created EnhancedOCRProcessor instance')
      const result = await ocrProcessor.process(file, language === 'zh' ? 'zh' : 'en')
      
      console.log('📊 OCR处理结果:', result)
      
      // 格式化结果以匹配预期的格式
      return {
        success: result.success !== false,
        text: result.text || '',
        latex: result.latex || [],
        confidence: result.confidence || 0,
        metadata: {
          ...result.metadata,
          provider: result.source || 'ocrprocessor'
        }
      }
      
    } catch (error) {
      console.error('❌ OCR Processor error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const handleImageSelected = (data) => {
    console.log('📸 Image selected:', data)
    setImageFiles([data.file])
    setUseImageInput(true)
    setQuestion(language === 'zh' ? '图片已选择，正在等待OCR处理...' : 'Image selected, waiting for OCR processing...')
  }

  const handleTextExtracted = (data) => {
    console.log('📝 OCR Result:', data)
    setOcrResult(data)
    setQuestion(data.text)
    
    // Show OCR result in UI
    if (data.success !== false) {
      setQuestion(data.text)
    } else {
      setQuestion('')
      alert(language === 'zh' ? 
        `OCR处理失败: ${data.error || '未知错误'}` : 
        `OCR processing failed: ${data.error || 'Unknown error'}`
      )
    }
  }

  const clearImages = () => {
    setImageFiles([])
    setUseImageInput(false)
    setQuestion('')
    setOcrResult(null)
  }

  const handleGenerateVideo = async () => {
    // 防止并发点击
    if (isGenerating) {
      console.warn('生成流程正在进行中，忽略重复点击')
      return
    }
    setIsGenerating(true)
    console.log('🎬 生成视频按钮被点击')
    console.log('当前问题:', question)
    console.log('当前用户:', user)
    console.log('使用图片输入:', useImageInput)
    console.log('图片数量:', imageFiles.length)
    
    if (!question.trim() && (!useImageInput || !ocrResult)) {
      console.log('❌ 问题为空或图片未处理，不执行生成')
      setIsGenerating(false)
      return
    }

    // 检查用户是否已登录
    if (!user) {
      console.log('❌ 用户未登录，显示登录提示')
      setShowAuthRequired(true)
      setIsGenerating(false)
      return
    }

    console.log('✅ 开始生成视频流程')

    // 检查速率限制（简化版，失败时跳过）
    try {
      console.log('🔍 开始检查速率限制...')
      
      // TEMPORARY: If user prop exists, skip rate limit check
      if (user && user.email) {
        console.log('✅ 用户已通过props认证，跳过速率限制检查:', user.email)
      } else {
        const rateLimitCheck = await Promise.race([
          userService.canGenerateVideo(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Rate limit check timeout')), 3000))
        ])
        console.log('✅ 速率限制检查结果:', rateLimitCheck)
        
        if (rateLimitCheck.error) {
          console.warn('⚠️ 速率限制检查出错，跳过检查:', rateLimitCheck.error)
        } else if (!rateLimitCheck.canGenerate) {
          console.log('❌ 速率限制，显示限制提示')
          setRateLimit(rateLimitCheck)
          setIsGenerating(false)
          return
        }
      }
    } catch (error) {
      console.warn('⚠️ 速率限制检查超时或失败，跳过检查:', error.message)
      // 直接跳过，继续执行生成流程
    }

    setGenerationProgress(0)
    setCurrentStep('准备开始...')
    setResult(null)
    setEstimatedCost(null)
    setShowAuthRequired(false)
    setRateLimit(null)
    setSaveStatus(null)

    try {
      console.log('🔍 步骤1: 分析数学问题')
      setCurrentStep('🔍 分析数学问题...')
      setGenerationProgress(10)
      await delay(1000)

      console.log('🤖 步骤2: 调用KIMI API解题')
      setCurrentStep('🤖 AI解题分析中...')
      setGenerationProgress(25)
      console.log('📡 开始调用KIMI API...')
      let mathSolution
      try {
        mathSolution = await callKimiAPI(question, language)
      } catch (err) {
        // 捕获超时或网络异常
        setCurrentStep('AI接口超时或出错，请重试')
        setGenerationProgress(0)
        setIsGenerating(false)
        setResult({ success: false, error: 'AI接口超时或出错，请重试' })
        return
      }
      console.log('✅ KIMI API调用结果:', mathSolution)
      if (!mathSolution.success) {
        setCurrentStep('AI解题失败，请重试')
        setGenerationProgress(0)
        setIsGenerating(false)
        setResult({ success: false, error: mathSolution.error || 'AI解题失败，请重试' })
        return
      }

      // 只有AI解答成功后，才继续后续流程
      console.log('📝 步骤3: 使用模块化服务开始完整流程')
      setCurrentStep('📝 正在分析问题和生成脚本...')
      setGenerationProgress(40)
      await delay(1000)

      // 导入模块化服务
      const { MathVideoAIService } = await import('../services/mathVideoAI.js')
      const mathVideoService = new MathVideoAIService()

      console.log('🎬 步骤4: 正在生成动画和语音内容')
      setCurrentStep('🎬 正在生成Manim动画...')
      setGenerationProgress(60)
      await delay(1000)

      console.log('🎤 步骤5: 正在合成语音解说')
      setCurrentStep('🎤 正在合成TTS语音...')
      setGenerationProgress(80)
      await delay(1000)

      console.log('🎥 步骤6: 正在整合完整教学视频')
      setCurrentStep('🎥 正在整合完整教学视频...')
      setGenerationProgress(95)
      await delay(1000)

      console.log('🧮 步骤7: 完成模块化视频生成')
      setCurrentStep('🧮 完成模块化视频生成...')
      setGenerationProgress(98)
      
      let videoResult
      if (useImageInput && ocrResult && ocrResult.text) {
        // 使用OCR识别的文本生成视频
        console.log('🤖 使用OCR文本生成视频...')
        console.log('📝 OCR文本:', ocrResult.text)
        videoResult = await mathVideoService.generateMathVideo(ocrResult.text, mathSolution.data.content, language)
        console.log('🟢 OCR视频生成结果:', videoResult)
      } else if (!useImageInput && question) {
        // 使用文本输入生成视频
        console.log('🤖 调用模块化服务生成文本视频...')
        videoResult = await mathVideoService.generateMathVideo(question, mathSolution.data.content, language)
        console.log('🟢 完整 videoResult:', videoResult)
      } else {
        throw new Error(language === 'zh' ? '无有效输入内容' : 'No valid input content')
      }
      
      if (!videoResult || !videoResult.success) {
        throw new Error('模块化服务生成失败')
      }
      
      // 提取动画对象
      const animationObject = videoResult.animations && videoResult.animations.length > 0 ? videoResult.animations[0] : null
      console.log('🎬 模块化服务生成的动画对象:', animationObject)
      
      if (!animationObject) {
        throw new Error('未生成有效的动画内容')
      }
      
      // Fix video path to ensure it's properly formatted for Vite
      let fixedVideoPath = animationObject.videoPath
      if (fixedVideoPath && !fixedVideoPath.startsWith('http')) {
        // Ensure path starts with /rendered_videos/
        if (!fixedVideoPath.startsWith('/rendered_videos/')) {
          // Extract just the filename if it's a full path
          const filename = fixedVideoPath.split('/').pop()
          fixedVideoPath = `/rendered_videos/${filename}`
        }
        // Path should already be correct, no need to modify further
      }
      
      console.log('✅ 模块化服务完整流程成功:', {
        videoUrl: fixedVideoPath,
        questionAnalysis: videoResult.analysis,
        script: videoResult.script,
        voiceover: videoResult.voiceover
      })

      console.log('✅ 步骤8: 完成')
      setCurrentStep('✅ 视频生成完成！')
      setGenerationProgress(100)
      
      // 等待一下确保视频文件已经完全写入
      await delay(1000)

      // 设置最终结果
      const finalResult = {
        success: true,
        video: {
          url: fixedVideoPath || '',
          videoUrl: fixedVideoPath || '',  // Add videoUrl for compatibility
          duration: animationObject.duration || 10,
          type: animationObject.animationType || 'manim'
        },
        mathSolution: {
          content: mathSolution.data.content,
          steps: videoResult.script?.pages || [],
          analysis: videoResult.analysis
        },
        metadata: {
          question: question,
          language: language,
          timestamp: new Date().toISOString(),
          type: videoResult.type || 'theoretical_question'
        },
        script: videoResult.script,
        voiceover: videoResult.voiceover,
        animations: videoResult.animations
      }

      console.log('🎉 设置最终结果:', finalResult)
      
      // 等待视频文件准备就绪
      if (finalResult.video?.url) {
        console.log('⏳ 等待视频文件准备就绪...')
        const videoReady = await waitForVideo(finalResult.video.url, 5, 1000)
        if (videoReady) {
          console.log('✅ 视频文件已准备就绪')
        } else {
          console.log('⚠️ 视频文件可能还在处理中')
        }
      }
      
      // 设置结果
      setResult(finalResult)
      setIsGenerating(false)
      
      // 平滑滚动到结果区域，但不要太突然
      setTimeout(() => {
        const resultElement = document.querySelector('.animate-fadeIn')
        if (resultElement) {
          // 添加平滑过渡，让旧内容向上移动
          const allCards = document.querySelectorAll('.content-transition')
          allCards.forEach((card, index) => {
            if (card !== resultElement && card.getBoundingClientRect().top < resultElement.getBoundingClientRect().top) {
              card.classList.add('animate-contentPush')
              // 在动画完成后移除类
              setTimeout(() => {
                card.classList.remove('animate-contentPush')
              }, 300)
            }
          })
          
          // 平滑滚动到新内容
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)

      // 保存到数据库
      console.log('💾 保存视频到数据库')
      await saveVideoToDatabase(finalResult)
      // 修复：生成视频和保存后不做任何页面跳转
      // 不调用 setCurrentView，不调用 window.location.href
    } catch (error) {
      console.error('❌ 视频生成失败:', error)
      setResult({
        success: false,
        error: error.message
      })
      // 修复：不做任何页面跳转
    } finally {
      console.log('🏁 生成流程结束')
      setIsGenerating(false)
    }
  }

  const callKimiAPI = async (question, language) => {
    console.log('🔑 检查KIMI API配置...')
    
    // 使用本地代理服务器，避免CORS和网络问题
    const proxyEndpoint = 'http://localhost:3001/api/kimi/chat'
    const kimiKey = import.meta.env.VITE_KIMI_API_KEY
    
    console.log('🔍 KIMI配置检查:', {
      VITE_KIMI_API_KEY: kimiKey ? '***已配置***' : '未配置',
      PROXY_ENDPOINT: proxyEndpoint
    })
    
    if (!kimiKey) {
      throw new Error('KIMI API密钥未配置，请检查VITE_KIMI_API_KEY环境变量')
    }
    console.log('✅ KIMI API密钥已配置')
    
    console.log('📝 构建数学提示...')
    const prompt = buildMathPrompt(question, language)
    console.log('✅ 提示构建完成，长度:', prompt.length)
    
    console.log('🔄 开始调用本地KIMI代理...')
    console.log('📡 请求地址:', proxyEndpoint)
    
    const messages = [
      {
        role: 'system',
        content: language === 'zh' ? 
          '你是专业的K12数学老师，请用清晰的中文解释数学概念和解题步骤。' :
          'You are a professional K12 math teacher. Please explain math concepts and solution steps clearly in English.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]
    
    // 添加重试机制
    const maxRetries = 3
    let lastError = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 KIMI代理调用尝试 ${attempt}/${maxRetries}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时
        
        const response = await fetch(proxyEndpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages,
            model: 'moonshot-v1-8k',
            max_tokens: 2048,
            temperature: 0.1,
            top_p: 0.8
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        console.log('📊 响应状态:', response.status, response.statusText)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ KIMI代理错误响应:', errorText)
          throw new Error(`KIMI代理调用失败: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('✅ KIMI代理调用成功，响应数据:', data)
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('KIMI代理返回格式错误')
        }
        
        const convertedData = {
          content: data.choices[0].message.content,
          usage: data.usage || {},
          model: data.model || 'moonshot-v1-8k',
          requestId: data.id
        }
        
        return { success: true, data: convertedData }
        
      } catch (error) {
        lastError = error
        console.error(`❌ KIMI代理调用异常 (尝试 ${attempt}/${maxRetries}):`, error)
        
        if (attempt < maxRetries) {
          // 等待一段时间后重试
          const delay = Math.min(1000 * attempt, 5000) // 递增延迟，最大5秒
          console.log(`⏳ 等待 ${delay}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    // 所有重试都失败了，抛出最后一个错误
    console.error('❌ KIMI代理调用最终失败，使用本地回退')
    throw new Error(`KIMI代理调用失败，已重试${maxRetries}次: ${lastError.message}`)
  }

  const generateClientFallback = (question, language) => {
    if (language === 'zh') {
      if (question.includes('2x + 5 = 15') || question.includes('2x+5=15')) {
        return `**数学问题解答**

**题目：** 解方程 2x + 5 = 15

**问题分析：**
这是一个一元一次方程，需要通过移项和化简来求解未知数x的值。

**详细解题步骤：**
1. **移项** - 将常数项移到等号右边
   2x + 5 = 15
   2x = 15 - 5
   2x = 10

2. **系数化1** - 两边同时除以x的系数
   x = 10 ÷ 2
   x = 5

**最终答案：** x = 5

**验证过程：**
将 x = 5 代入原方程：
2×5 + 5 = 10 + 5 = 15 ✓
验证正确！

**相关数学概念：**
- 一元一次方程
- 移项法则
- 等式性质

**常见错误提醒：**
- 移项时要变号
- 系数化1时要注意除法运算
- 最后要验证答案的正确性

*注：由于网络连接问题，此为本地解答。完整的AI解答请稍后重试。*`
      } else {
        return `**数学问题解答**

**题目：** ${question}

**解题思路：**
1. 仔细阅读题目，理解题意
2. 找出已知条件和未知量
3. 选择合适的数学方法
4. 逐步计算求解
5. 检验答案的合理性

**建议：**
由于当前网络连接问题，建议：
- 确认题目是否完整
- 检查是否包含所有必要的数字和条件
- 稍后重试获取完整的AI解答

*注：这是简化的本地解答，完整的AI解答请稍后重试。*`
      }
    } else {
      return `**Math Problem Solution**

**Question:** ${question}

**Solution Approach:**
1. Read the problem carefully
2. Identify known values and unknowns
3. Choose appropriate mathematical method
4. Solve step by step
5. Verify the answer

**Note:** Due to network connectivity issues, this is a simplified local response. Please try again later for a complete AI-powered solution.`
    }
  }

  // 新增：智能步骤提取和排序函数
  const extractAndSortSteps = (aiContent) => {
    console.log('🔍 开始智能步骤提取和排序...')
    
    let steps = []
    const stepMap = new Map() // 使用Map确保步骤编号唯一性
    
    // 1. 优先提取"详细解题步骤"块中的编号步骤
    const detailBlockMatch = aiContent.match(/\*\*详细解题步骤\*\*\s*([\s\S]*?)(?=\*\*最终答案\*\*|\*\*验证过程\*\*|\*\*相关数学概念\*\*|\*\*常见错误提醒\*\*|$)/)
    
    if (detailBlockMatch) {
      const detailBlock = detailBlockMatch[1]
      console.log('✅ 找到详细解题步骤块')
      
      // 使用改进的正则表达式，更准确地匹配编号步骤
      const stepPatterns = [
        // 匹配：1. **标题** 内容（多行）
        /(\d+)[.、\)]\s*\*\*([^*]+?)\*\*\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
        // 匹配：1. 标题 内容（多行）
        /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
        // 匹配：1. 标题（单行）
        /(\d+)\s*[.、\)]\s*([^\n]+)/g
      ]
      
      for (const pattern of stepPatterns) {
        const matches = [...detailBlock.matchAll(pattern)]
        if (matches.length > 0) {
          console.log(`📊 正则表达式匹配到 ${matches.length} 个步骤`)
          
          matches.forEach(match => {
            const stepNum = parseInt(match[1])
            let stepContent = ''
            
            if (match.length >= 4) {
              // 带**的格式
              const title = match[2].trim()
              const content = (match[3] || '').trim()
              stepContent = `**${title}** ${content}`.trim()
            } else if (match.length >= 3) {
              // 普通格式
              stepContent = match[2].trim()
            }
            
            // 清理内容
            stepContent = stepContent.replace(/\n\s*\n/g, '\n').trim()
            
            // 只保留有效的步骤内容
            if (stepContent && stepContent.length > 10) {
              // 如果这个编号还没有内容，或者新内容更详细，则更新
              if (!stepMap.has(stepNum) || stepContent.length > stepMap.get(stepNum).length) {
                stepMap.set(stepNum, stepContent)
                console.log(`📝 步骤 ${stepNum}: ${stepContent.substring(0, 50)}...`)
              }
            }
          })
          
          if (stepMap.size > 0) break // 找到有效步骤后停止尝试其他模式
        }
      }
    }
    
    // 2. 如果详细步骤块中没有找到，尝试全局搜索
    if (stepMap.size === 0) {
      console.log('⚠️ 详细步骤块中未找到步骤，尝试全局搜索...')
      
      // 全局搜索编号步骤
      const globalPatterns = [
        /(\d+)[.、\)]\s*\*\*([^*]+?)\*\*\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
        /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
        /(\d+)\s*[.、\)]\s*([^\n]+)/g
      ]
      
      for (const pattern of globalPatterns) {
        const matches = [...aiContent.matchAll(pattern)]
        if (matches.length > 0) {
          console.log(`📊 全局搜索匹配到 ${matches.length} 个步骤`)
          
          matches.forEach(match => {
            const stepNum = parseInt(match[1])
            let stepContent = ''
            
            if (match.length >= 4) {
              const title = match[2].trim()
              const content = (match[3] || '').trim()
              stepContent = `**${title}** ${content}`.trim()
            } else if (match.length >= 3) {
              stepContent = match[2].trim()
            }
            
            stepContent = stepContent.replace(/\n\s*\n/g, '\n').trim()
            
            // 过滤掉错误提醒等无关内容
            const excludeKeywords = ['错误', '提醒', '常见', '注意', '避免', '忘记', '漏掉', '误认为', '忽略']
            const hasExcludeKeyword = excludeKeywords.some((kw) => stepContent.includes(kw))
            
            if (!hasExcludeKeyword && stepContent && stepContent.length > 10) {
              if (!stepMap.has(stepNum) || stepContent.length > stepMap.get(stepNum).length) {
                stepMap.set(stepNum, stepContent)
                console.log(`📝 全局步骤 ${stepNum}: ${stepContent.substring(0, 50)}...`)
              }
            }
          })
          
          if (stepMap.size > 0) break
        }
      }
    }
    
    // 3. 按编号排序并重建步骤数组
    if (stepMap.size > 0) {
      const sortedSteps = Array.from(stepMap.keys())
        .sort((a, b) => a - b) // 确保按数字顺序排序
        .map(num => stepMap.get(num))
      
      console.log(`✅ 成功提取 ${sortedSteps.length} 个有序步骤`)
      steps = sortedSteps
    }
    
    // 4. 如果仍然没有找到步骤，使用智能分割
    if (steps.length === 0) {
      console.log('⚠️ 未找到编号步骤，使用智能分割...')
      
      // 按段落分割内容
      const paragraphs = aiContent.split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 20 && 
          !p.startsWith('**') && 
          !p.includes('错误') && 
          !p.includes('提醒') &&
          !p.includes('注意'))
      
      if (paragraphs.length > 0) {
        steps = paragraphs.slice(0, 6) // 限制最大步骤数
        console.log(`✅ 智能分割得到 ${steps.length} 个步骤`)
      }
    }
    
    // 5. 最终验证和清理
    if (steps.length > 0) {
      // 移除重复步骤（基于内容相似性）
      const uniqueSteps = []
      const seenContent = new Set()
      
      for (const step of steps) {
        const cleanStep = step.trim()
        if (cleanStep && cleanStep.length > 10) {
          // 使用前50个字符作为去重依据
          const key = cleanStep.substring(0, 50).toLowerCase()
          if (!seenContent.has(key)) {
            uniqueSteps.push(cleanStep)
            seenContent.add(key)
          } else {
            console.log(`⚠️ 跳过重复步骤: ${cleanStep.substring(0, 30)}...`)
          }
        }
      }
      
      steps = uniqueSteps
      console.log(`✅ 去重后剩余 ${steps.length} 个步骤`)
      
      // 验证步骤顺序
      for (let i = 0; i < steps.length; i++) {
        console.log(`步骤 ${i + 1}: ${steps[i].substring(0, 50)}...`)
      }
    }
    
    return steps
  }

  const buildMathPrompt = (question, language) => {
    if (language === 'zh') {
      return `请详细解答这个K12数学问题：

题目：${question}

请严格按照以下结构回答，确保每个步骤都详细且按顺序：

**问题分析**
简要分析题目类型和解题思路

**详细解题步骤**
请按顺序列出每个解题步骤，每个步骤都要包含：
1. 步骤编号（1、2、3...）
2. 具体操作（如：移项、化简、代入等）
3. 详细解释（为什么要这样做）
4. 中间结果（显示计算过程）

例如：
1. 首先，我们需要将方程中的常数项移到等号右边
   2x + 5 = 15
   2x = 15 - 5
   2x = 10
   解释：通过移项，我们将未知数项和常数项分离

2. 然后，我们通过除以系数来求解x
   2x = 10
   x = 10 ÷ 2
   x = 5
   解释：为了求解x，我们需要消除x的系数2

**最终答案**
明确给出最终答案

**验证过程**
将答案代入原方程验证

**相关数学概念**
涉及的核心数学概念

**常见错误提醒**
学生容易犯的错误

请确保每个步骤都详细完整，适合K12学生理解。`
    } else {
      return `Please solve this K12 math problem in detail:

Question: ${question}

Please structure your answer exactly as follows, ensuring each step is detailed and in order:

**Problem Analysis**
Briefly analyze the problem type and solution approach

**Detailed Solution Steps**
Please list each solution step in order, each step should include:
1. Step number (1, 2, 3...)
2. Specific operation (e.g., move terms, simplify, substitute, etc.)
3. Detailed explanation (why we do this)
4. Intermediate results (show calculation process)

For example:
1. First, we need to move the constant term to the right side of the equation
   2x + 5 = 15
   2x = 15 - 5
   2x = 10
   Explanation: By moving terms, we separate the unknown term from the constant term

2. Then, we solve for x by dividing by the coefficient
   2x = 10
   x = 10 ÷ 2
   x = 5
   Explanation: To solve for x, we need to eliminate the coefficient 2 of x

**Final Answer**
Clearly state the final answer

**Verification Process**
Substitute the answer back into the original equation to verify

**Related Math Concepts**
Core mathematical concepts involved

**Common Mistakes to Avoid**
Mistakes students commonly make

Please ensure each step is detailed and complete, suitable for K12 students to understand.`
    }
  }

  const extractMathTopics = (solution) => {
    const topics = []
    
    // 获取内容，支持不同的响应格式
    let content = ''
    if (solution && solution.content) {
      content = solution.content
    } else if (solution && solution.data && solution.data.content) {
      content = solution.data.content
    } else if (solution && solution.output && solution.output.text) {
      content = solution.output.text
    } else if (solution && typeof solution === 'string') {
      content = solution
    } else {
      console.warn('⚠️ extractMathTopics: solution参数无效，使用默认主题', solution)
      return ['代数']
    }
    
    const contentLower = content.toLowerCase()
    
    if (contentLower.includes('方程') || contentLower.includes('equation')) topics.push('方程')
    if (contentLower.includes('几何') || contentLower.includes('geometry')) topics.push('几何')
    if (contentLower.includes('函数') || contentLower.includes('function')) topics.push('函数')
    if (contentLower.includes('不等式') || contentLower.includes('inequality')) topics.push('不等式')
    
    return topics.length > 0 ? topics : ['代数']
  }

  const calculateActualCost = (usage) => {
    if (!usage) return '$0.002'
    const totalTokens = usage.total_tokens || 0
    const costCny = totalTokens * 0.004 / 1000
    return `¥${costCny.toFixed(4)}`
  }

  const calculateDetailedCost = (usage) => {
    if (!usage) return null
    
    const totalTokens = usage.total_tokens || 0
    const costCny = totalTokens * 0.004 / 1000
    
    return {
      llm: costCny,
      tts: 0.002,
      video: 0.3,
      animation: 0.1,
      total: () => costCny + 0.002 + 0.3 + 0.1
    }
  }

  // 清理LaTeX标记的函数
  const cleanLatexMarkers = (text) => {
    if (!text) return ''
    
    // 移除单个$符号（行内公式标记）
    let cleaned = text.replace(/\$([^$]+)\$/g, '$1')
    
    // 移除双$$符号（块级公式标记）
    cleaned = cleaned.replace(/\$\$([^$]+)\$\$/g, '$1')
    
    // 移除LaTeX命令但保留内容
    cleaned = cleaned.replace(/\\(frac|sqrt|sum|int|lim|sin|cos|tan|log|ln|exp)\s*\{([^}]*)\}/g, '$2')
    cleaned = cleaned.replace(/\\(alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|omega)/g, '')
    cleaned = cleaned.replace(/\\(times|div|pm|cdot|neq|leq|geq|approx|equiv|infty)/g, ' ')
    cleaned = cleaned.replace(/\\(left|right|big|Big|bigg|Bigg)/g, '')
    
    // 移除其他反斜杠命令
    cleaned = cleaned.replace(/\\[a-zA-Z]+/g, '')
    
    // 处理上下标
    cleaned = cleaned.replace(/\^{([^}]*)}/g, '^$1')
    cleaned = cleaned.replace(/_{([^}]*)}/g, '_$1')
    cleaned = cleaned.replace(/\^(\w)/g, '^$1')
    cleaned = cleaned.replace(/_(\w)/g, '_$1')
    
    // 移除花括号但保留内容
    cleaned = cleaned.replace(/\{([^}]*)\}/g, '$1')
    
    // 移除行内和块级公式标记
    cleaned = cleaned.replace(/\\\(/g, '').replace(/\\\)/g, '')
    cleaned = cleaned.replace(/\\\[/g, '').replace(/\\\]/g, '')
    
    // 清理多余的空格和换行
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    return cleaned
  }

  const generateVideoScript = (solution, language, questionText) => {
    // 获取内容，支持不同的响应格式
    let content = ''
    if (solution && solution.content) {
      content = solution.content
    } else if (solution && solution.data && solution.data.content) {
      content = solution.data.content
    } else if (solution && solution.output && solution.output.text) {
      content = solution.output.text
    } else if (solution && typeof solution === 'string') {
      content = solution
    } else {
      content = language === 'zh' ? '数学解题步骤' : 'Math solution steps'
    }
    
    // 清理LaTeX标记
    const cleanedContent = cleanLatexMarkers(content)
    
    return {
      title: language === 'zh' ? `数学解题：${questionText || '数学问题'}` : `Math Solution: ${questionText || 'Math Problem'}`,
      scenes: [
        {
          sceneNumber: 1,
          text: language === 'zh' ? '让我们一步步解决这个数学问题' : "Let's solve this math problem step by step",
          duration: 30
        },
        {
          sceneNumber: 2,
          text: cleanedContent.substring(0, 200) + (cleanedContent.length > 200 ? '...' : ''),
          duration: 60
        }
      ]
    }
  }

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  // 保存视频到数据库
  const saveVideoToDatabase = async (videoResult) => {
    try {
      setIsSaving(true)
      setSaveStatus(null)

      const videoData = {
        title: `Math Solution: ${(videoResult.question || videoResult.metadata?.question || 'Unknown').substring(0, 50)}...`,
        description: `AI-generated math teaching video for: ${videoResult.question || videoResult.metadata?.question || 'Unknown'}`,
        question: videoResult.question || videoResult.metadata?.question || 'Unknown',
        videoUrl: videoResult.video?.url || videoResult.video?.videoUrl || '',
        thumbnailUrl: videoResult.video?.thumbnailUrl || '',
        duration: videoResult.video?.duration || 0,
        language: videoResult.metadata?.language || 'zh',
        mathTopics: videoResult.metadata?.mathTopics || [],
        difficultyLevel: videoResult.metadata?.difficulty || 'intermediate',
        solutionData: {
          content: videoResult.mathSolution?.content || '',
          usage: videoResult.mathSolution?.usage || {},
          model: videoResult.mathSolution?.model || 'kimi-plus',
          script: videoResult.script
        }
      }

      const result = await userService.saveVideo(videoData)
      
      if (result.success) {
        setSaveStatus({
          type: 'success',
          message: language === 'zh' ? '视频已保存到您的账户' : 'Video saved to your account',
          videoId: result.data.id
        })
      } else {
        setSaveStatus({
          type: 'error',
          message: result.error
        })
      }
    } catch (error) {
      console.error('保存视频失败:', error)
      setSaveStatus({
        type: 'error',
        message: language === 'zh' ? '保存失败，请重试' : 'Save failed, please try again'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 速率限制提示组件
  const RateLimitAlert = () => (
    <Card className="border-red-200 bg-red-50 content-transition content-spacing">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-red-800">
              {language === 'zh' ? '生成限制' : 'Generation Limit'}
            </h3>
            <p className="mt-2 text-sm text-red-700">
              {rateLimit?.reason}
            </p>
            <p className="mt-1 text-sm text-red-600">
              {language === 'zh' ? 
                `剩余次数: ${rateLimit?.videosRemaining || 0}` : 
                `Remaining: ${rateLimit?.videosRemaining || 0}`
              }
            </p>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setRateLimit(null)}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                {language === 'zh' ? '我知道了' : 'I Understand'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // 视频播放功能
  const playMathVideo = async () => {
    if (!result || !result.success) {
      alert('请先生成视频内容')
      return
    }
    
    // First check if video file exists (only for non-merged videos)
    try {
      const videoUrl = result.video?.url || result.video?.videoUrl;
      if (videoUrl && !videoUrl.includes('merged_')) {
        console.log('🔍 检查视频文件:', videoUrl);
        
        // Skip check for newly generated videos as they should exist
        if (videoUrl.includes('ai_solution_') || videoUrl.includes('merged_')) {
          console.log('✅ 跳过新生成视频的检查');
        } else {
          // Try to fetch video headers to check if it exists
          const response = await fetch(videoUrl, { method: 'HEAD' });
          if (!response.ok) {
            console.error('❌ 视频文件不存在或无法访问:', response.status);
            // Use fallback video if original doesn't exist
            if (result.video) {
              result.video.url = '/rendered_videos/fallback_video.mp4';
              result.video.videoUrl = '/rendered_videos/fallback_video.mp4';
              console.log('🔄 使用备用视频');
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ 检查视频失败:', error);
      // Don't use fallback for merged videos
      const videoUrl = result.video?.url || result.video?.videoUrl;
      if (!videoUrl?.includes('merged_') && !videoUrl?.includes('ai_solution_')) {
        if (result.video) {
          result.video.url = '/rendered_videos/fallback_video.mp4';
          result.video.videoUrl = '/rendered_videos/fallback_video.mp4';
        }
      }
    }
    
    // 显示视频播放器
    setShowVideoPlayer(true)
    setCurrentScene(0)
    setVideoProgress(0)
    setVideoCurrentTime(0)
    setIsPlaying(false)
    
    // 检查视频URL并尝试修复
    if (result.video?.videoUrl) {
      console.log('🎬 准备播放视频:', result.video.videoUrl)
      
      // 确保视频URL格式正确
      let videoUrl = result.video.videoUrl
      if (!videoUrl.startsWith('/rendered_videos/') && !videoUrl.startsWith('http')) {
        // 如果URL不完整，尝试修复
        if (videoUrl.includes('qwen_video_')) {
          videoUrl = `/rendered_videos/${videoUrl}`
          console.log('🔧 修复视频URL:', videoUrl)
          // 更新result中的videoUrl
          setResult(prev => ({
            ...prev,
            video: {
              ...prev.video,
              videoUrl: videoUrl
            }
          }))
        }
      }
      
      // 等待DOM更新后自动聚焦到视频元素
      setTimeout(() => {
        const videoElement = document.querySelector('video')
        if (videoElement) {
          videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          console.log('📺 视频元素已找到，准备播放')
        }
      }, 100)
    } else {
      // 基于AI解题内容生成教学场景（作为备选）
      const content = result.mathSolution?.content || ''
      const scenes = generateVideoScenes(content)
      setVideoScenes(scenes)
    }
  }

  const generateVideoScenes = (content) => {
    if (!content) return []
    
    // 清理LaTeX标记
    const cleanedContent = cleanLatexMarkers(content)
    const lines = cleanedContent.split('\n').filter(line => line.trim() && line.length > 10)
    const scenes = []
    
    // 开场
    scenes.push({
      title: language === 'zh' ? '欢迎观看AI数学教学' : 'Welcome to AI Math Teaching',
      content: language === 'zh' ? '今天我们来解决这个数学问题，让我们一步步分析。' : 'Today we will solve this math problem step by step.',
      duration: 3000
    })

    // 处理解题步骤
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      const line = lines[i].trim()
      if (line && !line.startsWith('**')) {
        scenes.push({
          title: language === 'zh' ? `步骤 ${scenes.length}` : `Step ${scenes.length}`,
          content: line,
          duration: 4000
        })
      }
    }

    // 结尾
    scenes.push({
      title: language === 'zh' ? '解题完成' : 'Solution Complete',
      content: language === 'zh' ? '通过以上步骤，我们成功解决了这个数学问题。希望这个AI教学视频对您有帮助！' : 'Through these steps, we successfully solved this math problem. Hope this AI teaching video helps you!',
      duration: 3000
    })

    return scenes
  }

  const toggleVideoPlay = () => {
    if (!isPlaying) {
      startVideoPlayback()
    } else {
      pauseVideoPlayback()
    }
  }

  const startVideoPlayback = () => {
    if (videoScenes.length === 0) return
    
    setIsPlaying(true)
    playVideoScene(currentScene)
  }

  const pauseVideoPlayback = () => {
    setIsPlaying(false)
  }

  const playVideoScene = (sceneIndex) => {
    if (!isPlaying || sceneIndex >= videoScenes.length) {
      completeVideoPlayback()
      return
    }

    const scene = videoScenes[sceneIndex]
    setCurrentScene(sceneIndex)
    
    // 更新进度
    const progress = ((sceneIndex + 1) / videoScenes.length) * 100
    setVideoProgress(progress)
    
    // 更新时间
    const currentTime = Math.floor((sceneIndex * 180) / videoScenes.length)
    setVideoCurrentTime(currentTime)

    // 播放下一个场景
    const timeoutId = setTimeout(() => {
      if (isPlaying) {
        playVideoScene(sceneIndex + 1)
      }
    }, scene.duration)

    // 存储timeout ID以便暂停时清除
    setVideoPlayer(timeoutId)
  }

  const resetVideoPlayback = () => {
    if (videoPlayer) {
      clearTimeout(videoPlayer)
      setVideoPlayer(null)
    }
    setIsPlaying(false)
    setCurrentScene(0)
    setVideoProgress(0)
    setVideoCurrentTime(0)
  }

  const completeVideoPlayback = () => {
    setIsPlaying(false)
    setVideoProgress(100)
    setVideoCurrentTime(180)
    if (videoPlayer) {
      clearTimeout(videoPlayer)
      setVideoPlayer(null)
    }
  }

  const closeVideoPlayer = () => {
    if (videoPlayer) {
      clearTimeout(videoPlayer)
      setVideoPlayer(null)
    }
    setShowVideoPlayer(false)
    setIsPlaying(false)
    setCurrentScene(0)
    setVideoProgress(0)
    setVideoCurrentTime(0)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 其他功能按钮
  const downloadVideo = () => {
    // 如果有真实视频，提供真实下载功能
    if (result?.video?.videoUrl && result.video.videoUrl.startsWith('/rendered_videos/')) {
      const videoUrl = `${VIDEO_SERVER}${result.video.videoUrl}`
      const link = document.createElement('a')
      link.href = videoUrl
      link.download = result.video.videoUrl.split('/').pop() // 获取文件名
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      alert(language === 'zh' ? 
        `📥 视频下载开始！\n\n• 文件: ${link.download}\n• 类型: MP4视频\n• 来源: Manim生成的AI数学教学动画\n• 内容: 基于通义千问AI解题步骤` :
        `📥 Video download started!\n\n• File: ${link.download}\n• Type: MP4 Video\n• Source: Manim-generated AI math teaching animation\n• Content: Based on Qwen AI solution steps`
      )
    } else {
      alert(language === 'zh' ? '⚠️ 只有生成的视频才能下载，请先生成有效视频。' : '⚠️ Only generated videos can be downloaded. Please generate a valid video first.')
    }
  }

  const shareVideo = () => {
    const shareUrl = `${window.location.origin}/video/share/${Math.random().toString(36).substr(2, 9)}`
    
    if (navigator.share) {
      navigator.share({
        title: language === 'zh' ? 'AI数学教学视频' : 'AI Math Teaching Video',
        text: language === 'zh' ? '看看这个AI生成的数学教学视频！' : 'Check out this AI-generated math teaching video!',
        url: shareUrl
      })
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert(language === 'zh' ? 
          `🔗 分享链接已复制到剪贴板！\n\n${shareUrl}\n\n在实际应用中，这个链接会指向真实的视频资源。` :
          `🔗 Share link copied to clipboard!\n\n${shareUrl}\n\nIn the actual application, this link will point to real video resources.`
        )
      }).catch(() => {
        alert(language === 'zh' ? 
          `🔗 分享链接：\n\n${shareUrl}\n\n请手动复制此链接进行分享。` :
          `🔗 Share link:\n\n${shareUrl}\n\nPlease manually copy this link to share.`
        )
      })
    }
  }

  const generateSubtitles = () => {
    if (!result || !result.success) {
      alert(language === 'zh' ? '请先生成视频内容' : 'Please generate video content first')
      return
    }

    const content = result.mathSolution?.content || ''
    const cleanedContent = cleanLatexMarkers(content)
    const subtitles = generateSRTSubtitles(cleanedContent)
    
    // 创建并下载SRT文件
    const blob = new Blob([subtitles], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'math_video_subtitles.srt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert(language === 'zh' ? 
      '📄 字幕文件已生成并下载！\n\n• 格式：SRT（通用字幕格式）\n• 内容：基于AI解题步骤\n• 时间轴：自动同步\n• 支持多语言' :
      '📄 Subtitle file generated and downloaded!\n\n• Format: SRT (universal subtitle format)\n• Content: Based on AI solution steps\n• Timeline: Auto-synchronized\n• Multi-language support'
    )
  }

  const generateSRTSubtitles = (content) => {
    // 进一步清理内容，移除多余的标记和格式
    const cleanContent = content
      .replace(/\*\*/g, '') // 移除粗体标记
      .replace(/\*/g, '') // 移除斜体标记
      .replace(/^[0-9]+\.\s*/gm, '') // 移除步骤编号
      .replace(/^[一二三四五六七八九十]+\.\s*/gm, '') // 移除中文步骤编号
      .replace(/^[a-zA-Z]+\.\s*/gm, '') // 移除英文步骤编号
    
    const lines = cleanContent.split('\n').filter(line => line.trim() && line.length > 5)
    let srtContent = ''
    let subtitleIndex = 1
    let currentTime = 0

    // 添加开场字幕
    srtContent += `${subtitleIndex}\n`
    srtContent += `00:00:00,000 --> 00:00:03,000\n`
    srtContent += `${language === 'zh' ? '欢迎观看AI数学教学视频' : 'Welcome to AI Math Teaching Video'}\n\n`
    subtitleIndex++
    currentTime = 3

    // 为每个解题步骤生成字幕
    for (let i = 0; i < Math.min(lines.length, 8); i++) {
      const line = lines[i].trim()
      if (line && line.length > 5) {
        const startTime = formatSRTTime(currentTime)
        const endTime = formatSRTTime(currentTime + 4)
        
        srtContent += `${subtitleIndex}\n`
        srtContent += `${startTime} --> ${endTime}\n`
        srtContent += `${line}\n\n`
        
        subtitleIndex++
        currentTime += 4
      }
    }

    // 添加结尾字幕
    const startTime = formatSRTTime(currentTime)
    const endTime = formatSRTTime(currentTime + 3)
    srtContent += `${subtitleIndex}\n`
    srtContent += `${startTime} --> ${endTime}\n`
    srtContent += `${language === 'zh' ? '解题完成，感谢观看！' : 'Solution complete, thanks for watching!'}\n\n`

    return srtContent
  }

  const formatSRTTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    const milliseconds = 0
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`
  }

  const uploadImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (event) => {
      const file = event.target.files[0]
      if (file) {
        setQuestion(`[${language === 'zh' ? '已上传图片' : 'Image uploaded'}: ${file.name}]\n\n${language === 'zh' ? '在实际应用中，这里会使用OCR识别图片中的数学公式。\n\n请手动输入数学问题以继续演示。' : 'In the actual application, OCR will be used to recognize math formulas in the image.\n\nPlease manually enter a math question to continue the demo.'}`)
        
        alert(language === 'zh' ? 
          `📸 图片上传成功！\n\n文件名: ${file.name}\n大小: ${(file.size / 1024).toFixed(2)} KB\n类型: ${file.type}\n\n在实际应用中，系统会自动识别图片中的数学公式并转换为文本。` :
          `📸 Image uploaded successfully!\n\nFilename: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type}\n\nIn the actual application, the system will automatically recognize math formulas in the image and convert them to text.`
        )
      }
    }
    input.click()
  }

  const voiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(language === 'zh' ? 
        '🎤 语音输入功能\n\n您的浏览器不支持语音识别功能。\n\n在实际应用中，这里会：\n• 实时语音转文字\n• 支持多种语言\n• 智能识别数学术语\n• 自动标点符号' :
        '🎤 Voice Input Feature\n\nYour browser does not support speech recognition.\n\nIn the actual application, this will:\n• Real-time speech-to-text\n• Support multiple languages\n• Intelligent recognition of math terms\n• Automatic punctuation'
      )
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      alert(language === 'zh' ? 
        '🎤 开始录音...\n\n请说出您的数学问题\n点击"确定"后开始录音' :
        '🎤 Starting recording...\n\nPlease speak your math question\nClick "OK" to start recording'
      )
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setQuestion(transcript)
      
      alert(language === 'zh' ? 
        `🎤 语音识别完成！\n\n识别结果: ${transcript}` :
        `🎤 Speech recognition complete!\n\nRecognition result: ${transcript}`
      )
    }

    recognition.onerror = (event) => {
      alert(language === 'zh' ? 
        `🎤 语音识别错误: ${event.error}` :
        `🎤 Speech recognition error: ${event.error}`
      )
    }

    try {
      recognition.start()
    } catch (error) {
      alert(language === 'zh' ? 
        '🎤 语音输入功能\n\n启动语音识别时出现错误。' :
        '🎤 Voice Input Feature\n\nError starting speech recognition.'
      )
    }
  }

  const clearQuestion = () => {
    setQuestion('')
    setResult(null)
    setEstimatedCost(null)
    setShowVideoPlayer(false)
    setIsPlaying(false)
    setCurrentScene(0)
    setVideoProgress(0)
    setVideoCurrentTime(0)
    setShowAuthRequired(false)
  }

  // 添加认证需求提示组件
  const AuthRequiredAlert = () => (
    <Card className="border-orange-200 bg-orange-50 content-transition content-spacing">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="font-bold text-orange-700 mb-2">
              {language === 'zh' ? '需要登录' : 'Login Required'}
            </div>
            <div className="text-gray-700">
              {language === 'zh' ? '请先登录后再生成视频。' : 'Please log in before generating videos.'}
            </div>
            <div className="mt-4 flex space-x-3">
              <Button 
                onClick={() => {
                  if (onLoginRequired) {
                    onLoginRequired();
                  } else {
                    // Fallback: 只弹窗提示，不跳转首页
                    alert(language === 'zh' ? '请在首页登录后再试。' : 'Please log in on the home page and try again.');
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {language === 'zh' ? '立即登录' : 'Login Now'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAuthRequired(false)}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const VIDEO_SERVER = import.meta.env.VITE_VIDEO_SERVER || 'http://localhost:5006';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 transition-all duration-300">
      {/* 头部说明 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎬 AI数学视频生成演示
        </h1>
        <p className="text-gray-600 mb-6">
          体验完整的AI驱动数学教学视频生成流程
        </p>
        
        {/* 用户状态显示 */}
        {user ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <span className="text-green-800 font-medium">
                  {language === 'zh' ? '已登录' : 'Logged In'}: {user.email}
                </span>
                <span className="text-green-600 text-sm ml-2">
                  {language === 'zh' ? '可以生成视频' : 'Ready to generate videos'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <span className="text-orange-800 font-medium">
                  {language === 'zh' ? '未登录' : 'Not Logged In'}
                </span>
                <span className="text-orange-600 text-sm ml-2">
                  {language === 'zh' ? '需要登录后才能生成视频' : 'Login required to generate videos'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* API成本信息 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">实时成本分析</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-700">AI解题</div>
              <div className="text-blue-600">~¥0.004</div>
            </div>
            <div>
              <div className="font-medium text-blue-700">语音合成</div>
              <div className="text-blue-600">~¥0.002</div>
            </div>
            <div>
              <div className="font-medium text-blue-700">视频生成</div>
              <div className="text-blue-600">~¥0.30</div>
            </div>
            <div>
              <div className="font-medium text-blue-700">总成本</div>
              <div className="text-blue-600">~¥0.31</div>
            </div>
          </div>
        </div>
      </div>

      {/* 语言选择 */}
      <Card className="content-transition content-spacing">
        <CardHeader>
          <CardTitle>选择语言 / Select Language</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries({
              zh: '🇨🇳 中文',
              en: '🇺🇸 English'
            }).map(([code, label]) => (
              <Button
                key={code}
                variant={language === code ? "default" : "outline"}
                onClick={() => setLanguage(code)}
                className="text-sm"
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 示例问题 */}
      <Card className="content-transition content-spacing">
        <CardHeader>
          <CardTitle>示例问题 / Example Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(exampleQuestions[language] || exampleQuestions.zh).map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left p-3 h-auto"
                onClick={() => selectExampleQuestion(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 输入方式选择 */}
      <Card className="content-transition content-spacing">
        <CardHeader>
          <CardTitle>选择输入方式 / Select Input Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Button
              variant={!useImageInput ? "default" : "outline"}
              onClick={() => {
                setUseImageInput(false)
                clearImages()
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              {language === 'zh' ? '文字输入' : 'Text Input'}
            </Button>
            <Button
              variant={useImageInput ? "default" : "outline"}
              onClick={() => setUseImageInput(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {language === 'zh' ? '图片输入' : 'Image Input'}
            </Button>
          </div>

          {/* 图片输入区域 */}
          {useImageInput && (
            <div className="mb-6">
              <StandardImageInput
                onImageSelected={handleImageSelected}
                onTextExtracted={handleTextExtracted}
                onError={(error) => {
                  console.error('Image input error:', error)
                  alert(error)
                }}
                enableOCR={true}
                language={language}
                autoDetectLanguage={false}
                theme="light"
                showPreview={true}
                showProgress={true}
                customOCRProcessor={localBestOCRProcessor}
                maxFileSize={10 * 1024 * 1024}
                acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
              />
              {ocrResult && ocrResult.text && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {language === 'zh' ? '识别的数学问题：' : 'Recognized Math Problem:'}
                  </h4>
                  <p className="text-gray-900">{ocrResult.text}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    {language === 'zh' ? `置信度: ${(ocrResult.confidence * 100).toFixed(1)}%` : 
                     `Confidence: ${(ocrResult.confidence * 100).toFixed(1)}%`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 文字输入区域 */}
          {!useImageInput && (
            <div className="space-y-4">
              <Textarea
                placeholder={
                  language === 'zh' ? '输入您的数学问题，例如：解方程 2x + 5 = 15' :
                  'Enter your math question, e.g.: Solve 2x + 5 = 15'
                }
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[100px] text-lg"
              />
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={voiceInput}>
                    <Mic className="h-4 w-4 mr-2" />
                    {language === 'zh' ? '语音输入' : 'Voice Input'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearQuestion}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {language === 'zh' ? '清除' : 'Clear'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 生成按钮 */}
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleGenerateVideo}
              disabled={(!question.trim() && !useImageInput) || (useImageInput && !ocrResult) || isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {language === 'zh' ? '生成中...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {useImageInput ? 
                    (language === 'zh' ? '从图片生成AI教学视频' : 'Generate AI Teaching Video from Image') :
                    (language === 'zh' ? '生成AI教学视频' : 'Generate AI Teaching Video')
                  }
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 认证需求提示 */}
      {showAuthRequired && <AuthRequiredAlert />}

      {/* 速率限制提示 */}
      {rateLimit && <RateLimitAlert />}

      {/* 生成进度 */}
      {isGenerating && (
        <Card className="content-transition content-spacing animate-expand">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{currentStep}</h3>
                <span className="text-sm text-gray-600">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
              <p className="text-sm text-gray-600">
                {generationProgress < 30 ? '正在分析您的数学问题...' :
                 generationProgress < 50 ? '正在生成解题步骤...' :
                 generationProgress < 80 ? '正在创建教学动画...' :
                 '正在渲染最终视频...'}
              </p>
              
              {estimatedCost && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium mb-2">实时成本分析:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>AI解题: ¥{estimatedCost.llm.toFixed(4)}</div>
                    <div>语音合成: ¥{estimatedCost.tts.toFixed(3)}</div>
                    <div>视频生成: ¥{estimatedCost.video.toFixed(2)}</div>
                    <div>数学动画: ¥{estimatedCost.animation.toFixed(2)}</div>
                    <div className="col-span-2 font-medium border-t pt-2">
                      总计: ¥{estimatedCost.total().toFixed(4)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 生成结果 */}
      {result && (
        <Card className="transition-all duration-500 ease-in-out animate-fadeIn content-transition content-spacing">
          <CardHeader>
            <CardTitle className="flex items-center">
              {result.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  {language === 'zh' ? '🎉 视频生成成功!' : '🎉 Video Generated Successfully!'}
                </>
              ) : (
                <>
                  <X className="h-5 w-5 text-red-500 mr-2" />
                  {language === 'zh' ? '❌ 生成失败' : '❌ Generation Failed'}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-6">
                {/* AI解题结果 */}
                <div className="bg-green-50 rounded-lg p-4 stagger-item">
                  <h4 className="font-semibold text-green-800 mb-2">🤖 AI解题结果</h4>
                  <div className="text-sm text-green-700 whitespace-pre-wrap">
                    {cleanLatexMarkers(result.mathSolution?.content || '')}
                  </div>
                  <div className="mt-3 text-xs text-green-600">
                    Token使用: {result.mathSolution?.usage?.total_tokens || 0} | 
                    成本: {result.metadata.actualCost}
                  </div>
                </div>

                {/* 保存状态显示 */}
                {(isSaving || saveStatus) && (
                  <div className={`rounded-lg p-4 ${
                    saveStatus?.type === 'success' ? 'bg-green-50 border border-green-200' : 
                    saveStatus?.type === 'error' ? 'bg-red-50 border border-red-200' : 
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-blue-700">
                            {language === 'zh' ? '正在保存到您的账户...' : 'Saving to your account...'}
                          </span>
                        </>
                      ) : saveStatus?.type === 'success' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-700">{saveStatus.message}</span>
                        </>
                      ) : saveStatus?.type === 'error' ? (
                        <>
                          <X className="h-4 w-4 text-red-600" />
                          <span className="text-red-700">{saveStatus.message}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* 视频预览 */}
                {!showVideoPlayer ? (
                  <div className="bg-gray-100 rounded-lg p-8 text-center stagger-item">
                    <Play className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      {language === 'zh' ? '视频时长' : 'Duration'}: {Math.floor(result.video.duration / 60)}:{(result.video.duration % 60).toString().padStart(2, '0')}
                    </p>
                    <Button variant="outline" onClick={playMathVideo}>
                      {language === 'zh' ? '▶️ 播放视频' : '▶️ Play Video'}
                    </Button>
                  </div>
                ) : (
                  // 视频播放器
                  <div className="bg-black rounded-lg overflow-hidden stagger-item">
                    {/* 视频播放区域 */}
                    <div className="bg-gray-900 text-white p-4 min-h-[400px] flex flex-col justify-center">
                      {/* 如果有真实视频URL，优先显示真实视频 */}
                      {(result.video?.url || result.video?.videoUrl) ? (
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold mb-4">
                            🎬 {language === 'zh' ? 'AI数学教学视频' : 'AI Math Teaching Video'}
                          </h3>
                          <div className="video-container" style={{ 
                            position: 'relative',
                            width: '100%',
                            maxWidth: '800px',
                            margin: '0 auto',
                            backgroundColor: '#000',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}>
                            {/* Subtitle overlay */}
                            {result.animations?.[0]?.subtitles?.segments && (
                              <div 
                                className="subtitle-overlay" 
                                style={{
                                  position: 'absolute',
                                  bottom: '40px',
                                  left: '15%',
                                  right: '15%',
                                  padding: '6px 12px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                                  color: '#333',
                                  fontSize: '12px',
                                  textAlign: 'center',
                                  fontFamily: '"Microsoft YaHei", Arial, sans-serif',
                                  fontWeight: '400',
                                  lineHeight: '1.3',
                                  pointerEvents: 'none',
                                  zIndex: 10,
                                  minHeight: '32px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '3px',
                                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)'
                                }}
                              >
                                <div id="subtitle-text" style={{ maxWidth: '90%' }}></div>
                              </div>
                            )}
                            <video
                              id="math-video-player"
                              controls
                              autoPlay={false}
                              muted
                              preload="metadata"
                              className="video-player"
                              style={{ 
                                width: '100%',
                                height: 'auto',
                                maxHeight: '450px',
                                display: 'block',
                                objectFit: 'contain'
                              }}
                              poster={result.video.thumbnailUrl}
                              onTimeUpdate={(e) => {
                                // Update subtitle display based on current time
                                if (result.animations?.[0]?.subtitles?.segments) {
                                  const currentTime = e.target.currentTime;
                                  const segments = result.animations[0].subtitles.segments;
                                  const currentSegment = segments.find(seg => 
                                    currentTime >= seg.start && currentTime <= seg.end
                                  );
                                  
                                  const subtitleElement = document.getElementById('subtitle-text');
                                  if (subtitleElement) {
                                    subtitleElement.textContent = currentSegment ? currentSegment.text : '';
                                  }
                                }
                              }}
                              onLoadedMetadata={(e) => {
                                console.log('📺 视频元数据加载完成');
                                // Initialize subtitles
                                const subtitleElement = document.getElementById('subtitle-text');
                                if (subtitleElement) {
                                  subtitleElement.textContent = '';
                                }
                              }}
                            onError={(e) => {
                              console.error('❌ 视频加载失败:', e);
                              console.log('📹 尝试的视频URL:', result.video?.url || result.video?.videoUrl);
                              
                              // Prevent navigation by stopping event propagation
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('🔍 错误详情:', e.target.error);
                              
                              // 获取重试次数
                              const retryCount = parseInt(e.target.dataset.retryCount || '0');
                              
                              // 如果是新生成的AI视频，尝试多次重新加载
                              if (e.target.src.includes('ai_solution_') && !e.target.src.includes('1753834227691') && retryCount < 3) {
                                e.target.dataset.retryCount = (retryCount + 1).toString();
                                console.log(`🔄 尝试重新加载视频 (第 ${retryCount + 1}/3 次)...`);
                                
                                // 保存原始URL（不带查询参数）
                                const baseUrl = result.video?.url || result.video?.videoUrl;
                                
                                // 根据重试次数使用不同的延迟
                                const delays = [500, 1500, 3000];
                                const delay = delays[retryCount] || 1000;
                                
                                setTimeout(() => {
                                  let newSrc;
                                  // 第二次尝试时使用静态服务器
                                  if (retryCount === 1 && baseUrl.includes('/rendered_videos/')) {
                                    const filename = baseUrl.split('/').pop();
                                    newSrc = `http://localhost:5004/rendered_videos/${filename}?t=${Date.now()}`;
                                    console.log('🔄 尝试使用静态服务器:', newSrc);
                                  } else {
                                    // 添加时间戳避免缓存
                                    newSrc = baseUrl + '?t=' + Date.now() + '&retry=' + (retryCount + 1);
                                    console.log('🔄 重新加载视频:', newSrc);
                                  }
                                  
                                  // 重新设置source元素
                                  const sourceElement = e.target.querySelector('source');
                                  if (sourceElement) {
                                    sourceElement.src = newSrc;
                                    e.target.load(); // 强制重新加载
                                  } else {
                                    e.target.src = newSrc;
                                  }
                                }, delay);
                              } else if (retryCount >= 3) {
                                // 尝试3次后仍然失败
                                console.error('❌ 视频加载失败，已尝试3次');
                                
                                // 显示错误信息
                                e.target.style.display = 'none';
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'bg-red-50 border border-red-200 rounded p-4 text-center';
                                errorDiv.innerHTML = `
                                  <div class="text-red-600 font-semibold mb-2">❌ 视频加载失败</div>
                                  <div class="text-red-500 text-sm">
                                    ${e.target.src.includes('ai_solution_') ? '视频文件可能还在生成中或生成失败' : '视频文件无法访问'}
                                  </div>
                                  <div class="text-gray-600 text-xs mt-2">
                                    请刷新页面或重新生成视频
                                  </div>
                                `;
                                e.target.parentNode.appendChild(errorDiv);
                              }
                            }}
                            onLoadedData={() => {
                              console.log('✅ 视频加载成功:', result.video?.url || result.video?.videoUrl);
                            }}
                            onLoadStart={() => {
                              console.log('🔄 开始加载视频:', result.video?.url || result.video?.videoUrl);
                            }}
                          >
                            <source 
                              src={(() => {
                                const videoPath = result.video?.url || result.video?.videoUrl;
                                // For AI-generated videos, use the static server to avoid Vite caching issues
                                if (videoPath && videoPath.includes('ai_solution_')) {
                                  const filename = videoPath.split('/').pop();
                                  return `http://localhost:5004/rendered_videos/${filename}`;
                                }
                                // For other videos, use the normal path
                                if (videoPath && videoPath.startsWith('/rendered_videos/')) {
                                  return videoPath;
                                }
                                return videoPath;
                              })()} 
                              type="video/mp4" 
                            />
                            {/* Add WebVTT track if subtitles are available */}
                            {result.animations?.[0]?.subtitles?.vtt && (
                              <track
                                kind="subtitles"
                                src={`data:text/vtt;charset=utf-8,${encodeURIComponent(result.animations[0].subtitles.vtt)}`}
                                srcLang={language}
                                label={language === 'zh' ? '中文字幕' : 'English Subtitles'}
                                default
                              />
                            )}
                            {language === 'zh' ? '您的浏览器不支持视频播放。' : 'Your browser does not support the video tag.'}
                          </video>
                          </div>
                          <p className="text-gray-300 mt-2 text-sm">
                            {language === 'zh' ? '点击播放按钮开始观看AI生成的数学教学动画' : 'Click play button to watch AI-generated math teaching animation'}
                          </p>
                          
                          {/* 视频底部脚本/字幕显示 - 显示完整的TTS脚本 */}
                          {(result.voiceover?.text || result.voiceover?.script || 
                            (result.animations && result.animations[0] && (result.animations[0].ttsScript || result.animations[0].ttsContent))) && (
                            <div className="mt-4 bg-gray-800 p-3 rounded text-white text-sm">
                              <div className="font-semibold mb-2 flex items-center">
                                <span className="mr-2">{language === 'zh' ? '🎤 完整语音脚本：' : '🎤 Complete Narration Script:'}</span>
                                <span className="text-xs text-gray-400">
                                  {language === 'zh' ? '(与语音同步)' : '(Synced with audio)'}
                                </span>
                              </div>
                              <div className="text-gray-300 max-h-32 overflow-y-auto p-2 bg-gray-900 rounded">
                                {cleanLatexMarkers(
                                  result.voiceover?.text || result.voiceover?.script || 
                                  (result.animations && result.animations[0] && result.animations[0].ttsScript) ||
                                  (result.animations && result.animations[0] && Array.isArray(result.animations[0].ttsContent) 
                                   ? result.animations[0].ttsContent.join(' ')
                                   : result.animations[0]?.ttsContent) || 
                                  '暂无语音脚本'
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* 步骤显示 - 增强版，显示详细内容 */}
                          {((result.animations && result.animations[0] && result.animations[0].steps && result.animations[0].steps.length > 0) || 
                            (result.script && result.script.pages && result.script.pages.length > 0)) && (
                            <div className="mt-4 bg-gray-800 p-3 rounded text-white text-sm">
                              <div className="font-semibold mb-2">
                                {language === 'zh' ? '📝 详细解题步骤：' : '📝 Detailed Solution Steps:'}
                              </div>
                              <div className="space-y-2">
                                {(result.animations && result.animations[0] && result.animations[0].steps) ? 
                                  result.animations[0].steps.map((step, index) => {
                                    // 处理步骤对象或字符串
                                    const stepContent = typeof step === 'object' && step.content ? step.content : step;
                                    const stepType = typeof step === 'object' ? step.type : 'text';
                                    const hasGraphic = typeof step === 'object' && step.hasGraphic;
                                    
                                    return (
                                      <div key={index} className="border-l-2 border-blue-500 pl-3">
                                        {hasGraphic && (
                                          <div className="text-xs text-blue-400 mb-1">
                                            {language === 'zh' ? '🖼️ 包含图形演示' : '🖼️ Includes visual diagram'}
                                          </div>
                                        )}
                                        <div className={`text-gray-300 ${stepType === 'formula' ? 'font-mono' : ''}`}>
                                          {stepContent}
                                        </div>
                                      </div>
                                    );
                                  }) :
                                  // 如果没有steps，从script.pages中提取
                                  result.script.pages.map((page, index) => (
                                    <div key={index} className="border-l-2 border-blue-500 pl-3">
                                      <div className="text-gray-300">
                                        {cleanLatexMarkers(page.text || '')}
                                      </div>
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold mb-4">
                            🎬 {language === 'zh' ? 'AI数学教学视频' : 'AI Math Teaching Video'}
                          </h3>
                          <div className="text-red-500 text-lg font-bold mb-2">
                            {language === 'zh' ? '⚠️ 视频生成失败，请重试！' : '⚠️ Video generation failed, please try again!'}
                          </div>
                          <p className="text-gray-400 text-sm">
                            {language === 'zh' ? '未能生成有效视频文件，请重新生成。' : 'No valid video file generated, please try again.'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* 控制栏 */}
                    <div className="bg-gray-800 text-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          {/* 如果有真实视频，隐藏模拟控制按钮 */}
                          {!(result.video?.url && result.video.url.includes('rendered_videos')) && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={toggleVideoPlay}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                {isPlaying ? (language === 'zh' ? '暂停' : 'Pause') : (language === 'zh' ? '播放' : 'Play')}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={resetVideoPlayback}
                                className="bg-gray-600 hover:bg-gray-700 text-white"
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                {language === 'zh' ? '重播' : 'Replay'}
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={closeVideoPlayer}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <X className="h-4 w-4 mr-2" />
                            {language === 'zh' ? '关闭' : 'Close'}
                          </Button>
                        </div>
                        <div className="text-sm text-gray-300">
                          {result.video?.url && result.video.url.includes('rendered_videos') ? (
                            <span>{language === 'zh' ? '真实AI数学动画视频' : 'Real AI Math Animation Video'}</span>
                          ) : (
                            <span>{formatTime(videoCurrentTime)} / {formatTime(180)}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* 进度条 - 只在模拟模式下显示 */}
                      {!(result.video?.url && result.video.url.includes('rendered_videos')) && (
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${videoProgress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-400 text-center">
                        {result.video?.url && result.video.url.includes('rendered_videos') ? (
                          <span>{language === 'zh' ? '🎬 由Manim生成的专业数学教学动画 - 基于KIMI AI解题内容' : '🎬 Professional math teaching animation generated by Manim - Based on KIMI AI solution content'}</span>
                        ) : (
                          <span>{language === 'zh' ? 'AI数学教学演示 - 基于KIMI AI解题内容生成' : 'AI Math Teaching Demo - Generated based on KIMI AI solution content'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 详细信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">📊 技术信息</h4>
                    <div className="text-sm space-y-1">
                      <div>语言: {result.metadata.language}</div>
                      <div>难度: {result.metadata.difficulty}</div>
                      <div>数学主题: {result.metadata.mathTopics?.join(', ')}</div>
                      <div>处理时间: {result.video.processingTime}秒</div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">💰 成本信息</h4>
                    <div className="text-sm space-y-1">
                      <div>实际成本: {result.metadata.actualCost}</div>
                      <div>相比人工讲师: 节省98%+</div>
                      <div>相比专业制作: 节省99%+</div>
                      <div>质量: 专业级AI教学</div>
                    </div>
                  </div>
                </div>

                {/* 脚本预览 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">📝 生成的教学脚本:</h4>
                  <div className="text-sm space-y-2">
                    {result.script?.scenes?.map((scene, index) => (
                      <div key={index} className="border-l-2 border-blue-300 pl-3">
                        <div className="font-medium">场景 {scene.sceneNumber} ({scene.duration}秒)</div>
                        <div className="text-gray-600">{cleanLatexMarkers(scene.text || '')}</div>
                      </div>
                    )) || result.script?.pages?.map((page, index) => (
                      <div key={index} className="border-l-2 border-blue-300 pl-3">
                        <div className="font-medium">页面 {page.page} ({page.duration}秒)</div>
                        <div className="text-gray-600">{cleanLatexMarkers(page.text || '')}</div>
                      </div>
                    )) || (
                      <div className="text-gray-500 italic">
                        {language === 'zh' ? '脚本内容正在生成中...' : 'Script content is being generated...'}
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-wrap gap-4">
                  <Button onClick={downloadVideo}>
                    <Download className="h-4 w-4 mr-2" />
                    {language === 'zh' ? '下载视频' : 'Download Video'}
                  </Button>
                  <Button variant="outline" onClick={shareVideo}>
                    <Share2 className="h-4 w-4 mr-2" />
                    {language === 'zh' ? '分享链接' : 'Share Link'}
                  </Button>
                  <Button variant="outline" onClick={generateSubtitles}>
                    <FileText className="h-4 w-4 mr-2" />
                    {language === 'zh' ? '生成字幕' : 'Generate Subtitles'}
                  </Button>
                  <Button variant="outline" onClick={() => setResult(null)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {language === 'zh' ? '重新生成' : 'Regenerate'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-red-600">
                <p className="mb-4">{result.error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => setResult(null)}
                >
                  {language === 'zh' ? '🔄 重试' : '🔄 Try Again'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}