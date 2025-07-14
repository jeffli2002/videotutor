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
      let response
      if (useQwen) {
        response = await this.callQwenAPI(prompt)
      } else {
        response = await this.callOpenAIAPI(prompt)
      }
      
      return {
        originalQuestion: question,
        language,
        solution: response.solution,
        steps: response.steps,
        explanation: response.explanation,
        topics: response.topics,
        difficulty: response.assessedDifficulty,
        alternativeMethods: response.alternatives || []
      }
    } catch (error) {
      throw new Error(`Math solving failed: ${error.message}`)
    }
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
    const response = await fetch(`${this.config.qwen.baseUrl}/services/aigc/text-generation/generation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.qwen.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-plus', // 性价比最高的模型
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一个专业的数学老师，擅长用清晰的中文解释数学概念和解题步骤。'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          temperature: 0.1, // 确保数学答案的准确性
          max_tokens: 2000
        }
      })
    })
    
    const data = await response.json()
    return JSON.parse(data.output.text)
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
 * 将Qwen分步讲解脚本转为优化的Manim Python代码（避免超时）
 * @param {string[]} qwenSteps - Qwen API返回的分步讲解数组
 * @param {string} sceneName - Manim场景名
 * @returns {string} - 优化的Manim Python代码
 */
export function buildManimScriptFromQwen(qwenSteps, sceneName = "MathSolutionScene") {
  console.log('🎬 开始构建Manim脚本，原始步骤:', qwenSteps)
  
  // 清理和限制步骤，严格保持原始顺序
  const maxSteps = 8; // 限制最大步骤数，避免重复
  let cleanedSteps = qwenSteps
    .filter(step => step && step.trim())
    .map((step, index) => ({
      content: step.trim(), // 先保留原始内容
      originalIndex: index
    }))
    .filter(step => step.content.length > 0) // 只过滤空内容
    .slice(0, maxSteps); // 限制步骤数量

  // 步骤去重，保持顺序，使用更智能的去重逻辑
  const uniqueSteps = [];
  const seen = new Set();
  for (const step of cleanedSteps) {
    // 提取步骤的关键内容（前50个字符）用于去重判断
    const keyContent = step.content.substring(0, 50).trim();
    if (!seen.has(keyContent)) {
      uniqueSteps.push(step);
      seen.add(keyContent);
    }
  }
  
  // 现在对去重后的步骤进行清理
  cleanedSteps = uniqueSteps.map(step => cleanTextForManim(step.content));

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
  // 生成优化的Manim代码
  const script = `from manim import *
import warnings
warnings.filterwarnings("ignore")

class ${sceneName}(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # 标题
        title = Text("AI数学解答", font_size=36, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=1)
        self.wait(0.5)
        
        # 显示步骤
        steps = ${stepsStr}
        print(f"Manim渲染步骤数量: {len(steps)}")
        
        previous_text = None
        for i, step_text in enumerate(steps):
            try:
                print(f"渲染步骤 {i+1}: {step_text[:50]}...")
                
                # 步骤编号
                step_num = Text(f"步骤 {i+1}", font_size=24, color=RED)
                step_num.next_to(title, DOWN, buff=1)
                
                # 步骤内容 - 智能处理长文本
                if len(step_text) > 80:
                    # 按标点符号分句
                    import re
                    sentences = re.split(r'[。！？；;.!?]', step_text)
                    sentences = [s.strip() for s in sentences if s.strip()]
                    
                    # 创建多行文本组
                    step_content = VGroup()
                    current_y = 0
                    
                    for j, sentence in enumerate(sentences):
                        if len(sentence) > 40:
                            # 长句子按字数分行
                            words = []
                            while len(sentence) > 40:
                                words.append(sentence[:40])
                                sentence = sentence[40:]
                            if sentence:
                                words.append(sentence)
                        else:
                            words = [sentence]
                        
                        for k, word in enumerate(words):
                            line_text = Text(word, font_size=14, color=BLACK)
                            line_text.next_to(step_num, DOWN, buff=0.5 + current_y * 0.35)
                            step_content.add(line_text)
                            current_y += 1
                else:
                    # 短文本正常显示
                    step_content = Text(step_text, font_size=16, color=BLACK, line_spacing=1.2)
                    step_content.next_to(step_num, DOWN, buff=0.5)
                
                # 淡出前一个步骤
                if previous_text:
                    self.play(FadeOut(previous_text), run_time=0.8)
                
                # 显示新步骤
                self.play(Write(step_num), run_time=1.2)
                self.play(Write(step_content), run_time=1.5)
                
                # 根据内容长度调整等待时间
                wait_time = max(6.0, len(step_text) * 0.08)  # 至少6秒，每字符0.08秒
                self.wait(wait_time)  # 动态等待时间，让用户看清完整步骤
                
                previous_text = VGroup(step_num, step_content)
                
            except Exception as e:
                print(f"跳过步骤 {i+1}: {e}")
                continue
        
        # 结束文本
        end_text = Text("解答完成!", font_size=32, color=GREEN)
        if previous_text:
            self.play(FadeOut(previous_text), run_time=0.5)
        self.play(Write(end_text), run_time=1)
        self.wait(2)
`
  return script;
}

/**
 * 清理文本，移除可能导致Manim渲染问题的字符
 * @param {string} text - 原始文本
 * @returns {string} - 清理后的文本
 */
function cleanTextForManim(text) {
  // 移除markdown标记
  text = text.replace(/[#*`]/g, '');
  // 移除可能导致问题的特殊字符，保留中文、基本符号和数学符号
  text = text.replace(/[^ - - - \w\s\u4e00-\u9fff,.，。！？()（）=+\-*/÷×²³√π∞≤≥≠≈±∑∏∫∂∇∆∈∉⊂⊃∪∩∅∀∃]/g, '');
  // 移除多余空格
  text = text.replace(/\s+/g, ' ').trim();
  
  // 保留完整内容，不强制截断
  // 只在必要时限制长度（超过500字符才截断）
  if (text.length > 500) {
    text = text.substring(0, 497) + "...";
  }
  
  return text;
}

/**
 * 自动调用Manim渲染API生成视频
 * @param {string[]} qwenSteps - Qwen API返回的分步讲解数组
 * @param {string} outputName - 输出视频文件名
 * @returns {Promise<string>} - 返回mp4视频URL
 */
export async function generateManimVideoFromQwen(qwenSteps, outputName = "qwen_video1") {
  const manimScript = buildManimScriptFromQwen(qwenSteps)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5分钟

  try {
    console.log(`🎬 开始生成Manim视频: ${outputName}`)
    
    const resp = await fetch("http://127.0.0.1:5001/api/manim_render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        script: manimScript,
        output_name: outputName,
        scene_name: "MathSolutionScene"
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId);
    
    if (!resp.ok) {
      throw new Error(`HTTP错误: ${resp.status} ${resp.statusText}`)
    }
    
    const data = await resp.json()
    console.log(`📄 Manim API响应:`, data)
    
    if (data.success) {
      console.log(`✅ Manim视频生成成功: ${data.video_url}`)
      return data.video_url
    } else {
      throw new Error(data.error || "Manim渲染失败")
    }
  } catch (e) {
    clearTimeout(timeoutId);
    console.error(`❌ Manim渲染失败:`, e)
    
    if (e.name === 'AbortError') {
      throw new Error("Manim渲染超时，请简化问题或稍后重试")
    } else if (e.message.includes('fetch') || e.message.includes('Connection refused')) {
      // 服务器连接失败，返回固定的模拟视频URL
      console.log("🔄 Manim服务器不可用，返回模拟视频")
      return `/rendered_videos/fallback_video.mp4`
    } else {
      throw new Error(e.message);
    }
  }
}

export default new MathVideoAIService()