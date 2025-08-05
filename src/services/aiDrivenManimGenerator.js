// AI-Driven Manim Script Generator
export class AIDrivenManimGenerator {
  constructor() {
    this.kimiApiUrl = 'http://localhost:3001/api/kimi/chat';
  }
  
  getColorDefinitions() {
    return `# Explicitly define colors for visibility
WHITE = "#FFFFFF"
BLACK = "#000000"
BLUE = "#0066CC"
BLUE_D = "#003366"
GREEN = "#00AA00"
DARK_GRAY = "#404040"
LIGHT_GRAY = "#808080"`;
  }

  async generateManimScript(question, solution, duration = 20) {
    console.log('🤖 Using AI to generate Manim script dynamically...');
    
    try {
      // Extract steps from solution
      const steps = this.extractSteps(solution);
      const hasChineseChars = /[\u4e00-\u9fa5]/.test(question + solution);
      
      // Determine script complexity based on problem size
      const totalTextLength = question.length + solution.length;
      const stepCount = steps.length;
      
      console.log(`📊 Problem complexity: ${totalTextLength} chars, ${stepCount} steps`);
      
      // Choose appropriate generator based on complexity
      // More aggressive simplification to avoid timeouts
      if (totalTextLength > 1500 || stepCount > 4) {
        console.log('⚡ Using ultra-simplified script for complex problem');
        return this.generateUltraSimplifiedScript(question, steps, duration, hasChineseChars);
      } else if (totalTextLength > 800 || stepCount > 2) {
        console.log('🎯 Using simplified script for medium problem');
        return this.generateOptimizedSimplifiedScript(question, steps, duration, hasChineseChars);
      } else {
        console.log('🎨 Using ultra-simplified script for all problems to ensure reliability');
        // For now, use ultra-simplified for everything to ensure no timeouts
        return this.generateUltraSimplifiedScript(question, steps, duration, hasChineseChars);
      }
    } catch (error) {
      console.error('❌ AI-driven generation failed:', error);
      return this.generateBasicManimScript(question, solution, duration);
    }
  }
  
  extractSteps(solution) {
    const steps = [];
    
    // Split by step markers (第X步 or 步骤X or just numbers)
    const lines = solution.split('\n');
    let currentStep = null;
    let currentContent = [];
    
    for (const line of lines) {
      // Check if this is a step header
      const stepMatch = line.match(/^(第?\d+步?|步骤\s*\d+)[，,、.\s]*(.*)$/);
      
      if (stepMatch) {
        // Save previous step if exists
        if (currentStep) {
          const expressions = this.extractMathExpressions(currentContent.join('\n'));
          steps.push({
            title: currentStep.title,
            content: currentContent.join('\n'),
            expressions: expressions
          });
        }
        
        // Start new step
        currentStep = {
          title: stepMatch[2].replace(/[*：:]/g, '').replace(/[\[\]]/g, '').trim() || stepMatch[0]
        };
        currentContent = [];
      } else if (currentStep) {
        // Add to current step content
        currentContent.push(line);
      }
    }
    
    // Don't forget the last step
    if (currentStep) {
      const expressions = this.extractMathExpressions(currentContent.join('\n'));
      steps.push({
        title: currentStep.title,
        content: currentContent.join('\n'),
        expressions: expressions
      });
    }
    
    // Also extract final answer
    const answerPattern = /\*?\*?最终答案\*?\*?[：:]?\s*/;
    const answerMatch = solution.match(answerPattern);
    if (answerMatch) {
      const answerIndex = solution.indexOf(answerMatch[0]);
      const answerSection = solution.substring(answerIndex + answerMatch[0].length);
      const answerExpressions = this.extractMathExpressions(answerSection.split('\n')[0]);
      
      // If no LaTeX expressions found, look for plain text result
      if (answerExpressions.length === 0) {
        const plainResultMatch = answerSection.match(/([a-zA-Z]\s*[<>≤≥]\s*[\d.]+)/);
        if (plainResultMatch) {
          answerExpressions.push(plainResultMatch[1]);
        }
      }
      
      if (answerExpressions.length > 0) {
        steps.push({
          title: '最终答案',
          content: '',
          expressions: answerExpressions
        });
      }
    }
    
    return steps;
  }
  
  extractMathExpressions(text) {
    const expressions = [];
    
    // Clean up the text first to handle tab characters and other issues
    const cleanedText = text.replace(/\t/g, '\\t'); // Replace tabs with \t
    
    // Match both \[...\] and \(...\) patterns
    const mathPatterns = [
      /\\?\[([^\]]+)\\?\]/g,  // LaTeX display style
      /\\\(([^)]+)\\\)/g      // LaTeX inline style  
    ];
    
    mathPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(cleanedText)) !== null) {
        // Clean up the extracted expression
        let expr = match[1]
          .replace(/\\t/g, '\\t') // Restore \t as LaTeX command
          .trim();
        
        // Remove any leading numbers that might be step numbers
        expr = expr.replace(/^\d+\s+/, '');
        
        // Evaluate simple fractions to final results
        expr = this.evaluateFractions(expr);
        
        expressions.push(expr);
      }
    });
    
    // Remove duplicates
    return [...new Set(expressions)];
  }
  
  evaluateFractions(expr) {
    // Check for patterns like "x > 216/3" and calculate the result
    const fractionPattern = /([a-zA-Z]+\s*[<>≤≥]\s*)(\d+)\s*\/\s*(\d+)/;
    const match = expr.match(fractionPattern);
    
    if (match) {
      const variable = match[1];
      const numerator = parseInt(match[2]);
      const denominator = parseInt(match[3]);
      
      if (denominator !== 0) {
        const result = numerator / denominator;
        // If it's a whole number, show it as such
        if (result === Math.floor(result)) {
          return `${variable}${result}`;
        } else {
          // For mixed fractions, show as "49\\frac{1}{3}" format
          const whole = Math.floor(result);
          const remainder = numerator % denominator;
          if (whole > 0 && remainder > 0) {
            return `${variable}${whole}\\\\frac{${remainder}}{${denominator}}`;
          }
        }
      }
    }
    
    return expr;
  }
  
  cleanContentForDisplay(text) {
    if (!text) return '';
    
    // Extract only the Chinese explanation text, removing all math
    let cleanText = text
      // Remove display math \[...\] including brackets
      .replace(/\\\[([^\]]+)\\\]/g, '')
      .replace(/\[([^\]]+)\]/g, '') // Also remove plain brackets
      // Remove inline math \(...) including parentheses
      .replace(/\\\(([^)]+)\\\)/g, '')
      // Remove any remaining LaTeX commands with their content
      .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
      .replace(/\\[a-zA-Z]+/g, '')
      // Clean up extra spaces and special characters
      .replace(/\*+/g, '') // Remove asterisks
      .replace(/[：:]\s*$/g, '') // Remove trailing colons
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract only the explanation part (usually after 解释：)
    const explanationMatch = cleanText.match(/解释[：:](.+)/);
    if (explanationMatch) {
      cleanText = explanationMatch[1].trim();
    } else {
      // If no explanation found, check if it's all math/symbols
      if (!/[\u4e00-\u9fa5]/.test(cleanText)) {
        // No Chinese characters, probably just math remnants
        cleanText = '';
      }
    }
    
    // Further clean to remove any remaining math-like content
    cleanText = cleanText
      .replace(/[a-zA-Z0-9\s]*[×x]\s*[a-zA-Z0-9\s]*=/g, '') // Remove expressions like "3x × x ="
      .replace(/\d+x\^\d+/g, '') // Remove terms like "3x^2"
      .replace(/[+-]\s*\d+x/g, '') // Remove terms like "+3x" or "-12x"
      .replace(/[+-]\s*\d+/g, '') // Remove standalone numbers like "-84"
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleanText;
  }

  generateAdvancedManimScript(question, steps, duration, hasChineseChars) {
    const fontChoice = hasChineseChars ? 'SimHei' : 'Arial';
    const stepDuration = duration / (steps.length + 2); // +2 for intro and conclusion
    
    // Escape strings for Python
    const escapeForPython = (str) => {
      if (!str) return '';
      return str.replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/'/g, "\\'")
                .replace(/\n/g, ' ')  // Replace newlines with spaces
                .replace(/\r/g, '')
                .trim();
    };
    
    // Special escaping for math expressions in MathTex
    const escapeMathExpr = (expr) => {
      if (!expr) return '';
      // First trim any trailing/leading spaces
      expr = expr.trim();
      // Remove any trailing backslashes followed by spaces
      expr = expr.replace(/\\\s*$/, '');
      // Escape backslashes properly for Python string
      expr = expr.replace(/\\/g, '\\\\');
      // Escape quotes
      expr = expr.replace(/"/g, '\\"');
      expr = expr.replace(/'/g, "\\'");
      return expr;
    };
    
    const escapedQuestion = escapeForPython(question);
    
    return `from manim import *
import numpy as np

# Explicitly define colors for visibility
WHITE = "#FFFFFF"
BLACK = "#000000"
BLUE = "#0066CC"
BLUE_D = "#003366"
GREEN = "#00AA00"
DARK_GRAY = "#404040"
LIGHT_GRAY = "#808080"

class MathSolution(Scene):
    def construct(self):
        # Configuration
        self.camera.background_color = WHITE
        
        # Create subtitle area at the bottom (smaller, better positioned)
        subtitle_bg = Rectangle(
            width=config.frame_width,
            height=0.6,  # Reduced height for subtitles
            fill_color=BLACK,
            fill_opacity=0.85,
            stroke_width=0
        ).to_edge(DOWN, buff=0)
        
        # Subtitle text that will be updated
        self.subtitle = Text("", 
                           font="${fontChoice}",
                           font_size=20,  # Smaller font for subtitles
                           color=WHITE).move_to(subtitle_bg.get_center())
        
        # Add subtitle background and text to scene
        self.add(subtitle_bg, self.subtitle)
        
        # Title (positioned at top with proper spacing)
        title = Text("${escapedQuestion}", 
                    font="${fontChoice}",
                    color=BLUE,
                    font_size=32,  # Slightly smaller title
                    weight=BOLD).to_edge(UP, buff=0.3)
        
        # Opening animation
        self.update_subtitle("${escapedQuestion}")
        self.play(Write(title))
        self.wait(${stepDuration})
        
        # Main content area with proper bounds
        content_top = title.get_bottom()[1] - 0.4
        content_bottom = subtitle_bg.get_top()[1] + 0.2
        content_height = content_top - content_bottom
        
        # Track all content groups for smooth transitions
        all_steps = VGroup()
        
${steps.map((step, index) => {
        const cleanTitle = escapeForPython(step.title);
        const shortTitle = cleanTitle.length > 50 ? cleanTitle.substring(0, 47) + '...' : cleanTitle;
        return `        # Step ${index + 1}: ${shortTitle}
        self.update_subtitle("步骤 ${index + 1}: ${shortTitle}")
        
        # Create step group to manage as unit
        step${index + 1}_group = VGroup()
        
        # Step title with proper spacing
        step${index + 1}_title = Text("步骤 ${index + 1}: ${shortTitle}", 
                                    font="${fontChoice}",
                                    color=BLUE_D,
                                    font_size=24,  # Smaller step titles
                                    weight=MEDIUM)
        
        # Mathematical expressions for this step
${step.expressions.map((expr, exprIndex) => {
          const escapedExpr = escapeMathExpr(expr);
          return `        expr${index + 1}_${exprIndex + 1} = MathTex("${escapedExpr}", 
                                     color=BLACK, 
                                     font_size=28)  # Smaller math`;
        }).join('\n')}
        
        # Arrange step content vertically
        step${index + 1}_group.add(step${index + 1}_title)
${step.expressions.map((expr, exprIndex) => `        step${index + 1}_group.add(expr${index + 1}_${exprIndex + 1})`).join('\n')}
        step${index + 1}_group.arrange(DOWN, buff=0.3)
        
        # Position relative to previous content or start
        if len(all_steps) == 0:
            step${index + 1}_group.next_to(title, DOWN, buff=0.5)
        else:
            # Check if we need to clear screen for new content
            last_bottom = all_steps[-1].get_bottom()[1]
            step_height = step${index + 1}_group.get_height()
            
            if last_bottom - step_height - 0.4 < content_bottom:
                # Fade out previous content to make room
                self.play(FadeOut(all_steps), run_time=0.5)
                all_steps = VGroup()  # Reset content
                step${index + 1}_group.next_to(title, DOWN, buff=0.5)
            else:
                step${index + 1}_group.next_to(all_steps[-1], DOWN, buff=0.4)
        
        # Animate step appearance
        self.play(FadeIn(step${index + 1}_group), run_time=0.8)
        all_steps.add(step${index + 1}_group)
        
        self.wait(${stepDuration})
`;}).join('\n')}
        
        # Final emphasis on answer
        if len(all_steps) > 0:
            # Find the last mathematical expression
            last_step = all_steps[-1]
            if len(last_step) > 1:  # Has math expressions
                last_expr = last_step[-1]
                self.update_subtitle("最终答案")
                self.play(
                    last_expr.animate.scale(1.3).set_color(GREEN),
                    run_time=1
                )
        
        self.wait(2)
    
    def update_subtitle(self, text):
        """Update subtitle with smooth transition"""
        # Clean and truncate text for subtitle display
        clean_text = text.replace("\\n", " ").strip()
        if len(clean_text) > 100:
            clean_text = clean_text[:97] + "..."
            
        new_subtitle = Text(clean_text,
                           font="${fontChoice}",
                           font_size=20,
                           color=WHITE).move_to(self.subtitle.get_center())
        
        # Ensure subtitle fits within bounds
        if new_subtitle.get_width() > config.frame_width - 0.5:
            new_subtitle.scale((config.frame_width - 0.5) / new_subtitle.get_width())
        
        self.play(
            FadeOut(self.subtitle, run_time=0.2),
            FadeIn(new_subtitle, run_time=0.2),
            run_time=0.3
        )
        self.remove(self.subtitle)
        self.subtitle = new_subtitle`;
  }

  generateSuperSimplifiedScript(question, steps, duration, hasChineseChars) {
    const fontChoice = hasChineseChars ? 'SimHei' : 'Arial';
    const escapeStr = (str) => {
      if (!str) return '';
      return str.replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/'/g, "\\'")
                .replace(/\n/g, ' ')
                .replace(/\r/g, '')
                .trim();
    };
    
    // Special escaping for math expressions in MathTex
    const escapeMathExpr = (expr) => {
      if (!expr) return '';
      // First trim any trailing/leading spaces
      expr = expr.trim();
      // Remove any trailing backslashes followed by spaces
      expr = expr.replace(/\\\s*$/, '');
      // Escape backslashes properly for Python string
      expr = expr.replace(/\\/g, '\\\\');
      // Escape quotes
      expr = expr.replace(/"/g, '\\"');
      expr = expr.replace(/'/g, "\\'");
      return expr;
    };
    
    // Only show key steps with math expressions
    const keySteps = steps.filter(step => step.expressions && step.expressions.length > 0).slice(0, 3);
    
    let stepContent = '';
    keySteps.forEach((step, index) => {
      const title = escapeStr(step.title).substring(0, 30);
      const expr = step.expressions[0] ? escapeMathExpr(step.expressions[0]) : '';
      
      stepContent += `
        # Step ${index + 1}
        step${index + 1} = Text("${title}", font="${fontChoice}", color=BLUE_D, font_size=24)
        step${index + 1}.shift(UP * ${2 - index * 1.5})
        self.play(Write(step${index + 1}), run_time=0.5)
        
        ${expr ? `expr${index + 1} = MathTex("${expr}", color=BLACK, font_size=32)
        expr${index + 1}.next_to(step${index + 1}, DOWN)
        self.play(Write(expr${index + 1}), run_time=0.5)` : ''}
        
        self.wait(2)
`;
    });
    
    return `from manim import *

# Explicitly define colors for visibility
WHITE = "#FFFFFF"
BLACK = "#000000"
BLUE = "#0066CC"
BLUE_D = "#003366"
GREEN = "#00AA00"
DARK_GRAY = "#404040"
LIGHT_GRAY = "#808080"

class MathSolution(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # Title
        title = Text("${escapeStr(question)}", font="${fontChoice}", color=BLUE, font_size=30).to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        ${stepContent}
        
        # End
        self.wait(2)`;
  }

  generateWaterfallManimScript(question, steps, duration, hasChineseChars) {
    const fontChoice = hasChineseChars ? 'SimHei' : 'Arial';
    const stepDuration = Math.max(1.5, (duration - 4) / (steps.length + 1));
    
    // Helper to escape strings
    const escapeStr = (str) => {
      if (!str) return '';
      return str.replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/'/g, "\\'")
                .replace(/\n/g, ' ')
                .replace(/\r/g, '')
                .trim();
    };
    
    // Special escaping for math expressions in MathTex
    const escapeMathExpr = (expr) => {
      if (!expr) return '';
      expr = expr.trim();
      expr = expr.replace(/\\\s*$/, '');
      expr = expr.replace(/\\/g, '\\\\');
      expr = expr.replace(/"/g, '\\"');
      expr = expr.replace(/'/g, "\\'");
      return expr;
    };
    
    // Limit to prevent timeout - show at most 5 steps with waterfall
    const displaySteps = steps.slice(0, 5);
    
    return `from manim import *

# Explicitly define colors for visibility
WHITE = "#FFFFFF"
BLACK = "#000000"
BLUE = "#0066CC"
BLUE_D = "#003366"
GREEN = "#00AA00"
DARK_GRAY = "#404040"
LIGHT_GRAY = "#808080"

class MathSolution(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # Subtitle area
        subtitle_bg = Rectangle(
            width=config.frame_width,
            height=0.8,
            fill_color=BLACK,
            fill_opacity=0.85,
            stroke_width=0
        ).to_edge(DOWN, buff=0)
        
        self.subtitle = Text("", 
                           font="${fontChoice}",
                           font_size=22,
                           color=WHITE).move_to(subtitle_bg.get_center())
        
        self.add(subtitle_bg, self.subtitle)
        
        # Title
        title = Text("${escapeStr(question)}",
                    font="${fontChoice}",
                    color=BLUE,
                    font_size=32,
                    weight=BOLD).to_edge(UP, buff=0.3)
        
        self.update_subtitle("${escapeStr(question)}")
        self.play(Write(title), run_time=0.6)
        self.wait(1)
        
        # Content boundaries
        content_top = title.get_bottom()[1] - 0.3
        content_bottom = subtitle_bg.get_top()[1] + 0.2
        
        # All content tracking
        all_content = VGroup()
        
${displaySteps.map((step, index) => {
  const stepTitle = escapeStr(step.title);
  const shortTitle = stepTitle.length > 35 ? stepTitle.substring(0, 32) + '...' : stepTitle;
  const cleanedContent = this.cleanContentForDisplay(step.content);
  const cleanContent = escapeStr(cleanedContent);
  
  let stepCode = `        # Step ${index + 1}
        self.update_subtitle("步骤 ${index + 1}: ${shortTitle}")
        step${index + 1}_group = VGroup()
        
        # Title
        step${index + 1}_title = Text("步骤 ${index + 1}: ${shortTitle}",
                                     font="${fontChoice}",
                                     color=BLUE_D,
                                     font_size=24)
        step${index + 1}_group.add(step${index + 1}_title)
`;

  // Add only first math expression to save space
  if (step.expressions && step.expressions.length > 0) {
    const expr = step.expressions[0];
    const escapedExpr = escapeMathExpr(expr);
    stepCode += `
        expr${index + 1} = MathTex("${escapedExpr}",
                                 color=BLACK,
                                 font_size=32)
        step${index + 1}_group.add(expr${index + 1})
`;
  }
  
  // Add short explanation if exists
  if (cleanContent && cleanContent.length > 0) {
    const shortContent = cleanContent.length > 60 ? cleanContent.substring(0, 57) + '...' : cleanContent;
    if (shortContent.length > 0) {
      stepCode += `
        explanation${index + 1} = Text("${shortContent}",
                                      font="${fontChoice}",
                                      color=DARK_GRAY,
                                      font_size=16)
        step${index + 1}_group.add(explanation${index + 1})
`;
    }
  }

  stepCode += `
        step${index + 1}_group.arrange(DOWN, buff=0.25)
        
        # Position with waterfall
        if len(all_content) == 0:
            step${index + 1}_group.next_to(title, DOWN, buff=0.4)
        else:
            last_bottom = all_content[-1].get_bottom()[1]
            new_height = step${index + 1}_group.get_height()
            
            if last_bottom - new_height - 0.3 < content_bottom:
                # Waterfall scroll
                scroll_distance = new_height + 0.4
                step${index + 1}_group.next_to(all_content[-1], DOWN, buff=0.3)
                
                self.play(
                    all_content.animate.shift(UP * scroll_distance),
                    run_time=0.5
                )
                
                # Remove items that scrolled too high
                to_remove = []
                for obj in all_content:
                    if obj.get_top()[1] > content_top:
                        to_remove.append(obj)
                
                for obj in to_remove:
                    all_content.remove(obj)
                    self.remove(obj)
            else:
                step${index + 1}_group.next_to(all_content[-1], DOWN, buff=0.3)
        
        all_content.add(step${index + 1}_group)
        self.play(FadeIn(step${index + 1}_group, shift=DOWN*0.2), run_time=0.4)
        self.wait(${Math.min(stepDuration, 2)})
`;
  
  return stepCode;
}).join('\n')}
        
        # Final emphasis
        self.update_subtitle("完成！")
        
        # Highlight last math expression
        if len(all_content) > 0:
            for obj in reversed(all_content):
                found = False
                if isinstance(obj, VGroup):
                    for item in obj:
                        if isinstance(item, MathTex):
                            self.play(
                                item.animate.scale(1.15).set_color(GREEN),
                                run_time=0.5
                            )
                            found = True
                            break
                if found:
                    break
        
        self.wait(2)
    
    def update_subtitle(self, text):
        """Update subtitle with smooth transition"""
        clean_text = text.replace("\\n", " ").strip()
        if len(clean_text) > 100:
            clean_text = clean_text[:97] + "..."
            
        new_subtitle = Text(clean_text,
                           font="${fontChoice}",
                           font_size=22,
                           color=WHITE).move_to(self.subtitle.get_center())
        
        if new_subtitle.get_width() > config.frame_width - 0.5:
            new_subtitle.scale((config.frame_width - 0.5) / new_subtitle.get_width())
        
        self.play(
            FadeOut(self.subtitle, run_time=0.1),
            FadeIn(new_subtitle, run_time=0.1),
            run_time=0.15
        )
        self.remove(self.subtitle)
        self.subtitle = new_subtitle`;
  }

  generateSimplifiedManimScript(question, steps, duration, hasChineseChars) {
    const fontChoice = hasChineseChars ? 'SimHei' : 'Arial';
    const stepDuration = Math.max(2, (duration - 4) / (steps.length + 1));
    
    // Helper to escape strings
    const escapeStr = (str) => {
      if (!str) return '';
      return str.replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/'/g, "\\'")
                .replace(/\n/g, ' ')
                .replace(/\r/g, '')
                .trim();
    };
    
    // Special escaping for math expressions in MathTex
    const escapeMathExpr = (expr) => {
      if (!expr) return '';
      // First trim any trailing/leading spaces
      expr = expr.trim();
      // Remove any trailing backslashes followed by spaces
      expr = expr.replace(/\\\s*$/, '');
      // Escape backslashes properly for Python string
      expr = expr.replace(/\\/g, '\\\\');
      // Escape quotes
      expr = expr.replace(/"/g, '\\"');
      expr = expr.replace(/'/g, "\\'");
      return expr;
    };
    
    return `from manim import *

# Explicitly define colors for visibility
WHITE = "#FFFFFF"
BLACK = "#000000"
BLUE = "#0066CC"
BLUE_D = "#003366"
GREEN = "#00AA00"
DARK_GRAY = "#404040"
LIGHT_GRAY = "#808080"

class MathSolution(Scene):
    def construct(self):
        # White background
        self.camera.background_color = WHITE
        
        # Create subtitle area at bottom
        subtitle_bg = Rectangle(
            width=config.frame_width,
            height=0.8,
            fill_color=BLACK,
            fill_opacity=0.85,
            stroke_width=0
        ).to_edge(DOWN, buff=0)
        
        # Subtitle text placeholder
        self.subtitle = Text("", 
                           font="${fontChoice}",
                           font_size=22,
                           color=WHITE).move_to(subtitle_bg.get_center())
        
        # Add subtitle background and text
        self.add(subtitle_bg, self.subtitle)
        
        # Title
        title = Text("${escapeStr(question)}",
                    font="${fontChoice}",
                    color=BLUE,
                    font_size=36,
                    weight=BOLD).to_edge(UP, buff=0.5)
        
        # Update subtitle and show title
        self.update_subtitle("${escapeStr(question)}")
        self.play(Write(title))
        self.wait(2)
        
        # Main content area
        content_top = title.get_bottom()[1] - 0.5
        content_bottom = subtitle_bg.get_top()[1] + 0.3
        
        # Track current content
        current_content = VGroup()
        
${steps.map((step, index) => {
  const stepTitle = escapeStr(step.title);
  const shortTitle = stepTitle.length > 40 ? stepTitle.substring(0, 37) + '...' : stepTitle;
  const cleanedContent = this.cleanContentForDisplay(step.content);
  const cleanContent = escapeStr(cleanedContent);
  
  let stepCode = `        # Step ${index + 1}: ${shortTitle}
        self.update_subtitle("步骤 ${index + 1}: ${shortTitle}")
        
        # Create step group
        step${index + 1}_group = VGroup()
        
        # Step title
        step${index + 1}_title = Text("步骤 ${index + 1}: ${shortTitle}",
                                     font="${fontChoice}",
                                     color=BLUE_D,
                                     font_size=28,
                                     weight=BOLD)
        step${index + 1}_group.add(step${index + 1}_title)
`;

  // Add mathematical expressions (remove duplicates)
  if (step.expressions && step.expressions.length > 0) {
    const uniqueExpressions = [...new Set(step.expressions)];
    uniqueExpressions.forEach((expr, exprIndex) => {
      const escapedExpr = escapeMathExpr(expr);
      stepCode += `
        # Math expression ${exprIndex + 1}
        expr${index + 1}_${exprIndex + 1} = MathTex("${escapedExpr}",
                                        color=BLACK,
                                        font_size=36)
        step${index + 1}_group.add(expr${index + 1}_${exprIndex + 1})
`;
    });
  }
  
  // Add explanation text if content exists
  if (cleanContent && cleanContent.length > 0) {
    const shortContent = cleanContent.length > 100 ? cleanContent.substring(0, 97) + '...' : cleanContent;
    if (shortContent.length > 0) {
      stepCode += `
        # Explanation
        explanation${index + 1} = Text("${shortContent}",
                                      font="${fontChoice}",
                                      color=DARK_GRAY,
                                      font_size=20)
        step${index + 1}_group.add(explanation${index + 1})
`;
    }
  }

  stepCode += `
        # Arrange vertically
        step${index + 1}_group.arrange(DOWN, buff=0.4)
        
        # Position on screen
        if len(current_content) > 0:
            # Check if we need to clear screen
            bottom = current_content[-1].get_bottom()[1]
            new_height = step${index + 1}_group.get_height()
            
            if bottom - new_height - 0.5 < content_bottom:
                # Clear previous content
                self.play(FadeOut(current_content), run_time=0.5)
                current_content = VGroup()
                step${index + 1}_group.move_to(ORIGIN).shift(UP * 0.5)
            else:
                step${index + 1}_group.next_to(current_content, DOWN, buff=0.5)
        else:
            step${index + 1}_group.move_to(ORIGIN).shift(UP * 0.5)
        
        # Animate
        self.play(FadeIn(step${index + 1}_group), run_time=0.5)
        current_content.add(step${index + 1}_group)
        self.wait(${Math.min(stepDuration, 3)})
`;
  
  return stepCode;
}).join('\n')}
        
        # Final emphasis
        self.update_subtitle("完成！")
        
        # Highlight final answer if exists
        if len(current_content) > 0:
            for obj in current_content:
                if isinstance(obj, VGroup) and len(obj) > 1:
                    for item in obj:
                        if isinstance(item, MathTex):
                            self.play(
                                item.animate.scale(1.2).set_color(GREEN),
                                run_time=0.8
                            )
                            break
        
        self.wait(2)
    
    def update_subtitle(self, text):
        """Update subtitle with smooth transition"""
        clean_text = text.replace("\\n", " ").strip()
        if len(clean_text) > 120:
            clean_text = clean_text[:117] + "..."
            
        new_subtitle = Text(clean_text,
                           font="${fontChoice}",
                           font_size=22,
                           color=WHITE).move_to(self.subtitle.get_center())
        
        # Ensure subtitle fits
        if new_subtitle.get_width() > config.frame_width - 0.5:
            new_subtitle.scale((config.frame_width - 0.5) / new_subtitle.get_width())
        
        self.play(
            FadeOut(self.subtitle, run_time=0.2),
            FadeIn(new_subtitle, run_time=0.2),
            run_time=0.3
        )
        self.remove(self.subtitle)
        self.subtitle = new_subtitle`;
  }

  generateOptimizedSimplifiedScript(question, steps, duration, hasChineseChars) {
    const fontChoice = hasChineseChars ? 'SimHei' : 'Arial';
    const stepDuration = Math.max(1.5, (duration - 4) / Math.min(steps.length, 4));
    
    const escapeStr = (str) => {
      if (!str) return '';
      return str.replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/'/g, "\\'")
                .replace(/\n/g, ' ')
                .trim();
    };
    
    const escapeMathExpr = (expr) => {
      if (!expr) return '';
      expr = expr.trim();
      expr = expr.replace(/\\\s*$/, '');
      expr = expr.replace(/\\/g, '\\\\');
      expr = expr.replace(/"/g, '\\"');
      return expr;
    };
    
    // Show at most 4 key steps with minimal animations
    const keySteps = steps.filter(step => step.expressions && step.expressions.length > 0).slice(0, 4);
    
    return `from manim import *

# Explicitly define colors for visibility
WHITE = "#FFFFFF"
BLACK = "#000000"
BLUE = "#0066CC"
BLUE_D = "#003366"
GREEN = "#00AA00"
DARK_GRAY = "#404040"
LIGHT_GRAY = "#808080"

class MathSolution(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # Title
        title = Text("${escapeStr(question)}", font="${fontChoice}", color=BLUE, font_size=32).to_edge(UP)
        self.play(FadeIn(title), run_time=0.5)
        
        # Group all content for easy management
        content = VGroup()
        
${keySteps.map((step, index) => {
  const stepTitle = escapeStr(step.title);
  const shortTitle = stepTitle.length > 40 ? stepTitle.substring(0, 37) + '...' : stepTitle;
  
  let stepCode = `        # Step ${index + 1}: ${shortTitle} (comment only, not displayed)\n`;

  // Add all mathematical expressions for this step
  if (step.expressions && step.expressions.length > 0) {
    // Take all expressions
    step.expressions.forEach((expr, exprIndex) => {
      const escapedExpr = escapeMathExpr(expr);
      // Slightly smaller font for subsequent expressions
      const fontSize = exprIndex === 0 ? 34 : 30;
      stepCode += `        expr${index + 1}_${exprIndex + 1} = MathTex("${escapedExpr}", color="#000000", font_size=${fontSize})
        content.add(expr${index + 1}_${exprIndex + 1})
`;
    });
  }
  
  return stepCode;
}).join('\n')}
        
        # Implement scrolling animation
        visible_area_height = 5  # Height of visible area below title
        displayed_content = VGroup()
        total_animation_time = 0
        step_duration = ${stepDuration}
        
        for i in range(len(content)):
            current_expr = content[i]
            
            # Add to displayed content
            displayed_content.add(current_expr)
            
            # Arrange all displayed content
            displayed_content.arrange(DOWN, buff=0.4)
            displayed_content.next_to(title, DOWN, buff=0.8)
            
            # Check if we need to scroll
            content_bottom = displayed_content.get_bottom()[1]
            visible_bottom = title.get_bottom()[1] - visible_area_height
            
            if content_bottom < visible_bottom:
                # Need to scroll up
                scroll_distance = visible_bottom - content_bottom + 0.5
                
                # Create animations
                anims = [displayed_content.animate.shift(UP * scroll_distance)]
                
                # Add fade in for new content
                anims.append(FadeIn(current_expr))
                
                self.play(*anims, run_time=0.8)
                
                # Fade out items that moved above the title
                for j, item in enumerate(displayed_content):
                    if item.get_top()[1] > title.get_bottom()[1] + 0.2:
                        self.play(FadeOut(item), run_time=0.3)
                        displayed_content.remove(item)
            else:
                # Just fade in the new content
                self.play(FadeIn(current_expr), run_time=0.8)
            
            total_animation_time += 0.8
            self.wait(step_duration)
            total_animation_time += step_duration
        
        # Find and highlight final expression
        final_expr = None
        for i in range(len(content) - 1, -1, -1):
            if hasattr(content[i], 'tex_string'):  # It's a MathTex object
                final_expr = content[i]
                break
                
        if final_expr:
            self.wait(1)
            self.play(final_expr.animate.scale(1.2).set_color(GREEN), run_time=0.8)
            total_animation_time += 1.8
        
        # Final wait to match total duration
        remaining_time = ${duration} - total_animation_time - 0.5  # 0.5 for title animation
        if remaining_time > 0:
            self.wait(remaining_time)`;
  }

  generateOptimizedWaterfallScript(question, steps, duration, hasChineseChars) {
    const fontChoice = hasChineseChars ? 'SimHei' : 'Arial';
    const stepDuration = Math.max(1, (duration - 2) / Math.min(steps.length, 3));
    
    const escapeStr = (str) => {
      if (!str) return '';
      return str.replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/'/g, "\\'")
                .replace(/\n/g, ' ')
                .trim();
    };
    
    const escapeMathExpr = (expr) => {
      if (!expr) return '';
      expr = expr.trim();
      expr = expr.replace(/\\\s*$/, '');
      expr = expr.replace(/\\/g, '\\\\');
      expr = expr.replace(/"/g, '\\"');
      return expr;
    };
    
    // Limit to 3 steps for quick rendering
    const displaySteps = steps.slice(0, 3);
    
    return `from manim import *

# Explicitly define colors for visibility
WHITE = "#FFFFFF"
BLACK = "#000000"
BLUE = "#0066CC"
BLUE_D = "#003366"
GREEN = "#00AA00"
DARK_GRAY = "#404040"
LIGHT_GRAY = "#808080"

class MathSolution(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # Title
        title = Text("${escapeStr(question)}", font="${fontChoice}", color=BLUE, font_size=30).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.5)
        
        # Content area
        content_start_y = 1.5
        
${displaySteps.map((step, index) => {
  const stepTitle = escapeStr(step.title);
  const shortTitle = stepTitle.length > 35 ? stepTitle.substring(0, 32) + '...' : stepTitle;
  const yPos = content_start_y - index * 1.8;
  
  let stepCode = `        # Step ${index + 1}
        step${index + 1}_group = VGroup()
        
        step${index + 1}_title = Text("${shortTitle}", font="${fontChoice}", color=BLUE_D, font_size=22)
        step${index + 1}_group.add(step${index + 1}_title)
`;

  if (step.expressions && step.expressions.length > 0) {
    const expr = step.expressions[0];
    const escapedExpr = escapeMathExpr(expr);
    stepCode += `
        expr${index + 1} = MathTex("${escapedExpr}", color="#000000", font_size=28)
        step${index + 1}_group.add(expr${index + 1})
`;
  }

  stepCode += `
        step${index + 1}_group.arrange(DOWN, buff=0.2)
        step${index + 1}_group.move_to([0, ${yPos}, 0])
        
        self.play(FadeIn(step${index + 1}_group, shift=DOWN*0.3), run_time=0.4)
        self.wait(${stepDuration})
`;
  
  return stepCode;
}).join('\n')}
        
        # Final emphasis
        if 'expr${displaySteps.length}' in locals():
            self.play(expr${displaySteps.length}.animate.scale(1.15).set_color(GREEN), run_time=0.5)
        
        self.wait(${Math.max(1, duration - displaySteps.length * stepDuration - 2)})`;
  }

  generateUltraSimplifiedScript(question, steps, duration, hasChineseChars) {
    const fontChoice = hasChineseChars ? 'SimHei' : 'Arial';
    
    const escapeStr = (str) => {
      if (!str) return '';
      return str.replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/'/g, "\\'")
                .replace(/\n/g, ' ')
                .trim();
    };
    
    const escapeMathExpr = (expr) => {
      if (!expr) return '';
      expr = expr.trim();
      expr = expr.replace(/\\\s*$/, '');
      expr = expr.replace(/\\/g, '\\\\');
      expr = expr.replace(/"/g, '\\"');
      return expr;
    };
    
    // Show all steps with expressions
    const keySteps = steps.filter(step => step.expressions && step.expressions.length > 0);
    
    return `from manim import *

# Explicitly define colors for visibility
WHITE = "#FFFFFF"
BLACK = "#000000"
BLUE = "#0066CC"
BLUE_D = "#003366"
GREEN = "#00AA00"
DARK_GRAY = "#404040"
LIGHT_GRAY = "#808080"

class MathSolution(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # Title
        title = Text("${escapeStr(question)}",
                    font="${fontChoice}",
                    color=BLUE,
                    font_size=28).to_edge(UP)
        self.play(Write(title), run_time=0.5)
        
        # Track all content and implement scrolling
        all_content = VGroup()
        visible_area_height = 5  # Height of visible area below title
        content_spacing = 0.3
        
${keySteps.map((step, index) => {
  const stepTitle = escapeStr(step.title);
  const shortTitle = stepTitle.length > 30 ? stepTitle.substring(0, 27) + '...' : stepTitle;
  
  let stepCode = `        # Step ${index + 1}: ${shortTitle} (not displayed, just for reference)
        
        step${index + 1}_group = VGroup()
`;

  // Add ALL expressions from this step
  if (step.expressions && step.expressions.length > 0) {
    step.expressions.forEach((expr, exprIndex) => {
      const escapedExpr = escapeMathExpr(expr);
      // Slightly smaller font for subsequent expressions
      const fontSize = exprIndex === 0 ? 32 : 28;
      stepCode += `
        expr${index + 1}_${exprIndex + 1} = MathTex("${escapedExpr}",
                                 color=BLACK,
                                 font_size=${fontSize})
        step${index + 1}_group.add(expr${index + 1}_${exprIndex + 1})
`;
    });
  }

  stepCode += `
        step${index + 1}_group.arrange(DOWN, buff=0.3)
        
        # Add to all_content
        all_content.add(step${index + 1}_group)
        
        # Calculate if we need to scroll
        if ${index} == 0:
            # First step - position below title
            step${index + 1}_group.next_to(title, DOWN, buff=0.8)
        else:
            # Position below previous content
            all_content.arrange(DOWN, buff=0.5)
            all_content.next_to(title, DOWN, buff=0.8)
            
            # Check if content exceeds visible area
            content_bottom = all_content.get_bottom()[1]
            visible_bottom = title.get_bottom()[1] - visible_area_height
            
            if content_bottom < visible_bottom:
                # Need to scroll up
                scroll_distance = visible_bottom - content_bottom + 0.5
                
                # Animate scrolling with new content appearing
                self.play(
                    all_content.animate.shift(UP * scroll_distance),
                    run_time=0.8
                )
                
                # Fade out items that move above the title
                for item in all_content:
                    if item.get_top()[1] > title.get_bottom()[1] + 0.2:
                        self.play(FadeOut(item), run_time=0.3)
            else:
                # Just fade in the new content
                self.play(
                    FadeIn(step${index + 1}_group),
                    run_time=0.6
                )
        
        if ${index} == 0:
            self.play(FadeIn(step${index + 1}_group), run_time=0.6)
        
        self.wait(${Math.max(2, duration / (keySteps.length + 1))})
`;
  
  return stepCode;
}).join('\n')}
        
        # Final emphasis - highlight last expression
        if ${keySteps.length} > 0:
            last_step = step${keySteps.length}_group
            if last_step.submobjects:
                self.play(last_step[-1].animate.scale(1.2).set_color(GREEN), run_time=0.6)
        
        # Final wait to match duration
        self.wait(${Math.max(2, duration - 0.5 - keySteps.length * 2.6)})`;
  }

  generateBasicManimScript(question, solution, duration) {
    const finalWait = Math.max(2, duration - 10);
    
    // Escape strings for Python
    const escapedQuestion = question.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const escapedSolution = solution.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    
    // Detect if text contains Chinese characters
    const hasChineseChars = /[\u4e00-\u9fa5]/.test(question + solution);
    const fontChoice = hasChineseChars ? 'SimHei' : 'Arial';
    
    return `from manim import *

# Explicitly define colors for visibility
WHITE = "#FFFFFF"
BLACK = "#000000"
BLUE = "#0066CC"
BLUE_D = "#003366"
GREEN = "#00AA00"
DARK_GRAY = "#404040"
LIGHT_GRAY = "#808080"

class MathSolution(Scene):
    def construct(self):
        # Background
        self.camera.background_color = WHITE
        
        # Title
        title = Text("${escapedQuestion.substring(0, 60)}", 
                    font="${fontChoice}",
                    color=BLUE,
                    font_size=36).to_edge(UP)
        
        self.play(Write(title))
        self.wait(2)
        
        # Simple solution display
        solution_text = Text("Solution: See steps below",
                           font="${fontChoice}",
                           font_size=28,
                           color=BLACK).next_to(title, DOWN, buff=1)
        
        self.play(Write(solution_text))
        self.wait(` + finalWait + `)`;
  }
} 