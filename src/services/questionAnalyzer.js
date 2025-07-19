// 智能问题类型分析模块
export class QuestionAnalyzer {
  constructor() {
    this.concreteProblemPatterns = [
      // 具体数值计算
      /\d+[\.\d]*\s*(cm|m|km|mm|g|kg|ml|l|°|度|分|秒)/g,
      // 具体方程求解
      /解方程[：:]\s*[\w\+\-\*\/\(\)\=\s]+/,
      /solve\s+the\s+equation[：:]\s*[\w\+\-\*\/\(\)\=\s]+/i,
      // 具体计算要求
      /计算[：:]\s*[\w\+\-\*\/\(\)\=\s]+/,
      /calculate[：:]\s*[\w\+\-\*\/\(\)\=\s]+/i,
      // 求具体值
      /求[：:]\s*[\w\+\-\*\/\(\)\=\s]+/,
      /find[：:]\s*[\w\+\-\*\/\(\)\=\s]+/i,
      // 具体几何问题
      /已知.*(底边|边长|高|半径|直径).*\d+/,
      /given.*(base|side|height|radius|diameter).*\d+/i,
      // 具体代数问题
      /化简[：:]\s*[\w\+\-\*\/\(\)\=\s]+/,
      /simplify[：:]\s*[\w\+\-\*\/\(\)\=\s]+/i
    ]
    
    this.theoreticalQuestionPatterns = [
      // 原理、概念解释
      /(什么是|什么是|如何理解|为什么|原理|概念|定义)/,
      /(what is|how to understand|why|principle|concept|definition)/i,
      // 演示、说明、生成
      /(演示|说明|解释|展示|动画演示|生成.*动画|生成.*讲解)/,
      /(demonstrate|explain|show|illustrate|visualize|generate.*animation|generate.*explanation)/i,
      // 拉窗帘原理等具体理论
      /(拉窗帘原理|三角形面积不变|几何变换|面积不变)/,
      /(curtain principle|triangle area invariance|geometric transformation|area invariance)/i,
      // 一般性问题
      /(怎么|如何|怎样|方法|技巧)/,
      /(how|method|technique|approach)/i,
      // 比较、区别
      /(区别|不同|比较|vs|versus)/,
      /(difference|compare|versus|vs)/i,
      // 帮、请等请求性词汇
      /(帮我|请|帮我生成|请生成)/,
      /(help me|please|help me generate|please generate)/i
    ]
  }

  analyzeQuestionType(question) {
    console.log('🔍 开始智能问题类型分析...')
    console.log('📝 问题内容:', question)
    
    const analysis = {
      type: 'unknown',
      confidence: 0,
      reasoning: '',
      isConcreteProblem: false,
      isTheoreticalQuestion: false,
      hasSpecificNumbers: false,
      hasGeneralConcepts: false,
      requiresStepByStepSolution: false,
      requiresConceptualExplanation: false
    }
    
    // 检测具体数值 - 排除度数等理论概念中的数字
    const hasSpecificNumbers = /\d+[\.\d]*/.test(question) && 
      !question.includes('180度') && !question.includes('360度') && 
      !question.includes('90度') && !question.includes('π') &&
      !question.includes('180°') && !question.includes('360°') && 
      !question.includes('90°')
    analysis.hasSpecificNumbers = hasSpecificNumbers
    
    // 检测一般概念
    const hasGeneralConcepts = /(原理|概念|方法|技巧|理论)/.test(question)
    analysis.hasGeneralConcepts = hasGeneralConcepts
    
    // 计算具体问题得分
    let concreteScore = 0
    this.concreteProblemPatterns.forEach(pattern => {
      if (pattern.test(question)) {
        concreteScore += 1
      }
    })
    
    // 计算理论问题得分
    let theoreticalScore = 0
    this.theoreticalQuestionPatterns.forEach(pattern => {
      if (pattern.test(question)) {
        theoreticalScore += 1
      }
    })
    
    // 优先检查特殊理论题目
    if (question.includes('拉窗帘原理') || question.includes('面积不变') || 
        question.includes('生成.*动画') || question.includes('生成.*讲解') ||
        (question.includes('帮我') && question.includes('原理')) ||
        question.includes('什么是') || question.includes('what is')) {
      analysis.type = 'theoretical_question'
      analysis.isTheoreticalQuestion = true
      analysis.requiresConceptualExplanation = true
      analysis.confidence = 0.9
      analysis.reasoning = '检测到理论原理、概念解释或动画生成请求，需要概念解释和演示'
    }
    // 检查是否没有具体数字 - 通用理论问题
    else if (!hasSpecificNumbers) {
      // 特殊处理：如果包含"计算"、"求"等计算性词汇，但仍可能是演示性质
      if ((question.includes('计算') || question.includes('求') || 
           question.includes('calculate') || question.includes('find') ||
           question.includes('solve')) && 
          !question.includes('演示') && !question.includes('如何') &&
          !question.includes('demonstrate') && !question.includes('how')) {
        analysis.type = 'concrete_problem'
        analysis.isConcreteProblem = true
        analysis.requiresStepByStepSolution = true
        analysis.confidence = 0.7
        analysis.reasoning = '包含计算性词汇，倾向于具体求解问题'
      } else {
        analysis.type = 'theoretical_question'
        analysis.isTheoreticalQuestion = true
        analysis.requiresConceptualExplanation = true
        analysis.confidence = 0.8
        analysis.reasoning = '题目中没有具体数字，定义为通用理论问题，需要概念解释'
      }
    }
    // 综合分析
    else if (concreteScore > theoreticalScore && concreteScore >= 2) {
      analysis.type = 'concrete_problem'
      analysis.isConcreteProblem = true
      analysis.requiresStepByStepSolution = true
      analysis.confidence = Math.min(0.9, concreteScore / 5)
      analysis.reasoning = `检测到${concreteScore}个具体求解问题特征，需要逐步计算`
    } else if (theoreticalScore > concreteScore && theoreticalScore >= 2) {
      analysis.type = 'theoretical_question'
      analysis.isTheoreticalQuestion = true
      analysis.requiresConceptualExplanation = true
      analysis.confidence = Math.min(0.9, theoreticalScore / 5)
      analysis.reasoning = `检测到${theoreticalScore}个理论问题特征，需要概念解释`
    } else if (hasSpecificNumbers && !hasGeneralConcepts) {
      analysis.type = 'concrete_problem'
      analysis.isConcreteProblem = true
      analysis.requiresStepByStepSolution = true
      analysis.confidence = 0.7
      analysis.reasoning = '包含具体数值，倾向于具体求解问题'
    } else if (hasGeneralConcepts && !hasSpecificNumbers) {
      analysis.type = 'theoretical_question'
      analysis.isTheoreticalQuestion = true
      analysis.requiresConceptualExplanation = true
      analysis.confidence = 0.7
      analysis.reasoning = '包含一般概念，倾向于理论解释问题'
    } else {
      // 混合类型，需要进一步分析
      analysis.type = 'mixed'
      analysis.confidence = 0.5
      analysis.reasoning = '问题类型不明确，需要结合上下文判断'
      
      // 根据关键词进一步判断
      if (question.includes('拉窗帘') || question.includes('原理') || question.includes('演示')) {
        analysis.type = 'theoretical_question'
        analysis.isTheoreticalQuestion = true
        analysis.requiresConceptualExplanation = true
        analysis.confidence = 0.8
        analysis.reasoning = '包含演示、原理等关键词，倾向于理论解释'
      } else if (question.includes('求') || question.includes('计算') || question.includes('解')) {
        analysis.type = 'concrete_problem'
        analysis.isConcreteProblem = true
        analysis.requiresStepByStepSolution = true
        analysis.confidence = 0.8
        analysis.reasoning = '包含求、计算、解等关键词，倾向于具体求解'
      }
    }
    
    console.log('📊 问题类型分析结果:')
    console.log(`   类型: ${analysis.type}`)
    console.log(`   置信度: ${analysis.confidence}`)
    console.log(`   推理: ${analysis.reasoning}`)
    console.log(`   具体问题: ${analysis.isConcreteProblem}`)
    console.log(`   理论问题: ${analysis.isTheoreticalQuestion}`)
    console.log(`   需要逐步求解: ${analysis.requiresStepByStepSolution}`)
    console.log(`   需要概念解释: ${analysis.requiresConceptualExplanation}`)
    
    return analysis
  }
} 