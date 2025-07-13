import { selectOptimalQwenModel } from '../config/qwenModelSelection.js'

// 优化后的通义千问API调用服务
export class OptimizedQwenService {
  constructor() {
    this.apiKey = process.env.REACT_APP_QWEN_API_KEY
    this.baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
    this.cache = new Map() // 简单内存缓存
    this.requestCount = 0
    this.dailyBudget = 200 // ¥200每日预算
    this.usedBudget = 0
  }

  async solveMathProblem(question, userContext = {}) {
    try {
      // 1. 智能模型选择
      const modelSelection = selectOptimalQwenModel(question, userContext)
      console.log(`选择模型: ${modelSelection.model}, 原因: ${modelSelection.reasoning}`)

      // 2. 检查缓存
      const cacheKey = this.generateCacheKey(question, modelSelection.model)
      if (this.cache.has(cacheKey)) {
        console.log('使用缓存结果，节省成本')
        return this.cache.get(cacheKey)
      }

      // 3. 预算检查
      if (this.usedBudget >= this.dailyBudget * 0.9) {
        console.warn('接近预算限制，使用最便宜的模型')
        modelSelection.model = 'qwen-turbo'
      }

      // 4. 构建专门的数学prompt
      const prompt = this.buildMathPrompt(question, userContext, modelSelection.model)

      // 5. 调用API
      const response = await this.callQwenAPI(prompt, modelSelection.model)

      // 6. 结果验证和缓存
      const validatedResult = await this.validateMathResult(response, question)
      this.cache.set(cacheKey, validatedResult)
      
      // 7. 更新成本跟踪
      this.usedBudget += modelSelection.estimatedCost
      this.requestCount++

      return validatedResult

    } catch (error) {
      console.error('通义千问调用失败:', error)
      // 降级策略：尝试更简单的模型
      return await this.fallbackSolution(question, userContext)
    }
  }

  buildMathPrompt(question, userContext, modelType) {
    const { grade, difficulty } = userContext
    
    // 根据不同模型优化prompt
    const prompts = {
      'qwen-turbo': this.buildBasicPrompt(question, grade),
      'qwen-plus': this.buildStandardPrompt(question, grade, difficulty),
      'qwen-math-plus': this.buildAdvancedPrompt(question, grade)
    }

    return prompts[modelType] || prompts['qwen-plus']
  }

  buildBasicPrompt(question, grade) {
    return `作为K12数学老师，请解答这个${grade || ''}年级的数学问题：

题目：${question}

请提供：
1. 简明的解答步骤
2. 最终答案
3. 一句话解释

用JSON格式回答：
{
  "steps": ["步骤1", "步骤2"],
  "answer": "最终答案",
  "explanation": "简单解释"
}`
  }

  buildStandardPrompt(question, grade, difficulty) {
    const gradeContext = grade ? `这是${grade}年级水平的问题。` : ''
    const difficultyHint = difficulty ? `难度级别：${difficulty}。` : ''

    return `你是专业的K12数学老师，请详细解答这个数学问题。

${gradeContext}${difficultyHint}

题目：${question}

请按以下格式回答（JSON格式）：
{
  "analysis": "问题分析",
  "solution": {
    "steps": [
      {
        "stepNumber": 1,
        "description": "这一步要做什么",
        "operation": "具体运算过程",
        "result": "这一步的结果",
        "explanation": "为什么这样做"
      }
    ],
    "finalAnswer": "最终答案",
    "verification": "验算过程"
  },
  "concepts": ["涉及的数学概念"],
  "difficulty": "评估的难度级别",
  "commonMistakes": ["学生容易犯的错误"],
  "relatedTopics": ["相关数学主题"]
}`
  }

  buildAdvancedPrompt(question, grade) {
    return `你是数学专家，请深入分析并解决这个数学问题。

题目：${question}
学生水平：${grade || 'K12阶段'}

请提供完整的数学分析（JSON格式）：
{
  "problemType": "问题类型分类",
  "prerequisiteKnowledge": ["需要的前置知识"],
  "solutionMethods": [
    {
      "methodName": "解法名称",
      "steps": [
        {
          "step": "步骤描述",
          "mathematicalReasoning": "数学原理",
          "formula": "使用的公式",
          "calculation": "计算过程",
          "result": "结果"
        }
      ],
      "advantages": "这种方法的优点",
      "applicableScenarios": "适用场景"
    }
  ],
  "finalAnswer": "最终答案",
  "verification": {
    "method": "验证方法",
    "process": "验证过程",
    "conclusion": "验证结论"
  },
  "extensions": {
    "variations": ["问题变式"],
    "applications": ["实际应用"],
    "advancedTopics": ["相关高阶主题"]
  },
  "teachingTips": ["教学建议"]
}`
  }

  async callQwenAPI(prompt, modelType) {
    const modelConfigs = {
      'qwen-turbo': {
        model: 'qwen-turbo',
        temperature: 0.1,
        max_tokens: 1500
      },
      'qwen-plus': {
        model: 'qwen-plus', 
        temperature: 0.1,
        max_tokens: 2000
      },
      'qwen-math-plus': {
        model: 'qwen-math-plus',
        temperature: 0.05,
        max_tokens: 3000
      }
    }

    const config = modelConfigs[modelType] || modelConfigs['qwen-plus']

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        input: {
          messages: [
            {
              role: 'system',
              content: '你是专业的数学教师，专注于K12数学教育。请确保答案准确、解释清晰、适合学生理解。'
            },
            {
              role: 'user', 
              content: prompt
            }
          ]
        },
        parameters: {
          temperature: config.temperature,
          max_tokens: config.max_tokens,
          top_p: 0.8,
          repetition_penalty: 1.1
        }
      })
    })

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.code && data.code !== '200') {
      throw new Error(`API返回错误: ${data.message}`)
    }

    try {
      return JSON.parse(data.output.text)
    } catch (parseError) {
      // 如果返回的不是有效JSON，包装成标准格式
      return {
        rawResponse: data.output.text,
        parsed: false,
        fallbackAnswer: data.output.text
      }
    }
  }

  async validateMathResult(result, originalQuestion) {
    // 基础验证逻辑
    if (!result || (!result.answer && !result.finalAnswer && !result.solution)) {
      throw new Error('AI返回结果格式错误')
    }

    // 数学答案合理性检查
    const answer = result.finalAnswer || result.answer || result.solution?.finalAnswer
    if (answer && this.isMathematicallyInvalid(answer, originalQuestion)) {
      console.warn('检测到可能的数学错误，标记需要人工检查')
      result.needsReview = true
    }

    // 添加质量评分
    result.qualityScore = this.calculateQualityScore(result)
    result.generatedAt = new Date().toISOString()
    result.model = result.model || 'qwen-plus'

    return result
  }

  isMathematicallyInvalid(answer, question) {
    // 简单的数学合理性检查
    try {
      // 检查是否包含明显错误的数学表达式
      const invalidPatterns = [
        /\d+\/0/, // 除以零
        /\d+\s*\*\s*∞/, // 乘以无穷
        /\d+\s*\+\s*\d+\s*=\s*[a-zA-Z]/, // 数字计算结果是字母
      ]

      return invalidPatterns.some(pattern => pattern.test(answer))
    } catch (error) {
      return false
    }
  }

  calculateQualityScore(result) {
    let score = 0
    
    // 结构完整性 (40分)
    if (result.steps || result.solution?.steps) score += 20
    if (result.explanation || result.analysis) score += 10
    if (result.verification) score += 10

    // 内容丰富度 (30分)
    if (result.concepts || result.relatedTopics) score += 10
    if (result.commonMistakes) score += 10
    if (result.teachingTips || result.extensions) score += 10

    // 格式规范性 (30分)
    if (result.finalAnswer || result.answer) score += 15
    if (typeof result === 'object' && !result.rawResponse) score += 15

    return Math.min(score, 100)
  }

  async fallbackSolution(question, userContext) {
    try {
      console.log('使用fallback方案：qwen-turbo')
      const simplePrompt = `请简单解答这个数学问题：${question}\n\n要求：给出答案和简要步骤。`
      
      const response = await this.callQwenAPI(simplePrompt, 'qwen-turbo')
      return {
        ...response,
        isFallback: true,
        model: 'qwen-turbo',
        qualityScore: 60 // fallback方案质量分数较低
      }
    } catch (error) {
      // 最后的备选方案：返回错误信息
      return {
        error: true,
        message: '暂时无法处理此问题，请稍后重试',
        suggestion: '您可以尝试简化问题描述或联系技术支持'
      }
    }
  }

  generateCacheKey(question, model) {
    // 生成基于问题内容和模型的缓存key
    const normalized = question.toLowerCase().replace(/\s+/g, ' ').trim()
    const hash = this.simpleHash(normalized + model)
    return `qwen_${model}_${hash}`
  }

  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
  }

  // 获取使用统计
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      usedBudget: this.usedBudget,
      remainingBudget: this.dailyBudget - this.usedBudget,
      cacheHitRate: this.cache.size > 0 ? (this.requestCount / this.cache.size) : 0,
      averageCostPerRequest: this.requestCount > 0 ? (this.usedBudget / this.requestCount) : 0
    }
  }

  // 清理缓存和重置计数
  resetDailyStats() {
    this.usedBudget = 0
    this.requestCount = 0
    this.cache.clear()
    console.log('每日统计已重置')
  }
}

export default new OptimizedQwenService()