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
      // Better duration estimation based on TTS speed
      // Chinese: ~3-4 characters per second, English: ~2-3 words per second
      const charCount = step.length
      const estimatedDuration = language === 'zh' 
        ? Math.max(5, Math.ceil(charCount / 3.5)) // Chinese characters
        : Math.max(5, Math.ceil(charCount / 15)) // English (avg 5 chars per word, 3 words/sec)
      
      script.pages.push({
        page: index + 2,
        duration: estimatedDuration,
        text: step,
        subText: language === 'zh' ? `步骤 ${index + 1}` : `Step ${index + 1}`,
        visual: `show_step_${index + 1}`,
        estimatedTTSDuration: estimatedDuration
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
      // Better duration estimation for theoretical concepts (usually longer explanations)
      const charCount = concept.length
      const estimatedDuration = language === 'zh' 
        ? Math.max(8, Math.ceil(charCount / 3.2)) // Slightly slower for concepts
        : Math.max(8, Math.ceil(charCount / 12)) // English concepts need more time
      
      script.pages.push({
        page: index + 2,
        duration: estimatedDuration,
        text: concept,
        subText: language === 'zh' ? `概念点 ${index + 1}` : `Concept ${index + 1}`,
        visual: `explain_concept_${index + 1}`,
        estimatedTTSDuration: estimatedDuration
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
      // 优先从"详细解题步骤"块中提取
      const detailMatch = solution.match(/\*\*详细解题步骤\*\*([\s\S]*?)(\n\s*\*\*|---|$)/);
      if (detailMatch) {
        const stepsBlock = detailMatch[1];
        // 用正则提取每个编号大步（支持1.、2.、3.等Markdown格式）
        const stepMatches = [...stepsBlock.matchAll(/(\d+)\.\s*\*\*([^*]+)\*\*([\s\S]*?)(?=\n\d+\.\s*\*\*|$)/g)];
        
        steps = stepMatches.map(match => {
          const stepNum = match[1];
          const title = match[2].trim();
          const content = match[3].trim();
          
          // 清理内容中的多余格式和LaTeX符号
          const cleanContent = content
            .replace(/^\s*[\-\*]\s*/gm, '') // 去除列表符号
            .replace(/\n{2,}/g, '\n') // 多换行合一
            .replace(/解释：/g, '') // 去除"解释："前缀
            .replace(/中间结果：/g, '') // 去除"中间结果："前缀
            .replace(/\$\$?/g, '') // 移除LaTeX定界符
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1除以$2') // 转换分数
            .replace(/\\[a-zA-Z]+/g, '') // 移除LaTeX命令
            .replace(/[\^\{\}\\]/g, '') // 移除特殊字符
            .replace(/\*{2,}/g, '') // 移除markdown强调
            .replace(/\s+/g, ' ') // 规范化空格
            .trim();
          
          return `${title} ${cleanContent}`;
        });
      } else {
        // 备用提取方法：智能提取步骤
        const lines = solution.split('\n');
        const stepPatterns = [
          /^(步骤|Step)\s*\d+[:：\s]/i,
          /^(\d+)[.、\)]\s*([^：]+)/,
          /^\*\*(.+?)\*\*/,
          /^(计算|操作|解释|验证)[:：\s]/
        ];
        
        let currentStep = '';
        let stepNumber = 1;
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === '' || trimmed.match(/^[-*_]{3,}$/)) continue;
          
          const isStepStart = stepPatterns.some(pattern => pattern.test(trimmed));
          
          if (isStepStart) {
            if (currentStep && !currentStep.includes('最终答案') && !currentStep.includes('验证')) {
              const cleaned = this.cleanStepContent(currentStep);
              if (cleaned && !steps.includes(cleaned)) {
                steps.push(cleaned);
              }
            }
            currentStep = trimmed;
            stepNumber++;
          } else if (currentStep && !trimmed.includes('最终答案') && !trimmed.includes('验证')) {
            currentStep += ' ' + trimmed;
          }
        }
        
        if (currentStep && !currentStep.includes('最终答案') && !currentStep.includes('验证')) {
          const cleaned = this.cleanStepContent(currentStep);
          if (cleaned && !steps.includes(cleaned)) {
            steps.push(cleaned);
          }
        }
      }
    }
    
    // 清理和去重步骤
    const cleanSteps = steps.map(step => this.cleanStepContent(step))
    const uniqueSteps = [...new Set(cleanSteps.filter(step => step.length > 10))]
    return uniqueSteps.slice(0, 6)
  }

  // 清理单个步骤内容
  cleanStepContent(step) {
    return step
      .replace(/^题目[:：]/g, '')
      .replace(/^\d+[.、\)]\s*/g, '')
      .replace(/^\*\*/g, '')
      .replace(/\*\*$/g, '')
      .replace(/\${2,}/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1除以$2')
      .replace(/\\[a-zA-Z]+/g, '')
      .replace(/[\^\{\}\\]/g, '')
      .replace(/\*{2,}/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^(步骤|Step)\s*\d+[:：\s]*/i, '')
      .trim();
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