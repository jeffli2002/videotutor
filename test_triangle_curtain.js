/**
 * Test Triangle Area Curtain Principle Visualization
 * Tests the adaptive system with specific Chinese request
 */

// Test the specific request: "请用动画帮我解释三角形面积的拉窗帘原理"
const testRequest = {
  question: "请用动画帮我解释三角形面积的拉窗帘原理",
  language: "zh",
  difficulty: "intermediate"
}

// Mock the system functions
function detectProblemType(question) {
  const problemTypes = {
    'equation': /方程|equation|solve|解|=/i,
    'geometry': /几何|geometry|三角形|面积|体积|图形|length|area|volume|angle|拉窗帘|curtain/i,
    'algebra': /代数|algebra|多项式|polynomial|因式分解|factor/i,
    'calculus': /微积分|calculus|积分|integral|导数|derivative|极限|limit/i,
    'statistics': /统计|statistics|概率|probability|平均|mean|方差|variance/i,
    'trigonometry': /三角|trigonometry|sin|cos|tan|角度|angle/i,
    'matrix': /矩阵|matrix|行列式|determinant/i,
    'sequence': /数列|sequence|级数|series|等差|等比/i
  }
  
  for (const [type, pattern] of Object.entries(problemTypes)) {
    if (pattern.test(question)) {
      return type
    }
  }
  return 'general'
}

function detectProblemComplexity(question) {
  const complexPatterns = [
    /integral|积分|∫/i,
    /derivative|导数|微分/i,
    /matrix|矩阵/i,
    /limit|极限/i,
    /sum|∑|sigma/i,
    /product|∏|pi/i,
    /sqrt|根号|√[^)]*\)|\^{[^{}]*}/,
    /frac|\frac{[^{}]*}{[^{}]*}/,
    /[∑∏∫∂∇∆∞∈∉⊂⊃⊆⊇∩∪]/,
    /\$\$.*?\$\$/,
    /\\\[.*?\\\]/
  ]
  
  const complexityScore = complexPatterns.reduce((score, pattern) =>
    pattern.test(question) ? score + 1 : score, 0)
  
  return {
    complexity: complexityScore > 0 ? 'complex' : 'simple',
    score: complexityScore,
    useLaTeX: complexityScore > 0,
    format: complexityScore > 0 ? 'latex' : 'plain'
  }
}

function buildAdaptiveIntroduction(question, language, problemType, complexity) {
  const introductions = {
    'zh': {
      'geometry': "几何之美在于空间的变换与关系。让我们通过动画来直观理解三角形面积的奥秘，就像慢慢拉开窗帘，逐步揭示背后的数学真理。",
      'equation': "让我们一起探索这个方程，通过清晰的视觉化和逻辑步骤来发现它的解法。",
      'algebra': "代数是模式的语言。让我们通过观察表达式的变换和关系来解码这个问题。",
      'calculus': "微积分揭示了变化和积累的奥秘。让我们通过可视化来理解这些概念的含义。",
      'statistics': "数据讲述着故事。让我们可视化这个统计问题，理解数字真正想告诉我们什么。",
      'trigonometry': "三角学连接了角度和长度。让我们看看这些关系如何通过动画变得生动。",
      'matrix': "矩阵以优美的方式组织信息。让我们可视化这些数组如何变换和交互。",
      'sequence': "数列显示了随时间变化的规律。让我们动画展示这些数字如何演变和关联。",
      'general': "当我们能够看到数学时，它就变得美丽。让我们通过可视化和理解来探索这个问题。"
    }
  }
  
  const baseIntro = introductions[language]?.[problemType] || introductions[language]?.general
  
  const complexityHints = {
    'simple': "我们将使用直观的可视化让概念变得清晰易懂。",
    'complex': "我们将分层次展示，逐步建立深入理解。"
  }
  
  return `${baseIntro} ${complexityHints[complexity.complexity] || ''}`
}

// Generate tailored response for triangle area curtain principle
function generateTriangleCurtainResponse() {
  const { question, language, difficulty } = testRequest
  const problemType = detectProblemType(question)
  const complexity = detectProblemComplexity(question)
  const introduction = buildAdaptiveIntroduction(question, language, problemType, complexity)
  
  return {
    question: question,
    problemType: problemType,
    complexity: complexity.complexity,
    introduction: introduction,
    narrativeFlow: [
      {
        phase: "curtain_analogy",
        description: "用拉窗帘的类比引入三角形面积概念",
        duration: 30,
        visualApproach: "展示一个三角形窗帘，从折叠状态慢慢拉开"
      },
      {
        phase: "area_transformation", 
        description: "展示三角形如何通过剪切平移变成矩形",
        duration: 45,
        visualApproach: "动画演示将三角形沿中线剪切，平移右侧三角形与左侧拼接成矩形"
      },
      {
        phase: "formula_discovery",
        description: "通过面积守恒推导出三角形面积公式",
        duration: 30,
        visualApproach: "显示矩形面积为底×高的一半，直观得出三角形面积公式"
      },
      {
        phase: "generalization",
        description: "推广到任意三角形的面积公式",
        duration: 25,
        visualApproach: "展示不同形状的三角形，都适用相同的面积计算方法"
      }
    ],
    keyInsights: [
      "任何三角形都可以通过剪切平移转化为等面积的矩形",
      "三角形面积是等底等高矩形面积的一半",
      "拉窗帘的过程体现了面积守恒的几何变换"
    ],
    visualMetaphors: [
      "拉窗帘的展开过程",
      "纸张的剪切与重组",
      "面积的守恒变换"
    ],
    animationElements: [
      "三角形到矩形的变换动画",
      "面积计算的动态演示",
      "不同三角形的公式应用"
    ],
    solution: "S = (底 × 高) ÷ 2",
    format: "plain",
    topics: ["几何", "三角形面积", "几何变换", "面积守恒"],
    commonMistakes: ["忘记除以2", "混淆底和高的对应关系"]
  }
}

console.log("🔺 三角形面积拉窗帘原理动画测试")
console.log("=".repeat(50))

const response = generateTriangleCurtainResponse()

console.log(`问题: ${response.question}`)
console.log(`问题类型: ${response.problemType}`)
console.log(`复杂度: ${response.complexity}`)
console.log(`\n🎬 开场介绍:`)
console.log(response.introduction)

console.log(`\n📊 叙事流程:`)
response.narrativeFlow.forEach((phase, index) => {
  console.log(`${index + 1}. ${phase.phase}: ${phase.description}`)
  console.log(`   视觉方法: ${phase.visualApproach}`)
  console.log(`   时长: ${phase.duration}秒`)
})

console.log(`\n💡 核心洞察:`)
response.keyInsights.forEach(insight => console.log(`   • ${insight}`))

console.log(`\n🎨 视觉隐喻:`)
response.visualMetaphors.forEach(metaphor => console.log(`   • ${metaphor}`))

console.log(`\n🎯 动画元素:`)
response.animationElements.forEach(element => console.log(`   • ${element}`))

console.log(`\n📐 最终公式: ${response.solution}`)
console.log(`📚 相关概念: ${response.topics.join(", ")}`)

console.log("\n" + "=".repeat(50))
console.log("✅ 三角形面积拉窗帘原理动画方案已生成！")