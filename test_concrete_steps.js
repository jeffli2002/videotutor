// 测试具体解题步骤生成功能
import { MathVideoAIService } from './src/services/mathVideoAI.js';

async function testConcreteStepsGeneration() {
  console.log('🧪 开始测试具体解题步骤生成功能...\n');
  
  const mathService = new MathVideoAIService();
  
  // 测试用例
  const testCases = [
    {
      name: '几何问题',
      question: '已知三角形ABC，底边长为6cm，高为4cm，求三角形面积',
      expectedType: 'geometry'
    },
    {
      name: '方程问题',
      question: '解方程：2x + 3 = 7',
      expectedType: 'equation'
    },
    {
      name: '代数问题',
      question: '化简表达式：(x+1)(x-1)',
      expectedType: 'algebra'
    },
    {
      name: '微积分问题',
      question: '求函数f(x)=x²的导数',
      expectedType: 'calculus'
    },
    {
      name: '不等式问题',
      question: '解不等式：2x - 1 > 5',
      expectedType: 'inequality'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`📝 测试用例: ${testCase.name}`);
    console.log(`题目: ${testCase.question}`);
    
    try {
      // 1. 测试问题类型检测
      const detectedType = mathService.detectProblemType(testCase.question);
      console.log(`✅ 检测到问题类型: ${detectedType} (期望: ${testCase.expectedType})`);
      
      // 2. 测试复杂度检测
      const complexity = mathService.detectProblemComplexity(testCase.question);
      console.log(`📊 问题复杂度: ${complexity.complexity}, 分数: ${complexity.score}`);
      
      // 3. 测试解题步骤提取
      const mockSolution = {
        content: `**题目分析**
这是一个${detectedType}问题，需要具体计算。

**解题步骤**
1. **步骤1** 分析题目条件：${testCase.question}
2. **步骤2** 列出相关公式：根据${detectedType}知识
3. **步骤3** 代入数值计算：具体计算过程
4. **步骤4** 得出结果：最终答案
5. **步骤5** 验证答案：检查计算正确性

**最终答案**
具体数值结果

**验证**
用具体数值验证答案的正确性`,
        originalQuestion: testCase.question
      };
      
      const extractedSteps = mathService.extractConcreteSteps(mockSolution.content, testCase.question);
      console.log(`📋 提取的解题步骤数量: ${extractedSteps.length}`);
      extractedSteps.forEach((step, index) => {
        console.log(`   步骤${index + 1}: ${step.substring(0, 60)}...`);
      });
      
      // 4. 测试脚本生成
      const script = await mathService.generateTeachingScript(mockSolution, 'zh', 'educational');
      console.log(`📜 生成的脚本页数: ${script.pages.length}`);
      script.pages.forEach((page, index) => {
        console.log(`   页面${index + 1}: ${page.text.substring(0, 50)}...`);
      });
      
      // 5. 测试动画生成
      console.log('🎬 测试动画生成...');
      const animations = await mathService.generateMathAnimations(mockSolution, script);
      console.log(`🎨 生成的动画数量: ${animations.length}`);
      if (animations.length > 0) {
        const animation = animations[0];
        console.log(`   动画类型: ${animation.animationType}`);
        console.log(`   动画时长: ${animation.duration}秒`);
        console.log(`   动画内容: ${animation.mathContent.substring(0, 80)}...`);
        if (animation.steps) {
          console.log(`   包含步骤数: ${animation.steps.length}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`);
    }
    
    console.log('─'.repeat(80) + '\n');
  }
  
  // 测试具体解题步骤的准确性
  console.log('🔍 测试解题步骤的准确性...\n');
  
  const accuracyTestCases = [
    {
      name: '具体计算步骤',
      content: `**解题步骤**
1. **步骤1** 将方程2x+3=7移项：2x+3-3=7-3，得到2x=4
2. **步骤2** 系数化为1：2x÷2=4÷2，得到x=2
3. **步骤3** 验证答案：将x=2代入原方程，2×2+3=7，等式成立`,
      expectedSteps: 3
    },
    {
      name: '几何计算步骤',
      content: `**解题步骤**
1. **步骤1** 分析题目：三角形底边6cm，高4cm
2. **步骤2** 应用面积公式：面积=底×高÷2=6×4÷2=12cm²
3. **步骤3** 验证计算：6×4=24，24÷2=12，计算正确`,
      expectedSteps: 3
    }
  ];
  
  for (const testCase of accuracyTestCases) {
    console.log(`📝 测试: ${testCase.name}`);
    
    const steps = mathService.extractConcreteSteps(testCase.content, '测试题目');
    console.log(`✅ 提取步骤数: ${steps.length} (期望: ${testCase.expectedSteps})`);
    
    steps.forEach((step, index) => {
      console.log(`   步骤${index + 1}: ${step}`);
    });
    
    // 验证步骤是否包含具体操作
    const hasConcreteOperations = steps.every(step => 
      /\d/.test(step) || /[\+\-\=\×\÷\√]/.test(step) || /(计算|求解|化简|展开|合并|移项|代入)/.test(step)
    );
    
    console.log(`🔍 步骤包含具体操作: ${hasConcreteOperations ? '✅' : '❌'}`);
    console.log('─'.repeat(60) + '\n');
  }
  
  console.log('✅ 具体解题步骤生成功能测试完成！');
}

// 运行测试
testConcreteStepsGeneration().catch(console.error); 