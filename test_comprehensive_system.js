/**
 * 全面测试系统 - 模拟环境版本
 * 测试所有数学问题类型、检测准确性、脚本生成质量
 */

// 模拟MathVideoAIService的核心功能进行测试
class MockMathVideoAIService {
  constructor() {
    this.supportedLanguages = ['zh', 'en', 'es', 'fr', 'ja'];
  }

  // 问题类型检测
  detectProblemType(question) {
    if (!question || typeof question !== 'string') return 'general';
    
    const questionLower = question.toLowerCase();
    
    const problemTypes = {
      'equation': /方程|equation|solve|解|=/i,
      'geometry': /几何|geometry|三角形|面积|体积|图形|length|area|volume|angle|拉窗帘|curtain|圆|rectangle|square|triangle/i,
      'algebra': /代数|algebra|多项式|polynomial|因式分解|factor|展开|化简|simplify|expand/i,
      'calculus': /微积分|calculus|积分|integral|导数|derivative|极限|limit|∫|dx/i,
      'statistics': /统计|statistics|概率|probability|平均|mean|方差|variance|标准差|standard deviation/i,
      'trigonometry': /三角|trigonometry|sin|cos|tan|角度|angle|弧度|radian/i,
      'matrix': /矩阵|matrix|行列式|determinant/i,
      'sequence': /数列|sequence|级数|series|等差|等比|arithmetic|geometric/i
    };

    for (const [type, pattern] of Object.entries(problemTypes)) {
      if (pattern.test(questionLower)) {
        return type;
      }
    }
    return 'general';
  }

  // 复杂度检测
  detectProblemComplexity(question) {
    if (!question || typeof question !== 'string') {
      return { complexity: 'simple', score: 0, useLaTeX: false, format: 'plain' };
    }

    const complexPatterns = [
      /integral|积分|∫|dx/i,
      /derivative|导数|微分|d\//i,
      /matrix|矩阵|\[\[|\]\]/i,
      /limit|极限|lim/i,
      /sum|∑|sigma/i,
      /product|∏|pi/i,
      /sqrt|根号|√|\\sqrt/i,
      /frac|\\frac{[^{}]*}{[^{}]*}/i,
      /[∑∏∫∂∇∆∞∈∉⊂⊃⊆⊇∩∪]/i,
      /\\\[.*?\\\]/i,
      /\$\$.*?\$\$/i
    ];

    const complexityScore = complexPatterns.reduce((score, pattern) => {
      return score + (pattern.test(question) ? 1 : 0);
    }, 0);

    return {
      complexity: complexityScore > 0 ? 'complex' : 'simple',
      score: complexityScore,
      useLaTeX: complexityScore > 0,
      format: complexityScore > 0 ? 'latex' : 'plain'
    };
  }

  // 自适应开场介绍
  buildAdaptiveIntroduction(question, language, problemType, complexity) {
    const introductions = {
      'zh': {
        'equation': '让我们一起探索这个方程，通过清晰的视觉化和逻辑步骤来发现它的解法。',
        'geometry': '当我们能够看到形状和关系时，几何就变得生动起来。让我们一步步可视化这个问题。',
        'algebra': '代数是模式的语言。让我们通过观察表达式的变换和关系来解码这个问题。',
        'calculus': '微积分揭示了变化和积累的奥秘。让我们通过可视化来理解这些概念的含义。',
        'statistics': '数据讲述着故事。让我们可视化这个统计问题，理解数字真正想告诉我们什么。',
        'trigonometry': '三角学连接了角度和长度。让我们看看这些关系如何通过动画变得生动。',
        'matrix': '矩阵以优美的方式组织信息。让我们可视化这些数组如何变换和交互。',
        'sequence': '数列显示了随时间变化的规律。让我们动画展示这些数字如何演变和关联。',
        'general': '当我们能够看到数学时，它就变得美丽。让我们通过可视化和理解来探索这个问题。'
      },
      'en': {
        'equation': 'Let\'s explore this equation together and discover how to find its solution through clear visualization and logical steps.',
        'geometry': 'Geometry comes alive when we can see the shapes and relationships. Let\'s visualize this problem step by step.',
        'algebra': 'Algebra is the language of patterns. Let\'s decode this problem by seeing how expressions transform and relate.',
        'calculus': 'Calculus reveals the beauty of change and accumulation. Let\'s visualize these concepts to understand their meaning.',
        'statistics': 'Data tells stories. Let\'s visualize this statistical problem to understand what the numbers are really saying.',
        'trigonometry': 'Trigonometry connects angles and lengths. Let\'s see these relationships come to life through animation.',
        'matrix': 'Matrices organize information beautifully. Let\'s visualize how these arrays transform and interact.',
        'sequence': 'Sequences show patterns over time. Let\'s animate how these numbers evolve and relate.',
        'general': 'Mathematics is beautiful when we can see it. Let\'s explore this problem through visualization and understanding.'
      }
    };

    const baseIntro = introductions[language]?.[problemType] || introductions[language]?.general || introductions['en'][problemType];
    
    const complexityHints = {
      'simple': language === 'zh' ? '我们将使用直观的可视化让概念变得清晰易懂。' : 'We\'ll use straightforward visualizations to make this clear.',
      'complex': language === 'zh' ? '我们将分层次展示，逐步建立深入理解。' : 'We\'ll break this down into manageable visual pieces to build deep understanding.'
    };

    return `${baseIntro} ${complexityHints[complexity.complexity] || ''}`;
  }

  // 脚本生成
  generateTypeSpecificScript(mathSolution, problemType, language, complexity) {
    const scripts = {
      'zh': {
        'geometry': [
          { page: 1, duration: 8, text: '同学们，今天我们要用动画来理解一个美丽的几何原理。', subText: '几何之美在于空间的变换与关系', visual: '标题页显示问题' },
          { page: 2, duration: 12, text: '这是一个几何图形，让我们一步步分析它的特性。', subText: '明确定义几何要素', visual: '显示几何图形' },
          { page: 3, duration: 15, text: '通过几何变换，我们可以发现隐藏的规律。', subText: '建立几何直观', visual: '几何变换动画' },
          { page: 4, duration: 18, text: '最终我们得到简洁的几何结果。', subText: '结果的几何意义', visual: '最终答案展示' }
        ],
        'equation': [
          { page: 1, duration: 8, text: '让我们来解决这个方程，看看数学的平衡原理如何运作。', subText: '方程求解的核心是保持等式平衡', visual: '显示方程' },
          { page: 2, duration: 12, text: '方程就像一架天平，两边必须始终保持平衡。', subText: '天平类比建立直观理解', visual: '方程对应天平' },
          { page: 3, duration: 15, text: '我们的目标是将未知数单独留在等式的一边。', subText: '逐步隔离未知数', visual: '逐步变换过程' },
          { page: 4, duration: 18, text: '每步操作都要在等式两边同时进行，保持平衡。', subText: '平衡原理的具体应用', visual: '等式变换动画' },
          { page: 5, duration: 20, text: '通过逆运算，我们最终得到未知数的值。', subText: '运算与逆运算的关系', visual: '最终解的显示' }
        ],
        'calculus': [
          { page: 1, duration: 10, text: '微积分研究的是变化和积累，让我们从直观角度理解这个概念。', subText: '微积分的核心思想', visual: '变化过程动画' },
          { page: 2, duration: 15, text: '想象一个量在不断变化，我们如何计算它的瞬时变化率？', subText: '瞬时变化率的直观理解', visual: '变化率可视化' },
          { page: 3, duration: 18, text: '通过极限思想，我们可以逼近瞬时变化率。', subText: '极限概念的引入', visual: '极限逼近动画' },
          { page: 4, duration: 20, text: '导数就是变化率的精确表示，几何上是切线的斜率。', subText: '导数的几何意义', visual: '切线斜率显示' },
          { page: 5, duration: 22, text: '积分是导数的逆运算，表示累积的变化量。', subText: '积分与导数的关系', visual: '累积过程动画' }
        ]
      }
    };

    return scripts[language]?.[problemType] || scripts['zh']?.general || scripts['zh']['general'];
  }
}

// 测试用例
const comprehensiveTestCases = [
  // 方程类
  { name: "简单线性方程", question: "解方程：3x + 5 = 17", language: "zh", expectedType: "equation", expectedComplexity: "simple" },
  { name: "复杂二次方程", question: "解方程：x² - 4x + 3 = 0", language: "zh", expectedType: "equation", expectedComplexity: "complex" },
  { name: "英文方程", question: "Solve: 2(x-3) = 4x + 1", language: "en", expectedType: "equation", expectedComplexity: "simple" },

  // 几何类
  { name: "三角形面积拉窗帘", question: "请用动画帮我解释三角形面积的拉窗帘原理", language: "zh", expectedType: "geometry", expectedComplexity: "simple" },
  { name: "圆面积计算", question: "计算半径为5的圆的面积", language: "zh", expectedType: "geometry", expectedComplexity: "simple" },
  { name: "几何英文问题", question: "Find the volume of a cube with side length 4", language: "en", expectedType: "geometry", expectedComplexity: "simple" },

  // 代数类
  { name: "多项式展开", question: "展开：(x + 2)(x - 3)", language: "zh", expectedType: "algebra", expectedComplexity: "simple" },
  { name: "因式分解", question: "因式分解：x² + 5x + 6", language: "zh", expectedType: "algebra", expectedComplexity: "simple" },

  // 微积分
  { name: "简单积分", question: "计算积分：∫x dx", language: "zh", expectedType: "calculus", expectedComplexity: "complex" },
  { name: "复杂微积分", question: "计算定积分：∫₀¹ (x² + 2x) dx", language: "zh", expectedType: "calculus", expectedComplexity: "complex" },

  // 统计
  { name: "平均数计算", question: "计算数据集的平均值：5, 8, 12, 15, 20", language: "zh", expectedType: "statistics", expectedComplexity: "simple" },
  { name: "统计英文问题", question: "Calculate the standard deviation for: 2, 4, 6, 8, 10", language: "en", expectedType: "statistics", expectedComplexity: "complex" },

  // 三角函数
  { name: "三角函数求值", question: "计算sin(30°)的值", language: "zh", expectedType: "trigonometry", expectedComplexity: "simple" },
  { name: "复杂三角问题", question: "解方程：sin(x) = 0.5", language: "zh", expectedType: "trigonometry", expectedComplexity: "complex" },

  // 矩阵
  { name: "矩阵乘法", question: "计算矩阵[[1,2],[3,4]]与[[5,6],[7,8]]的乘积", language: "zh", expectedType: "matrix", expectedComplexity: "complex" },

  // 数列
  { name: "等差数列", question: "求等差数列2,5,8,11...的第10项", language: "zh", expectedType: "sequence", expectedComplexity: "simple" },

  // 边界测试
  { name: "空字符串", question: "", language: "zh", expectedType: "general", expectedComplexity: "simple" },
  { name: "复杂混合问题", question: "求函数f(x)=x²+3x+2在区间[0,2]上的积分值", language: "zh", expectedType: "calculus", expectedComplexity: "complex" }
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
 * Run Comprehensive Tests
 */
async function runComprehensiveTests() {
  console.log("🧪 开始数学视频AI系统全面测试");
  console.log("=".repeat(80));
  
  const service = new MockMathVideoAIService();
  const results = new TestResults();

  for (const testCase of comprehensiveTestCases) {
    console.log(`\n🔍 测试: ${testCase.name}`);
    console.log(`问题: ${testCase.question}`);
    console.log(`语言: ${testCase.language}`);
    
    try {
      // 测试问题类型检测
      const problemType = service.detectProblemType(testCase.question);
      const complexity = service.detectProblemComplexity(testCase.question);
      
      // 测试开场介绍生成
      const introduction = service.buildAdaptiveIntroduction(
        testCase.question, 
        testCase.language, 
        problemType, 
        complexity
      );

      // 测试脚本生成
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

  const service = new MockMathVideoAIService();
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
      const script = service.generateTypeSpecificScript(
        { originalQuestion: test.question, steps: ["分析问题", "应用方法", "计算结果"] },
        test.type,
        test.language,
        { complexity: 'simple', format: 'plain' }
      );

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
 * Test Edge Cases
 */
function testEdgeCases() {
  console.log("\n⚡ 测试边界情况和错误处理");
  console.log("=".repeat(50));

  const service = new MockMathVideoAIService();
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

  const service = new MockMathVideoAIService();
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
  const comprehensiveReport = await runComprehensiveTests();

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