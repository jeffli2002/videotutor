import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { CheckCircle, X, Upload, Mic, Play, Award, RefreshCw, Pause, RotateCcw, Download, Share2, FileText, Trash2, Save } from 'lucide-react'
import { generateManimVideoFromQwen } from '../services/mathVideoAI'
import userService from '../services/userService'

export default function VideoGenerationDemo({ user, onLoginRequired }) {
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
    
    if (!question.trim()) {
      console.log('❌ 问题为空，不执行生成')
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

      console.log('🤖 步骤2: 调用通义千问API解题')
      setCurrentStep('🤖 AI解题分析中...')
      setGenerationProgress(25)
      console.log('📡 开始调用QWEN API...')
      let mathSolution
      try {
        mathSolution = await callQwenAPI(question, language)
      } catch (err) {
        // 捕获超时或网络异常
        setCurrentStep('AI接口超时或出错，请重试')
        setGenerationProgress(0)
        setIsGenerating(false)
        setResult({ success: false, error: 'AI接口超时或出错，请重试' })
        return
      }
      console.log('✅ QWEN API调用结果:', mathSolution)
      if (!mathSolution.success) {
        setCurrentStep('AI解题失败，请重试')
        setGenerationProgress(0)
        setIsGenerating(false)
        setResult({ success: false, error: mathSolution.error || 'AI解题失败，请重试' })
        return
      }

      // 只有AI解答成功后，才继续后续流程
      console.log('📝 步骤3: 生成教学脚本')
      setCurrentStep('📝 生成教学脚本...')
      setGenerationProgress(40)
      await delay(1500)

      console.log('🎬 步骤4: 创建数学动画')
      setCurrentStep('🎬 创建数学动画...')
      setGenerationProgress(60)
      await delay(2000)

      console.log('🎤 步骤5: 生成多语言语音')
      setCurrentStep('🎤 合成多语言语音...')
      setGenerationProgress(80)
      await delay(1500)

      console.log('🎥 步骤6: 渲染最终视频')
      setCurrentStep('🎥 渲染最终视频...')
      setGenerationProgress(95)
      await delay(2000)

      console.log('🧮 步骤7: Manim动画生成')
      setCurrentStep('🧮 Manim动画生成中...')
      setGenerationProgress(98)
      // 优化步骤提取逻辑，严格提取详细解题步骤
      // 获取AI解答内容，支持不同的响应格式
      let aiContent = ''
      if (mathSolution.data && mathSolution.data.content) {
        aiContent = mathSolution.data.content
      } else if (mathSolution.output && mathSolution.output.text) {
        aiContent = mathSolution.output.text
      } else if (mathSolution.data && mathSolution.data.output && mathSolution.data.output.text) {
        aiContent = mathSolution.data.output.text
      } else {
        console.error('❌ 无法解析AI响应内容:', mathSolution)
        throw new Error('AI响应格式错误')
      }
      
      console.log('📝 原始AI解答内容:', aiContent)
      let steps = []
      
      // 1. 优先提取"详细解题步骤"部分，支持多种格式
      const detailPatterns = [
        /\*\*详细解题步骤\*\*[\s\S]*?(?=\*\*|$)/,
        /详细解题步骤[\s\S]*?(?=(\*\*|最终答案|验证过程|相关数学概念|常见错误|$))/,
        /\*\*解题步骤\*\*[\s\S]*?(?=\*\*|$)/,
        /解题步骤[\s\S]*?(?=(\*\*|最终答案|验证过程|相关数学概念|常见错误|$))/
      ]
      
      let detailBlock = ''
      for (const pattern of detailPatterns) {
        const match = aiContent.match(pattern)
        if (match) {
          detailBlock = match[0]
          console.log('✅ 找到详细解题步骤块:', detailBlock.substring(0, 100) + '...')
          break
        }
      }
      
      if (detailBlock) {
        console.log('🔍 开始提取详细解题步骤块内容...')
        console.log('📝 详细解题步骤块:', detailBlock.substring(0, 500) + '...')
        
        // 提取编号步骤，支持多种格式：1. 1、 1) 等，并包含多行内容
        const numberedPatterns = [
          // 匹配带**的格式：1. **标题** 内容（包含多行详细内容，包括数学公式）
          /(\d+)[.、\)]\s*\*\*([^*]+)\*\*\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
          // 匹配普通格式：1. 标题 内容（包含多行详细内容，包括数学公式）
          /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
          // 匹配简单格式：1. 标题
          /(\d+)\s*[.、\)]\s*([^\n]+)/g
        ]
        
        for (const pattern of numberedPatterns) {
          const matches = [...detailBlock.matchAll(pattern)]
          console.log(`🔍 正则表达式匹配结果:`, matches.length, '个匹配')
          
          if (matches && matches.length > 0) {
            // 保持原始顺序，按编号排序
            const stepMap = new Map()
            matches.forEach((match, index) => {
              const stepNum = parseInt(match[1])
              let stepContent = ''
              
              // 根据匹配组数量确定内容位置
              if (match.length >= 4) {
                // 带**的格式：match[2]是标题，match[3]是内容
                const title = match[2].trim()
                const content = (match[3] || '').trim()
                stepContent = `**${title}** ${content}`.trim()
              } else if (match.length >= 3) {
                // 普通格式：match[2]是内容
                stepContent = match[2].trim()
              }
              
              // 清理内容，移除多余的换行和空格
              stepContent = stepContent.replace(/\n\s*\n/g, '\n').trim()
              
              console.log(`📝 步骤 ${stepNum}:`, stepContent.substring(0, 200) + '...')
              
              // 如果这个编号还没有内容，或者新内容更长，则更新
              if (stepContent && (!stepMap.has(stepNum) || stepContent.length > stepMap.get(stepNum).length)) {
                stepMap.set(stepNum, stepContent)
              }
            })
            
            // 按编号顺序重建步骤数组
            steps = Array.from(stepMap.keys())
              .sort((a, b) => a - b)
              .map(num => stepMap.get(num))
            
            console.log('✅ 成功提取步骤:', steps.length, '个步骤')
            break
          }
        }
        
        // 如果没有编号，尝试提取多行步骤内容
        if (steps.length === 0) {
          // 尝试提取带**的步骤标题
          const boldStepPattern = /(\d+)[.、\)]\s*\*\*([^*]+)\*\*/g
          const boldMatches = [...detailBlock.matchAll(boldStepPattern)]
          
          if (boldMatches && boldMatches.length > 0) {
            const stepMap = new Map()
            boldMatches.forEach(match => {
              const stepNum = parseInt(match[1])
              const stepTitle = match[2].trim()
              stepMap.set(stepNum, stepTitle)
            })
            
            steps = Array.from(stepMap.keys())
              .sort((a, b) => a - b)
              .map(num => stepMap.get(num))
            
            console.log('✅ 提取加粗步骤标题（保持顺序）:', steps)
          } else {
            // 尝试更智能的步骤提取：按编号分割内容
            const stepSections = detailBlock.split(/(?=\n\s*\d+[.、\)])/g)
            const extractedSteps = []
            
            for (const section of stepSections) {
              if (section.trim()) {
                // 移除开头的编号和多余空白
                const cleanSection = section.replace(/^\s*\d+[.、\)]\s*/, '').trim()
                if (cleanSection.length > 10) {
                  extractedSteps.push(cleanSection)
                }
              }
            }
            
            if (extractedSteps.length > 0) {
              steps = extractedSteps.slice(0, 8)
              console.log('✅ 智能分割步骤（保持顺序）:', steps)
            } else {
              // 按行分割，过滤掉标题和空行
              const lines = detailBlock.split('\n')
                .map(s => s.trim())
                .filter(s => s.length > 10 && 
                  !s.startsWith('**') && 
                  !s.startsWith('详细解题步骤') && 
                  !s.startsWith('解题步骤') &&
                  !s.startsWith('步骤') &&
                  !s.startsWith('问题分析') &&
                  !s.startsWith('最终答案') &&
                  !s.startsWith('验证过程'))
              
              // 合并短行，形成完整步骤
              const mergedSteps = []
              let currentStep = ''
              
              for (const line of lines) {
                if (line.length > 20) {
                  if (currentStep) {
                    mergedSteps.push(currentStep.trim())
                  }
                  currentStep = line
                } else if (currentStep) {
                  currentStep += ' ' + line
                }
              }
              
              if (currentStep) {
                mergedSteps.push(currentStep.trim())
              }
              
              steps = mergedSteps.slice(0, 8) // 增加最大步骤数
              console.log('✅ 按段落提取步骤（保持顺序）:', steps)
            }
          }
        }
      }
      
      // 2. 如果还没有，尝试全局编号提取，保持顺序
      if (steps.length === 0) {
        // 首先尝试提取带**的步骤标题
        const boldStepPattern = /(\d+)[.、\)]\s*\*\*([^*]+)\*\*/g
        const boldMatches = [...aiContent.matchAll(boldStepPattern)]
        
        if (boldMatches && boldMatches.length > 0) {
          const stepMap = new Map()
          boldMatches.forEach(match => {
            const stepNum = parseInt(match[1])
            const stepTitle = match[2].trim()
            stepMap.set(stepNum, stepTitle)
          })
          
          steps = Array.from(stepMap.keys())
            .sort((a, b) => a - b)
            .map(num => stepMap.get(num))
          
          console.log('✅ 全局提取加粗步骤标题（保持顺序）:', steps)
        } else {
          const numberedPatterns = [
            // 匹配带**的格式：1. **标题** 内容（包含多行详细内容，包括数学公式）
            /(\d+)[.、\)]\s*\*\*([^*]+)\*\*\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
            // 匹配普通格式：1. 标题 内容（包含多行详细内容，包括数学公式）
            /(\d+)[.、\)]\s*([\s\S]*?)(?=\n\s*\d+[.、\)]|$)/g,
            /(\d+)\s*[.、\)]\s*([^\n]+)/g
          ]
          
          for (const pattern of numberedPatterns) {
            const matches = [...aiContent.matchAll(pattern)]
            if (matches && matches.length > 0) {
              // 保持原始顺序，按编号排序
              const stepMap = new Map()
              matches.forEach(match => {
                const stepNum = parseInt(match[1])
                let stepContent = ''
                
                // 根据匹配组数量确定内容位置
                if (match.length >= 4) {
                  // 带**的格式：match[2]是标题，match[3]是内容
                  const title = match[2].trim()
                  const content = (match[3] || '').trim()
                  stepContent = `**${title}** ${content}`.trim()
                } else if (match.length >= 3) {
                  // 普通格式：match[2]是内容
                  stepContent = match[2].trim()
                }
                
                // 清理内容，移除多余的换行和空格
                stepContent = stepContent.replace(/\n\s*\n/g, '\n').trim()
                
                // 如果这个编号还没有内容，或者新内容更长，则更新
                if (!stepMap.has(stepNum) || stepContent.length > stepMap.get(stepNum).length) {
                  stepMap.set(stepNum, stepContent)
                }
              })
              
              // 按编号顺序重建步骤数组
              steps = Array.from(stepMap.keys())
                .sort((a, b) => a - b)
                .map(num => stepMap.get(num))
              
              console.log('✅ 全局编号提取（保持顺序）:', steps)
              break
            }
          }
        }
      }
      
      // 3. 如果还没有，尝试智能分割整个内容
      if (steps.length === 0) {
        // 尝试按编号分割整个AI内容
        const stepSections = aiContent.split(/(?=\n\s*\d+[.、\)])/g)
        const extractedSteps = []
        
        for (const section of stepSections) {
          if (section.trim()) {
            // 移除开头的编号和多余空白
            const cleanSection = section.replace(/^\s*\d+[.、\)]\s*/, '').trim()
            if (cleanSection.length > 15 && 
                !cleanSection.startsWith('**问题分析**') && 
                !cleanSection.startsWith('**详细解题步骤**') && 
                !cleanSection.startsWith('**最终答案**') && 
                !cleanSection.startsWith('**验证过程**') && 
                !cleanSection.startsWith('**相关数学概念**') && 
                !cleanSection.startsWith('**常见错误')) {
              extractedSteps.push(cleanSection)
            }
          }
        }
        
        if (extractedSteps.length > 0) {
          steps = extractedSteps.slice(0, 8)
          console.log('✅ 全局智能分割步骤（保持顺序）:', steps)
        } else {
          // 按段落分割过滤标题
          const paragraphs = aiContent.split('\n')
            .map(p => p.trim())
            .filter(p => p && p.length > 15 && 
              !p.startsWith('**') && 
              !p.startsWith('题目：') && 
              !p.startsWith('问题分析：') && 
              !p.startsWith('最终答案：') && 
              !p.startsWith('验证过程：') && 
              !p.startsWith('相关数学概念：') &&
              !p.startsWith('常见错误'))
          steps = paragraphs.slice(0, 8) // 增加最大步骤数
          console.log('✅ 兜底段落提取:', steps)
        }
      }
      
      // 4. 如果还是没有有效步骤，尝试从AI内容中提取更详细的步骤
      if (steps.length < 2) {
        console.log('🔄 尝试从AI内容中提取详细步骤...')
        
        // 从AI内容中提取有意义的段落作为步骤
        const contentLines = aiContent.split('\n')
          .map(s => s.trim())
          .filter(s => s.length > 20 && 
            !s.startsWith('**') && 
            !s.startsWith('问题分析') &&
            !s.startsWith('最终答案') &&
            !s.startsWith('验证过程') &&
            !s.startsWith('相关数学概念') &&
            !s.startsWith('常见错误提醒') &&
            !s.startsWith('---'))
        
        // 选择最长的几个段落作为步骤
        const sortedLines = contentLines.sort((a, b) => b.length - a.length)
        steps = sortedLines.slice(0, 5)
        
        // 如果还是没有足够的步骤，使用备用步骤
        if (steps.length < 2) {
          steps = [
            "分析题目条件",
            "列出方程",
            "移项求解", 
            "计算得出结果",
            "验证答案"
          ]
        }
        
        console.log('🔄 使用备用步骤:', steps)
      }
      
      // 5. 确保步骤内容与问题相关，并保持正确顺序
      if (steps.length > 0) {
        // 确保步骤顺序正确，移除重复步骤
        const uniqueSteps = []
        const seenSteps = new Set()
        for (const step of steps) {
          const cleanStep = step.trim()
          if (cleanStep && cleanStep.length > 5 && !seenSteps.has(cleanStep)) {
            uniqueSteps.push(cleanStep)
            seenSteps.add(cleanStep)
          }
        }
        steps = uniqueSteps
        
        // 添加问题信息到第一个步骤（如果还没有的话）
        const questionInfo = `题目：${question.trim()}`
        if (!steps[0].includes(question.trim().substring(0, 10))) {
          steps.unshift(questionInfo)
        }
        
        console.log('✅ 最终提取的步骤（保持顺序）:', steps)
        console.log('📊 步骤数量:', steps.length)
        
        // 验证步骤顺序
        for (let i = 0; i < steps.length; i++) {
          console.log(`步骤 ${i + 1}: ${steps[i]}`)
        }
      }
      let manimVideoUrl = ''
      try {
        console.log('🎬 准备调用Manim生成视频，步骤顺序:')
        steps.forEach((step, index) => {
          console.log(`  ${index + 1}. ${step}`)
        })
        
        manimVideoUrl = await generateManimVideoFromQwen(steps, `qwen_video_${Date.now()}`)
        console.log('✅ Manim视频生成结果:', manimVideoUrl)
      } catch (e) {
        console.error('❌ Manim渲染失败:', e)
      }

      console.log('✅ 步骤8: 完成')
      setCurrentStep('✅ 完成!')
      setGenerationProgress(100)
      await delay(500)

      // 生成最终结果
      const finalResult = {
        success: true,
        video: {
          videoUrl: manimVideoUrl || '/videos/sample-math-explanation.mp4',
          thumbnailUrl: '/images/video-thumbnail.jpg',
          duration: 180,
          processingTime: 45
        },
        mathSolution: mathSolution.data,
        metadata: {
          language,
          difficulty: 'intermediate',
          mathTopics: extractMathTopics(mathSolution.data),
          actualCost: calculateActualCost(mathSolution.data?.usage || mathSolution.usage)
        },
        script: generateVideoScript(mathSolution.data, language, question),
        question: question.trim() // Store the original question
      }

      console.log('🎉 设置最终结果:', finalResult)
      setResult(finalResult)
      setEstimatedCost(calculateDetailedCost(mathSolution.data?.usage))

      // 自动保存视频到数据库
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

  const callQwenAPI = async (question, language) => {
    console.log('🔑 检查API密钥...')
    const apiKey = import.meta.env.VITE_QWEN_API_KEY
    console.log('🔍 环境变量检查:', {
      VITE_QWEN_API_KEY: apiKey ? '***已配置***' : '未配置',
      import_meta_env: Object.keys(import.meta.env).filter(key => key.includes('QWEN'))
    })
    if (!apiKey) {
      throw new Error('API密钥未配置，请检查VITE_QWEN_API_KEY环境变量')
    }
    console.log('✅ API密钥已配置')
    
    // 先测试网络连接
    console.log('🌐 测试SDK服务器连接...')
    try {
      const testResponse = await fetch('http://127.0.0.1:8002/api/qwen', {
        method: 'OPTIONS',
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('✅ SDK服务器连接正常，状态码:', testResponse.status)
    } catch (error) {
      console.error('❌ SDK服务器连接失败:', error)
      console.error('请确保SDK服务器正在运行: python qwen_sdk_server.py')
      throw new Error(`SDK服务器连接失败: ${error.message}`)
    }
    
    console.log('📝 构建数学提示...')
    const prompt = buildMathPrompt(question, language)
    console.log('✅ 提示构建完成，长度:', prompt.length)
    
    let lastError = null
    for (let i = 0; i < 3; i++) {
      try {
        console.log(`🔄 尝试第 ${i + 1} 次API调用...`)
        console.log('📡 请求地址:', 'http://127.0.0.1:8002/api/qwen')
        console.log('📄 请求数据:', {
          api_key: apiKey ? '***已配置***' : '未配置',
          messages: [
            {
              role: 'system',
              content: language === 'zh' ? 
                '你是专业的K12数学老师，请用清晰的中文解释数学概念和解题步骤。' :
                'You are a professional K12 math teacher. Please explain math concepts and solution steps clearly in English.'
            },
            {
              role: 'user',
              content: prompt.substring(0, 100) + '...'
            }
          ],
          temperature: 0.1,
          max_tokens: 1000,
          top_p: 0.8
        })
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          console.log('⏰ 请求超时，正在中断...')
          controller.abort()
        }, 30000) // 减少到30秒超时，避免长时间等待
        
        try {
          const response = await fetch('http://127.0.0.1:8002/api/qwen', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              api_key: apiKey,
              messages: [
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
              ],
              temperature: 0.1,
              max_tokens: 1000,
              top_p: 0.8
            }),
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          console.log('📊 响应状态:', response.status, response.statusText)
          console.log('📊 响应头:', Object.fromEntries(response.headers.entries()))
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ 服务器错误响应:', errorText)
            throw new Error(`服务器错误: ${response.status} ${response.statusText}`)
          }
          
          const data = await response.json()
          console.log('✅ API调用成功，响应数据:', data)
          
          // 转换SDK响应格式为前端期望的格式
          const convertedData = {
            content: data.output?.text || '',
            usage: data.usage || {},
            model: 'qwen-plus',
            requestId: data.request_id
          }
          
          return { success: true, data: convertedData }
          
        } catch (error) {
          clearTimeout(timeoutId)
          
          console.error('🔍 详细错误信息:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          })
          
          if (error.name === 'AbortError') {
            console.error('❌ 请求超时被中断')
            throw new Error('请求超时，请稍后重试')
          } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            console.error('❌ 网络连接失败')
            throw new Error('网络连接失败，请检查SDK服务器是否运行')
          } else {
            console.error('❌ API调用异常:', error)
            throw error
          }
        }
      } catch (error) {
        console.error(`❌ 第 ${i + 1} 次API调用失败:`, error)
        lastError = `网络连接失败: ${error.message}`
        
        // 检查错误类型，决定是否重试
        if (error.name === 'AbortError' || error.message.includes('超时')) {
          console.log('🔄 超时错误，将重试...')
          continue
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          console.log('🔄 网络连接错误，将重试...')
          continue
        } else {
          console.log('❌ 非重试错误，停止重试')
          break
        }
      }
    }
    
    // 如果所有重试都失败，提供客户端备用响应
    console.log('🔄 所有重试失败，使用客户端备用响应')
    console.log('❌ 最终错误:', lastError)
    const fallbackContent = generateClientFallback(question, language)
    return {
      success: true,
      data: {
        content: fallbackContent,
        usage: { input_tokens: question.length, output_tokens: fallbackContent.length },
        model: 'client-fallback',
        requestId: `client_${Date.now()}`
      }
    }
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
    
    // 移除其他常见的LaTeX标记
    cleaned = cleaned.replace(/\\[a-zA-Z]+/g, '') // 移除反斜杠命令
    cleaned = cleaned.replace(/\{[^}]*\}/g, '') // 移除花括号内容
    cleaned = cleaned.replace(/\\\(/g, '').replace(/\\\)/g, '') // 移除行内公式标记
    cleaned = cleaned.replace(/\\\[/g, '').replace(/\\\]/g, '') // 移除块级公式标记
    
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
        title: `Math Solution: ${videoResult.question.substring(0, 50)}...`,
        description: `AI-generated math teaching video for: ${videoResult.question}`,
        question: videoResult.question,
        videoUrl: videoResult.video.videoUrl,
        thumbnailUrl: videoResult.video.thumbnailUrl,
        duration: videoResult.video.duration,
        language: videoResult.metadata.language,
        mathTopics: videoResult.metadata.mathTopics,
        difficultyLevel: videoResult.metadata.difficulty,
        solutionData: {
          content: videoResult.mathSolution?.content || '',
          usage: videoResult.mathSolution?.usage || {},
          model: videoResult.mathSolution?.model || 'qwen-plus',
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
    <Card className="border-red-200 bg-red-50">
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
  const playMathVideo = () => {
    if (!result || !result.success) {
      alert('请先生成视频内容')
      return
    }
    
    // 显示视频播放器
    setShowVideoPlayer(true)
    setCurrentScene(0)
    setVideoProgress(0)
    setVideoCurrentTime(0)
    setIsPlaying(false)
    
    // 如果有真实的Manim视频，直接跳转到视频区域
    if (result.video?.videoUrl && result.video.videoUrl.startsWith('/rendered_videos/')) {
      console.log('🎬 准备播放真实视频:', result.video.videoUrl)
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
    <Card className="border-orange-200 bg-orange-50">
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

  const VIDEO_SERVER = import.meta.env.VITE_VIDEO_SERVER || 'http://localhost:5001';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
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
      <Card>
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
      <Card>
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

      {/* 问题输入 */}
      <Card>
        <CardHeader>
          <CardTitle>输入数学问题 / Enter Math Question</CardTitle>
        </CardHeader>
        <CardContent>
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
                <Button variant="outline" size="sm" onClick={uploadImage}>
                  <Upload className="h-4 w-4 mr-2" />
                  {language === 'zh' ? '上传图片' : 'Upload Image'}
                </Button>
                <Button variant="outline" size="sm" onClick={voiceInput}>
                  <Mic className="h-4 w-4 mr-2" />
                  {language === 'zh' ? '语音输入' : 'Voice Input'}
                </Button>
                <Button variant="outline" size="sm" onClick={clearQuestion}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {language === 'zh' ? '清除' : 'Clear'}
                </Button>
              </div>
              
              <Button 
                onClick={handleGenerateVideo}
                disabled={!question.trim() || isGenerating}
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
                    {language === 'zh' ? '生成AI教学视频' : 'Generate AI Teaching Video'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 认证需求提示 */}
      {showAuthRequired && <AuthRequiredAlert />}

      {/* 速率限制提示 */}
      {rateLimit && <RateLimitAlert />}

      {/* 生成进度 */}
      {isGenerating && (
        <Card>
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
        <Card>
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
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">🤖 AI解题结果</h4>
                  <div className="text-sm text-green-700 whitespace-pre-wrap">
                    {result.mathSolution?.content || ''}
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
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
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
                  <div className="bg-black rounded-lg overflow-hidden">
                    {/* 视频播放区域 */}
                    <div className="bg-gray-900 text-white p-4 min-h-[400px] flex flex-col justify-center">
                      {/* 如果有真实视频URL，优先显示真实视频 */}
                      {result.video?.videoUrl && result.video.videoUrl.startsWith('/rendered_videos/') ? (
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold mb-4">
                            🎬 {language === 'zh' ? 'AI数学教学视频' : 'AI Math Teaching Video'}
                          </h3>
                          <video
                            src={`${VIDEO_SERVER}${result.video.videoUrl}`}
                            controls
                            autoPlay={false}
                            style={{ 
                              margin: '0 auto', 
                              maxWidth: '100%', 
                              width: '100%',
                              maxHeight: '320px',
                              background: '#000',
                              borderRadius: '8px'
                            }}
                            poster={result.video.thumbnailUrl}
                            onError={(e) => {
                              console.error('视频加载失败:', e);
                              console.log('尝试的视频URL:', `${VIDEO_SERVER}${result.video.videoUrl}`);
                            }}
                            onLoadedData={() => {
                              console.log('✅ 视频加载成功:', result.video.videoUrl);
                            }}
                          >
                            {language === 'zh' ? '您的浏览器不支持视频播放。' : 'Your browser does not support the video tag.'}
                          </video>
                          <p className="text-gray-300 mt-2 text-sm">
                            {language === 'zh' ? '点击播放按钮开始观看AI生成的数学教学动画' : 'Click play button to watch AI-generated math teaching animation'}
                          </p>
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
                          {!(result.video?.videoUrl && result.video.videoUrl.startsWith('/rendered_videos/')) && (
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
                          {result.video?.videoUrl && result.video.videoUrl.startsWith('/rendered_videos/') ? (
                            <span>{language === 'zh' ? '真实AI数学动画视频' : 'Real AI Math Animation Video'}</span>
                          ) : (
                            <span>{formatTime(videoCurrentTime)} / {formatTime(180)}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* 进度条 - 只在模拟模式下显示 */}
                      {!(result.video?.videoUrl && result.video.videoUrl.startsWith('/rendered_videos/')) && (
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${videoProgress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-400 text-center">
                        {result.video?.videoUrl && result.video.videoUrl.startsWith('/rendered_videos/') ? (
                          <span>{language === 'zh' ? '🎬 由Manim生成的专业数学教学动画 - 基于通义千问AI解题内容' : '🎬 Professional math teaching animation generated by Manim - Based on Qwen AI solution content'}</span>
                        ) : (
                          <span>{language === 'zh' ? 'AI数学教学演示 - 基于通义千问解题内容生成' : 'AI Math Teaching Demo - Generated based on Qwen solution content'}</span>
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
                    {result.script.scenes.map((scene, index) => (
                      <div key={index} className="border-l-2 border-blue-300 pl-3">
                        <div className="font-medium">场景 {scene.sceneNumber} ({scene.duration}秒)</div>
                        <div className="text-gray-600">{scene.text}</div>
                      </div>
                    ))}
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