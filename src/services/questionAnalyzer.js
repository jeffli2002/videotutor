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
    
    // 问题主题分类
    this.topicCategories = {
      geometry: ['几何', '三角形', '圆形', '正方形', '矩形', '多边形', '面积', '周长', '体积', '勾股定理', '拉窗帘', 'geometry', 'triangle', 'circle', 'square', 'rectangle', 'polygon', 'area', 'perimeter', 'volume', 'pythagorean'],
      algebra: ['代数', '方程', '不等式', '函数', '多项式', '因式分解', 'algebra', 'equation', 'inequality', 'function', 'polynomial', 'factorization'],
      calculus: ['微积分', '导数', '积分', '极限', '微分', 'calculus', 'derivative', 'integral', 'limit', 'differentiation'],
      statistics: ['统计', '概率', '平均数', '方差', '标准差', 'statistics', 'probability', 'mean', 'variance', 'standard deviation'],
      trigonometry: ['三角函数', '正弦', '余弦', '正切', '角度', 'trigonometry', 'sine', 'cosine', 'tangent', 'angle'],
      arithmetic: ['算术', '加减乘除', '分数', '小数', '百分数', 'arithmetic', 'addition', 'subtraction', 'multiplication', 'division', 'fraction', 'decimal', 'percentage']
    }
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

  // 识别问题主题
  identifyTopic(question) {
    const questionLower = question.toLowerCase()
    const topics = []
    
    for (const [category, keywords] of Object.entries(this.topicCategories)) {
      for (const keyword of keywords) {
        if (questionLower.includes(keyword.toLowerCase())) {
          topics.push(category)
          break
        }
      }
    }
    
    return topics.length > 0 ? topics[0] : 'general'
  }

  // 生成AI脚本生成提示
  generateScriptPrompt(question, solution, topic, questionType) {
    const basePrompt = `请为以下数学问题生成一个详细的Manim动画脚本：

问题：${question}
解答：${solution}
主题：${topic}
问题类型：${questionType}

要求：
1. 创建一个完整的Manim场景类
2. 根据问题内容设计合适的动画效果
3. 包含清晰的标题、概念解释、步骤演示
4. 使用合适的颜色和布局
5. 动画时长控制在30-60秒
6. 确保文字和图形不重叠，布局清晰

请生成完整的Python Manim脚本：`

    return basePrompt
  }

  // 通过AI生成Manim脚本
  async generateManimScript(question, solution, topic, questionType) {
    try {
      const prompt = this.generateScriptPrompt(question, solution, topic, questionType)
      
      // 调用AI服务生成脚本
      const response = await fetch('http://localhost:8002/api/qwen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: '你是一个专业的数学动画脚本生成专家，擅长使用Manim库创建数学概念的可视化动画。请生成完整、可执行的Manim Python脚本。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          api_key: 'test-key'
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.response) {
        // 提取代码块中的Python脚本
        const codeMatch = result.response.match(/```python\n([\s\S]*?)\n```/)
        if (codeMatch) {
          return codeMatch[1]
        } else {
          // 如果没有代码块标记，直接返回响应内容
          return result.response
        }
      } else {
        throw new Error('AI生成脚本失败')
      }
      
    } catch (error) {
      console.error('❌ AI脚本生成失败:', error)
      // 返回默认脚本模板
      return this.generateDefaultScript(question, solution, topic, questionType)
    }
  }

  // 生成默认脚本模板
  generateDefaultScript(question, solution, topic, questionType) {
    return `from manim import *
import warnings
warnings.filterwarnings("ignore")

config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

class ${this.generateClassName(question)}Scene(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # 标题 - 使用较小的字体避免占用太多空间
        title = Text("${this.generateTitle(question)}", font_size=32, color=BLUE).to_edge(UP, buff=0.3)
        self.play(Write(title), run_time=1.0)
        self.wait(0.5)
        
        # 创建主要内容区域 - 在标题下方留出足够空间
        main_area = Rectangle(
            width=16, height=8, 
            color=GRAY, fill_opacity=0.1, stroke_opacity=0.3
        ).next_to(title, DOWN, buff=0.5)
        
        # 左侧图形区域 - 居中布局，减少与右侧的间距
        left_area = Rectangle(
            width=5, height=5,
            color=BLUE, fill_opacity=0.05, stroke_opacity=0.2
        ).move_to(main_area.get_center() + LEFT * 4)
        
        # 右侧文字区域 - 居中布局，靠近左侧图形
        right_area = Rectangle(
            width=5, height=5,
            color=GREEN, fill_opacity=0.05, stroke_opacity=0.2
        ).move_to(main_area.get_center() + RIGHT * 4)
        
        # 显示区域框架（可选，用于调试）
        # self.play(Create(main_area), Create(left_area), Create(right_area))
        
        # 在左侧区域创建示例图形（根据主题调整）
        if "${topic}" == "geometry":
            # 几何图形示例
            triangle = Polygon(
                ORIGIN, RIGHT * 2, UP * 1.5,
                color=BLUE, fill_opacity=0.3
            ).move_to(left_area.get_center())
            
            # 边长标签 - 显示在边的外侧，不压在图形上
            a_label = Text("a=2", font_size=16, color=BLACK).next_to(
                triangle.get_bottom(), DOWN, buff=0.2
            )
            b_label = Text("b=1.5", font_size=16, color=BLACK).next_to(
                triangle.get_right(), RIGHT, buff=0.2
            )
            c_label = Text("c=2.5", font_size=16, color=BLACK).next_to(
                triangle.get_top(), UP + LEFT * 0.5, buff=0.2
            )
            
            self.play(Create(triangle), run_time=1.0)
            self.play(Write(a_label), Write(b_label), Write(c_label), run_time=0.8)
            
        elif "${topic}" == "algebra":
            # 代数表达式示例
            equation = MathTex(
                "x^2 + 2x + 1 = 0",
                font_size=36, color=BLUE
            ).move_to(left_area.get_center())
            
            self.play(Write(equation), run_time=1.0)
            
        elif "${topic}" == "calculus":
            # 微积分示例
            derivative = MathTex(
                "\\\\frac{d}{dx}(x^2) = 2x",
                font_size=32, color=BLUE
            ).move_to(left_area.get_center())
            
            self.play(Write(derivative), run_time=1.0)
            
        else:
            # 通用示例
            circle = Circle(radius=1.5, color=BLUE, fill_opacity=0.3).move_to(left_area.get_center())
            radius_label = Text("r=1.5", font_size=16, color=BLACK).next_to(
                circle.get_right(), RIGHT, buff=0.3
            )
            
            self.play(Create(circle), run_time=1.0)
            self.play(Write(radius_label), run_time=0.5)
        
        # 在右侧区域显示解释内容 - 进一步优化布局，确保在显示区域内
        explanation_lines = []
        solution_text = "${solution}"
        max_line_length = 15  # 进一步减少每行字符数，确保不超出显示区
        
        # 智能分割解答文本为多行
        current_line = ""
        words = list(solution_text)
        for i in range(len(words)):
            # 在标点符号处强制换行
            if words[i] in ["，", "。", "；", "！", "？"]:
                current_line += words[i]
                explanation_lines.append(current_line)
                current_line = ""
            # 在达到最大长度时换行
            elif len(current_line) >= max_line_length:
                explanation_lines.append(current_line)
                current_line = words[i]
            else:
                current_line += words[i]
        
        if current_line:
            explanation_lines.append(current_line)
        
        # 限制行数避免超出显示区域
        max_lines = 5  # 进一步减少最大行数
        if len(explanation_lines) > max_lines:
            explanation_lines = explanation_lines[:max_lines-1]
            explanation_lines.append("...")
        
        explanation_group = VGroup()
        for i in range(len(explanation_lines)):
            line = Text(
                explanation_lines[i], 
                font_size=14,  # 进一步减小字体
                color=BLACK
            )
            if i == 0:
                line.move_to(right_area.get_top() + DOWN * 0.5)  # 调整起始位置
            else:
                line.next_to(explanation_group[i-1], DOWN, buff=0.2)  # 减少行间距
            explanation_group.add(line)
        
        self.play(Write(explanation_group), run_time=2.0)
        self.wait(1.0)
        
        # 添加问题文本（如果空间允许）
        if len(explanation_lines) <= 4:  # 减少条件
            question_text = Text(
                "问题：${question.substring(0, 25)}${question.length > 25 ? '...' : ''}", 
                font_size=14,  # 减小字体
                color=GRAY
            ).next_to(explanation_group, DOWN, buff=0.4)
            
            self.play(Write(question_text), run_time=0.8)
        
        # 总结
        summary = Text("演示完成", font_size=24, color=GREEN)
        summary.next_to(main_area, DOWN, buff=0.3)
        self.play(Write(summary), run_time=1.0)
        self.wait(2.0)
`
  }

  // 生成类名
  generateClassName(question) {
    const words = question.replace(/[^\w\s]/g, '').split(/\s+/).slice(0, 3)
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') + 'Scene'
  }

  // 生成标题
  generateTitle(question) {
    return question.length > 20 ? question.substring(0, 20) + '...' : question
  }
} 