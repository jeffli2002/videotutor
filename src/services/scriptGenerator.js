// 脚本生成模块 - 根据问题类型生成不同的脚本内容
import { QuestionAnalyzer } from './questionAnalyzer.js'

export class ScriptGenerator {
  constructor() {
    this.questionAnalyzer = new QuestionAnalyzer()
  }

  // 根据问题类型生成相应的脚本
  async generateScript(question, solution, language = 'zh') {
    const analysis = this.questionAnalyzer.analyzeQuestionType(question)
    
    if (analysis.isConcreteProblem) {
      return this.generateConcreteProblemScript(question, solution, language, analysis)
    } else if (analysis.isTheoreticalQuestion) {
      return this.generateTheoreticalQuestionScript(question, solution, language, analysis)
    } else {
      return this.generateMixedScript(question, solution, language, analysis)
    }
  }

  // 生成具体求解问题的脚本
  generateConcreteProblemScript(question, solution, language, analysis) {
    console.log('📝 生成具体求解问题脚本...')
    
    const steps = this.extractConcreteSteps(solution, question)
    
    const script = {
      type: 'concrete_problem',
      question: question,
      analysis: analysis,
      pages: []
    }

    // 添加问题介绍页面
    script.pages.push({
      page: 1,
      duration: 5,
      text: language === 'zh' ? `让我们来解决这个数学问题：${question}` : `Let's solve this math problem: ${question}`,
      subText: language === 'zh' ? '分析题目条件' : 'Analyze problem conditions',
      visual: 'display_problem'
    })

    // 为每个具体步骤创建页面
    steps.forEach((step, index) => {
      script.pages.push({
        page: index + 2,
        duration: Math.max(8, step.length * 0.3),
        text: step,
        subText: language === 'zh' ? `步骤 ${index + 1}` : `Step ${index + 1}`,
        visual: `show_step_${index + 1}`
      })
    })

    // 添加验证页面
    script.pages.push({
      page: script.pages.length + 1,
      duration: 6,
      text: language === 'zh' ? '让我们验证一下答案的正确性' : 'Let\'s verify the answer',
      subText: language === 'zh' ? '验证计算过程' : 'Verify calculation process',
      visual: 'show_verification'
    })

    return script
  }

  // 生成理论解释问题的脚本
  generateTheoreticalQuestionScript(question, solution, language, analysis) {
    console.log('📝 生成理论解释问题脚本...')
    
    const concepts = this.extractTheoreticalConcepts(solution, question)
    
    const script = {
      type: 'theoretical_question',
      question: question,
      analysis: analysis,
      pages: []
    }

    // 添加概念介绍页面
    script.pages.push({
      page: 1,
      duration: 8,
      text: language === 'zh' ? `让我们来理解这个概念：${question}` : `Let's understand this concept: ${question}`,
      subText: language === 'zh' ? '概念背景介绍' : 'Concept background',
      visual: 'introduce_concept'
    })

    // 为每个概念点创建页面
    concepts.forEach((concept, index) => {
      script.pages.push({
        page: index + 2,
        duration: Math.max(10, concept.length * 0.4),
        text: concept,
        subText: language === 'zh' ? `概念点 ${index + 1}` : `Concept ${index + 1}`,
        visual: `explain_concept_${index + 1}`
      })
    })

    // 添加实例演示页面
    script.pages.push({
      page: script.pages.length + 1,
      duration: 12,
      text: language === 'zh' ? '让我们通过具体例子来加深理解' : 'Let\'s deepen understanding through examples',
      subText: language === 'zh' ? '实例演示' : 'Example demonstration',
      visual: 'show_examples'
    })

    // 添加总结页面
    script.pages.push({
      page: script.pages.length + 1,
      duration: 8,
      text: language === 'zh' ? '总结一下我们学到的要点' : 'Let\'s summarize what we learned',
      subText: language === 'zh' ? '知识总结' : 'Knowledge summary',
      visual: 'show_summary'
    })

    return script
  }

  // 生成混合类型问题的脚本
  generateMixedScript(question, solution, language, analysis) {
    console.log('📝 生成混合类型问题脚本...')
    
    const script = {
      type: 'mixed',
      question: question,
      analysis: analysis,
      pages: []
    }

    // 根据问题内容动态生成脚本
    if (question.includes('拉窗帘') || question.includes('原理')) {
      return this.generateTheoreticalQuestionScript(question, solution, language, analysis)
    } else {
      return this.generateConcreteProblemScript(question, solution, language, analysis)
    }
  }

  // 提取具体解题步骤
  extractConcreteSteps(solution, question) {
    let steps = []
    
    if (Array.isArray(solution)) {
      steps = solution
    } else if (typeof solution === 'string') {
      // 从字符串中提取步骤
      const stepMatches = solution.match(/(\d+)[.、\)]\s*\*\*([^*]+)\*\*\s*([^\n]+)/g)
      if (stepMatches) {
        steps = stepMatches.map(match => {
          const content = match.replace(/^\d+[.、\)]\s*\*\*([^*]+)\*\*\s*/, '$1：')
          return content.trim()
        })
      } else {
        // 尝试其他格式
        const lines = solution.split('\n').filter(line => 
          line.trim().length > 10 && 
          /[\+\-\=\×\÷\√\d]/.test(line) &&
          !line.includes('**最终答案') &&
          !line.includes('**验证')
        )
        steps = lines.slice(0, 6)
      }
    }
    
    // 确保步骤是具体的数学操作
    return steps.filter(step => 
      step.length > 10 && 
      (/\d/.test(step) || /[\+\-\=\×\÷\√]/.test(step) || /(计算|求解|化简|展开|合并|移项|代入)/.test(step))
    )
  }

  // 提取理论概念
  extractTheoreticalConcepts(solution, question) {
    let concepts = []
    
    if (typeof solution === 'string') {
      // 提取概念解释段落
      const paragraphs = solution.split('\n\n').filter(p => 
        p.trim().length > 20 && 
        (p.includes('原理') || p.includes('概念') || p.includes('理解') || p.includes('演示'))
      )
      concepts = paragraphs.slice(0, 4)
    }
    
    // 如果没有提取到概念，生成默认概念
    if (concepts.length === 0) {
      if (question.includes('拉窗帘')) {
        concepts = [
          '拉窗帘原理是几何学中的一个重要概念，它展示了三角形面积的不变性',
          '当我们沿着三角形的中线剪开并重新组合时，面积保持不变',
          '这个原理帮助我们理解几何变换中的面积守恒',
          '通过动画演示，我们可以直观地看到这个变换过程'
        ]
      } else {
        concepts = [
          '让我们先理解这个数学概念的基本含义',
          '通过具体的例子来加深理解',
          '掌握这个概念的关键要点',
          '总结一下我们学到的知识'
        ]
      }
    }
    
    return concepts
  }

  // 计算脚本总时长
  calculateTotalDuration(script) {
    return script.pages.reduce((total, page) => total + page.duration, 0)
  }
} 