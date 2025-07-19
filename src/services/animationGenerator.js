// 动画生成模块 - 根据问题类型生成不同的动画内容
import { QuestionAnalyzer } from './questionAnalyzer.js'

export class AnimationGenerator {
  constructor() {
    this.questionAnalyzer = new QuestionAnalyzer()
    this.config = {
      manim: {
        endpoint: 'http://localhost:8002/generate-video'
      }
    }
  }

  // 根据问题类型生成相应的动画
  async generateAnimation(question, solution, script, language = 'zh') {
    const analysis = this.questionAnalyzer.analyzeQuestionType(question)
    
    if (analysis.isConcreteProblem) {
      return this.generateConcreteProblemAnimation(question, solution, script, language, analysis)
    } else if (analysis.isTheoreticalQuestion) {
      return this.generateTheoreticalQuestionAnimation(question, solution, script, language, analysis)
    } else {
      return this.generateMixedAnimation(question, solution, script, language, analysis)
    }
  }

  // 生成具体求解问题的动画
  async generateConcreteProblemAnimation(question, solution, script, language, analysis) {
    console.log('🎬 生成具体求解问题动画...')
    
    const steps = this.extractConcreteSteps(solution, question)
    
    try {
      // 生成Manim脚本
      const manimScript = this.buildConcreteProblemManimScript(steps, question)
      
      // 调用Manim服务器生成视频
      const response = await fetch(this.config.manim.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          script: manimScript,
          output_name: `concrete_problem_${Date.now()}`,
          question: question
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.video_path) {
        console.log('✅ 具体问题动画生成成功:', result.video_path)
        return [{
          sceneId: 1,
          animationType: 'concrete_problem',
          videoPath: result.video_path,
          duration: Math.max(20, steps.length * 8),
          mathContent: steps.join('; '),
          steps: steps,
          script: script
        }]
      } else {
        console.warn('❌ 具体问题动画生成失败:', result.error)
        return this.generateStaticVisuals(question, script)
      }
      
    } catch (error) {
      console.error('❌ 具体问题动画生成异常:', error)
      return this.generateStaticVisuals(question, script)
    }
  }

  // 生成理论解释问题的动画
  async generateTheoreticalQuestionAnimation(question, solution, script, language, analysis) {
    console.log('🎬 生成理论解释问题动画...')
    
    const concepts = this.extractTheoreticalConcepts(solution, question)
    
    try {
      // 生成Manim脚本
      const manimScript = this.buildTheoreticalQuestionManimScript(concepts, question)
      
      // 调用Manim服务器生成视频
      const response = await fetch(this.config.manim.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          script: manimScript,
          output_name: `theoretical_question_${Date.now()}`,
          question: question
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.video_path) {
        console.log('✅ 理论问题动画生成成功:', result.video_path)
        return [{
          sceneId: 1,
          animationType: 'theoretical_question',
          videoPath: result.video_path,
          duration: Math.max(25, concepts.length * 10),
          mathContent: concepts.join('; '),
          concepts: concepts,
          script: script
        }]
      } else {
        console.warn('❌ 理论问题动画生成失败:', result.error)
        return this.generateStaticVisuals(question, script)
      }
      
    } catch (error) {
      console.error('❌ 理论问题动画生成异常:', error)
      return this.generateStaticVisuals(question, script)
    }
  }

  // 生成混合类型问题的动画
  async generateMixedAnimation(question, solution, script, language, analysis) {
    console.log('🎬 生成混合类型问题动画...')
    
    // 根据问题内容动态选择动画类型
    if (question.includes('拉窗帘') || question.includes('原理')) {
      return this.generateTheoreticalQuestionAnimation(question, solution, script, language, analysis)
    } else {
      return this.generateConcreteProblemAnimation(question, solution, script, language, analysis)
    }
  }

  // 构建具体问题的Manim脚本
  buildConcreteProblemManimScript(steps, question) {
    const stepsStr = JSON.stringify(steps)
    
    return `from manim import *
import warnings
warnings.filterwarnings("ignore")

config.frame_rate = 30
config.pixel_height = 1080
config.pixel_width = 1920
config.background_color = WHITE

class ConcreteProblemScene(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # 标题
        title = Text("数学题目解答", font_size=32, color=BLUE).to_edge(UP)
        self.play(Write(title), run_time=0.8)
        self.wait(0.3)
        
        # 显示题目
        question_text = Text("${question.substring(0, 50)}${question.length > 50 ? '...' : ''}", 
                           font_size=20, color=BLACK).next_to(title, DOWN, buff=0.5)
        self.play(Write(question_text), run_time=1.0)
        self.wait(1.0)
        
        # 显示解题步骤
        steps = ${stepsStr}
        max_steps = min(len(steps), 6)
        steps = steps[:max_steps]
        
        previous_text = None
        for i, step_text in enumerate(steps):
            step_num = Text(f"步骤 {i+1}", font_size=24, color=BLUE, weight=BOLD)
            step_num.next_to(question_text, DOWN, buff=1.0)
            
            step_content = self.create_step_content(step_text, step_num)
            
            if previous_text:
                self.play(FadeOut(previous_text), run_time=0.6)
            
            self.play(Write(step_num), run_time=1.0)
            self.play(Write(step_content), run_time=1.2)
            
            wait_time = min(max(3.5, len(step_text) * 0.015), 8.0)
            self.wait(wait_time)
            
            previous_text = VGroup(step_num, step_content)
        
        # 总结
        if previous_text:
            self.play(FadeOut(previous_text), run_time=0.8)
        
        summary = Text("解题完成", font_size=28, color=GREEN, weight=BOLD)
        summary.next_to(question_text, DOWN, buff=1.0)
        self.play(Write(summary), run_time=1.0)
        self.wait(2.0)
    
    def create_step_content(self, text, step_num):
        if len(text) > 80:
            words = text.split(' ')
            lines = []
            current_line = ""
            
            for word in words:
                if (current_line + word).length <= 40:
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
                    text_obj.next_to(step_num, DOWN, buff=0.3)
                else:
                    text_obj.next_to(text_objects[i-1], DOWN, buff=0.1)
                text_objects.append(text_obj)
            
            return VGroup(*text_objects)
        else:
            return Text(text, font_size=18, color=BLACK).next_to(step_num, DOWN, buff=0.3)
`
  }

  // 构建理论问题的Manim脚本
  buildTheoreticalQuestionManimScript(concepts, question) {
    const conceptsStr = JSON.stringify(concepts)
    
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

  // 提取具体解题步骤
  extractConcreteSteps(solution, question) {
    let steps = []
    
    if (Array.isArray(solution)) {
      steps = solution
    } else if (typeof solution === 'string') {
      const stepMatches = solution.match(/(\d+)[.、\)]\s*\*\*([^*]+)\*\*\s*([^\n]+)/g)
      if (stepMatches) {
        steps = stepMatches.map(match => {
          const content = match.replace(/^\d+[.、\)]\s*\*\*([^*]+)\*\*\s*/, '$1：')
          return content.trim()
        })
      } else {
        const lines = solution.split('\n').filter(line => 
          line.trim().length > 10 && 
          /[\+\-\=\×\÷\√\d]/.test(line) &&
          !line.includes('**最终答案') &&
          !line.includes('**验证')
        )
        steps = lines.slice(0, 6)
      }
    }
    
    return steps.filter(step => 
      step.length > 10 && 
      (/\d/.test(step) || /[\+\-\=\×\÷\√]/.test(step) || /(计算|求解|化简|展开|合并|移项|代入)/.test(step))
    )
  }

  // 提取理论概念
  extractTheoreticalConcepts(solution, question) {
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

  // 生成静态视觉效果（备用方案）
  generateStaticVisuals(question, script) {
    console.log('📊 生成静态视觉效果...')
    return [{
      sceneId: 1,
      animationType: 'static',
      videoPath: null,
      duration: 15,
      mathContent: question,
      script: script
    }]
  }
} 