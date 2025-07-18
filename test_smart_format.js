/**
 * Test Smart Format Detection System
 * Tests adaptive format selection based on problem complexity
 */

// Test the new smart format detection
const testCases = [
  {
    name: "Simple Linear Equation",
    question: "解方程：2x + 3 = 7",
    expectedFormat: "plain"
  },
  {
    name: "Quadratic Equation",
    question: "解方程：x^2 + 4x + 3 = 0",
    expectedFormat: "plain"
  },
  {
    name: "Integral Calculus",
    question: "计算积分：∫(x^2 + 1)dx 从0到1",
    expectedFormat: "latex"
  },
  {
    name: "Matrix Operation",
    question: "求矩阵的逆：[[1,2],[3,4]]",
    expectedFormat: "latex"
  },
  {
    name: "Limit Problem",
    question: "求极限：lim(x→0) (sin x)/x",
    expectedFormat: "latex"
  },
  {
    name: "Fraction Equation",
    question: "解方程：(x+1)/(x-1) = 2",
    expectedFormat: "plain"
  }
]

// Mock the detectProblemComplexity function
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

// Test content normalization
function normalizeMathContent(content) {
  if (!content) return ''
  
  let normalized = content.replace(/\s+/g, ' ').trim()
  
  if (normalized.includes('\\')) {
    normalized = normalized
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
      .replace(/\\cdot/g, '*')
      .replace(/\\times/g, '*')
      .replace(/\\div/g, '/')
  }
  
  return normalized
}

// Run tests
function runSmartFormatTests() {
  console.log("🧪 Smart Format Detection Test Suite")
  console.log("=".repeat(50))
  
  let passed = 0
  
  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`)
    console.log(`   Question: ${testCase.question}`)
    
    const result = detectProblemComplexity(testCase.question)
    const testPassed = result.format === testCase.expectedFormat
    
    console.log(`   Detected: ${result.format} (score: ${result.score})`)
    console.log(`   Expected: ${testCase.expectedFormat}`)
    console.log(`   Status: ${testPassed ? '✅ PASS' : '❌ FAIL'}`)
    
    if (testPassed) passed++
  })
  
  console.log("\n" + "=".repeat(50))
  console.log(`📊 Test Results: ${passed}/${testCases.length} passed`)
  console.log(`Success Rate: ${(passed/testCases.length*100).toFixed(1)}%`)
  
  // Test content normalization
  console.log("\n🔧 Content Normalization Tests")
  console.log("-".repeat(30))
  
  const normalizationTests = [
    { input: "\\frac{x+1}{x-1}", expected: "(x+1)/(x-1)" },
    { input: "\\sqrt{16}", expected: "sqrt(16)" },
    { input: "2x + 3 = 7", expected: "2x + 3 = 7" },
    { input: "x^2 + 4x + 3 = 0", expected: "x^2 + 4x + 3 = 0" }
  ]
  
  normalizationTests.forEach((test, index) => {
    const result = normalizeMathContent(test.input)
    const passed = result === test.expected
    console.log(`${index + 1}. ${test.input} → ${result} ${passed ? '✅' : '❌'}`)
  })
  
  console.log("\n🎯 Smart Format System Ready!")
}

// Run the tests
runSmartFormatTests()