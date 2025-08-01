// 测试视频生成修复效果
import { MathVideoAIService } from './src/services/mathVideoAI.js'

// 测试用例1：包含重复步骤的AI响应
const testAIResponseWithDuplicates = `**详细解题步骤**
1. **理解题目** 首先，我们需要理解题目要求：解不等式 3x - 7 > 14
   这是一个一元一次不等式，需要找到x的范围

2. **列出不等式** 根据题目，我们有不等式：3x - 7 > 14
   这是标准的一元一次不等式形式

3. **移项求解** 将常数项7移到等号右边：
   3x - 7 > 14
   3x > 14 + 7
   3x > 21
   解释：通过移项，我们将未知数项和常数项分离

4. **计算得出结果** 通过除以系数3来求解x：
   3x > 21
   x > 21 ÷ 3
   x > 7
   解释：为了求解x，我们需要消除x的系数3

5. **验证答案** 将x = 8代入原不等式验证：
   3(8) - 7 = 24 - 7 = 17 > 14 ✓
   验证正确

**最终答案**
x > 7

**相关数学概念**
一元一次不等式、移项、系数

**常见错误提醒**
注意不等号方向，不要忘记变号
`

// 测试用例2：顺序混乱的步骤
const testAIResponseWithWrongOrder = `**详细解题步骤**
3. **移项求解** 将常数项7移到等号右边：
   3x - 7 > 14
   3x > 14 + 7
   3x > 21

1. **理解题目** 首先，我们需要理解题目要求：解不等式 3x - 7 > 14

5. **验证答案** 将x = 8代入原不等式验证：
   3(8) - 7 = 24 - 7 = 17 > 14 ✓

2. **列出不等式** 根据题目，我们有不等式：3x - 7 > 14

4. **计算得出结果** 通过除以系数3来求解x：
   3x > 21
   x > 21 ÷ 3
   x > 7

**最终答案**
x > 7
`

// 测试用例3：包含重复内容的步骤
const testAIResponseWithRepeatedContent = `**详细解题步骤**
1. **理解题目** 首先，我们需要理解题目要求：解不等式 3x - 7 > 14
   这是一个一元一次不等式，需要找到x的范围

2. **列出不等式** 根据题目，我们有不等式：3x - 7 > 14
   这是标准的一元一次不等式形式

3. **移项求解** 将常数项7移到等号右边：
   3x - 7 > 14
   3x > 14 + 7
   3x > 21

4. **移项求解** 将常数项7移到等号右边：
   3x - 7 > 14
   3x > 14 + 7
   3x > 21

5. **计算得出结果** 通过除以系数3来求解x：
   3x > 21
   x > 21 ÷ 3
   x > 7

6. **计算得出结果** 通过除以系数3来求解x：
   3x > 21
   x > 21 ÷ 3
   x > 7

**最终答案**
x > 7
`

async function testVideoGenerationFix() {
  console.log('🧪 开始测试视频生成修复效果...\n')
  
  const service = new MathVideoAIService()
  
  const testCases = [
    { name: '重复步骤测试', content: testAIResponseWithDuplicates },
    { name: '顺序混乱测试', content: testAIResponseWithWrongOrder },
    { name: '重复内容测试', content: testAIResponseWithRepeatedContent }
  ]
  
  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}`)
    console.log('=' * 50)
    
    try {
      // 测试问题类型分析
      console.log('🔍 测试问题类型分析...')
      const analysis = service.analyzeQuestionType('解不等式 3x - 7 > 14')
      console.log('✅ 问题类型分析成功:', analysis)
      
      // 测试视频生成（不实际渲染）
      console.log('🎬 测试视频生成流程...')
      const videoResult = await service.generateMathVideo('解不等式 3x - 7 > 14', testCase.content, 'zh')
      console.log('✅ 视频生成流程测试成功')
      console.log('📊 结果:', {
        type: videoResult.type,
        success: videoResult.success,
        duration: videoResult.totalDuration,
        animations: videoResult.animations?.length || 0
      })
      
      console.log('\n')
    } catch (error) {
      console.error(`❌ ${testCase.name} 失败:`, error.message)
      console.log('\n')
    }
  }
  
  console.log('🎉 所有测试完成！')
}

// 运行测试
testVideoGenerationFix().catch(console.error) 