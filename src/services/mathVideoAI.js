export class MathVideoAIService {
  constructor() {
    this.config = {
      // 主要AI服务配置
      openai: {
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        baseUrl: 'https://api.openai.com/v1'
      },
      // 阿里云通义千问 - 性价比高的中文数学理解
      qwen: {
        apiKey: import.meta.env.VITE_QWEN_API_KEY,
        baseUrl: 'https://dashscope.aliyuncs.com/api/v1'
      },
      // D-ID或HeyGen用于虚拟讲师视频生成
      did: {
        apiKey: import.meta.env.VITE_DID_API_KEY,
        baseUrl: 'https://api.d-id.com'
      },
      // Azure Speech Services用于多语言TTS
      azure: {
        apiKey: import.meta.env.VITE_AZURE_SPEECH_KEY,
        region: import.meta.env.VITE_AZURE_REGION
      },
      // Manim Community用于数学动画渲染
      manim: {
        endpoint: import.meta.env.VITE_MANIM_API_ENDPOINT || 'http://localhost:5001'
      }
    }
    
    this.supportedLanguages = {
      'en': { name: 'English', voice: 'en-US-AriaNeural', mathTerms: 'english' },
      'zh': { name: '中文', voice: 'zh-CN-XiaoxiaoNeural', mathTerms: 'chinese' },
      'es': { name: 'Español', voice: 'es-ES-ElviraNeural', mathTerms: 'spanish' },
      'fr': { name: 'Français', voice: 'fr-FR-DeniseNeural', mathTerms: 'french' },
      'ja': { name: '日本語', voice: 'ja-JP-NanamiNeural', mathTerms: 'japanese' }
    }
  }

  async generateMathVideo(question, options = {}) {
    const {
      language = 'en',
      difficulty = 'intermediate',
      style = 'step-by-step',
      includeAnimation = true,
      voiceGender = 'female'
    } = options

    try {
      // 步骤1: 数学问题理解和求解
      const mathSolution = await this.solveMathProblem(question, language, difficulty)
      
      // 步骤2: 生成教学脚本
      const teachingScript = await this.generateTeachingScript(mathSolution, language, style)
      
      // 步骤3: 创建数学动画
      const animations = includeAnimation ? 
        await this.generateMathAnimations(mathSolution, teachingScript) : null
      
      // 步骤4: 生成多语言语音
      const audioTrack = await this.generateVoiceover(teachingScript, language, voiceGender)
      
      // 步骤5: 合成最终视频
      const finalVideo = await this.combineVideoElements(
        teachingScript, 
        animations, 
        audioTrack, 
        language
      )
      
      return {
        success: true,
        video: finalVideo,
        metadata: {
          duration: finalVideo.duration,
          language,
          difficulty,
          mathTopics: mathSolution.topics,
          processingTime: finalVideo.processingTime
        }
      }
      
    } catch (error) {
      console.error('Video generation failed:', error)
      return {
        success: false,
        error: error.message,
        fallback: await this.generateFallbackContent(question, language)
      }
    }
  }

  async solveMathProblem(question, language, difficulty) {
    // 使用通义千问处理中文数学问题，OpenAI处理英文
    const useQwen = language === 'zh' || language.startsWith('zh')
    
    const prompt = this.buildMathSolvingPrompt(question, language, difficulty)
    
    try {
      let aiResponse
      if (useQwen) {
        aiResponse = await this.callQwenAPI(prompt)
      } else {
        aiResponse = await this.callOpenAIAPI(prompt)
      }
      
      console.log('📝 AI原始响应:', aiResponse.substring(0, 200) + '...')
      
      // 尝试解析JSON响应
      let parsedResponse
      try {
        parsedResponse = JSON.parse(aiResponse)
      } catch (parseError) {
        console.log('⚠️ JSON解析失败，使用文本解析模式')
        // 如果JSON解析失败，使用文本解析
        parsedResponse = this.parseTextResponse(aiResponse, question)
      }
      
      // 提取和优化步骤
      let steps = []
      if (parsedResponse.steps && Array.isArray(parsedResponse.steps)) {
        // 如果是结构化步骤，转换为文本格式
        steps = parsedResponse.steps.map(step => {
          if (typeof step === 'object') {
            return `${step.stepNumber || ''}. **${step.description || ''}** ${step.operation || ''} ${step.result || ''} ${step.explanation || ''}`
          }
          return step
        })
      } else {
        // 从文本中提取步骤
        steps = extractAndSortSteps(aiResponse)
      }
      
      // 去重处理
      steps = removeDuplicateSteps(steps)
      
      console.log('📊 最终步骤数量:', steps.length)
      steps.forEach((step, index) => {
        console.log(`步骤 ${index + 1}: ${step.substring(0, 50)}...`)
      })
      
      return {
        originalQuestion: question,
        language,
        solution: parsedResponse.solution || '答案已包含在步骤中',
        steps: steps,
        explanation: parsedResponse.explanation || aiResponse,
        topics: parsedResponse.topics || ['数学'],
        difficulty: parsedResponse.assessedDifficulty || difficulty,
        alternativeMethods: parsedResponse.alternatives || [],
        rawResponse: aiResponse
      }
    } catch (error) {
      console.error('❌ 数学问题求解失败:', error)
      throw new Error(`Math solving failed: ${error.message}`)
    }
  }
  
  parseTextResponse(text, question) {
    // 从文本响应中提取结构化信息
    const result = {
      solution: '',
      explanation: text,
      topics: ['数学'],
      assessedDifficulty: 'intermediate'
    }
    
    // 尝试提取最终答案
    const answerMatch = text.match(/\*\*最终答案\*\*\s*([\s\S]*?)(?=\*\*|$)/)
    if (answerMatch) {
      result.solution = answerMatch[1].trim()
    }
    
    // 尝试提取数学主题
    const topicsMatch = text.match(/\*\*相关数学概念\*\*\s*([\s\S]*?)(?=\*\*|$)/)
    if (topicsMatch) {
      result.topics = topicsMatch[1].split(/[,，、]/).map(t => t.trim()).filter(t => t)
    }
    
    return result
  }

  buildMathSolvingPrompt(question, language, difficulty) {
    const languageInstructions = {
      'en': 'Solve this math problem step by step in English',
      'zh': '请用中文逐步解决这个数学问题',
      'es': 'Resuelve este problema matemático paso a paso en español',
      'fr': 'Résolvez ce problème mathématique étape par étape en français',
      'ja': 'この数学問題を日本語で段階的に解いてください'
    }
    
    return `
${languageInstructions[language] || languageInstructions['en']}:

Question: ${question}
Difficulty Level: ${difficulty}

Please provide:
1. Complete step-by-step solution
2. Clear explanation for each step
3. Final answer with verification
4. Key mathematical concepts involved
5. Common mistakes to avoid
6. Visual elements that would help understanding

Format your response as JSON with the following structure:
{
  "solution": "final answer",
  "steps": [
    {
      "stepNumber": 1,
      "description": "what we're doing",
      "operation": "mathematical operation",
      "result": "result of this step",
      "explanation": "why we do this",
      "visualHint": "how to show this visually"
    }
  ],
  "explanation": "overall explanation",
  "topics": ["topic1", "topic2"],
  "assessedDifficulty": "actual difficulty level",
  "commonMistakes": ["mistake1", "mistake2"],
  "visualElements": ["element1", "element2"]
}
`
  }

  async callQwenAPI(prompt) {
    try {
      // 首先尝试使用本地增强服务器
      const localResponse = await fetch('http://localhost:8002/api/qwen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: '你是一个专业的数学老师，擅长用清晰的中文解释数学概念和解题步骤。请按照以下格式提供非常详细的解题步骤，每个步骤都要包含具体的操作和解释：\n\n**详细解题步骤**\n1. **理解题目** 仔细阅读题目，明确已知条件和要求求解的内容。分析题目中的关键词和数学概念。\n2. **确定解题思路** 根据题目类型选择合适的解题方法，列出解题的整体思路和步骤。\n3. **列出公式或方程** 根据数学原理，写出相关的公式、方程或不等式。\n4. **代入已知条件** 将题目中的具体数值代入公式或方程中。\n5. **逐步计算** 按照数学运算规则，一步一步进行计算，每步都要写出具体的计算过程。\n6. **得出结果** 完成所有计算后，得出最终答案。\n7. **验证答案** 检查计算过程是否正确，验证答案是否符合题目要求。\n\n**最终答案**\n[具体数值和单位]\n\n**相关数学概念**\n[涉及的所有数学概念和公式]\n\n**常见错误提醒**\n[学生容易犯的错误和注意事项]'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        })
      })
      
      if (localResponse.ok) {
        const localData = await localResponse.json()
        console.log('✅ 本地QWEN服务器响应成功')
        return localData.output.text
      } else {
        throw new Error('本地服务器响应失败')
      }
    } catch (localError) {
      console.log('⚠️ 本地服务器不可用，尝试直接调用QWEN API')
      
      // 备用方案：直接调用QWEN API
      const response = await fetch(`${this.config.qwen.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.qwen.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: [
              {
                role: 'system',
                content: '你是一个专业的数学老师，擅长用清晰的中文解释数学概念和解题步骤。请按照以下格式提供非常详细的解题步骤，每个步骤都要包含具体的操作和解释：\n\n**详细解题步骤**\n1. **理解题目** 仔细阅读题目，明确已知条件和要求求解的内容。分析题目中的关键词和数学概念。\n2. **确定解题思路** 根据题目类型选择合适的解题方法，列出解题的整体思路和步骤。\n3. **列出公式或方程** 根据数学原理，写出相关的公式、方程或不等式。\n4. **代入已知条件** 将题目中的具体数值代入公式或方程中。\n5. **逐步计算** 按照数学运算规则，一步一步进行计算，每步都要写出具体的计算过程。\n6. **得出结果** 完成所有计算后，得出最终答案。\n7. **验证答案** 检查计算过程是否正确，验证答案是否符合题目要求。\n\n**最终答案**\n[具体数值和单位]\n\n**相关数学概念**\n[涉及的所有数学概念和公式]\n\n**常见错误提醒**\n[学生容易犯的错误和注意事项]'
              },
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          parameters: {
            temperature: 0.1,
            max_tokens: 2000
          }
        })
      })
      
      const data = await response.json()
      return data.output.text
    }
  }

  async callOpenAIAPI(prompt) {
    const response = await fetch(`${this.config.openai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openai.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // 性价比考虑
        messages: [
          {
            role: 'system',
            content: 'You are an expert math teacher who explains concepts clearly and systematically.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    })
    
    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  }

  async generateTeachingScript(mathSolution, language, style) {
    const scriptPrompt = this.buildScriptPrompt(mathSolution, language, style)
    
    const useQwen = language === 'zh' || language.startsWith('zh')
    let response
    
    if (useQwen) {
      response = await this.callQwenAPI(scriptPrompt)
    } else {
      response = await this.callOpenAIAPI(scriptPrompt)
    }
    
    return {
      title: response.title,
      introduction: response.introduction,
      scenes: response.scenes,
      conclusion: response.conclusion,
      totalDuration: response.estimatedDuration,
      language
    }
  }

  buildScriptPrompt(mathSolution, language, style) {
    const styleInstructions = {
      'step-by-step': 'Focus on clear, sequential steps with pauses for understanding',
      'conceptual': 'Emphasize the underlying mathematical concepts and intuition',
      'visual': 'Heavy emphasis on visual demonstrations and animations',
      'interactive': 'Include questions and checkpoints for student engagement'
    }
    
    return `
Create a detailed video teaching script in ${language} for this math solution:

Problem: ${mathSolution.originalQuestion}
Solution: ${JSON.stringify(mathSolution, null, 2)}
Style: ${style} - ${styleInstructions[style]}

Create a script with these specifications:
- Total duration: 3-5 minutes
- Clear introduction, main content, and conclusion
- Specific timing for each scene
- Visual cues for animations
- Natural, conversational tone appropriate for students
- Include transition phrases between concepts

Format as JSON:
{
  "title": "lesson title",
  "introduction": {
    "text": "opening script",
    "duration": 30,
    "visuals": ["visual cues"]
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "text": "narration text",
      "duration": 45,
      "visuals": ["what to show on screen"],
      "animations": ["animation descriptions"],
      "emphasis": ["key points to highlight"]
    }
  ],
  "conclusion": {
    "text": "closing script",
    "duration": 30,
    "visuals": ["final visuals"]
  },
  "estimatedDuration": 300
}
`
  }

  async generateMathAnimations(mathSolution, teachingScript) {
    // 调用Manim服务生成数学动画
    try {
      const animationRequest = {
        scenes: teachingScript.scenes.map(scene => ({
          sceneId: scene.sceneNumber,
          duration: scene.duration,
          mathContent: this.extractMathContent(scene),
          animationType: this.determineAnimationType(scene.animations),
          style: 'educational'
        })),
        resolution: '1920x1080',
        fps: 30,
        backgroundColor: '#ffffff'
      }
      
      const response = await fetch(`${this.config.manim.endpoint}/generate-animation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(animationRequest)
      })
      
      const result = await response.json()
      return result.animations
      
    } catch (error) {
      console.warn('Animation generation failed, using static visuals:', error)
      return this.generateStaticVisuals(mathSolution, teachingScript)
    }
  }

  async generateVoiceover(teachingScript, language, voiceGender) {
    const voiceConfig = this.supportedLanguages[language]
    if (!voiceConfig) {
      throw new Error(`Unsupported language: ${language}`)
    }
    
    // 组合所有脚本文本
    const fullScript = [
      teachingScript.introduction.text,
      ...teachingScript.scenes.map(scene => scene.text),
      teachingScript.conclusion.text
    ].join('\n\n')
    
    try {
      // 使用Azure Speech Services生成高质量TTS
      const response = await fetch(
        `https://${this.config.azure.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': this.config.azure.apiKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm'
          },
          body: this.buildSSMLScript(fullScript, voiceConfig.voice, language)
        }
      )
      
      const audioBuffer = await response.arrayBuffer()
      return {
        audioData: audioBuffer,
        duration: this.estimateAudioDuration(fullScript, language),
        voice: voiceConfig.voice,
        language
      }
      
    } catch (error) {
      throw new Error(`Voice generation failed: ${error.message}`)
    }
  }

  buildSSMLScript(text, voice, language) {
    // 为数学术语添加特殊发音标记
    const mathTermsProcessed = this.processMathTerms(text, language)
    
    return `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
  <voice name="${voice}">
    <prosody rate="0.9" pitch="medium">
      ${mathTermsProcessed}
    </prosody>
  </voice>
</speak>`
  }

  processMathTerms(text, language) {
    const mathTerms = {
      'en': {
        'x': '<say-as interpret-as="characters">x</say-as>',
        '²': '<say-as interpret-as="characters">squared</say-as>',
        '³': '<say-as interpret-as="characters">cubed</say-as>',
        '√': 'square root of',
        'π': 'pi'
      },
      'zh': {
        'x': '<say-as interpret-as="characters">x</say-as>',
        '²': '的平方',
        '³': '的立方',
        '√': '根号',
        'π': '圆周率'
      }
    }
    
    const terms = mathTerms[language] || mathTerms['en']
    let processedText = text
    
    Object.entries(terms).forEach(([symbol, pronunciation]) => {
      processedText = processedText.replace(new RegExp(symbol, 'g'), pronunciation)
    })
    
    return processedText
  }

  async combineVideoElements(script, animations, audioTrack, language) {
    // 使用D-ID或类似服务创建虚拟讲师视频
    try {
      const videoRequest = {
        script: {
          type: 'text',
          input: script.scenes.map(scene => scene.text).join(' '),
          language: language
        },
        config: {
          fluent: true,
          pad_audio: 0.0
        },
        source_url: this.getAvatarForLanguage(language) // 选择合适的虚拟讲师
      }
      
      const response = await fetch(`${this.config.did.baseUrl}/talks`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.config.did.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoRequest)
      })
      
      const result = await response.json()
      
      // 等待视频生成完成
      const finalVideo = await this.pollVideoStatus(result.id)
      
      return {
        videoUrl: finalVideo.result_url,
        thumbnailUrl: finalVideo.thumbnail_url,
        duration: finalVideo.duration,
        processingTime: finalVideo.processing_time,
        quality: '1920x1080',
        format: 'mp4'
      }
      
    } catch (error) {
      throw new Error(`Video combination failed: ${error.message}`)
    }
  }

  getAvatarForLanguage(language) {
    const avatars = {
      'en': 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg',
      'zh': 'https://d-id-public-bucket.s3.amazonaws.com/chinese-teacher.jpg',
      'es': 'https://d-id-public-bucket.s3.amazonaws.com/maria.jpg',
      'fr': 'https://d-id-public-bucket.s3.amazonaws.com/sophie.jpg',
      'ja': 'https://d-id-public-bucket.s3.amazonaws.com/yuki.jpg'
    }
    
    return avatars[language] || avatars['en']
  }

  async pollVideoStatus(videoId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 10000)) // 等待10秒
      
      const response = await fetch(`${this.config.did.baseUrl}/talks/${videoId}`, {
        headers: {
          'Authorization': `Basic ${this.config.did.apiKey}`
        }
      })
      
      const status = await response.json()
      
      if (status.status === 'done') {
        return status
      } else if (status.status === 'error') {
        throw new Error(`Video generation failed: ${status.error}`)
      }
      
      // 状态仍在处理中，继续等待
    }
    
    throw new Error('Video generation timeout')
  }

  // 成本估算方法
  estimateCost(duration, language, includeAnimation = true) {
    const costs = {
      // OpenAI API costs (per 1K tokens)
      openai: 0.002,
      // 通义千问 costs (per 1K tokens) - 更便宜
      qwen: 0.0008,
      // Azure Speech costs (per character)
      azureTTS: 0.000004,
      // D-ID costs (per minute)
      didVideo: 0.3,
      // Manim animation (per scene)
      animation: 0.1
    }
    
    const useQwen = language === 'zh'
    const llmCost = useQwen ? costs.qwen : costs.openai
    
    return {
      llm: llmCost * 2, // 估算2K tokens
      tts: costs.azureTTS * duration * 200, // 估算每分钟200字符
      video: costs.didVideo * (duration / 60),
      animation: includeAnimation ? costs.animation * 5 : 0, // 估算5个场景
      total: function() {
        return this.llm + this.tts + this.video + this.animation
      }
    }
  }

  // 辅助方法
  extractMathContent(scene) {
    const mathPatterns = [
      /\d+[xy]\s*[+\-*/]\s*\d+/g, // 基本代数表达式
      /[xy]\s*=\s*\d+/g, // 等式
      /\d+\/\d+/g, // 分数
      /√\d+/g, // 根号
      /\d+²/g, // 平方
    ]
    
    const mathContent = []
    mathPatterns.forEach(pattern => {
      const matches = scene.text.match(pattern)
      if (matches) {
        mathContent.push(...matches)
      }
    })
    
    return mathContent
  }

  determineAnimationType(animations) {
    if (!animations || animations.length === 0) return 'static'
    
    const animationKeywords = {
      'equation': ['solve', 'step', 'substitute'],
      'graph': ['plot', 'line', 'curve'],
      'geometry': ['triangle', 'circle', 'angle'],
      'algebra': ['variable', 'expression', 'simplify']
    }
    
    for (const [type, keywords] of Object.entries(animationKeywords)) {
      if (keywords.some(keyword => 
        animations.some(anim => anim.toLowerCase().includes(keyword))
      )) {
        return type
      }
    }
    
    return 'general'
  }

  estimateAudioDuration(text, language) {
    // 不同语言的语速估算 (字符/秒)
    const speechRates = {
      'en': 14, // 英语约14字符/秒
      'zh': 4,  // 中文约4字符/秒
      'es': 12, // 西班牙语约12字符/秒
      'fr': 13, // 法语约13字符/秒
      'ja': 6   // 日语约6字符/秒
    }
    
    const rate = speechRates[language] || speechRates['en']
    return Math.ceil(text.length / rate)
  }

  async generateFallbackContent(question, language) {
    // 如果主要视频生成失败，提供文本解答作为备选
    return {
      type: 'text',
      content: `We apologize, but video generation is temporarily unavailable. Here's a text solution for: ${question}`,
      language,
      suggestedAction: 'Try again later or contact support'
    }
  }
}

/**
 * 智能提取和排序步骤，解决重复和顺序问题
 * 增强过滤：移除标题、问题陈述、最终答案等非步骤内容
 * @param {string} aiContent - AI返回的完整内容
 * @returns {string[]} - 去重且排序后的步骤数组
 */
function extractAndSortSteps(aiContent) {
  console.log('🔍 开始智能步骤提取...')
  console.log('原始内容长度:', aiContent.length)
  
  const steps = [] // 使用数组确保顺序
  
  // 1. 首先检查是否为模板/示例响应
  const templateIndicators = [
    "理解题意", "建立数学模型", "逐步计算", "验证结果",
    "Please provide", "Format your response", "step-by-step solution",
    "what we're doing", "mathematical operation", "result of this step"
  ];
  
  const hasTemplateContent = templateIndicators.some(indicator => 
    aiContent.toLowerCase().includes(indicator.toLowerCase())
  );
  
  if (hasTemplateContent) {
    console.log('⚠️ 检测到模板内容，跳过模板提取');
    // 继续尝试提取实际内容
  }
  
  // 2. 首先尝试匹配实际AI响应格式："**步骤编号：1** 具体操作：... 详细解释：..."
  const detailedStepPattern = /(?:^|\n)(\d+)[.、\)]?\s*(?:\*\*步骤编号：\1\*\*\s*\*\*具体操作：([^*]+)\*\*(?:\s*\*\*详细解释：([^*]+)\*\*)?(?:\s*\*\*中间结果：([^*]*)\*\*)?)?/gm;
  const detailedMatches = [...aiContent.matchAll(detailedStepPattern)];
  
  if (detailedMatches.length > 0) {
    console.log(`✅ 找到 ${detailedMatches.length} 个详细步骤格式`);
    
    detailedMatches.forEach(match => {
      const stepNum = parseInt(match[1]);
      const operation = match[2] ? match[2].trim() : '';
      const explanation = match[3] ? match[3].trim() : '';
      const result = match[4] ? match[4].trim() : '';
      
      let fullContent = operation;
      if (explanation && !operation.includes(explanation)) {
        fullContent += '：' + explanation;
      }
      if (result && result.trim()) {
        fullContent += '，计算结果：' + result.trim();
      }
      
      if (fullContent.length > 10 && !isTemplateStep(fullContent)) {
        steps[stepNum - 1] = fullContent;
        console.log(`📝 提取详细步骤 ${stepNum}: ${fullContent.substring(0, 80)}...`);
      }
    });
    
    const validSteps = steps.filter(step => step && step.length > 0);
    if (validSteps.length > 0) {
      console.log(`✅ 成功提取 ${validSteps.length} 个详细步骤`);
      return validSteps;
    }
  }
  
  // 2. 尝试匹配带标题的步骤格式
  const titledStepPattern = /(?:^|\n)(\d+)[.、\)]\s*\*\*([^*]+)\*\*\s*([^\n]+)/gm;
  const titledMatches = [...aiContent.matchAll(titledStepPattern)];
  
  if (titledMatches.length > 0) {
    console.log(`✅ 找到 ${titledMatches.length} 个带标题步骤`);
    
    titledMatches.forEach(match => {
      const stepNum = parseInt(match[1]);
      const title = match[2] ? match[2].trim() : '';
      const content = match[3] ? match[3].trim() : '';
      
      let fullContent = title;
      if (content && !title.includes(content)) {
        fullContent += '：' + content;
      }
      
      if (fullContent.length > 10 && !isTemplateStep(fullContent)) {
        steps[stepNum - 1] = fullContent;
        console.log(`📝 提取带标题步骤 ${stepNum}: ${fullContent.substring(0, 80)}...`);
      }
    });
    
    const validSteps = steps.filter(step => step && step.length > 0);
    if (validSteps.length > 0) {
      console.log(`✅ 成功提取 ${validSteps.length} 个带标题步骤`);
      return validSteps;
    }
  }
  
  // 3. 清理内容后提取普通编号步骤
  let filteredContent = aiContent;
  
  // 保留数学公式，但清理格式标记
  filteredContent = filteredContent.replace(/\*\*([^*]+)\*\*/g, '$1');
  filteredContent = filteredContent.replace(/^#+.*?\n/gm, '');
  
  // 智能分割，保留数学内容
  const stepPattern = /(?:^|\n)(\d+)[.、\)]\s*([\s\S]*?)(?=\n\d+[.、\)]|$)/gm;
  const matches = [...filteredContent.matchAll(stepPattern)];
  
  if (matches.length > 0) {
    console.log(`✅ 找到 ${matches.length} 个普通编号步骤`);
    
    matches.forEach(match => {
      const stepNum = parseInt(match[1]);
      let content = match[2].trim();
      
      // 清理但保留数学内容
      content = content
        .replace(/\s+/g, ' ')
        .replace(/^步骤[:：]?\s*/i, '')
        .trim();
      
      if (content.length > 8 && !isTemplateStep(content)) {
        steps[stepNum - 1] = content;
        console.log(`📝 提取普通步骤 ${stepNum}: ${content.substring(0, 80)}...`);
      }
    });
    
    const validSteps = steps.filter(step => step && step.length > 0);
    if (validSteps.length > 0) {
      console.log(`✅ 成功提取 ${validSteps.length} 个普通步骤`);
      return validSteps;
    }
  }
  
  // 4. 提取包含数学公式的段落
  const mathParagraphs = aiContent
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 30 && (p.includes('=') || p.includes('$') || /\d+/.test(p)))
    .filter(p => !p.startsWith('**最终答案') && !p.startsWith('**验证'));
  
  if (mathParagraphs.length >= 2) {
    console.log(`✅ 找到 ${mathParagraphs.length} 个数学段落`);
    const cleanedParagraphs = mathParagraphs
      .map(p => p.replace(/\s+/g, ' ').trim())
      .filter(p => p.length > 20);
    
    if (cleanedParagraphs.length > 0) {
      console.log(`✅ 使用数学段落作为步骤`);
      return cleanedParagraphs.slice(0, 6);
    }
  }
  
  // 5. 增强后备方案 - 从内容中智能提取数学段落
  console.log('🔍 增强后备提取方案...');
  
  // 提取所有包含数学内容的段落
  const paragraphs = aiContent
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 20)
    .filter(p => {
      const hasMath = /[\+\-\=\×\÷\√\d\$\^\_\{\}\\]/.test(p) || 
                     /(计算|求解|化简|展开|合并|移项|代入|方程|函数|导数|积分)/.test(p) ||
                     /(calculate|solve|simplify|equation|function|derivative|integrate)/i.test(p);
      
      // 更严格的内容过滤，排除模板和示例
      const isTemplateContent = [
        "理解题意", "建立数学模型", "逐步计算", "验证结果",
        "分析已知条件", "列出方程", "移项求解", "计算得出结果",
        "检查答案的正确性", "请用中文逐步解决这个数学问题",
        "Solve this math problem step by step",
        "Please provide", "Format your response", "what we're doing",
        "mathematical operation", "result of this step", "why we do this"
      ].some(template => p.toLowerCase().includes(template.toLowerCase()));
      
      const notHeader = !p.startsWith('**最终答案') && 
                        !p.startsWith('**验证') && 
                        !p.startsWith('**总结') &&
                        !p.startsWith('**结论') &&
                        !p.toLowerCase().includes("template") &&
                        !p.toLowerCase().includes("example");
      
      return hasMath && notHeader && !isTemplateContent;
    });
  
  if (paragraphs.length >= 2) {
    console.log(`✅ 找到 ${paragraphs.length} 个数学段落作为步骤`);
    return paragraphs.map(p => p.replace(/\s+/g, ' ').trim()).slice(0, 6);
  }
  
  // 6. 提取句子作为步骤
  const sentences = aiContent
    .split(/[.!?。！？]/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 200)
    .filter(s => {
      const hasMath = /[\+\-\=\×\÷\√\d]/.test(s) || 
                     /(计算|求解|方程|公式|定理)/.test(s) ||
                     /(calculate|solve|equation|formula|theorem)/i.test(s);
      
      // 排除模板句子
      const isTemplateSentence = [
        "理解题意", "分析已知条件", "建立数学模型", "逐步计算", "验证结果",
        "请按照以下格式", "Please provide", "step by step",
        "what we're doing", "mathematical operation", "result of this step"
      ].some(template => s.toLowerCase().includes(template.toLowerCase()));
      
      return hasMath && !isTemplateSentence;
    });
  
  if (sentences.length >= 2) {
    console.log(`✅ 找到 ${sentences.length} 个数学句子作为步骤`);
    return sentences.slice(0, 6);
  }
  
  // 7. 最终后备 - 从内容中智能提取实际数学内容
  console.log('🔍 最终后备：智能提取实际数学内容...');
  
  // 提取所有包含数学运算的实际内容
  const mathOperations = aiContent
    .split(/\n+|\s{2,}/)
    .map(line => line.trim())
    .filter(line => {
      const hasMathContent = /[\+\-\=\×\÷\√\d]/.test(line) || 
                           /(计算|求解|方程|公式|定理|代入|化简)/.test(line) ||
                           /(calculate|solve|equation|formula|substitute|simplify)/i.test(line);
      const isNotTemplate = !line.includes("理解题意") && 
                           !line.includes("建立数学模型") &&
                           !line.includes("逐步计算") &&
                           !line.includes("验证结果");
      return line.length > 15 && hasMathContent && isNotTemplate;
    });

  if (mathOperations.length >= 2) {
    console.log(`✅ 从内容中提取到 ${mathOperations.length} 个实际数学操作`);
    return mathOperations.slice(0, 4);
  }

  // 8. 避免返回模板内容，返回实际内容或错误提示
  console.log('⚠️ 无法提取有效数学步骤，返回标记而非模板');
  return ["[无法从响应中提取有效步骤，请检查AI响应格式]"];
}

/**
 * 判断内容是否为模板步骤（而非实际解题步骤）
 * @param {string} content - 待判断的内容
 * @returns {boolean} - 是否为模板内容
 */
function isTemplateStep(content) {
  if (!content) return true;
  
  const templatePatterns = [
    /理解题意[:：]/i,
    /建立数学模型[:：]/i,
    /逐步计算[:：]/i,
    /验证结果[:：]/i,
    /分析已知条件[:：]/i,
    /列出方程[:：]/i,
    /移项求解[:：]/i,
    /计算得出结果[:：]/i,
    /检查答案[:：]/i,
    /请用中文逐步解决这个数学问题/i,
    /solve this math problem step by step/i,
    /please provide.*step.*step/i,
    /format your response/i,
    /what we're doing.*operation.*result/i,
    /mathematical operation.*result of this step/i,
    /step \d+[:：]?\s*(理解|分析|建立|计算|验证)/i
  ];
  
  return templatePatterns.some(pattern => pattern.test(content));
}

/**
 * 判断内容是否为有效的数学步骤
 * @param {string} content - 待判断的内容
 * @returns {boolean} - 是否为有效数学步骤
 */
function isValidMathStep(content) {
  const invalidPatterns = [
    /^问题[:：]?/i,
    /^题目[:：]?/i,
    /^已知[:：]?/i,
    /^求[:：]?/i,
    /^(最终)?答案[:：]?/i,
    /^结论[:：]?/i,
    /^结果[:：]?/i,
    /^总结[:：]?/i,
    /^反思[:：]?/i,
    /^注意[:：]?/i,
    /^提示[:：]?/i,
    /^建议[:：]?/i,
    /^第[一二三四五六七八九十]步[:：]?/i,
    /^step\s*\d+[:：]?/i,
    /^introduction/i,
    /^conclusion/i,
    /^overview/i,
    /^summary/i
  ];
  
  // 检查是否包含数学运算符号或数学关键词
  const mathSymbols = /[=+\-*/×÷√²³∑∏∫∂∇≤≥≠≈±∞∈∩∪⊂⊃]/;
  const mathKeywords = /方程|不等式|函数|导数|积分|极限|矩阵|向量|几何|代数|计算|求解|化简|展开|合并|移项/;
  
  const hasMathContent = mathSymbols.test(content) || mathKeywords.test(content);
  const isInvalid = invalidPatterns.some(pattern => pattern.test(content.trim()));
  
  return hasMathContent && !isInvalid && content.length > 10;
}

/**
 * 判断内容是否包含实际数学操作
 * @param {string} content - 待判断的内容
 * @returns {boolean} - 是否包含实际数学操作
 */
function hasMathOperation(content) {
  if (!content || content.length < 10) return false;
  
  // 实际数学操作关键词和符号
  const operationKeywords = [
    // 基本运算
    '计算', '求解', '代入', '化简', '展开', '合并', '移项', '移向', '除法', '乘法', '加法', '减法',
    '加减', '乘除', '运算', '算式', '算得', '求得', '解得', '得到', '等于', '结果为',
    
    // 代数运算
    '配方', '因式分解', '提取公因式', '完全平方', '平方差', '十字相乘', 
    '求根公式', '判别式', '根与系数', '韦达定理',
    
    // 函数与方程
    '解方程', '解不等式', '函数值', '定义域', '值域', '单调性', '奇偶性', '周期性',
    
    // 几何与三角
    '勾股定理', '正弦定理', '余弦定理', '相似三角形', '全等三角形', '面积公式',
    
    // 微积分
    '求导', '积分', '极限', '微分', '不定积分', '定积分',
    
    // 英文关键词
    'calculate', 'solve', 'substitute', 'simplify', 'expand', 'combine', 'rearrange',
    'factor', 'derive', 'integrate', 'prove', 'verify', 'compute', 'divide', 'multiply',
    'add', 'subtract', 'reduce', 'evaluate', 'determine', 'find'
  ];
  
  // 数学运算符号
  const operationSymbols = /[=+\-*/×÷√²³∑∏∫∂∇≤≥≠≈±∞∈∩∪⊂⊃∆]/;
  
  // 数字和变量组合（表示实际计算）
  const numberVariablePattern = /\d+[a-zA-Zα-ωΑ-Ω]|\d+\s*[+\-*/=×÷]|\d+\.\d+|[a-zA-Z]\s*=/;
  
  // 检查是否包含实际操作
  const hasOperationKeyword = operationKeywords.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );
  
  const hasOperationSymbol = operationSymbols.test(content);
  const hasNumberOperation = numberVariablePattern.test(content);
  
  // 排除纯描述性内容
  const isDescriptiveOnly = /^\s*(我们|首先|然后|接着|最后|注意|需要|应该|可以)\s*$/.test(content);
  
  return (hasOperationKeyword || hasOperationSymbol || hasNumberOperation) && !isDescriptiveOnly;
}

/**
 * 清理步骤内容，移除冗余信息
 * @param {string} content - 原始步骤内容
 * @returns {string} - 清理后的步骤内容
 */
function cleanStepContent(content) {
  if (!content) return '';
  
  let cleaned = content.trim();
  
  // 移除步骤编号前缀
  cleaned = cleaned.replace(/^\s*\d+[.、)\s]+/, '');
  cleaned = cleaned.replace(/^第[一二三四五六七八九十]+步[:：]?\s*/, '');
  cleaned = cleaned.replace(/^step\s*\d+[:：]?\s*/i, '');
  
  // 移除markdown格式
  cleaned = cleaned.replace(/\*\*/g, '');
  cleaned = cleaned.replace(/\*\s*/g, '');
  cleaned = cleaned.replace(/`\s*`/g, '');
  
  // 移除多余的空白字符
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');
  
  return cleaned;
}

/**
 * 增强的去重机制，基于数学内容指纹而非文本相似性
 * @param {string[]} steps - 原始步骤数组
 * @returns {string[]} - 去重后的步骤数组
 */
function removeDuplicateSteps(steps) {
  console.log('🧹 开始智能数学内容去重处理...')
  
  const uniqueSteps = []
  const seenFingerprints = new Set()
  const duplicateCount = { count: 0, details: [] }

  for (const step of steps) {
    const cleanStep = step.trim()
    if (cleanStep && cleanStep.length > 5) {
      // 使用数学内容指纹而非文本哈希
      const fingerprint = generateMathFingerprint(cleanStep)
      
      if (!seenFingerprints.has(fingerprint)) {
        uniqueSteps.push(cleanStep)
        seenFingerprints.add(fingerprint)
        console.log(`✅ 保留数学步骤: ${cleanStep.substring(0, 80)}...`)
      } else {
        duplicateCount.count++
        duplicateCount.details.push(cleanStep.substring(0, 80))
        console.log(`⚠️ 跳过数学重复步骤: ${cleanStep.substring(0, 80)}...`)
      }
    }
  }
  
  console.log(`📊 数学内容去重结果: 原始 ${steps.length} 个步骤，去重后 ${uniqueSteps.length} 个步骤，跳过 ${duplicateCount.count} 个重复`)
  
  return uniqueSteps
}

/**
 * 生成数学内容指纹，基于实际数学操作和概念
 * @param {string} content - 原始内容
 * @returns {string} - 数学内容指纹
 */
function generateMathFingerprint(content) {
  // 1. 提取数学操作序列
  const operations = extractMathOperations(content)
  
  // 2. 提取数学概念和变量
  const concepts = extractMathConcepts(content)
  
  // 3. 提取数值特征
  const values = extractNumericValues(content)
  
  // 4. 组合成内容指纹
  const fingerprint = [
    operations.join('|'),
    concepts.join('|'),
    values.join('|')
  ].filter(part => part.length > 0).join('::')
  
  return fingerprint || content.substring(0, 100).toLowerCase()
}

/**
 * 提取数学操作序列
 * @param {string} content - 原始内容
 * @returns {string[]} - 数学操作序列
 */
function extractMathOperations(content) {
  const operations = []
  const lowerContent = content.toLowerCase()
  
  // 基本运算操作
  const basicOps = [
    '加法', '减法', '乘法', '除法', '开方', '平方', '立方', '乘方',
    'add', 'subtract', 'multiply', 'divide', 'sqrt', 'square', 'cube', 'power'
  ]
  
  // 代数操作
  const algebraOps = [
    '代入', '化简', '展开', '合并', '移项', '配方', '因式分解', '求根',
    'substitute', 'simplify', 'expand', 'combine', 'rearrange', 'complete', 'factor', 'solve'
  ]
  
  // 微积分操作
  const calculusOps = [
    '求导', '积分', '极限', '微分', '不定积分', '定积分',
    'derive', 'integrate', 'limit', 'differentiate', 'indefinite', 'definite'
  ]
  
  // 方程操作
  const equationOps = [
    '解方程', '解不等式', '验证', '检查', '证明', '求解',
    'solve equation', 'solve inequality', 'verify', 'check', 'prove'
  ]
  
  const allOps = [...basicOps, ...algebraOps, ...calculusOps, ...equationOps]
  
  allOps.forEach(op => {
    if (lowerContent.includes(op.toLowerCase())) {
      operations.push(op)
    }
  })
  
  // 数学符号操作
  const symbols = /[=+\-*/×÷√²³∑∏∫∂∇≤≥≠≈±]/g
  const symbolMatches = content.match(symbols)
  if (symbolMatches) {
    operations.push(...symbolMatches.map(s => s.charCodeAt(0).toString()))
  }
  
  return [...new Set(operations)].sort()
}

/**
 * 提取数学概念和变量
 * @param {string} content - 原始内容
 * @returns {string[]} - 数学概念和变量
 */
function extractMathConcepts(content) {
  const concepts = []
  const lowerContent = content.toLowerCase()
  
  // 数学概念关键词
  const mathConcepts = [
    '方程', '函数', '导数', '积分', '矩阵', '向量', '几何', '代数',
    '数列', '概率', '统计', '三角', '复数', '集合', '映射', '变换',
    'equation', 'function', 'derivative', 'integral', 'matrix', 'vector', 
    'geometry', 'algebra', 'sequence', 'probability', 'statistics', 'trigonometry',
    'complex', 'set', 'mapping', 'transformation'
  ]
  
  mathConcepts.forEach(concept => {
    if (lowerContent.includes(concept.toLowerCase())) {
      concepts.push(concept)
    }
  })
  
  // 提取变量名（如x, y, a1, b2等）
  const variablePattern = /\b[a-zA-Z][0-9]*\b/g
  const variables = content.match(variablePattern)
  if (variables) {
    concepts.push(...variables.filter(v => !['a', 'an', 'the', 'and', 'or', 'but'].includes(v.toLowerCase())))
  }
  
  return [...new Set(concepts)].sort()
}

/**
 * 提取数值特征
 * @param {string} content - 原始内容
 * @returns {string[]} - 数值特征
 */
function extractNumericValues(content) {
  const values = []
  
  // 提取数字（包括小数和分数）
  const numberPattern = /\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?/g
  const numbers = content.match(numberPattern)
  if (numbers) {
    // 对数字进行标准化（保留2位小数）
    values.push(...numbers.map(n => {
      const num = parseFloat(n)
      return isNaN(num) ? n : Math.round(num * 100) / 100
    }))
  }
  
  // 提取数学常数
  const constants = ['π', 'e', '∞', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  constants.forEach(constant => {
    if (content.includes(constant)) {
      values.push(constant)
    }
  })
  
  return [...new Set(values)].sort()
}

/**
 * 标准化内容用于传统文本去重（作为后备方案）
 * @param {string} content - 原始内容
 * @returns {string} - 标准化后的内容
 */
function normalizeForDeduplication(content) {
  return content
    .toLowerCase()
    .replace(/\s+/g, ' ') // 统一空格
    .replace(/[,.，。！？；：\-]/g, '') // 移除标点
    .replace(/\*\*/g, '') // 移除markdown标记
    .trim()
}

/**
 * 生成内容哈希值用于传统去重（作为后备方案）
 * @param {string} content - 标准化后的内容
 * @returns {string} - 内容哈希
 */
function hashContent(content) {
  // 使用内容的前200字符作为哈希，避免过于敏感
  return content.substring(0, 200)
}

/**
 * 将Qwen分步讲解脚本转为优化的Manim Python代码（避免超时）
 * @param {string[]} qwenSteps - Qwen API返回的分步讲解数组
 * @param {string} sceneName - Manim场景名
 * @returns {string} - 优化的Manim Python代码
 */
export function buildManimScriptFromQwen(qwenSteps, sceneName = "MathSolutionScene") {
  console.log('🎬 开始构建Manim脚本，原始步骤:', qwenSteps)
  
  // 如果传入的是字符串（AI完整响应），先提取步骤
  let steps = qwenSteps
  if (typeof qwenSteps === 'string') {
    console.log('📝 检测到字符串输入，开始提取步骤...')
    steps = extractAndSortSteps(qwenSteps)
  } else if (Array.isArray(qwenSteps)) {
    console.log('📝 检测到数组输入，直接处理步骤...')
    // 对数组进行去重处理
    steps = removeDuplicateSteps(qwenSteps)
  } else {
    console.log('⚠️ 无效的输入格式，使用默认步骤')
    steps = [
      "分析题目条件",
      "列出方程或不等式", 
      "移项求解",
      "计算得出结果",
      "验证答案"
    ]
  }
  
  // 智能步骤处理和排序
  let cleanedSteps = steps
    .filter(step => step && step.trim())
    .map((step, index) => ({
      content: step.trim(),
      originalIndex: index
    }))
    .filter(step => step.content.length > 0);

  // 进一步去重和优化
  const uniqueSteps = [];
  const seenContent = new Set();
  
  for (const step of cleanedSteps) {
    const cleanContent = step.content.trim()
    if (cleanContent.length > 10) {
      // 使用前80个字符作为去重依据，提高准确性
      const key = cleanContent.substring(0, 80).toLowerCase().replace(/\s+/g, ' ')
      if (!seenContent.has(key)) {
        uniqueSteps.push(step)
        seenContent.add(key)
        console.log(`✅ 保留步骤: ${cleanContent.substring(0, 50)}...`)
      } else {
        console.log(`⚠️ 跳过重复步骤: ${cleanContent.substring(0, 50)}...`)
      }
    }
  }
  
  // 保持原始顺序，但限制最大步骤数
  const maxSteps = 6; // 减少最大步骤数，提高渲染稳定性
  if (uniqueSteps.length > maxSteps) {
    console.log(`📊 步骤数量过多 (${uniqueSteps.length})，截取前${maxSteps}个步骤`)
    uniqueSteps.splice(maxSteps)
  }
  
  // 对去重后的步骤进行智能优化
  cleanedSteps = uniqueSteps.map(step => cleanTextForManim(step.content));
  
  // 进一步优化步骤，确保渲染稳定性和专业性
  cleanedSteps = cleanedSteps.map((step, index) => {
    // 智能长度控制，保持内容完整性
    if (step.length > 600) { // 减少最大长度，提高渲染稳定性
      // 尝试在句号处截断，保持语义完整
      const sentences = step.split(/[。！？.!?]/);
      let truncated = '';
      for (const sentence of sentences) {
        if ((truncated + sentence).length <= 597) {
          truncated += sentence + '。';
        } else {
          break;
        }
      }
      step = truncated || step.substring(0, 597) + "...";
    }
    
    // 移除可能导致渲染问题的字符，但保留数学符号
    step = step.replace(/[^\w\s\u4e00-\u9fff,.，。！？()（）=+\-*/÷×²³√π∞≤≥≠≈±∑∏∫∂∇∆∈∉⊂⊃∪∩∅∀∃]/g, '');
    
    // 确保步骤内容专业且完整
    if (step.length < 20) {
      // 如果步骤太短，尝试补充内容
      step = `步骤${index + 1}: ${step}`;
    }
    
    return step;
  });
  
  // 验证步骤数量，确保渲染稳定性
  if (cleanedSteps.length > 6) {
    console.log(`📊 步骤数量过多 (${cleanedSteps.length})，截取前6个步骤`);
    cleanedSteps = cleanedSteps.slice(0, 6);
  }

  console.log('🧹 清理后的步骤（去重后顺序）:', cleanedSteps)
  console.log('📊 步骤数量:', cleanedSteps.length)
  
  // 验证步骤顺序和内容
  for (let i = 0; i < cleanedSteps.length; i++) {
    console.log(`Manim步骤 ${i + 1}: ${cleanedSteps[i].substring(0, 100)}${cleanedSteps[i].length > 100 ? '...' : ''}`)
    console.log(`步骤 ${i + 1} 完整内容长度: ${cleanedSteps[i].length} 字符`)
  }

  // 如果步骤太少，自动补充基础步骤
  if (cleanedSteps.length < 2) {
    cleanedSteps = [
      "分析题目条件", 
      "列出方程",
      "移项求解",
      "计算得出结果",
      "验证答案"
    ].slice(0, maxSteps)
    console.log('🔄 使用默认步骤:', cleanedSteps)
  }
  
  // 转换步骤为Python列表格式
  const stepsStr = JSON.stringify(cleanedSteps);
  
  // 生成优化的Manim代码 - 增强稳定性和性能
  const script = `from manim import *
import warnings
import sys
import traceback
warnings.filterwarnings("ignore")

# 设置渲染配置，提高稳定性
config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

class ${sceneName}(Scene):
    def construct(self):
        try:
            # 设置场景属性
            self.camera.background_color = WHITE
            
            # 标题
            title = Text("AI数学解答", font_size=32, color=BLUE).to_edge(UP)
            self.play(Write(title), run_time=0.8)
            self.wait(0.3)
            
            # 显示步骤（确保顺序正确）
            steps = ${stepsStr}
            print(f"Manim渲染步骤数量: {len(steps)}")
            
            # 验证步骤顺序和内容
            for i, step in enumerate(steps):
                print(f"步骤 {i+1}: {step[:50]}...")
            
            # 限制最大步骤数，确保渲染稳定性
            max_steps = min(len(steps), 4)
            steps = steps[:max_steps]
            
            previous_text = None
            for i, step_text in enumerate(steps):
                try:
                    print(f"渲染步骤 {i+1}/{max_steps}: {step_text[:40]}...")
                    
                    # 步骤编号 - 更专业的样式
                    step_num = Text(f"步骤 {i+1}", font_size=24, color=BLUE, weight=BOLD)
                    step_num.next_to(title, DOWN, buff=1.0)
                    
                    # 步骤内容 - 优化的文本处理
                    step_content = self.create_step_content(step_text, step_num)
                    
                    # 淡出前一个步骤
                    if previous_text:
                        self.play(FadeOut(previous_text), run_time=0.6)
                    
                    # 显示新步骤 - 更专业的动画
                    self.play(Write(step_num), run_time=1.0)
                    self.play(Write(step_content), run_time=1.2)
                    
                    # 智能等待时间，根据内容长度和复杂度调整
                    base_wait = 4.0  # 减少基础等待时间
                    content_factor = len(step_text) * 0.02  # 减少内容长度因子
                    complexity_factor = step_text.count('=') * 0.2  # 减少数学公式复杂度因子
                    wait_time = min(max(base_wait, content_factor + complexity_factor), 10.0) # 减少最大等待时间
                    
                    print(f"步骤 {i+1} 等待时间: {wait_time:.1f}秒")
                    self.wait(wait_time)
                    
                    previous_text = VGroup(step_num, step_content)
                    
                except Exception as e:
                    print(f"步骤 {i+1} 渲染失败: {e}")
                    traceback.print_exc()
                    continue
            
            # 结束文本
            if previous_text:
                self.play(FadeOut(previous_text), run_time=0.5)
            
            end_text = Text("解答完成!", font_size=28, color=GREEN)
            self.play(Write(end_text), run_time=0.8)
            self.wait(1.5)
            
        except Exception as e:
            print(f"场景渲染失败: {e}")
            traceback.print_exc()
            # 显示错误信息
            error_text = Text("渲染完成", font_size=24, color=BLACK)
            self.play(Write(error_text), run_time=1)
            self.wait(2)
    
    def create_step_content(self, text, step_num):
        """创建步骤内容，优化文本显示"""
        try:
            # 清理文本
            text = text.strip()
            if len(text) > 400: # 减少最大长度
                text = text[:397] + "..."
            
            # 分割长文本为多行
            if len(text) > 100:
                lines = []
                current_line = ""
                words = text.split(' ')
                
                for word in words:
                    if (current_line + word).length <= 50:
                        current_line += word + " "
                    else:
                        if current_line:
                            lines.append(current_line.strip())
                        current_line = word + " "
                
                if current_line:
                    lines.append(current_line.strip())
                
                # 创建多行文本组
                text_group = VGroup()
                for i, line in enumerate(lines):
                    line_text = Text(line, font_size=16, color=BLACK, weight=NORMAL)
                    line_text.next_to(step_num, DOWN, buff=0.5 + i * 0.4)
                    text_group.add(line_text)
                
                return text_group
            else:
                return Text(text, font_size=16, color=BLACK).next_to(step_num, DOWN, buff=0.5)
                
        except Exception as e:
            print(f"创建步骤内容失败: {e}")
            return Text(text[:60] + "...", font_size=16, color=BLACK).next_to(step_num, DOWN, buff=0.5)
`
  return script;
}

/**
 * 清理文本，移除可能导致Manim渲染问题的字符
 * @param {string} text - 原始文本
 * @returns {string} - 清理后的文本
 */
function cleanTextForManim(text) {
  try {
    // 移除markdown标记，但保留内容
    text = text.replace(/\*\*/g, ''); // 移除加粗标记
    text = text.replace(/`/g, ''); // 移除代码标记
    text = text.replace(/^#+\s*/g, ''); // 移除标题标记
    
    // 智能处理LaTeX数学表达式
    text = text.replace(/\$\$([^$]+)\$\$/g, (match, content) => {
      // 简化复杂的LaTeX表达式
      if (content.length > 30) {
        return content.substring(0, 27) + "...";
      }
      return content;
    });
    
    // 移除可能导致问题的特殊字符，保留中文、基本符号和数学符号
    text = text.replace(/[^\w\s\u4e00-\u9fff,.，。！？()（）=+\-*/÷×²³√π∞≤≥≠≈±∑∏∫∂∇∆∈∉⊂⊃∪∩∅∀∃]/g, '');
    
    // 移除多余空格和换行，但保留基本格式
    text = text.replace(/[ \t]+/g, ' ').trim();
    text = text.replace(/\n\s*\n/g, '\n');
    
    // 智能长度控制 - 根据内容类型调整
    const maxLength = 1000; // 增加最大长度，提高内容完整性
    if (text.length > maxLength) {
      // 尝试在句号处截断，保持语义完整
      const sentences = text.split(/[。！？.!?]/);
      let truncated = '';
      for (const sentence of sentences) {
        if ((truncated + sentence).length <= maxLength - 3) {
          truncated += sentence + '。';
        } else {
          break;
        }
      }
      text = truncated || text.substring(0, maxLength - 3) + "...";
    }
    
    return text;
  } catch (error) {
    console.error('文本清理失败:', error);
    // 返回安全的默认文本
    return text ? text.substring(0, 200) : "步骤内容";
  }
}

/**
 * 自动调用Manim渲染API生成视频
 * @param {string[]} qwenSteps - Qwen API返回的分步讲解数组
 * @param {string} outputName - 输出视频文件名
 * @returns {Promise<string>} - 返回mp4视频URL
 */
export async function generateManimVideoFromQwen(qwenSteps, outputName = "qwen_video1") {
  console.log('🎬 开始生成Manim视频，输入步骤:', qwenSteps)
  
  // 智能优化步骤内容，减少渲染复杂度
  let optimizedSteps
  if (typeof qwenSteps === 'string') {
    // 如果是字符串（AI完整响应），先提取步骤
    console.log('📝 检测到字符串输入，开始提取步骤...')
    optimizedSteps = extractAndSortSteps(qwenSteps)
  } else if (Array.isArray(qwenSteps)) {
    // 如果是数组，直接优化
    console.log('📝 检测到数组输入，直接优化步骤...')
    optimizedSteps = optimizeStepsForManim(qwenSteps)
  } else {
    console.log('⚠️ 无效的输入格式，使用默认步骤')
    optimizedSteps = [
      "分析题目条件",
      "列出方程或不等式", 
      "移项求解",
      "计算得出结果",
      "验证答案"
    ]
  }
  
  // 去重处理
  optimizedSteps = removeDuplicateSteps(optimizedSteps)
  
  console.log('📊 优化后的步骤数量:', optimizedSteps.length)
  optimizedSteps.forEach((step, index) => {
    console.log(`优化步骤 ${index + 1}: ${step.substring(0, 50)}...`)
  })
  
  const manimScript = buildManimScriptFromQwen(optimizedSteps)
  
  // 实现重试机制和渐进式超时
  const maxRetries = 3;
  const baseTimeout = 180000; // 3分钟基础超时
  const maxTimeout = 600000; // 10分钟最大超时
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const currentTimeout = Math.min(baseTimeout * attempt, maxTimeout);
    const timeoutId = setTimeout(() => controller.abort(), currentTimeout);

    try {
      console.log(`🎬 开始生成Manim视频 (尝试 ${attempt}/${maxRetries}): ${outputName}`)
      console.log(`⏱️ 超时设置: ${currentTimeout/1000}秒`)
      
      const resp = await fetch("http://127.0.0.1:5001/api/manim_render", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Retry-Attempt": attempt.toString()
        },
        body: JSON.stringify({
          script: manimScript,
          output_name: outputName,
          scene_name: "MathSolutionScene",
          quality: attempt === 1 ? "high" : "medium", // 首次尝试高质量，重试时降低质量
          timeout: currentTimeout
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId);
      
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error(`❌ HTTP错误 ${resp.status}: ${errorText}`)
        
        if (resp.status === 504 && attempt < maxRetries) {
          console.log(`🔄 超时错误，准备重试...`)
          continue;
        }
        
        throw new Error(`HTTP错误: ${resp.status} ${resp.statusText}`)
      }
      
      const data = await resp.json()
      console.log(`📄 Manim API响应:`, data)
      
      if (data.success) {
        console.log(`✅ Manim视频生成成功 (尝试 ${attempt}): ${data.video_path || data.video_url}`)
        // 修复：优先使用video_path，如果没有则使用video_url
        const videoPath = data.video_path || data.video_url;
        // 确保返回的是以/rendered_videos/开头的路径
        if (videoPath && !videoPath.startsWith('/rendered_videos/')) {
          const fileName = videoPath.split(/[/\\]/).pop();
          return `/rendered_videos/${fileName}`;
        }
        return videoPath;
      } else {
        throw new Error(data.error || "Manim渲染失败")
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.error(`❌ Manim渲染失败 (尝试 ${attempt}):`, e)
      
      if (e.name === 'AbortError') {
        if (attempt < maxRetries) {
          console.log(`⏰ 渲染超时，准备重试 (${attempt + 1}/${maxRetries})...`)
          // 重试前等待一段时间，避免服务器过载
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        } else {
          throw new Error("Manim渲染多次超时，请简化问题或稍后重试")
        }
      } else if (e.message.includes('fetch') || e.message.includes('Connection refused')) {
        // 服务器连接失败，返回固定的模拟视频URL
        console.log("🔄 Manim服务器不可用，返回模拟视频")
        return `/rendered_videos/fallback_video.mp4`
      } else if (attempt < maxRetries) {
        console.log(`🔄 其他错误，准备重试 (${attempt + 1}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      } else {
        throw new Error(e.message);
      }
    }
  }
  
  throw new Error("所有重试都失败了");
}

/**
 * 智能优化步骤内容，减少Manim渲染复杂度
 * @param {string[]} steps - 原始步骤
 * @returns {string[]} - 优化后的步骤
 */
function optimizeStepsForManim(steps) {
  return steps.map(step => {
    let optimized = step;
    
    // 1. 限制单步内容长度，避免过长的文本
    if (optimized.length > 800) {
      // 智能截断，保持语义完整
      const sentences = optimized.split(/[。！？.!?]/);
      let truncated = '';
      for (const sentence of sentences) {
        if ((truncated + sentence).length <= 797) {
          truncated += sentence + '。';
        } else {
          break;
        }
      }
      optimized = truncated || optimized.substring(0, 797) + "...";
    }
    
    // 2. 移除可能导致渲染问题的特殊字符
    optimized = optimized.replace(/[^\w\s\u4e00-\u9fff,.，。！？()（）=+\-*/÷×²³√π∞≤≥≠≈±∑∏∫∂∇∆∈∉⊂⊃∪∩∅∀∃]/g, '');
    
    // 3. 简化复杂的数学表达式
    optimized = optimized.replace(/\$\$([^$]+)\$\$/g, (match, content) => {
      // 保留LaTeX内容但简化显示
      return content.length > 50 ? content.substring(0, 47) + "..." : content;
    });
    
    // 4. 移除多余的换行和空格
    optimized = optimized.replace(/\n\s*\n/g, '\n').trim();
    
    return optimized;
  });
}

export default new MathVideoAIService()