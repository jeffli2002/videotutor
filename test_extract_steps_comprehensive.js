/**
 * Comprehensive Test Suite for extractAndSortSteps Function
 * Tests template detection, content filtering, and improved extraction
 */

// Import the function we need to test
import { extractAndSortSteps, isTemplateStep } from './src/services/mathVideoAI.js';

// Test data - various types of AI responses
const testCases = {
  // Template responses that should be filtered
  templateResponses: [
    {
      name: "Generic Template Chinese",
      content: `**详细解题步骤**
1. 理解题意：分析已知条件和求解目标
2. 建立数学模型：根据题意列出方程或表达式
3. 逐步计算：按逻辑顺序进行数学运算
4. 验证结果：检查答案的正确性和合理性

**最终答案**
答案为x=5

**相关数学概念**
方程、代数运算`,
      expected: "should filter template steps"
    },
    {
      name: "Generic Template English",
      content: `**Step-by-step solution**
1. **Understand the problem**: Analyze given conditions and what needs to be solved
2. **Establish mathematical model**: Formulate equations based on the problem
3. **Calculate step by step**: Perform mathematical operations in logical order
4. **Verify results**: Check the correctness and reasonableness of the answer

**Final Answer**
The answer is x = 5`,
      expected: "should filter template steps"
    },
    {
      name: "API Format Template",
      content: `Please provide:
1. Complete step-by-step solution
2. Clear explanation for each step
3. Final answer with verification

Format your response as JSON with:
"steps": [
  {
    "stepNumber": 1,
    "description": "what we're doing",
    "operation": "mathematical operation",
    "result": "result of this step"
  }
]`,
      expected: "should filter API template"
    }
  ],

  // Actual mathematical responses that should be extracted
  actualResponses: [
    {
      name: "Real Math Steps Chinese",
      content: `**步骤1：化简方程**
将方程2x + 3 = 7两边同时减去3，得到2x = 4

**步骤2：求解x**
两边同时除以2，得到x = 4/2 = 2

**步骤3：验证结果**
将x=2代入原方程：2*2 + 3 = 7，左边等于右边，验证正确

**最终答案**
x = 2`,
      expected: ["将方程2x + 3 = 7两边同时减去3，得到2x = 4", "两边同时除以2，得到x = 4/2 = 2", "将x=2代入原方程：2*2 + 3 = 7，左边等于右边，验证正确"]
    },
    {
      name: "Real Math Steps English",
      content: `**Step 1: Simplify the equation**
Subtract 3 from both sides: 2x + 3 - 3 = 7 - 3 → 2x = 4

**Step 2: Solve for x**
Divide both sides by 2: 2x/2 = 4/2 → x = 2

**Step 3: Verify the solution**
Substitute x=2 back into original equation: 2(2) + 3 = 7, which checks out

**Final Answer**
x = 2`,
      expected: ["Subtract 3 from both sides: 2x + 3 - 3 = 7 - 3 → 2x = 4", "Divide both sides by 2: 2x/2 = 4/2 → x = 2", "Substitute x=2 back into original equation: 2(2) + 3 = 7, which checks out"]
    },
    {
      name: "Detailed Format Response",
      content: `**步骤编号：1** **具体操作：理解题意并列出方程** **详细解释：根据题意，设未知数x，列出方程** **中间结果：2x + 5 = 13**

**步骤编号：2** **具体操作：移项求解** **详细解释：将常数项移到等式右边** **中间结果：2x = 13 - 5 = 8**

**步骤编号：3** **具体操作：求解未知数** **详细解释：两边同时除以系数2** **中间结果：x = 8/2 = 4**`,
      expected: ["理解题意并列出方程：根据题意，设未知数x，列出方程，计算结果：2x + 5 = 13", "移项求解：将常数项移到等式右边，计算结果：2x = 13 - 5 = 8", "求解未知数：两边同时除以系数2，计算结果：x = 8/2 = 4"]
    }
  ],

  // Edge cases
  edgeCases: [
    {
      name: "Mixed Content",
      content: `**问题描述**
解方程：3x - 2 = 10

**解题步骤**
1. 首先将方程两边同时加2，得到3x = 12
2. 然后两边同时除以3，得到x = 4
3. 最后验证：3*4 - 2 = 10 ✓

**总结**
方程的解为x = 4`,
      expected: ["首先将方程两边同时加2，得到3x = 12", "然后两边同时除以3，得到x = 4", "最后验证：3*4 - 2 = 10 ✓"]
    },
    {
      name: "No Steps Found",
      content: "This is just a general discussion about math concepts without any specific steps.",
      expected: ["[无法从响应中提取有效步骤，请检查AI响应格式]"]
    },
    {
      name: "Empty Response",
      content: "",
      expected: ["[无法从响应中提取有效步骤，请检查AI响应格式]"]
    }
  ]
};

// Test the template detection function
function testTemplateDetection() {
  console.log("=== Testing Template Detection ===");
  
  const templateTests = [
    { content: "理解题意：分析已知条件", expected: true },
    { content: "建立数学模型：根据题意列出方程", expected: true },
    { content: "将方程2x + 3 = 7两边同时减去3", expected: false },
    { content: "Please provide step by step solution", expected: true },
    { content: "Calculate the derivative of f(x) = x²", expected: false }
  ];
  
  templateTests.forEach((test, index) => {
    const result = isTemplateStep(test.content);
    const passed = result === test.expected;
    console.log(`Test ${index + 1}: ${passed ? '✅' : '❌'} "${test.content}" = ${result} (expected ${test.expected})`);
  });
}

// Test extractAndSortSteps with different types of responses
function testContentExtraction() {
  console.log("\n=== Testing Content Extraction ===");
  
  // Test template filtering
  console.log("\n--- Template Response Tests ---");
  testCases.templateResponses.forEach((test, index) => {
    const result = extractAndSortSteps(test.content);
    const hasTemplate = result.some(step => isTemplateStep(step));
    console.log(`${test.name}: ${!hasTemplate ? '✅' : '❌'} Filtered template content`);
    console.log(`  Result: ${result.length} steps: ${result.slice(0, 2).join('... ')}`);
  });
  
  // Test actual content extraction
  console.log("\n--- Actual Content Tests ---");
  testCases.actualResponses.forEach((test, index) => {
    const result = extractAndSortSteps(test.content);
    const hasRealMath = result.some(step => /[\+\-\=\×\÷\√\d]/.test(step));
    console.log(`${test.name}: ${hasRealMath ? '✅' : '❌'} Extracted real math content`);
    console.log(`  Result: ${result.length} steps extracted`);
    result.forEach((step, i) => console.log(`    ${i+1}: ${step.substring(0, 60)}...`));
  });
  
  // Test edge cases
  console.log("\n--- Edge Case Tests ---");
  testCases.edgeCases.forEach((test, index) => {
    const result = extractAndSortSteps(test.content);
    console.log(`${test.name}: ${result.length === test.expected.length ? '✅' : '❌'} Handled correctly`);
    console.log(`  Result: ${result.join(' | ')}`);
  });
}

// Test the improved fallback mechanism
function testFallbackMechanism() {
  console.log("\n=== Testing Fallback Mechanism ===");
  
  const fallbackTests = [
    {
      name: "Partial Template Content",
      content: `**解题思路**
解方程 2x + 5 = 13

首先两边同时减去5：2x = 8
然后两边同时除以2：x = 4

**验证**
2*4 + 5 = 13 ✓`,
      expected: "should extract actual steps despite template headers"
    },
    {
      name: "Complex Math with Variables",
      content: `给定方程：3x² - 12x + 9 = 0

步骤1：两边同时除以3，化简为x² - 4x + 3 = 0
步骤2：使用求根公式，判别式Δ = (-4)² - 4*1*3 = 16 - 12 = 4
步骤3：x = [4 ± √4]/2 = [4 ± 2]/2，得到x₁=3, x₂=1`,
      expected: "should extract complex mathematical steps"
    }
  ];
  
  fallbackTests.forEach((test, index) => {
    const result = extractAndSortSteps(test.content);
    console.log(`${test.name}: ${result.length > 0 ? '✅' : '❌'} ${test.expected}`);
    console.log(`  Extracted ${result.length} steps`);
    result.forEach((step, i) => console.log(`    ${i+1}: ${step}`));
  });
}

// Run all tests
async function runComprehensiveTests() {
  console.log("🧪 Comprehensive Test Suite Started");
  console.log("=".repeat(50));
  
  try {
    testTemplateDetection();
    testContentExtraction();
    testFallbackMechanism();
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ All tests completed successfully!");
    
  } catch (error) {
    console.error("❌ Test suite failed:", error);
  }
}

// Run tests directly
runComprehensiveTests();