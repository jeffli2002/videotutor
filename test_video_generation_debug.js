// 调试视频生成过程
console.log('🔍 调试视频生成过程...\n')

async function testVideoGeneration() {
  const testQuestion = '帮我用视频动画解释勾股定理'
  
  console.log('📝 测试问题:', testQuestion)
  
  // 模拟QWEN API的备用响应
  const fallbackResponse = {
    output: {
      text: `我来帮你解释这个数学概念：

**问题：** ${testQuestion}

**概念分析：**
这是一个数学理论概念的解释问题，需要从以下几个方面来理解：

1. **基本定义** - 理解概念的核心含义
2. **几何意义** - 从图形角度理解
3. **应用场景** - 实际应用和例子
4. **证明过程** - 数学证明和推导

**详细解释：**
由于当前网络连接问题，我无法提供完整的AI解答。

**建议：**
- 请检查网络连接后重试
- 确保问题描述完整清楚
- 如需详细解答，请稍后重试

**注意：** 当前使用备用响应模式，网络恢复后将提供完整AI解答。`
    }
  }
  
  console.log('📄 QWEN API响应内容:')
  console.log(fallbackResponse.output.text)
  
  // 模拟提取理论概念的过程
  const solution = fallbackResponse.output.text
  const concepts = extractTheoreticalConcepts(solution, testQuestion)
  
  console.log('\n🔍 提取的理论概念:')
  console.log(concepts)
  
  if (concepts.length === 0) {
    console.log('❌ 没有提取到有效的理论概念！')
    console.log('💡 这会导致Manim脚本生成失败')
  } else {
    console.log('✅ 成功提取到理论概念')
  }
  
  // 测试Manim脚本生成
  const manimScript = buildTheoreticalQuestionManimScript(concepts, testQuestion)
  console.log('\n📝 生成的Manim脚本长度:', manimScript.length)
  console.log('📝 Manim脚本前200字符:')
  console.log(manimScript.substring(0, 200) + '...')
  
  // 检查脚本是否包含有效内容
  if (manimScript.includes('concepts = []') || manimScript.includes('concepts = [""]')) {
    console.log('❌ Manim脚本包含空的概念数组！')
  } else {
    console.log('✅ Manim脚本包含有效内容')
  }
}

// 模拟extractTheoreticalConcepts函数
function extractTheoreticalConcepts(solution, question) {
  let concepts = []
  
  if (typeof solution === 'string') {
    const paragraphs = solution.split('\n\n').filter(p => 
      p.trim().length > 20 && 
      (p.includes('原理') || p.includes('概念') || p.includes('理解') || p.includes('演示'))
    )
    concepts = paragraphs.slice(0, 4)
  }
  
  if (concepts.length === 0) {
    if (question.includes('拉窗帘')) {
      concepts = [
        '拉窗帘原理是几何学中的一个重要概念，它展示了三角形面积的不变性',
        '当我们沿着三角形的中线剪开并重新组合时，面积保持不变',
        '这个原理帮助我们理解几何变换中的面积守恒',
        '通过动画演示，我们可以直观地看到这个变换过程'
      ]
    } else if (question.includes('勾股定理')) {
      concepts = [
        '勾股定理是直角三角形的基本性质：a² + b² = c²',
        '其中a和b是直角三角形的两条直角边，c是斜边',
        '这个定理在几何学和三角学中有广泛应用',
        '通过动画演示，我们可以直观地理解这个定理'
      ]
    } else {
      concepts = [
        '让我们先理解这个数学概念的基本含义',
        '通过具体的例子来加深理解',
        '掌握这个概念的关键要点',
        '总结一下我们学到的知识'
      ]
    }
  }
  
  return concepts
}

// 模拟buildTheoreticalQuestionManimScript函数
function buildTheoreticalQuestionManimScript(concepts, question) {
  const conceptsStr = JSON.stringify(concepts)
  
  // 检查是否为拉窗帘原理等特殊理论问题
  if (question.includes('拉窗帘') || question.includes('面积不变')) {
    return `# 拉窗帘原理专用脚本...`
  }
  
  return `from manim import *
import warnings
warnings.filterwarnings("ignore")

config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

class TheoreticalQuestionScene(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # 标题
        title = Text("概念理解", font_size=32, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=0.8)
        self.wait(0.3)
        
        # 显示问题
        question_text = Text("${question.substring(0, 50)}${question.length > 50 ? '...' : ''}", 
                           font_size=20, color=BLACK).next_to(title, DOWN, buff=0.5)
        self.play(Write(question_text), run_time=1.0)
        self.wait(1.0)
        
        # 显示概念解释
        concepts = ${conceptsStr}
        max_concepts = min(len(concepts), 4)
        concepts = concepts[:max_concepts]
        
        previous_text = None
        for i, concept_text in enumerate(concepts):
            concept_num = Text(f"概念 {i+1}", font_size=24, color=BLUE, weight=BOLD)
            concept_num.next_to(question_text, DOWN, buff=1.0)
            
            concept_content = self.create_concept_content(concept_text, concept_num)
            
            if previous_text:
                self.play(FadeOut(previous_text), run_time=0.6)
            
            self.play(Write(concept_num), run_time=1.0)
            self.play(Write(concept_content), run_time=1.2)
            
            wait_time = min(max(4.0, len(concept_text) * 0.02), 10.0)
            self.wait(wait_time)
            
            previous_text = VGroup(concept_num, concept_content)
        
        # 总结
        if previous_text:
            self.play(FadeOut(previous_text), run_time=0.8)
        
        summary = Text("概念理解完成", font_size=28, color=GREEN, weight=BOLD)
        summary.next_to(question_text, DOWN, buff=1.0)
        self.play(Write(summary), run_time=1.0)
        self.wait(2.0)
    
    def create_concept_content(self, text, concept_num):
        if len(text) > 100:
            words = text.split(' ')
            lines = []
            current_line = ""
            
            for word in words:
                if (current_line + word).length <= 50:
                    current_line += word + " "
                else:
                    if current_line:
                        lines.append(current_line.strip())
                    current_line = word + " "
            
            if current_line:
                lines.append(current_line.strip())
            
            text_objects = []
            for i, line in enumerate(lines):
                text_obj = Text(line, font_size=18, color=BLACK)
                if i == 0:
                    text_obj.next_to(concept_num, DOWN, buff=0.3)
                else:
                    text_obj.next_to(text_objects[i-1], DOWN, buff=0.1)
                text_objects.append(text_obj)
            
            return VGroup(*text_objects)
        else:
            return Text(text, font_size=18, color=BLACK).next_to(concept_num, DOWN, buff=0.3)
`
}

// 运行测试
testVideoGeneration().catch(console.error) 