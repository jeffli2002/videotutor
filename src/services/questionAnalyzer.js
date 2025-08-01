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
      for (const kw of keywords) {
        if (questionLower.includes(kw.toLowerCase())) {
          topics.push(category)
          break
        }
      }
    }
    
    return topics.length > 0 ? topics[0] : 'general'
  }

  // 生成脚本提示词
  generateScriptPrompt(question, solution, topic, questionType) {
    console.log('📝 生成脚本提示词...')
    
    if (questionType === 'theoretical_question') {
      return `请为以下理论问题生成详细的Manim动画脚本：

问题：${question}
解答：${solution}

要求：
1. 创建一个继承自Scene的类，类名为${this.generateClassName(question)}Scene
2. 设计动画布局：左侧显示图形/动画，右侧显示文字说明，底部显示结论
3. 动画时长控制在10-15秒
4. 使用白色背景，蓝色主题色
5. 包含以下元素：
   - 标题动画
   - 概念解释动画
   - 图形演示动画
   - 公式推导动画
   - 结论总结动画

请生成完整的Python代码，确保语法正确，可以直接被Manim执行。代码必须包含：
- 必要的导入语句
- 配置设置
- 完整的Scene类定义
- construct方法中的所有动画步骤

示例模板：
\`\`\`python
from manim import *
import warnings
warnings.filterwarnings("ignore")

# 配置设置
config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

class ${this.generateClassName(question)}Scene(Scene):
    def construct(self):
        # 设置背景颜色
        self.camera.background_color = WHITE
        
        # 步骤1：问题展示
        title = Text("${this.generateTitle(question)}", font_size=36, color=BLUE).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=1.0)
        self.wait(1.0)
        
        # 创建布局区域
        left_area = Rectangle(
            width=7, height=7,
            color=BLUE, fill_opacity=0.05, stroke_opacity=0.3
        ).to_edge(LEFT, buff=0.5).shift(DOWN * 0.5)
        
        right_area = Rectangle(
            width=7, height=7,
            color=GREEN, fill_opacity=0.05, stroke_opacity=0.3
        ).to_edge(RIGHT, buff=0.5).shift(DOWN * 0.5)
        
        self.play(Create(left_area), Create(right_area), run_time=1.0)
        self.wait(0.5)
        
        # 步骤2：分析问题，提取已知条件
        known_conditions = VGroup(
            Text("已知条件：", font_size=24, color=BLUE),
            Text("底边 = 8", font_size=20, color=BLACK),
            Text("高 = 6", font_size=20, color=BLACK)
        ).arrange(DOWN, aligned_edge=LEFT).move_to(right_area.get_center())
        
        self.play(Write(known_conditions), run_time=2.0)
        self.wait(1.0)
        
        # 步骤3：选择解题方法
        formula = MathTex("S = \\frac{1}{2} \\times 底边 \\times 高", font_size=28, color=RED)
        formula.move_to(right_area.get_center() + DOWN * 2)
        self.play(Write(formula), run_time=1.5)
        self.wait(0.5)
        
        # 步骤4：具体计算过程
        # 绘制三角形
        triangle = Polygon(
            ORIGIN, RIGHT * 2, UP * 1.5,
            color=BLUE, fill_opacity=0.3
        ).move_to(left_area.get_center())
        
        # 标注底边和高
        base_label = Text("8", font_size=20, color=RED).next_to(triangle, DOWN)
        height_label = Text("6", font_size=20, color=RED).next_to(triangle, RIGHT)
        
        self.play(Create(triangle), run_time=1.0)
        self.play(Write(base_label), Write(height_label), run_time=1.0)
        self.wait(0.5)
        
        # 显示计算过程
        calculation_steps = VGroup(
            MathTex("S = \\frac{1}{2} \\times 8 \\times 6", font_size=24, color=BLACK),
            MathTex("S = \\frac{1}{2} \\times 48", font_size=24, color=BLACK),
            MathTex("S = 24", font_size=24, color=BLACK)
        ).arrange(DOWN, aligned_edge=LEFT).move_to(right_area.get_center() + UP * 1)
        
        for step in calculation_steps:
            self.play(Write(step), run_time=1.5)
            self.wait(0.5)
        
        # 步骤5：验证答案
        verification = Text("验证：24 平方单位", font_size=24, color=GREEN)
        verification.move_to(right_area.get_center() + DOWN * 3)
        self.play(Write(verification), run_time=1.0)
        self.wait(1.0)
        
        # 步骤6：总结结论
        conclusion = Text("答案：24 平方单位", font_size=28, color=BLUE)
        conclusion.to_edge(DOWN, buff=0.5)
        self.play(Write(conclusion), run_time=1.0)
        self.wait(2.0)
        
        # 保持最终状态
        self.wait(1.0)
\`\`\`

请根据具体问题内容，严格按照上述模板生成详细的解题步骤动画。对于几何问题，必须包含几何图形的绘制、标注和计算过程的可视化。对于代数问题，必须包含公式推导和计算步骤的动画展示。确保每个步骤都有具体的动画内容，不要生成过于简单的脚本。`
    } else {
      // 具体问题类型 - 需要详细的解题步骤和几何图形
      return `请为以下具体数学问题生成详细的解题步骤Manim动画脚本：

问题：${question}
解答：${solution}

要求：
1. 创建一个继承自Scene的类，类名为${this.generateClassName(question)}Scene
2. 必须包含完整的解题步骤动画，每个步骤都要有具体的演示
3. 如果是几何问题，必须包含几何图形的绘制和变换动画
4. 如果是计算问题，必须包含公式推导和计算过程动画
5. 动画布局：左侧显示图形/计算，右侧显示步骤说明，底部显示答案
6. 动画时长控制在15-20秒
7. 使用白色背景，蓝色主题色

具体解题步骤要求：
- 步骤1：问题展示（2秒）
  * 显示问题标题
  * 突出显示关键数字和条件

- 步骤2：分析问题，提取已知条件（3秒）
  * 列出所有已知条件
  * 标注关键信息
  * 确定求解目标

- 步骤3：选择解题方法（2秒）
  * 显示适用的公式
  * 解释为什么选择这个公式
  * 展示公式的适用条件

- 步骤4：具体计算过程（5-8秒）
  * 逐步代入数值到公式中
  * 显示每一步的计算过程
  * 高亮显示当前计算步骤
  * 显示中间结果

- 步骤5：验证答案（2秒）
  * 检查计算结果的合理性
  * 验证答案的正确性
  * 添加单位标注

- 步骤6：总结结论（2秒）
  * 显示最终答案
  * 总结解题思路
  * 强调关键步骤

如果是几何问题，必须包含：
- 几何图形的绘制动画（使用Polygon、Circle等对象）
- 标注关键尺寸和角度（使用Text、Line等）
- 面积/周长计算的可视化（使用Rectangle、Circle等填充）
- 公式应用的动画演示（使用MathTex显示公式）
- 计算过程的可视化（使用NumberLine、CoordinateSystem等）

如果是代数问题，必须包含：
- 方程/不等式的逐步变形（使用MathTex）
- 计算过程的动画展示（使用Text显示步骤）
- 答案验证的步骤（使用MathTex显示验证过程）

请生成完整的Python代码，确保语法正确，可以直接被Manim执行。代码必须包含：
- 必要的导入语句
- 配置设置
- 完整的Scene类定义
- construct方法中的所有动画步骤

示例模板：
\`\`\`python
from manim import *
import warnings
warnings.filterwarnings("ignore")

# 配置设置
config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

class ${this.generateClassName(question)}Scene(Scene):
    def construct(self):
        # 设置背景颜色
        self.camera.background_color = WHITE
        
        # 步骤1：问题展示
        title = Text("${this.generateTitle(question)}", font_size=36, color=BLUE).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=1.0)
        self.wait(1.0)
        
        # 创建布局区域
        left_area = Rectangle(
            width=7, height=7,
            color=BLUE, fill_opacity=0.05, stroke_opacity=0.3
        ).to_edge(LEFT, buff=0.5).shift(DOWN * 0.5)
        
        right_area = Rectangle(
            width=7, height=7,
            color=GREEN, fill_opacity=0.05, stroke_opacity=0.3
        ).to_edge(RIGHT, buff=0.5).shift(DOWN * 0.5)
        
        self.play(Create(left_area), Create(right_area), run_time=1.0)
        self.wait(0.5)
        
        # 步骤2：分析问题，提取已知条件
        step2_title = Text("步骤2：分析已知条件", font_size=24, color=BLUE).move_to(right_area.get_top() + DOWN * 0.5)
        self.play(Write(step2_title), run_time=0.5)
        
        # 在这里添加具体的已知条件分析动画...
        
        # 步骤3：选择解题方法
        step3_title = Text("步骤3：选择解题方法", font_size=24, color=BLUE).move_to(step2_title.get_center())
        self.play(Transform(step2_title, step3_title), run_time=0.5)
        
        # 在这里添加解题方法选择的动画...
        
        # 步骤4：具体计算过程
        step4_title = Text("步骤4：计算过程", font_size=24, color=BLUE).move_to(step3_title.get_center())
        self.play(Transform(step3_title, step4_title), run_time=0.5)
        
        # 在这里添加详细的计算过程动画...
        
        # 步骤5：验证答案
        step5_title = Text("步骤5：验证答案", font_size=24, color=BLUE).move_to(step4_title.get_center())
        self.play(Transform(step4_title, step5_title), run_time=0.5)
        
        # 在这里添加答案验证的动画...
        
        # 步骤6：总结结论
        conclusion = Text(
            "解题完成",
            font_size=28, color=BLUE
        ).to_edge(DOWN, buff=0.5)
        
        self.play(Write(conclusion), run_time=1.0)
        self.wait(2.0)
        
        # 保持最终状态
        self.wait(1.0)
\`\`\`

请根据具体问题内容，在"在这里添加具体的..."部分添加详细的动画步骤。对于几何问题，必须包含几何图形的绘制和变换；对于计算问题，必须包含公式推导和计算过程。`
    }
  }

  // 为几何问题生成详细的解题动画脚本
  generateGeometryScript(question, solution) {
    console.log('📐 生成几何问题详细脚本...')
    
    // 提取几何问题的关键信息
    const geometryInfo = this.extractGeometryInfo(question)
    
    return `请为以下几何问题生成详细的解题步骤Manim动画脚本：

问题：${question}
解答：${solution}

几何信息：${JSON.stringify(geometryInfo)}

要求：
1. 创建一个继承自Scene的类，类名为${this.generateClassName(question)}Scene
2. 必须包含完整的几何图形绘制和解题步骤动画
3. 动画布局：左侧显示几何图形，右侧显示计算过程，底部显示答案
4. 动画时长控制在15-20秒
5. 使用白色背景，蓝色主题色

具体动画要求：
- 步骤1：绘制几何图形（3秒）
  * 根据问题描述绘制准确的几何图形
  * 标注所有已知尺寸和角度
  * 使用不同颜色区分不同元素

- 步骤2：分析已知条件（2秒）
  * 在右侧显示已知条件列表
  * 高亮显示关键信息

- 步骤3：选择计算公式（2秒）
  * 显示适用的面积/周长公式
  * 解释为什么选择这个公式

- 步骤4：代入计算（5-8秒）
  * 逐步代入数值到公式中
  * 显示计算过程
  * 高亮显示当前计算步骤

- 步骤5：得出答案（2秒）
  * 显示最终答案
  * 添加单位标注

- 步骤6：验证答案（2秒）
  * 通过其他方法验证答案
  * 显示验证过程

请生成完整的Python代码，确保语法正确，可以直接被Manim执行。

示例模板：
\`\`\`python
from manim import *
import warnings
warnings.filterwarnings("ignore")

# 配置设置
config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

class ${this.generateClassName(question)}Scene(Scene):
    def construct(self):
        # 设置背景颜色
        self.camera.background_color = WHITE
        
        # 步骤1：问题展示
        title = Text("${this.generateTitle(question)}", font_size=36, color=BLUE).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=1.0)
        self.wait(1.0)
        
        # 创建布局区域
        left_area = Rectangle(
            width=7, height=7,
            color=BLUE, fill_opacity=0.05, stroke_opacity=0.3
        ).to_edge(LEFT, buff=0.5).shift(DOWN * 0.5)
        
        right_area = Rectangle(
            width=7, height=7,
            color=GREEN, fill_opacity=0.05, stroke_opacity=0.3
        ).to_edge(RIGHT, buff=0.5).shift(DOWN * 0.5)
        
        self.play(Create(left_area), Create(right_area), run_time=1.0)
        self.wait(0.5)
        
        # 步骤2：绘制几何图形
        step2_title = Text("步骤2：绘制几何图形", font_size=24, color=BLUE).move_to(right_area.get_top() + DOWN * 0.5)
        self.play(Write(step2_title), run_time=0.5)
        
        # 在这里添加几何图形绘制动画...
        # 根据具体问题绘制三角形、矩形、圆形等
        
        # 步骤3：分析已知条件
        step3_title = Text("步骤3：分析已知条件", font_size=24, color=BLUE).move_to(step2_title.get_center())
        self.play(Transform(step2_title, step3_title), run_time=0.5)
        
        # 在这里添加已知条件分析动画...
        
        # 步骤4：选择计算公式
        step4_title = Text("步骤4：选择计算公式", font_size=24, color=BLUE).move_to(step3_title.get_center())
        self.play(Transform(step3_title, step4_title), run_time=0.5)
        
        # 在这里添加公式选择动画...
        
        # 步骤5：代入计算
        step5_title = Text("步骤5：代入计算", font_size=24, color=BLUE).move_to(step4_title.get_center())
        self.play(Transform(step4_title, step5_title), run_time=0.5)
        
        # 在这里添加详细的计算过程动画...
        
        # 步骤6：得出答案
        step6_title = Text("步骤6：得出答案", font_size=24, color=BLUE).move_to(step5_title.get_center())
        self.play(Transform(step5_title, step6_title), run_time=0.5)
        
        # 在这里添加答案显示动画...
        
        # 步骤7：验证答案
        step7_title = Text("步骤7：验证答案", font_size=24, color=BLUE).move_to(step6_title.get_center())
        self.play(Transform(step6_title, step7_title), run_time=0.5)
        
        # 在这里添加答案验证动画...
        
        # 总结结论
        conclusion = Text(
            "解题完成",
            font_size=28, color=BLUE
        ).to_edge(DOWN, buff=0.5)
        
        self.play(Write(conclusion), run_time=1.0)
        self.wait(2.0)
        
        # 保持最终状态
        self.wait(1.0)
\`\`\`

请根据具体几何问题内容，在"在这里添加..."部分添加详细的动画步骤。必须包含几何图形的绘制、标注、计算过程等。`
  }

  // 提取几何问题的关键信息
  extractGeometryInfo(question) {
    const info = {
      shape: '',
      dimensions: {},
      angles: {},
      type: ''
    }
    
    // 检测几何图形类型
    if (question.includes('三角形')) {
      info.shape = 'triangle'
      info.type = 'area'
    } else if (question.includes('矩形') || question.includes('长方形')) {
      info.shape = 'rectangle'
      info.type = 'area'
    } else if (question.includes('圆形') || question.includes('圆')) {
      info.shape = 'circle'
      info.type = 'area'
    } else if (question.includes('正方形')) {
      info.shape = 'square'
      info.type = 'area'
    }
    
    // 提取尺寸信息
    const dimensionMatches = question.match(/(\d+)/g)
    if (dimensionMatches) {
      if (info.shape === 'triangle') {
        if (dimensionMatches.length >= 2) {
          info.dimensions.base = parseInt(dimensionMatches[0])
          info.dimensions.height = parseInt(dimensionMatches[1])
        }
      } else if (info.shape === 'rectangle') {
        if (dimensionMatches.length >= 2) {
          info.dimensions.length = parseInt(dimensionMatches[0])
          info.dimensions.width = parseInt(dimensionMatches[1])
        }
      } else if (info.shape === 'circle') {
        if (dimensionMatches.length >= 1) {
          info.dimensions.radius = parseInt(dimensionMatches[0])
        }
      }
    }
    
    return info
  }

  // 通过AI生成Manim脚本
  async generateManimScript(question, solution, topic, questionType) {
    try {
      console.log('🤖 通过AI生成Manim脚本...')
      
      // 根据问题类型选择不同的提示词
      let prompt
      if (questionType === 'theoretical_question') {
        prompt = this.generateScriptPrompt(question, solution, topic, questionType)
      } else {
        // 检查是否是几何问题
        const geometryInfo = this.extractGeometryInfo(question)
        if (geometryInfo.shape) {
          console.log('📐 检测到几何问题，使用专门的几何脚本生成器')
          prompt = this.generateGeometryScript(question, solution)
        } else {
          prompt = this.generateScriptPrompt(question, solution, topic, questionType)
        }
      }
      
      // 调用AI服务生成脚本 - 使用本地代理
      const apiEndpoint = 'http://localhost:3001/api/kimi/chat'
      const apiKey = import.meta.env?.VITE_KIMI_API_KEY
      
      if (!apiKey) {
        throw new Error('KIMI API密钥未设置')
      }
      
      const response = await fetch(apiEndpoint, {
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
          model: 'moonshot-v1-8k',
          max_tokens: 2048,
          temperature: 0.1,
          top_p: 0.8
        })
      })
      
      const result = await response.json()
      console.log('🤖 KIMI API响应:', result)
      
      if (result.choices && result.choices.length > 0) {
        const content = result.choices[0].message.content
        console.log('📝 AI生成的内容:', content)
        
        // 提取代码块中的Python脚本
        const codeMatch = content.match(/```python\n([\s\S]*?)\n```/)
        let pythonScript = ''
        
        if (codeMatch) {
          console.log('✅ 成功提取Python代码块')
          pythonScript = codeMatch[1]
        } else {
          // 如果没有代码块标记，检查是否直接是Python代码
          if (content.includes('from manim import') || content.includes('class') && content.includes('Scene')) {
            console.log('✅ 检测到直接Python代码')
            pythonScript = content
          } else {
            console.log('⚠️ 未检测到Python代码，使用默认脚本')
            pythonScript = this.generateDefaultScript(question, solution, topic, questionType)
          }
        }
        
        // 后处理：确保脚本语法正确
        pythonScript = this.postProcessManimScript(pythonScript, question, topic)
        
        console.log('✅ 最终生成的Manim脚本:', pythonScript.substring(0, 200) + '...')
        return pythonScript
        
      } else {
        console.error('❌ KIMI API响应格式错误:', result)
        throw new Error('AI生成脚本失败')
      }
      
    } catch (error) {
      console.error('❌ AI脚本生成失败:', error)
      // 返回默认脚本模板
      return this.generateDefaultScript(question, solution, topic, questionType)
    }
  }

  // 后处理Manim脚本，确保语法正确
  postProcessManimScript(script, question, topic) {
    console.log('🔧 后处理Manim脚本...')
    
    // 1. 确保有必要的导入
    if (!script.includes('from manim import')) {
      script = 'from manim import *\nimport warnings\nwarnings.filterwarnings("ignore")\n\n' + script
    }
    
    // 2. 确保有配置设置
    if (!script.includes('config.frame_rate')) {
      const configBlock = `
# 配置设置
config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

`
      script = script.replace('from manim import *', 'from manim import *\n' + configBlock)
    }
    
    // 3. 确保场景类名正确
    const className = this.generateClassName(question)
    if (!script.includes(`class ${className}Scene`)) {
      script = script.replace(/class\s+\w+Scene\s*\(Scene\):/, `class ${className}Scene(Scene):`)
    }
    
    // 4. 确保construct方法存在（只在完全缺失时添加）
    if (!script.includes('def construct(self):')) {
      console.log('⚠️ 检测到缺少construct方法，添加基本方法')
      const constructMethod = `
    def construct(self):
        # 设置背景颜色
        self.camera.background_color = WHITE
        
        # 创建标题
        title = Text("${this.generateTitle(question)}", font_size=36, color=BLUE).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=1.0)
        self.wait(0.5)
        
        # 创建主要内容区域
        main_area = Rectangle(
            width=16, height=8, 
            color=GRAY, fill_opacity=0.1, stroke_opacity=0.3
        ).next_to(title, DOWN, buff=0.3)
        
        self.play(Create(main_area), run_time=1.0)
        self.wait(0.5)
        
        # 显示结论
        conclusion = Text(
            "演示完成",
            font_size=28, color=BLUE
        ).to_edge(DOWN, buff=0.5)
        
        self.play(Write(conclusion), run_time=1.0)
        self.wait(2.0)
        
        # 保持最终状态
        self.wait(1.0)
`
      script = script.replace(/class\s+\w+Scene\s*\(Scene\):/, `class ${className}Scene(Scene):${constructMethod}`)
    } else {
      console.log('✅ 检测到construct方法，保留AI生成的详细内容')
    }
    
    // 5. 修复常见的语法问题
    script = script
      .replace(/\n\s*\n\s*\n/g, '\n\n') // 移除多余的空行
      .replace(/,\s*,/g, ',') // 修复多余的逗号
      .replace(/\(\s*,/g, '(') // 修复开头的逗号
      .replace(/,\s*\)/g, ')') // 修复结尾的逗号
    
    // 6. 确保缩进正确
    const lines = script.split('\n')
    const processedLines = []
    let inClass = false
    let inMethod = false
    
    for (let line of lines) {
      const trimmedLine = line.trim()
      
      if (trimmedLine.startsWith('class ') && trimmedLine.includes('Scene')) {
        inClass = true
        processedLines.push(line)
      } else if (inClass && trimmedLine.startsWith('def construct(self):')) {
        inMethod = true
        processedLines.push(line)
      } else if (inMethod && trimmedLine.startsWith('def ')) {
        inMethod = false
        processedLines.push(line)
      } else if (inClass && !inMethod && trimmedLine.startsWith('def ')) {
        inMethod = true
        processedLines.push(line)
      } else if (inMethod && trimmedLine && !trimmedLine.startsWith('#')) {
        // 确保方法内的代码有正确的缩进
        if (!line.startsWith('        ') && !line.startsWith('\t')) {
          line = '        ' + line
        }
        processedLines.push(line)
      } else {
        processedLines.push(line)
      }
    }
    
    script = processedLines.join('\n')
    
    console.log('✅ Manim脚本后处理完成')
    return script
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

class ${this.generateClassName(question)}(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # 标题 - 使用较小的字体避免占用太多空间
        title = Text("${this.generateTitle(question).replace(/`/g, '\\\\`').replace(/\$/g, '\\\\$').replace(/：/g, ':').replace(/"/g, '\\\\"')}", font_size=32, color=BLUE).to_edge(UP, buff=0.3)
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
        solution_text = "${(solution || '').replace(/`/g, '\\\\`').replace(/\$/g, '\\\\$').replace(/：/g, ':').replace(/"/g, '\\\\"')}"
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
                "问题: ${question.substring(0, 25).replace(/：/g, ':').replace(/"/g, '\\\\"')}${question.length > 25 ? '...' : ''}", 
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
    // 处理中文和英文混合的情况
    let cleanQuestion = question
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '') // 保留中文、英文、数字和空格
      .trim()
    
    if (!cleanQuestion) {
      return 'MathScene' // 默认类名
    }
    
    // 如果问题包含中文字符，直接使用默认类名
    if (/[\u4e00-\u9fa5]/.test(cleanQuestion)) {
      return 'TheoreticalQuestionScene'
    }
    
    // 提取前几个字符作为类名
    const maxLength = 20
    let className = cleanQuestion.substring(0, maxLength)
      .replace(/\s+/g, '') // 移除空格
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '') // 只保留中文、英文、数字
    
    // 如果类名太短，添加一些默认字符
    if (className.length < 3) {
      className = 'Math' + className
    }
    
    // 确保类名以字母开头
    if (!/^[a-zA-Z\u4e00-\u9fa5]/.test(className)) {
      className = 'Math' + className
    }
    
    return className + 'Scene'
  }

  // 生成标题
  generateTitle(question) {
    return question.length > 20 ? question.substring(0, 20) + '...' : question
  }
} 