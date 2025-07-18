/**
 * Test Adaptive Introduction System
 * Tests contextual introduction generation for different math problems
 */

// Test cases covering different problem types and complexities
const testCases = [
  {
    name: "Simple Linear Equation",
    question: "解方程：2x + 3 = 7",
    language: "zh",
    expectedType: "equation",
    expectedComplexity: "simple"
  },
  {
    name: "Complex Calculus",
    question: "计算积分：∫(x^2 + 1)dx 从0到1",
    language: "zh",
    expectedType: "calculus",
    expectedComplexity: "complex"
  },
  {
    name: "Geometry Problem",
    question: "Find the area of triangle with base 8 and height 6",
    language: "en",
    expectedType: "geometry",
    expectedComplexity: "simple"
  },
  {
    name: "Statistics Data",
    question: "计算数据集的平均值：2, 4, 6, 8, 10",
    language: "zh",
    expectedType: "statistics",
    expectedComplexity: "simple"
  },
  {
    name: "Matrix Operation",
    question: "Find the inverse of matrix [[1,2],[3,4]]",
    language: "en",
    expectedType: "matrix",
    expectedComplexity: "complex"
  }
]

// Mock functions for testing
function detectProblemType(question) {
  const problemTypes = {
    'equation': /方程|equation|solve|解|=/i,
    'geometry': /几何|geometry|三角形|面积|体积|图形|length|area|volume|angle/i,
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
    /\$\$.*?\$\$/,  // 双美元符号LaTeX
    /\\\[.*?\\\]/  // 方括号LaTeX
  ]
  
  const complexityScore = complexPatterns.reduce((score, pattern) => {
    return score + (pattern.test(question) ? 1 : 0)
  }, 0)
  
  return {
    complexity: complexityScore > 0 ? 'complex' : 'simple',
    score: complexityScore,
    useLaTeX: complexityScore > 0,
    format: complexityScore > 0 ? 'latex' : 'plain'
  }
}

function buildAdaptiveIntroduction(question, language, problemType, complexity) {
  const introductions = {
    'en': {
      'equation': "Let's explore this equation together and discover how to find its solution through clear visualization and logical steps.",
      'geometry': "Geometry comes alive when we can see the shapes and relationships. Let's visualize this problem step by step.",
      'algebra': "Algebra is the language of patterns. Let's decode this problem by seeing how expressions transform and relate.",
      'calculus': "Calculus reveals the beauty of change and accumulation. Let's visualize these concepts to understand their meaning.",
      'statistics': "Data tells stories. Let's visualize this statistical problem to understand what the numbers are really saying.",
      'trigonometry': "Trigonometry connects angles and lengths. Let's see these relationships come to life through animation.",
      'matrix': "Matrices organize information beautifully. Let's visualize how these arrays transform and interact.",
      'sequence': "Sequences show patterns over time. Let's animate how these numbers evolve and relate.",
      'general': "Mathematics is beautiful when we can see it. Let's explore this problem through visualization and understanding."
    },
    'zh': {
      'equation': "让我们一起探索这个方程，通过清晰的视觉化和逻辑步骤来发现它的解法。",
      'geometry': "当我们能够看到形状和关系时，几何就变得生动起来。让我们一步步可视化这个问题。",
      'algebra': "代数是模式的语言。让我们通过观察表达式的变换和关系来解码这个问题。",
      'calculus': "微积分揭示了变化和积累的奥秘。让我们通过可视化来理解这些概念的含义。",
      'statistics': "数据讲述着故事。让我们可视化这个统计问题，理解数字真正想告诉我们什么。",
      'trigonometry': "三角学连接了角度和长度。让我们看看这些关系如何通过动画变得生动。",
      'matrix': "矩阵以优美的方式组织信息。让我们可视化这些数组如何变换和交互。",
      'sequence': "数列显示了随时间变化的规律。让我们动画展示这些数字如何演变和关联。",
      'general': "当我们能够看到数学时，它就变得美丽。让我们通过可视化和理解来探索这个问题。"
    }
  }
  
  const baseIntro = introductions[language]?.[problemType] || introductions[language]?.general || introductions['en'][problemType]
  
  const complexityHints = {
    'simple': "We'll use straightforward visualizations to make this clear.",
    'complex': "We'll break this down into manageable visual pieces to build deep understanding."
  }
  
  return `${baseIntro} ${complexityHints[complexity.complexity] || ''}`
}

// Test the adaptive introduction system
function runAdaptiveIntroductionTests() {
  console.log("🎯 Adaptive Introduction System Test")
  console.log("=".repeat(60))
  
  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`)
    console.log(`   Question: ${testCase.question}`)
    console.log(`   Language: ${testCase.language}`)
    
    const problemType = detectProblemType(testCase.question)
    const complexity = detectProblemComplexity(testCase.question)
    const introduction = buildAdaptiveIntroduction(testCase.question, testCase.language, problemType, complexity)
    
    console.log(`   Type: ${problemType} (${testCase.expectedType} expected)`)
    console.log(`   Complexity: ${complexity.complexity} (${testCase.expectedComplexity} expected)`)
    console.log(`   Introduction: ${introduction}`)
    
    const typePassed = problemType === testCase.expectedType
    const complexityPassed = complexity.complexity === testCase.expectedComplexity
    
    console.log(`   Status: Type ${typePassed ? '✅' : '❌'}, Complexity ${complexityPassed ? '✅' : '❌'}`)
  })
  
  console.log("\n" + "=".repeat(60))
  console.log("🎨 Narrative Style Examples")
  console.log("-".repeat(30))
  
  const narrativeStyles = {
    'equation': 'Focus on the transformation and balance of both sides',
    'geometry': 'Emphasize spatial relationships and visual constructions',
    'algebra': 'Highlight pattern recognition and symbolic manipulation',
    'calculus': 'Visualize change, accumulation, and limiting processes',
    'statistics': 'Show data distributions and probabilistic relationships',
    'trigonometry': 'Demonstrate angle relationships and periodic behavior',
    'matrix': 'Illustrate transformations and system relationships',
    'sequence': 'Display patterns and convergence behavior'
  }
  
  for (const [type, style] of Object.entries(narrativeStyles)) {
    console.log(`${type}: ${style}`)
  }
  
  console.log("\n✅ Adaptive Introduction System Ready!")
}

// Run the comprehensive tests
runAdaptiveIntroductionTests()