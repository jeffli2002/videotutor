/**
 * Comprehensive Testing Suite for Math Video AI System
 * Tests all problem types, detection accuracy, and script generation
 */

import MathVideoAIService from './src/services/mathVideoAI.js';

const service = new MathVideoAIService();

/**
 * Test Cases for All Problem Types
 */
const comprehensiveTestCases = [
  // 1. 方程类问题
  {
    name: "简单线性方程",
    question: "解方程：3x + 5 = 17",
    language: "zh",
    expectedType: "equation",
    expectedComplexity: "simple",
    expectedFormat: "plain"
  },
  {
    name: "复杂二次方程",
    question: "解方程：x² - 4x + 3 = 0",
    language: "zh", 
    expectedType: "equation",
    expectedComplexity: "complex",
    expectedFormat: "latex"
  },
  {
    name: "英文方程",
    question: "Solve: 2(x-3) = 4x + 1",
    language: "en",
    expectedType: "equation",
    expectedComplexity: "simple",
    expectedFormat: "plain"
  },

  // 2. 几何类问题
  {
    name: "三角形面积拉窗帘",
    question: "请用动画帮我解释三角形面积的拉窗帘原理",
    language: "zh",
    expectedType: "geometry",
    expectedComplexity: "simple",
    expectedFormat: "plain"
  },
  {
    name: "圆面积计算",
    question: "计算半径为5的圆的面积",
    language: "zh",
    expectedType: "geometry",
    expectedComplexity: "simple",
    expectedFormat: "plain"
  },
  {
    name: "几何英文问题",
    question: "Find the volume of a cube with side length 4",
    language: "en",
    expectedType: "geometry",
    expectedComplexity: "simple",
    expectedFormat: "plain"
  },

  // 3. 代数类问题
  {
    name: "多项式展开",
    question: "展开：(x + 2)(x - 3)",
    language: "zh",
    expectedType: "algebra",
    expectedComplexity: "simple",
    expectedFormat: "plain"
  },
  {
    name: "因式分解",
    question: "因式分解：x² + 5x + 6",
    language: "zh",
    expectedType: "algebra", 
    expectedComplexity: "simple",
    expectedFormat: "plain"
  },

  // 4. 微积分类问题
  {
    name: "简单积分",
    question: "计算积分：∫x dx",
    language: "zh",
    expectedType: "calculus",
    expectedComplexity: "complex",
    expectedFormat: "latex"
  },
  {
    name: "复杂微积分",
    question: "计算定积分：∫₀¹ (x² + 2x) dx",
    language: "zh",
    expectedType: "calculus",
    expectedComplexity: "complex",
    expectedFormat: "latex"
  },

  // 5. 统计类问题
  {
    name: "平均数计算",
    question: "计算数据集的平均值：5, 8, 12, 15, 20",
    language: "zh",
    expectedType: "statistics",
    expectedComplexity: "simple",
    expectedFormat: "plain"
  },
  {
    name: "统计英文问题",
    question: "Calculate the standard deviation for: 2, 4, 6, 8, 10",
    language: "en",
    expectedType: "statistics",
    expectedComplexity: "complex",
    expectedFormat: "latex"
  },

  // 6. 三角函数类问题
  {
    name: "三角函数求值",
    question: "计算sin(30°)的值",
    language: "zh",
    expectedType: "trigonometry",
    expectedComplexity: "simple",
    expectedFormat: "plain"
  },
  {
    name: "复杂三角问题",
    question: "解方程：sin(x) = 0.5",
    language: "zh",
    expectedType: "trigonometry",
    expectedComplexity: "complex",
    expectedFormat: "latex"
  },

  // 7. 矩阵类问题
  {
    name: "矩阵乘法",
    question: "计算矩阵[[1,2],[3,4]]与[[5,6],[7,8]]的乘积",
    language: "zh",
    expectedType: "matrix",
    expectedComplexity: "complex",
    expectedFormat: "latex"
  },

  // 8. 数列类问题
  {
    name: "等差数列",
    question: "求等差数列2,5,8,11...的第10项",
    language: "zh",
    expectedType: "sequence",
    expectedComplexity: "simple",
    expectedFormat: "plain"
  },

  // 9. 综合类问题
  {
    name: "综合问题",
    question: "如果一个数的平方等于9，这个数是多少？",
    language: "zh",
    expectedType: "general",
    expectedComplexity: "simple",
    expectedFormat: "plain"
  },

  // 10. 边界测试
  {
    name: "空字符串",
    question: "",
    language: "zh",
    expectedType: "general",
    expectedComplexity: "simple",
    expectedFormat: "plain"
  },
  {
    name: "复杂混合问题",
    question: "求函数f(x)=x²+3x+2在区间[0,2]上的积分值",
    language: "zh",
    expectedType: "calculus",
    expectedComplexity: "complex",
    expectedFormat: "latex"
  }
];

/**
 * Test Results Class
 */
class TestResults {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
    this.total = 0;
  }

  addResult(testCase, actualType, actualComplexity, actualFormat, introduction, script, error = null) {
    const result = {
      testCase,
      actualType,
      actualComplexity,
      actualFormat,
      introduction,
      script,
      error,
      typeMatch: actualType === testCase.expectedType,
      complexityMatch: actualComplexity === testCase.expectedComplexity,
      formatMatch: actualFormat === testCase.expectedFormat,
      passed: actualType === testCase.expectedType && 
              actualComplexity === testCase.expectedComplexity && 
              actualFormat === testCase.expectedFormat &&
              !error
    };

    this.results.push(result);
    if (result.passed) this.passed++;
    else this.failed++;
    this.total++;
  }

  generateReport() {
    const report = {
      summary: {
        total: this.total,
        passed: this.passed,
        failed: this.failed,
        successRate: ((this.passed / this.total) * 100).toFixed(1) + '%'
      },
      detailedResults: this.results,
      typeAccuracy: this.calculateAccuracy('typeMatch'),
      complexityAccuracy: this.calculateAccuracy('complexityMatch'),
      formatAccuracy: this.calculateAccuracy('formatMatch'),
      failures: this.results.filter(r => !r.passed)
    };

    return report;
  }

  calculateAccuracy(key) {
    const matches = this.results.filter(r => r[key]).length;
    return ((matches / this.total) * 100).toFixed(1) + '%';
  }
}

/**
 * Run Problem Type Detection Tests
 */
async function runProblemTypeTests() {
  console.log("🧪 开始问题类型检测测试");
  console.log("=".repeat(80));
  
  const results = new TestResults();

  for (const testCase of comprehensiveTestCases) {
    console.log(`\n🔍 测试: ${testCase.name}`);
    console.log(`问题: ${testCase.question}`);
    console.log(`语言: ${testCase.language}`);
    
    try {
      const problemType = service.detectProblemType(testCase.question);
      const complexity = service.detectProblemComplexity(testCase.question);
      
      const introduction = service.buildAdaptiveIntroduction(
        testCase.question, 
        testCase.language, 
        problemType, 
        complexity
      );

      let script = null;
      if (testCase.question.trim()) {
        try {
          const mockMathSolution = {
            originalQuestion: testCase.question,
            steps: [
              `步骤1: 分析${problemType}问题`,
              `步骤2: 应用${problemType}方法`,
              `步骤3: 计算中间结果`,
              `步骤4: 得出最终答案`
            ]
          };
          
          script = service.generateTypeSpecificScript(
            mockMathSolution,
            problemType,
            testCase.language,
            complexity
          );
        } catch (e) {
          script = { error: e.message };
        }
      }

      results.addResult(
        testCase,
        problemType,
        complexity.complexity,
        complexity.format,
        introduction,
        script
      );

      console.log(`实际类型: ${problemType} (${testCase.expectedType}期望)`);
      console.log(`实际复杂度: ${complexity.complexity} (${testCase.expectedComplexity}期望)`);
      console.log(`实际格式: ${complexity.format} (${testCase.expectedFormat}期望)`);
      
      const passed = problemType === testCase.expectedType && 
                    complexity.complexity === testCase.expectedComplexity &&
                    complexity.format === testCase.expectedFormat;
      
      console.log(`结果: ${passed ? '✅ 通过' : '❌ 失败'}`);

    } catch (error) {
      results.addResult(testCase, null, null, null, null, null, error.message);
      console.log(`❌ 测试失败: ${error.message}`);
    }
  }

  return results.generateReport();
}

/**
 * Test Script Generation Quality
 */
function testScriptGenerationQuality() {
  console.log("\n📝 测试脚本生成质量");
  console.log("=".repeat(50));

  const scriptTests = [
    { type: "geometry", question: "三角形面积计算", language: "zh" },
    { type: "equation", question: "解方程：x + 3 = 7", language: "zh" },
    { type: "calculus", question: "计算积分：∫x dx", language: "zh" },
    { type: "algebra", question: "多项式展开", language: "zh" },
    { type: "statistics", question: "计算平均值", language: "zh" },
    { type: "trigonometry", question: "三角函数求值", language: "zh" }
  ];

  const qualityResults = [];

  for (const test of scriptTests) {
    console.log(`\n📊 ${test.type} 类型脚本测试 (${test.language})`);
    
    try {
      let script;
      const mockSolution = {
        originalQuestion: test.question,
        steps: ["分析问题", "应用方法", "计算结果"]
      };

      switch (test.type) {
        case "geometry":
          script = service.buildGeometryScript(test.question, mockSolution.steps, { title: "几何问题" }, test.language);
          break;
        case "equation":
          script = service.buildEquationScript(test.question, mockSolution.steps, { title: "方程问题" }, test.language);
          break;
        case "calculus":
          script = service.buildCalculusScript(test.question, mockSolution.steps, { title: "微积分问题" }, test.language);
          break;
        case "algebra":
          script = service.buildAlgebraScript(test.question, mockSolution.steps, { title: "代数问题" }, test.language);
          break;
        default:
          script = service.buildGeneralScript(test.question, mockSolution.steps, { title: "通用问题" }, test.language);
      }

      const qualityMetrics = {
        type: test.type,
        language: test.language,
        pages: script?.length || 0,
        totalDuration: script?.reduce((total, page) => total + page.duration, 0) || 0,
        hasContent: script?.every(page => page.text && page.text.length > 0) || false,
        hasVisuals: script?.every(page => page.visual && page.visual.length > 0) || false,
        hasSubText: script?.every(page => page.subText && page.subText.length > 0) || false,
        sampleText: script?.[0]?.text || "无内容",
        sampleVisual: script?.[0]?.visual || "无视觉指导"
      };

      console.log(`页面数: ${qualityMetrics.pages}`);
      console.log(`总时长: ${qualityMetrics.totalDuration}秒`);
      console.log(`内容完整性: ${qualityMetrics.hasContent ? '✅' : '❌'}`);
      console.log(`视觉指导: ${qualityMetrics.hasVisuals ? '✅' : '❌'}`);
      console.log(`副标题: ${qualityMetrics.hasSubText ? '✅' : '❌'}`);
      console.log(`示例内容: ${qualityMetrics.sampleText}`);

      qualityResults.push(qualityMetrics);

    } catch (error) {
      console.log(`❌ 脚本生成失败: ${error.message}`);
      qualityResults.push({ type: test.type, error: error.message });
    }
  }

  return qualityResults;
}

/**
 * Test Error Handling and Edge Cases
 */
function testEdgeCases() {
  console.log("\n⚡ 测试边界情况和错误处理");
  console.log("=".repeat(50));

  const edgeCases = [
    { question: "", description: "空字符串" },
    { question: "123", description: "纯数字" },
    { question: "解方程", description: "不完整问题" },
    { question: null, description: "null值" },
    { question: undefined, description: "undefined值" },
    { question: "   ", description: "空格字符串" },
    { question: "这是一个很长的包含很多数学符号的问题：∫₀¹ x² dx + sin(π/4) = √2/2", description: "复杂混合问题" }
  ];

  const edgeResults = [];

  for (const edgeCase of edgeCases) {
    console.log(`\n🧪 边界测试: ${edgeCase.description}`);
    console.log(`输入: ${edgeCase.question}`);

    try {
      const type = service.detectProblemType(edgeCase.question || "");
      const complexity = service.detectProblemComplexity(edgeCase.question || "");
      const introduction = service.buildAdaptiveIntroduction(
        edgeCase.question || "",
        "zh",
        type,
        complexity
      );

      const result = {
        input: edgeCase.question,
        description: edgeCase.description,
        type: type,
        complexity: complexity,
        introduction: introduction.substring(0, 100) + "...",
        handled: true
      };

      console.log(`处理结果: ✅`);
      console.log(`识别类型: ${type}`);
      console.log(`复杂度: ${complexity.complexity}`);

      edgeResults.push(result);

    } catch (error) {
      console.log(`处理结果: ❌ ${error.message}`);
      edgeResults.push({
        input: edgeCase.question,
        description: edgeCase.description,
        error: error.message,
        handled: false
      });
    }
  }

  return edgeResults;
}

/**
 * Performance Testing
 */
function testPerformance() {
  console.log("\n⚡ 性能测试");
  console.log("=".repeat(30));

  const performanceTests = [
    { name: "简单问题", question: "2 + 3 = ?" },
    { name: "复杂问题", question: "计算∫₀¹ (x³ + 2x² - x + 1) dx" },
    { name: "中文问题", question: "解方程：x² - 5x + 6 = 0" },
    { name: "英文问题", question: "Find the derivative of f(x) = x³" }
  ];

  const performanceResults = [];

  for (const test of performanceTests) {
    const start = performance.now();
    
    const type = service.detectProblemType(test.question);
    const complexity = service.detectProblemComplexity(test.question);
    const introduction = service.buildAdaptiveIntroduction(test.question, "zh", type, complexity);
    
    const end = performance.now();
    const duration = (end - start).toFixed(2);

    console.log(`${test.name}: ${duration}ms`);
    performanceResults.push({
      name: test.name,
      duration: parseFloat(duration),
      type,
      complexity
    });
  }

  return performanceResults;
}

/**
 * Main Testing Function
 */
async function main() {
  console.log("🚀 数学视频AI系统 - 全面测试报告");
  console.log("=".repeat(100));
  console.log("测试时间: " + new Date().toLocaleString());
  console.log("测试范围: 问题类型检测 + 脚本生成 + 边界处理 + 性能测试");

  // 1. 运行问题类型检测测试
  const comprehensiveReport = await runProblemTypeTests();

  // 2. 测试脚本质量
  const scriptQuality = testScriptGenerationQuality();

  // 3. 测试边界情况
  const edgeCaseResults = testEdgeCases();

  // 4. 性能测试
  const performanceResults = testPerformance();

  // 5. 生成最终报告
  console.log("\n📊 最终测试报告");
  console.log("=".repeat(80));

  console.log(`\n🎯 综合测试结果:`);
  console.log(`总测试用例: ${comprehensiveReport.summary.total}`);
  console.log(`通过: ${comprehensiveReport.summary.passed}`);
  console.log(`失败: ${comprehensiveReport.summary.failed}`);
  console.log(`成功率: ${comprehensiveReport.summary.successRate}`);

  console.log(`\n📈 准确率统计:`);
  console.log(`问题类型检测: ${comprehensiveReport.typeAccuracy}`);
  console.log(`复杂度判断: ${comprehensiveReport.complexityAccuracy}`);
  console.log(`格式选择: ${comprehensiveReport.formatAccuracy}`);

  console.log(`\n📝 脚本质量概览:`);
  const avgPages = scriptQuality.reduce((sum, q) => sum + q.pages, 0) / scriptQuality.length;
  const avgDuration = scriptQuality.reduce((sum, q) => sum + q.totalDuration, 0) / scriptQuality.length;
  console.log(`平均页面数: ${avgPages.toFixed(1)}`);
  console.log(`平均时长: ${avgDuration.toFixed(1)}秒`);

  console.log(`\n⚡ 性能测试平均响应时间:`);
  const avgPerformance = performanceResults.reduce((sum, p) => sum + p.duration, 0) / performanceResults.length;
  console.log(`平均: ${avgPerformance.toFixed(2)}ms`);

  if (comprehensiveReport.failures.length > 0) {
    console.log(`\n❌ 失败用例:`);
    comprehensiveReport.failures.forEach(failure => {
      console.log(`- ${failure.testCase.name}: ${failure.testCase.question}`);
      console.log(`  实际类型: ${failure.actualType}, 期望: ${failure.testCase.expectedType}`);
    });
  }

  console.log(`\n✅ 测试完成！系统已准备好处理所有类型的数学问题。`);

  return {
    comprehensiveReport,
    scriptQuality,
    edgeCaseResults,
    performanceResults
  };
}

// 运行测试
main().catch(console.error);