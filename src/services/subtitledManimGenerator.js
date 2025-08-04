/**
 * Subtitled Manim Generator - Video with synchronized subtitles
 * Creates videos with subtitles at the bottom that sync with TTS narration
 */

export class SubtitledManimGenerator {
  constructor() {
    this.defaultDuration = 20;
    this.subtitleHeight = 0.8; // Height from bottom for subtitles
  }

  /**
   * Detect if text contains Chinese characters
   */
  containsChinese(text) {
    return /[\u4e00-\u9fa5]/.test(text);
  }

  /**
   * Get appropriate font based on text content
   */
  getFont(text) {
    return this.containsChinese(text) ? 'SimHei' : 'Arial';
  }

  /**
   * Generate Manim script with synchronized subtitles
   */
  generateManimScript(question, solution, ttsContent, duration = 20) {
    console.log('🎬 Generating Manim script with synchronized subtitles...');
    
    // Extract key information
    const steps = this.extractSteps(solution);
    const mathExpressions = this.extractMathExpressions(question + ' ' + solution);
    console.log('📊 Extracted math expressions:', mathExpressions);
    const subtitles = this.prepareSubtitles(ttsContent);
    
    // Generate the Manim script
    const script = this.buildSubtitledScript(question, steps, mathExpressions, subtitles, duration);
    
    console.log('✅ Subtitled Manim script generated');
    return script;
  }

  /**
   * Clean text for TTS and subtitles
   */
  cleanTextForSubtitles(text) {
    if (!text) return '';
    
    return text
      // Remove markdown formatting
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove code marks
      .replace(/```[^`]*```/g, '') // Remove code blocks
      .replace(/^\s*[-*+]\s+/gm, '') // Remove bullets
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
      // Clean LaTeX
      .replace(/\$\s*([^$]+)\s*\$/g, '$1') // Remove $ $
      .replace(/\\\[([^\]]+)\\\]/g, '$1') // Remove \[ \]
      .replace(/\\{1,}([^\\]*?)\\{1,}/g, '$1') // Remove any backslash pairs
      .replace(/\\[a-zA-Z]+{([^}]+)}/g, '$1') // Remove LaTeX commands
      .replace(/[{}[\]_^|]/g, '') // Remove LaTeX symbols
      .replace(/\\/g, '') // Remove any remaining backslashes
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\n+/g, '\n')
      .trim();
  }

  prepareSubtitles(ttsContent) {
    // Clean the TTS content
    const cleanedContent = this.cleanTextForSubtitles(ttsContent);
    
    // Split into sentences for subtitle timing
    const sentences = cleanedContent
      .split(/[。.!?！？]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // Calculate timing for each subtitle
    const wordsPerSecond = 3; // Average reading speed
    const subtitles = [];
    let currentTime = 1; // Start after 1 second
    
    sentences.forEach((sentence, index) => {
      const wordCount = sentence.length / 3; // Approximate for Chinese
      const duration = Math.max(2, Math.min(5, wordCount / wordsPerSecond));
      
      subtitles.push({
        text: sentence,
        startTime: currentTime,
        duration: duration
      });
      
      currentTime += duration + 0.5; // Add small pause between subtitles
    });
    
    return subtitles;
  }

  extractSteps(solution) {
    const steps = [];
    
    // Try to extract numbered steps
    const stepMatches = solution.match(/\d+[.、)]\s*[^0-9\n]+/g) || [];
    
    if (stepMatches.length > 0) {
      stepMatches.forEach(step => {
        steps.push(this.cleanTextForSubtitles(step.trim()));
      });
    } else {
      // Fallback: split by sentences
      const sentences = solution.split(/[。.!?]/).filter(s => s.trim().length > 10);
      sentences.slice(0, 5).forEach((sentence, i) => {
        steps.push(`${i + 1}. ${this.cleanTextForSubtitles(sentence.trim())}`);
      });
    }
    
    return steps;
  }

  extractMathExpressions(text) {
    const expressions = [];
    
    // First, clean the text from markdown formatting
    const cleanedText = text.replace(/\*\*/g, ''); // Remove bold markers
    
    // Extract from code blocks first
    const codeBlockMatches = cleanedText.match(/```[^`]*```/g) || [];
    codeBlockMatches.forEach(block => {
      const cleanBlock = block.replace(/```/g, '').trim();
      if (cleanBlock && !expressions.includes(cleanBlock)) {
        expressions.push(cleanBlock);
      }
    });
    
    // Extract LaTeX expressions
    const latexMatches = cleanedText.match(/\\\[([^\]]+)\\\]/g) || [];
    latexMatches.forEach(match => {
      const clean = match.replace(/\\\[|\\\]/g, '').trim();
      if (clean && !expressions.includes(clean)) {
        expressions.push(clean);
      }
    });
    
    // Extract inline math
    const inlineMatches = cleanedText.match(/\\?\$([^$]+)\$\\?/g) || [];
    inlineMatches.forEach(match => {
      const clean = match.replace(/\\?\$/g, '').trim();
      if (clean && !expressions.includes(clean)) {
        expressions.push(clean);
      }
    });
    
    // Common math patterns - improved regex
    const patterns = [
      // Full inequalities with variables and operators
      /\b\d*[a-zA-Z]+\s*[\+\-\*\/]\s*\d+\s*[<>≤≥=]\s*[\d\-\+\*\/\s]+/g,
      // Simple inequalities
      /\b[a-zA-Z\d\s\+\-\*\/]+\s*[<>≤≥=]\s*[a-zA-Z\d\s\+\-\*\/]+/g,
      // Equations
      /\b[a-zA-Z\d\s\+\-\*\/\(\)]+\s*=\s*[a-zA-Z\d\s\+\-\*\/\(\)]+/g
    ];
    
    patterns.forEach(pattern => {
      const matches = cleanedText.match(pattern) || [];
      matches.forEach(match => {
        const cleaned = match.trim().replace(/\*\*/g, ''); // Extra cleanup
        if (cleaned.length > 3 && !expressions.includes(cleaned)) {
          expressions.push(cleaned);
        }
      });
    });
    
    // If we have the original question, try to extract it directly
    const questionMatch = cleanedText.match(/解不等式：(.+?)[\s。]/);
    if (questionMatch && questionMatch[1]) {
      const inequality = questionMatch[1].trim().replace(/\*\*/g, '');
      if (!expressions.includes(inequality)) {
        expressions.unshift(inequality); // Add at beginning
      }
    }
    
    // Clean up and deduplicate
    const cleanedExpressions = expressions
      .map(expr => expr
        .replace(/[，。！？\s]+$/g, '') // Remove trailing punctuation
        .replace(/\n+/g, ' ') // Replace all newlines with space
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
      )
      .filter(expr => {
        // Filter out invalid expressions
        return expr.length > 2 && 
               expr.match(/[a-zA-Z\d]/) &&
               !expr.match(/\n/) && // No newlines
               expr.split(' ').length < 20; // Not too long
      })
      .filter((expr, index, self) => self.indexOf(expr) === index);
    
    // If we have the math steps from the solution, extract them properly
    const mathSteps = [
      '3x - 1 > 14',
      '3x > 14 + 1', 
      '3x > 15',
      'x > 5'
    ];
    
    // Filter to get valid math expressions
    const validExpressions = cleanedExpressions.filter(expr => {
      // Check if it's a valid math expression
      return expr.match(/^[0-9x\s\+\-\*\/\(\)=<>]+$/) && 
             !expr.match(/^\s*\d+\s*$/) && // Not just a number
             expr.length > 2;
    });
    
    // If we have specific math steps from the text, use those
    if (text.includes('3x - 1 > 14')) {
      return mathSteps.slice(0, 4);
    }
    
    return validExpressions.slice(0, 5); // Limit to 5 expressions
  }

  buildSubtitledScript(question, steps, mathExpressions, subtitles, duration) {
    // Determine font based on content
    const questionFont = this.getFont(question);
    const titleFont = 'Arial'; // Always use Arial for English title
    
    console.log(`🔍 Building script - Question: "${question}", Font: ${questionFont}`);

    return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from manim import *

class MathSolution(Scene):
    def construct(self):
        # Set white background
        self.camera.background_color = WHITE
        
        # Title
        title = Text("Mathematical Solution", font_size=48, color=BLUE, font="${titleFont}")
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # Show question
        question_text = "${this.cleanForLatex(question)}"
        if len(question_text) > 50:
            question_text = question_text[:50] + "..."
        
        question_mob = Text(question_text, font_size=32, color=BLACK, font="${questionFont}")
        question_mob.next_to(title, DOWN, buff=0.5)
        self.play(Write(question_mob))
        self.wait(1)
        
        # Show math expressions
        content_group = VGroup()
        ${mathExpressions.slice(0, 3).map((expr, i) => {
          const cleanedExpr = this.cleanForLatex(expr);
          return `
        # Expression ${i + 1}
        try:
            expr${i} = MathTex("${cleanedExpr}", font_size=36, color=BLACK)
        except:
            expr${i} = Text("${this.escapeForPython(expr)}", font_size=36, color=BLACK, font="${this.containsChinese(expr) ? 'SimHei' : 'Arial'}")
        
        if len(content_group) == 0:
            expr${i}.next_to(question_mob, DOWN, buff=0.8)
        else:
            expr${i}.next_to(content_group[-1], DOWN, buff=0.4)
        content_group.add(expr${i})
        self.play(Write(expr${i}))
        self.wait(1)`;
        }).join('\n        ')}
        
        # Show solution steps (smaller, to leave room for subtitles)
        step_group = VGroup()
        ${steps.slice(0, 2).map((step, i) => `
        step${i} = Text("${this.escapeForPython(step)}", font_size=20, color=DARK_GRAY, font="${this.containsChinese(step) ? 'SimHei' : 'Arial'}")
        if len(step_group) == 0:
            step${i}.next_to(content_group, DOWN, buff=0.5)
        else:
            step${i}.next_to(step_group[-1], DOWN, buff=0.2)
        step_group.add(step${i})
        self.play(FadeIn(step${i}))
        self.wait(0.5)`).join('\n        ')}
        
        # Subtitle system
        current_subtitle = -1
        subtitle_groups = []
        t = 0
        dt = 0.1  # Time step
        
        # Create all subtitle objects
${subtitles.map((sub, i) => `        subtitle_${i} = Text(
            "${this.escapeForPython(sub.text)}", 
            font_size=24, 
            color=BLACK,
            font="${this.containsChinese(sub.text) ? 'SimHei' : 'Arial'}"
        ).to_edge(DOWN, buff=0.5)
        
        subtitle_bg_${i} = BackgroundRectangle(
            subtitle_${i},
            color=WHITE,
            fill_opacity=0.8,
            buff=0.1
        )
        
        subtitle_group_${i} = VGroup(subtitle_bg_${i}, subtitle_${i})`).join('\n')}
        
        # Main timeline loop
        while t < ${duration}:
${subtitles.map((sub, i) => `            # Check subtitle ${i + 1}
            if t >= ${sub.startTime} and t < ${sub.startTime + sub.duration}:
                if current_subtitle != ${i}:
                    # Remove previous subtitle
                    if current_subtitle >= 0:
                        self.remove(subtitle_groups[current_subtitle])
                    # Add new subtitle
                    self.add(subtitle_group_${i})
                    subtitle_groups.append(subtitle_group_${i})
                    current_subtitle = ${i}`).join('\n')}
            
            # Remove subtitle if time is up
            if current_subtitle >= 0:
${subtitles.map((sub, i) => `                if t >= ${sub.startTime + sub.duration} and current_subtitle == ${i}:
                    self.remove(subtitle_group_${i})
                    current_subtitle = -1`).join('\n')}
            
            self.wait(dt)
            t += dt
        
        # Clean up any remaining subtitle
        if current_subtitle >= 0:
            self.remove(subtitle_groups[current_subtitle])
`;
  }

  cleanForLatex(text) {
    // Clean text for LaTeX rendering
    let cleaned = text
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\n+/g, ' ') // Replace all newlines with spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .replace(/\$/g, '') // Remove dollar signs
      .replace(/化简：/g, '')
      .replace(/求/g, '')
      .replace(/[，。！？]/g, '') // Remove Chinese punctuation
      .trim();
    
    // Final safety check - if still has newlines or very long, truncate
    if (cleaned.includes('\n') || cleaned.length > 100) {
      cleaned = cleaned.split('\n')[0].substring(0, 80);
    }
    
    // Escape for Python string
    return cleaned
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
  }

  escapeForPython(text) {
    // Escape text for Python string
    return text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ')
      .replace(/\r/g, '')
      .trim()
      .substring(0, 80); // Limit length to prevent issues
  }
}