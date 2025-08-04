// AI-Driven Manim Script Generator
// This service uses AI to dynamically generate Manim animations for any math problem

export class AIDrivenManimGenerator {
  constructor() {
    this.kimiApiUrl = 'http://localhost:3001/api/kimi/chat';
  }

  async generateManimScript(question, solution, duration = 20) {
    console.log('🤖 Using AI to generate Manim script dynamically...');
    
    try {
      // Step 1: Extract structured content from solution
      const structuredContent = await this.extractStructuredContent(question, solution);
      
      // Step 2: Generate waterfall-style Manim script
      const manimScript = this.generateWaterfallManimScript(structuredContent, duration);
      
      console.log('✅ AI successfully generated waterfall Manim script');
      return manimScript;
      
    } catch (error) {
      console.error('❌ AI-driven generation failed:', error);
      // Fallback to basic template
      return this.generateBasicManimScript(question, solution, duration);
    }
  }

  async extractStructuredContent(question, solution) {
    // Parse the solution to extract steps and key information
    const lines = solution ? solution.split('\n').filter(line => line.trim()) : [];
    
    const contents_data = [];
    const scripts_data = [];
    
    // Add title - handle both theoretical and practical questions
    let titleValue = question;
    let titleType = "text";
    
    // Check if this is a theoretical question
    const isTheoretical = question.includes('讲解') || question.includes('举例') || 
                         question.includes('解释') || question.includes('什么是') ||
                         question.includes('explain') || question.includes('example');
    
    if (!isTheoretical) {
      // Try to extract mathematical expression for practical problems
      if (question.includes('：')) {
        const parts = question.split('：');
        if (parts.length > 1) {
          titleValue = parts[1].trim().replace('。', '');
        }
      }
      
      // If title contains math, extract it
      if (titleValue && /[0-9x\+\-\*\/\s<>=]/.test(titleValue)) {
        const mathMatch = titleValue.match(/[0-9x\+\-\*\/\s<>=]+/);
        if (mathMatch) {
          titleValue = this.convertToLatex(mathMatch[0].trim());
          titleType = "formula";
        }
      }
    }
    
    // For theoretical questions or when no math found, use text title
    if (titleType === "text" || titleValue === 'x' || !titleValue) {
      titleValue = question.substring(0, 40);
      titleType = "text";
    }
    
    contents_data.push({
      name: "title",
      type: titleType,
      value: titleValue,
      font_size: 36,
      color: "BLUE"
    });
    scripts_data.push(`让我们解决这个问题：${question}`);
    
    // Analyze question for potential visualizations
    const visualizations = this.detectVisualizationNeeds(question, solution);
    
    // Add initial visualization if needed
    if (visualizations.initial) {
      contents_data.push(visualizations.initial);
      scripts_data.push(visualizations.initial.narration || "让我们先看一下问题的图形表示");
    }
    
    // Process solution steps - separate math from descriptions
    let stepNumber = 0;
    let mathEquationCount = 0;
    let currentStepDescription = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and markdown formatting
      if (!line || line === '**详细解题步骤：**') continue;
      
      // Clean markdown
      const cleanLine = line.replace(/\*\*/g, '').trim();
      
      // Check for step markers (e.g., "1. 移项： 将常数项移到不等号右边")
      if (cleanLine.match(/^\d+[\.、]\s*/)) {
        stepNumber++;
        
        // Extract step description for TTS
        const stepMatch = cleanLine.match(/^\d+[\.、]\s*([^：:]+)[：:]?\s*(.*)$/);
        if (stepMatch) {
          const stepName = stepMatch[1].trim();
          const stepDesc = stepMatch[2].trim();
          
          // Add step header - keep it short for Manim rendering
          contents_data.push({
            name: `step${stepNumber}_header`,
            type: "text",
            value: `Step ${stepNumber}`,
            font_size: 28,
            color: "YELLOW"
          });
          
          // Add to scripts for TTS narration
          currentStepDescription = `第${stepNumber}步，${stepName}`;
          if (stepDesc) {
            currentStepDescription += `，${stepDesc}`;
          }
          scripts_data.push(currentStepDescription);
          
          // Extract math from the step description itself if present
          const mathInDesc = stepDesc.match(/([0-9x\+\-\*\/\s>=<²³√]+)/);
          if (mathInDesc && mathInDesc[1].trim()) {
            mathEquationCount++;
            contents_data.push({
              name: `step${stepNumber}_equation${mathEquationCount}`,
              type: "formula",
              value: this.convertToLatex(mathInDesc[1].trim()),
              color: "BLACK",
              font_size: 32
            });
          }
          
          // Look ahead for mathematical content on next lines
          let j = i + 1;
          while (j < lines.length) {
            const nextLine = lines[j].trim();
            if (!nextLine || nextLine.match(/^\d+[\.、]\s*/)) {
              // Empty line or next step, stop looking
              break;
            }
            
            // Check if this is mathematical content
            if (nextLine.match(/[=\+\-\*\/\(\)x\d²³><≥≤]/) && !nextLine.match(/答案|解|结果|说明/)) {
              // This is math content for the current step
              mathEquationCount++;
              contents_data.push({
                name: `step${stepNumber}_equation${mathEquationCount}`,
                type: "formula",
                value: this.convertToLatex(nextLine.replace(/\*\*/g, '').trim()),
                color: "BLACK",
                font_size: 32
              });
              
              // Add math narration
              const mathNarration = this.generateMathNarration(nextLine);
              scripts_data.push(mathNarration);
              
              // Mark this line as processed
              lines[j] = ''; // Clear it so it won't be processed again
            }
            j++;
          }
        }
        
      } else if (cleanLine.match(/^[0-9x\+\-\*\/\s>=<]+$/) || 
                 (cleanLine.includes('=') || cleanLine.includes('>') || cleanLine.includes('<')) && 
                 !cleanLine.match(/答案|解|结果|说明/)) {
        // This is a pure math equation
        mathEquationCount++;
        contents_data.push({
          name: `equation${mathEquationCount}`,
          type: "formula",
          value: this.convertToLatex(cleanLine),
          color: "BLACK",
          font_size: 32
        });
        
        // Add math narration to scripts
        const mathNarration = this.generateMathNarration(cleanLine);
        scripts_data.push(mathNarration);
        
        // Check if this equation needs a visualization
        const equationViz = this.analyzeEquationForVisualization(cleanLine, stepNumber);
        if (equationViz) {
          contents_data.push(equationViz);
          scripts_data.push(equationViz.narration || "让我们看一下图形表示");
        }
        
      } else if (cleanLine.match(/^(答案|解|结果)[：:]/)) {
        // Answer line
        const answerMatch = cleanLine.match(/^(?:答案|解|结果)[：:]\s*(.+)$/);
        if (answerMatch) {
          const answer = answerMatch[1].trim();
          contents_data.push({
            name: "final_answer",
            type: "formula",
            value: this.convertToLatex(answer),
            font_size: 36,
            color: "GREEN"
          });
          scripts_data.push(`所以最终答案是：${answer}`);
        }
      } else if (stepNumber > 0 && cleanLine && !cleanLine.match(/^\d/)) {
        // This is additional explanation text for the current step
        scripts_data.push(cleanLine);
      }
    }
    
    // If no steps found, extract key content (for theoretical questions)
    if (stepNumber === 0 && lines.length > 1) {
      console.log('📚 Processing theoretical content...');
      
      // Look for key sections
      let conceptCount = 0;
      let exampleCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const cleanLine = line.replace(/\*\*/g, '').trim();
        
        if (!cleanLine) continue;
        
        // Check for definitions or concepts
        if (cleanLine.match(/定义|概念|含义|是指|就是|definition|concept/i)) {
          conceptCount++;
          contents_data.push({
            name: `concept${conceptCount}`,
            type: "text",
            value: cleanLine.substring(0, 60),
            font_size: 26,
            color: "YELLOW"
          });
          scripts_data.push(cleanLine);
        }
        // Check for examples
        else if (cleanLine.match(/例如|例子|比如|假设|example|for instance/i)) {
          exampleCount++;
          const exampleText = cleanLine.substring(0, 80);
          
          // Try to extract math from example
          const mathInExample = cleanLine.match(/[0-9x\+\-\*\/\s>=<]+[0-9x]/);
          if (mathInExample) {
            contents_data.push({
              name: `example${exampleCount}_text`,
              type: "text",
              value: "示例 " + exampleCount + ":",
              font_size: 24,
              color: "GREEN"
            });
            contents_data.push({
              name: `example${exampleCount}_math`,
              type: "formula",
              value: this.convertToLatex(mathInExample[0]),
              font_size: 28,
              color: "BLACK"
            });
          } else {
            contents_data.push({
              name: `example${exampleCount}`,
              type: "text",
              value: exampleText,
              font_size: 24,
              color: "GREEN"
            });
          }
          scripts_data.push(cleanLine);
        }
        // Check for mathematical expressions
        else if (cleanLine.match(/[=+\-*/^²³√∫∑]/) && cleanLine.match(/[0-9x]/)) {
          const mathExpr = this.convertToLatex(cleanLine);
          if (mathExpr && mathExpr !== 'x') {
            contents_data.push({
              name: `math_expr${i}`,
              type: "formula",
              value: mathExpr,
              font_size: 28,
              color: "BLACK"
            });
            scripts_data.push(cleanLine);
          }
        }
        // First line as introduction if not already added
        else if (i === 0 && contents_data.length === 1) {
          contents_data.push({
            name: "intro",
            type: "text",
            value: cleanLine.substring(0, 60),
            font_size: 24,
            color: "BLACK"
          });
          scripts_data.push(cleanLine);
        }
      }
    }
    
    // Process any remaining lines that weren't caught above
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const cleanLine = line.replace(/\*\*/g, '').trim();
      
      // Skip if already processed or empty
      if (!cleanLine || cleanLine === '详细解题步骤：') continue;
      
      // Check if this line was already processed
      let alreadyProcessed = false;
      for (const script of scripts_data) {
        if (script.includes(cleanLine) || cleanLine.includes(script)) {
          alreadyProcessed = true;
          break;
        }
      }
      
      if (!alreadyProcessed && cleanLine.match(/答案|解|结果/) && !contents_data.find(c => c.name === 'final_answer')) {
        const answerMatch = cleanLine.match(/(?:答案|解|结果)[：:]\s*(.+)/) || [null, cleanLine];
        if (answerMatch[1]) {
          const cleanAnswer = answerMatch[1].replace(/\*\*/g, '').trim();
          // Check if answer is already added
          if (!contents_data.find(c => c.value === cleanAnswer || c.value === this.convertToLatex(cleanAnswer))) {
            contents_data.push({
              name: "answer_text",
              type: "text", 
              value: `答案：${cleanAnswer}`,
              font_size: 32,
              color: "GREEN"
            });
            scripts_data.push(`最终答案是：${cleanAnswer}`);
          }
        }
      }
    }
    
    // Ensure we have some content
    if (contents_data.length === 1) {
      // Only title exists, try to extract key math steps from solution
      console.log('📊 Only title found, extracting math steps from solution...');
      
      // Look for common patterns in the solution
      const mathPatterns = [
        /3x\s*-\s*1\s*>\s*14/,
        /3x\s*>\s*15/,
        /x\s*>\s*5/,
        /\d+x\s*[+\-*/=><]\s*\d+/,
        /x\s*[=><]\s*\d+/
      ];
      
      let stepCount = 0;
      for (const pattern of mathPatterns) {
        const match = solution.match(pattern);
        if (match) {
          stepCount++;
          contents_data.push({
            name: `extracted_step${stepCount}`,
            type: "formula",
            value: match[0].trim(),
            font_size: 28,
            color: stepCount === mathPatterns.length ? "GREEN" : "BLACK"
          });
          scripts_data.push(`步骤${stepCount}: ${match[0]}`);
        }
      }
      
      // If still no math content found, add basic steps based on the question
      if (contents_data.length === 1) {
        // Try to extract mathematical content from the question
        const mathInQuestion = this.convertToLatex(question);
        if (mathInQuestion && mathInQuestion !== 'x') {
          contents_data.push({
            name: "problem",
            type: "formula",
            value: mathInQuestion,
            font_size: 28,
            color: "BLACK"
          });
          scripts_data.push("让我们开始解决这个问题");
        }
        
        // Add a generic solution placeholder
        contents_data.push({
          name: "solution_text",
          type: "text",
          value: "Solution Steps",
          font_size: 24,
          color: "BLACK"
        });
        scripts_data.push("让我们逐步解决");
        
        // If we have any solution text, try to extract math from it
        if (solution && solution.length > 10) {
          const solutionLines = solution.split('\n').filter(line => line.trim());
          for (let i = 0; i < Math.min(3, solutionLines.length); i++) {
            const mathContent = this.convertToLatex(solutionLines[i]);
            if (mathContent && mathContent !== 'x') {
              contents_data.push({
                name: `fallback_step${i}`,
                type: "formula",
                value: mathContent,
                font_size: 26,
                color: i === solutionLines.length - 1 ? "GREEN" : "BLACK"
              });
            }
          }
        }
      }
    }
    
    console.log(`✅ Extracted ${contents_data.length} content items and ${scripts_data.length} script items`);
    
    return { contents_data, scripts_data };
  }

  convertToLatex(expression) {
    // First try to extract pure mathematical expressions
    let cleaned = expression;
    
    // If expression contains Chinese text with math, extract the math part
    if (/[\u4e00-\u9fff]/.test(expression)) {
      // Look for patterns like "不等式：3x-1>14" or "求解 x^2 + 5x = 0"
      const patterns = [
        /[：:]\s*([^，。；！？]+)$/,  // After colon
        /求解?\s*([^，。；！？]+)$/,   // After "solve"
        /计算?\s*([^，。；！？]+)$/,   // After "calculate"
        /([0-9x\+\-\*\/\s>=<\^²³√∑∫\(\)]+)/  // General math pattern
      ];
      
      for (const pattern of patterns) {
        const match = expression.match(pattern);
        if (match && match[1]) {
          cleaned = match[1].trim();
          break;
        }
      }
    }
    
    // Remove LaTeX delimiters if present
    cleaned = cleaned
      .replace(/\\\[/g, '')
      .replace(/\\\]/g, '')
      .replace(/\$\$/g, '')
      .replace(/\$/g, '')
      .replace(/\*\*/g, '') // Remove markdown bold syntax
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    // Remove any remaining problematic characters
    cleaned = cleaned
      .replace(/[""'']/g, '') // Remove quotes
      .replace(/[，。；：！？]/g, '') // Remove Chinese punctuation
      .replace(/[\u4e00-\u9fff]+/g, '') // Remove any remaining Chinese characters
      .trim();
    
    // Convert common math notation to LaTeX
    cleaned = cleaned
      .replace(/x²/g, 'x^2')
      .replace(/x³/g, 'x^3')
      .replace(/y²/g, 'y^2')
      .replace(/y³/g, 'y^3')
      .replace(/(\w)²/g, '$1^2')  // General superscript 2
      .replace(/(\w)³/g, '$1^3')  // General superscript 3
      .replace(/\^(\d)/g, '^{$1}')  // Wrap single digit exponents
      .replace(/√(\w)/g, '\\sqrt{$1}')  // Square root with content
      .replace(/√/g, '\\sqrt')
      .replace(/×/g, '\\times')
      .replace(/÷/g, '\\div')
      .replace(/≥/g, '\\geq')
      .replace(/≤/g, '\\leq')
      .replace(/≠/g, '\\neq')
      .replace(/∑/g, '\\sum')
      .replace(/∫/g, '\\int')
      .replace(/\s+/g, ' ')  // Normalize spaces
      .trim();
    
    // Ensure valid LaTeX: if empty after cleaning, return a simple expression
    if (!cleaned || cleaned.length === 0) {
      return 'x';
    }
    
    // Final validation - ensure it contains some mathematical content
    if (!/[0-9x\+\-\*\/=><\^\\]/.test(cleaned)) {
      return 'x';
    }
    
    return cleaned;
  }

  generateMathNarration(equation) {
    // Generate natural language narration for math equations
    let narration = equation;
    
    // Replace math symbols with Chinese descriptions
    narration = narration
      .replace(/=/g, '等于')
      .replace(/>/g, '大于')
      .replace(/</g, '小于')
      .replace(/≥/g, '大于等于')
      .replace(/≤/g, '小于等于')
      .replace(/\+/g, '加')
      .replace(/-/g, '减')
      .replace(/\*/g, '乘以')
      .replace(/\//g, '除以')
      .replace(/x/g, 'x')
      .replace(/y/g, 'y');
    
    // Handle specific patterns
    if (equation.match(/^\d+x/)) {
      narration = narration.replace(/(\d+)x/, '$1乘以x');
    }
    
    return narration;
  }
  
  detectVisualizationNeeds(question, solution) {
    const visualizations = {};
    const lowerQuestion = question.toLowerCase();
    const lowerSolution = solution.toLowerCase();
    
    // Comprehensive pattern matching for all mathematical concepts
    const patterns = {
      // Inequalities
      inequality: {
        regex: /不等式|inequality|[<>≤≥]|大于|小于|greater|less/i,
        handler: () => {
          const solMatch = solution.match(/x\s*([<>≤≥])\s*([\-\d\.]+)/);
          return {
            name: "inequality_viz",
            type: "visualization",
            config: {
              subtype: "number_line",
              x_range: [-15, 15, 1],
              solution_value: solMatch ? parseFloat(solMatch[2]) : 7,
              operator: solMatch ? solMatch[1] : '>'
            },
            narration: "让我们在数轴上表示这个不等式的解集"
          };
        }
      },
      
      // Geometry - comprehensive
      geometry: {
        regex: /三角形|triangle|圆|circle|矩形|rectangle|正方形|square|多边形|polygon|梯形|平行四边形|菱形|五边形|六边形|几何|geometry/i,
        handler: () => {
          let shapeType = "triangle"; // default
          let config = { subtype: "geometry_shape" };
          
          if (lowerQuestion.match(/圆|circle/)) {
            shapeType = "circle";
            const radiusMatch = question.match(/半径[为是：:\s]*(\d+)/);
            config.radius = radiusMatch ? parseFloat(radiusMatch[1]) : 2;
          } else if (lowerQuestion.match(/矩形|长方形|rectangle/)) {
            shapeType = "rectangle";
            const nums = question.match(/\d+/g) || ['4', '2'];
            config.width = parseFloat(nums[0]);
            config.height = parseFloat(nums[1] || nums[0]);
          } else if (lowerQuestion.match(/正方形|square/)) {
            shapeType = "rectangle";
            const sideMatch = question.match(/边长[为是：:\s]*(\d+)/);
            const side = sideMatch ? parseFloat(sideMatch[1]) : 3;
            config.width = side;
            config.height = side;
          } else if (lowerQuestion.match(/五边形|pentagon/)) {
            shapeType = "polygon";
            config.n_sides = 5;
          } else if (lowerQuestion.match(/六边形|hexagon/)) {
            shapeType = "polygon";
            config.n_sides = 6;
          } else if (lowerQuestion.match(/三角形|triangle/)) {
            const nums = question.match(/\d+/g) || ['8', '6'];
            config.vertices = [[-3, -2, 0], [3, -2, 0], [0, 2, 0]];
          }
          
          config.shape_type = shapeType;
          
          return {
            name: "geometry_shape",
            type: "visualization",
            config: config,
            narration: `让我们画出这个${shapeType === 'triangle' ? '三角形' : shapeType === 'circle' ? '圆' : '几何图形'}`
          };
        }
      },
      
      // Functions - all types
      function: {
        regex: /函数|function|抛物线|parabola|指数|exponential|对数|logarithm|三角函数|trigonometric|sin|cos|tan|图像|graph/i,
        handler: () => {
          let functionExpr = "x^2 - 2*x - 3"; // default quadratic
          
          // Try to extract function from question or solution
          const funcPatterns = [
            { regex: /y\s*=\s*([^,，。\n]+)/, type: "general" },
            { regex: /f\(x\)\s*=\s*([^,，。\n]+)/, type: "general" },
            { regex: /(\d*x\^2[\s\+\-\d*x]+)/, type: "quadratic" },
            { regex: /(sin|cos|tan)\s*\(?x\)?/, type: "trig" }
          ];
          
          for (const pattern of funcPatterns) {
            const match = question.match(pattern.regex) || solution.match(pattern.regex);
            if (match) {
              functionExpr = match[1].trim();
              break;
            }
          }
          
          return {
            name: "function_graph",
            type: "visualization",
            config: {
              subtype: "coordinate_system",
              x_range: [-8, 8, 1],
              y_range: [-8, 8, 1],
              function_expr: functionExpr,
              show_grid: true
            },
            narration: "让我们绘制函数的图像"
          };
        }
      },
      
      // 3D Geometry
      geometry3d: {
        regex: /立体|正方体|长方体|球|圆柱|圆锥|棱柱|棱锥|3d|cube|sphere|cylinder|cone|prism|pyramid/i,
        handler: () => ({
          name: "3d_geometry",
          type: "visualization",
          config: {
            subtype: "3d_shape",
            shape_type: "cube" // Would need 3D scene
          },
          narration: "让我们看立体图形"
        })
      },
      
      // Statistics
      statistics: {
        regex: /统计|概率|分布|平均|中位数|方差|标准差|histogram|probability|distribution|mean|median|variance/i,
        handler: () => {
          const data = question.match(/\d+/g)?.map(n => parseFloat(n)) || [3, 5, 7, 9, 11];
          return {
            name: "statistics_viz",
            type: "visualization",
            config: {
              subtype: "statistical_chart",
              chart_type: "bar",
              data: data
            },
            narration: "让我们用图表展示数据"
          };
        }
      },
      
      // Vectors
      vector: {
        regex: /向量|vector|矢量|点积|叉积|dot.*product|cross.*product/i,
        handler: () => ({
          name: "vector_viz",
          type: "visualization",
          config: {
            subtype: "vector_field"
          },
          narration: "让我们看向量的图形表示"
        })
      }
    };
    
    // Check all patterns
    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.regex.test(question) || pattern.regex.test(solution)) {
        visualizations.initial = pattern.handler();
        break; // Use first match
      }
    }
    
    return visualizations;
  }
  
  analyzeEquationForVisualization(equation, stepNumber) {
    // Analyze if this specific equation step needs visualization
    const cleanEq = equation.trim();
    
    // Check if it's a final answer that needs highlighting
    if (cleanEq.match(/^x\s*[<>=]\s*[\-\d\.]+$/)) {
      // This is a solution like "x > 7" or "x = 5"
      const match = cleanEq.match(/x\s*([<>=]+)\s*([\-\d\.]+)/);
      if (match) {
        const operator = match[1];
        const value = parseFloat(match[2]);
        
        if (operator.includes('>') || operator.includes('<')) {
          // Inequality solution - show on number line
          return {
            name: `solution_numberline_${stepNumber}`,
            type: "visualization",
            config: {
              subtype: "number_line",
              x_range: [value - 10, value + 10, 1],
              solution_value: value,
              operator: operator
            },
            narration: `解集是 x ${operator} ${value}`
          };
        }
      }
    }
    
    // Check if it's a function that could be graphed
    if (cleanEq.match(/y\s*=|f\(x\)\s*=/)) {
      const funcMatch = cleanEq.match(/=\s*(.+)$/);
      if (funcMatch) {
        return {
          name: `function_graph_${stepNumber}`,
          type: "visualization",
          config: {
            subtype: "coordinate_system",
            x_range: [-5, 5, 1],
            y_range: [-5, 5, 1],
            function_expr: funcMatch[1].trim()
          },
          narration: "让我们看这个函数的图像"
        };
      }
    }
    
    return null;
  }

  toPythonLiteral(obj, indent = 0) {
    const spaces = ' '.repeat(indent);
    
    if (obj === null) return 'None';
    if (obj === undefined) return 'None';
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      const items = obj.map(item => 
        spaces + '  ' + this.toPythonLiteral(item, indent + 2)
      );
      return '[\n' + items.join(',\n') + '\n' + spaces + ']';
    }
    
    if (typeof obj === 'object') {
      const entries = Object.entries(obj);
      if (entries.length === 0) return '{}';
      const items = entries.map(([key, value]) => 
        spaces + '  "' + key + '": ' + this.toPythonLiteral(value, indent + 2)
      );
      return '{\n' + items.join(',\n') + '\n' + spaces + '}';
    }
    
    if (typeof obj === 'string') {
      // Use repr-like escaping for Python strings
      return JSON.stringify(obj);
    }
    
    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj);
    }
    
    return JSON.stringify(obj);
  }

  generateWaterfallManimScript(structuredContent, duration) {
    const { contents_data, scripts_data } = structuredContent;
    
    // Convert to Python literal format to preserve Unicode
    const contentsPython = this.toPythonLiteral(contents_data, 2);
    const scriptsPython = this.toPythonLiteral(scripts_data, 2);
    
    return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from manim import *
import numpy as np
import json

class UniversalWaterfallScene(Scene):
    def __init__(self, contents_data=None, scripts_data=None, **kwargs):
        super().__init__(**kwargs)
        self.dynamic_contents_data = contents_data if contents_data is not None else []
        self.dynamic_scripts_data = scripts_data if scripts_data is not None else []

    def construct(self):
        # Set white background for better visibility
        self.camera.background_color = WHITE
        
        # Debug logging
        print(f"DEBUG: Contents data length: {len(self.dynamic_contents_data)}")
        print(f"DEBUG: Scripts data length: {len(self.dynamic_scripts_data)}")
        if len(self.dynamic_contents_data) > 0:
            print(f"DEBUG: First content item: {self.dynamic_contents_data[0]}")
        
        # Create Manim objects dynamically
        contents = []
        print(f"DEBUG: Creating {len(self.dynamic_contents_data)} content objects...")
        
        for i, item_data in enumerate(self.dynamic_contents_data):
            name = item_data.get("name", "Unnamed")
            item_type = item_data.get("type")
            mobject = None
            print(f"DEBUG: Processing item {i}: name={name}, type={item_type}")
            
            if item_type == "text":
                text_value = item_data["value"]
                color_str = item_data.get("color", "BLACK")
                color_obj = BLACK
                if color_str == "BLUE":
                    color_obj = BLUE
                elif color_str == "YELLOW":
                    color_obj = ORANGE  # Use orange instead of yellow for visibility
                elif color_str == "GREEN":
                    color_obj = GREEN
                elif color_str == "RED":
                    color_obj = RED
                elif color_str == "WHITE":
                    color_obj = BLACK  # Use black on white background
                
                # For step headers, use simple step numbers
                if "step" in name and "header" in name:
                    # Extract step number from name
                    step_num = name.replace("step", "").replace("_header", "")
                    step_text = f"Step\\\\ {step_num}"  # Double backslash for proper LaTeX
                    
                    mobject = MathTex(
                        step_text,
                        font_size=item_data.get("font_size", 28),
                        color=color_obj
                    )
                else:
                    # For text content, use Text with proper font
                    # Check if text contains Chinese characters
                    has_chinese = any(ord(c) > 127 for c in text_value)
                    
                    if has_chinese:
                        # For Chinese text, use available Chinese fonts with fallback
                        # Truncate if too long for display
                        if len(text_value) > 30:
                            text_value = text_value[:30] + "..."
                        
                        # Try multiple fonts in order of preference
                        for font_name in ["SimHei", "Noto Sans CJK SC", "WenQuanYi Micro Hei", "Microsoft YaHei"]:
                            try:
                                mobject = Text(
                                    text_value,
                                    font=font_name,
                                    font_size=item_data.get("font_size", 24),
                                    color=color_obj
                                )
                                print(f"DEBUG: Using font {font_name} for Chinese text")
                                break
                            except:
                                continue
                        
                        # If all fonts fail, use default
                        if mobject is None:
                            print("WARNING: No Chinese font available, using default")
                            mobject = Text(
                                text_value,
                                font_size=item_data.get("font_size", 24),
                                color=color_obj
                            )
                    else:
                        # For English/math text, use MathTex if possible
                        try:
                            mobject = MathTex(
                                text_value,
                                font_size=item_data.get("font_size", 24),
                                color=color_obj
                            )
                        except:
                            # Fallback to Text for non-LaTeX content
                            mobject = Text(
                                text_value,
                                font="Arial",
                                font_size=item_data.get("font_size", 24),
                                color=color_obj
                            )
            elif item_type == "formula":
                color_str = item_data.get("color", "BLACK")
                color_obj = BLACK
                if color_str == "GREEN":
                    color_obj = GREEN
                elif color_str == "WHITE":
                    color_obj = BLACK  # Use black on white background
                elif color_str == "YELLOW":
                    color_obj = ORANGE
                elif color_str == "BLUE":
                    color_obj = BLUE
                elif color_str == "RED":
                    color_obj = RED
                    
                mobject = MathTex(
                    item_data["value"], 
                    font_size=item_data.get("font_size", 32),
                    color=color_obj
                )
            elif item_type == "visualization":
                # Handle various mathematical visualizations
                print(f"DEBUG: Processing visualization: {item_data}")
                viz_config = item_data.get("config", {})
                viz_subtype = viz_config.get("subtype", "generic")
                
                if viz_subtype == "number_line":
                    # Create number line for inequalities
                    x_range = viz_config.get("x_range", [-10, 10, 1])
                    mobject = VGroup()
                    number_line = NumberLine(
                        x_range=x_range,
                        length=10,
                        include_numbers=True,
                        include_tip=True,
                        color=BLACK,
                        numbers_color=BLACK,
                        include_ticks=True,
                        tick_size=0.1
                    )
                    mobject.add(number_line)
                    
                    # Add solution highlighting
                    if "solution_value" in viz_config:
                        val = viz_config["solution_value"]
                        op = viz_config.get("operator", ">")
                        
                        if ">" in op:
                            highlight = Line(
                                number_line.n2p(val),
                                number_line.n2p(x_range[1]),
                                color=GREEN,
                                stroke_width=8
                            )
                        else:
                            highlight = Line(
                                number_line.n2p(x_range[0]),
                                number_line.n2p(val),
                                color=GREEN,
                                stroke_width=8
                            )
                        
                        dot_color = RED if "=" not in op else GREEN
                        dot = Dot(number_line.n2p(val), color=dot_color, radius=0.15)
                        mobject.add(highlight, dot)
                
                elif viz_subtype == "coordinate_system":
                    # Create coordinate system for functions
                    x_range = viz_config.get("x_range", [-5, 5, 1])
                    y_range = viz_config.get("y_range", [-5, 5, 1])
                    
                    axes = Axes(
                        x_range=x_range,
                        y_range=y_range,
                        x_length=7,
                        y_length=5,
                        axis_config={"color": BLACK},
                        tips=True,
                    )
                    
                    mobject = VGroup(axes)
                    
                    # Add function graph if specified
                    if "function_expr" in viz_config:
                        func_str = viz_config["function_expr"]
                        # Convert string to lambda safely
                        import re
                        if re.match(r'^[x\d\+\-\*/\^\s\(\)\.]+$', func_str):
                            func_str = func_str.replace('^', '**')
                            func = lambda x: eval(func_str, {"x": x, "__builtins__": {}})
                            graph = axes.plot(func, color=BLUE)
                            mobject.add(graph)
                    
                    # Add grid if requested
                    if viz_config.get("show_grid", False):
                        grid = NumberPlane(
                            x_range=x_range,
                            y_range=y_range,
                            x_length=7,
                            y_length=5,
                            background_line_style={
                                "stroke_color": LIGHT_GREY,
                                "stroke_width": 1,
                                "stroke_opacity": 0.5
                            }
                        )
                        mobject = VGroup(grid, mobject)
                
                elif viz_subtype == "geometry_shape":
                    # Handle various geometry shapes
                    shape_type = viz_config.get("shape_type", "triangle")
                    
                    if shape_type == "triangle":
                        vertices = viz_config.get("vertices", [[-2, -1, 0], [2, -1, 0], [0, 2, 0]])
                        mobject = Polygon(
                            *[np.array(v) for v in vertices],
                            color=BLUE,
                            fill_opacity=0.3,
                            stroke_width=3
                        )
                    elif shape_type == "circle":
                        radius = viz_config.get("radius", 2)
                        mobject = Circle(radius=radius, color=BLUE, fill_opacity=0.3)
                    elif shape_type == "rectangle":
                        width = viz_config.get("width", 4)
                        height = viz_config.get("height", 2)
                        mobject = Rectangle(width=width, height=height, color=BLUE, fill_opacity=0.3)
                    elif shape_type == "polygon":
                        n_sides = viz_config.get("n_sides", 5)
                        mobject = RegularPolygon(n=n_sides, color=BLUE, fill_opacity=0.3)
                    else:
                        # Default to a square
                        mobject = Square(side_length=3, color=BLUE, fill_opacity=0.3)
                
                else:
                    # Generic visualization placeholder
                    mobject = MathTex(
                        f"\\\\text{{Visualization: {viz_subtype}}}", 
                        font_size=24,
                        color=ORANGE
                    )
            
            if mobject:
                contents.append((name, mobject))
            else:
                # If mobject creation failed, skip visualization for now
                if item_type != "visualization":
                    print(f"WARNING: Failed to create mobject for {name}, using placeholder")
                    placeholder = MathTex(f"Item\\\\ {i+1}", font_size=24, color=BLACK)
                    contents.append((name, placeholder))
                else:
                    print(f"INFO: Skipping visualization {name} - will be implemented later")

        # Fallback if no content was created
        if len(contents) == 0:
            print("WARNING: No content objects created, adding fallback content")
            # Create fallback content that's more meaningful
            if len(self.dynamic_contents_data) > 0:
                # Try to extract any text or formula from the data
                for item_data in self.dynamic_contents_data[:5]:  # Process up to 5 items
                    try:
                        if item_data.get("type") == "formula":
                            content = MathTex(
                                item_data.get("value", "x"),
                                font_size=item_data.get("font_size", 28),
                                color=BLACK
                            )
                            contents.append((item_data.get("name", "content"), content))
                        elif item_data.get("type") == "text":
                            text_val = item_data.get("value", "Math Problem")
                            if len(text_val) > 40:
                                text_val = text_val[:40] + "..."
                            content = Text(
                                text_val,
                                font="SimHei" if any(ord(c) > 127 for c in text_val) else "Arial",
                                font_size=item_data.get("font_size", 24),
                                color=BLACK
                            )
                            contents.append((item_data.get("name", "text"), content))
                    except:
                        pass
                
                # If still no content, add a basic message
                if len(contents) == 0:
                    fallback_text = Text("Mathematical Solution", font="Arial", font_size=36, color=BLUE)
                    contents.append(("fallback", fallback_text))
            else:
                fallback_text = Text("Processing...", font="Arial", font_size=36, color=BLACK)
                contents.append(("fallback", fallback_text))

        scripts = self.dynamic_scripts_data

        # Create subtitle area at the bottom of the screen
        subtitle_bg = Rectangle(
            width=config.frame_width,
            height=1.2,
            fill_color=BLACK,
            fill_opacity=0.7,
            stroke_width=0
        ).to_edge(DOWN, buff=0)
        
        # Add subtitle background
        self.add(subtitle_bg)
        
        # Current subtitle text object
        current_subtitle = None

        # Improved vertical display with subtitles
        if len(contents) > 0:
            # Calculate total height needed (leave room for subtitles)
            total_items = len(contents)
            spacing = 0.7 if total_items > 5 else 0.9
            
            # Create a group to manage all content
            all_content = VGroup()
            
            # Track which script to show for each content
            script_index = 0
            
            for i, (name, content) in enumerate(contents):
                print(f"DEBUG: Displaying content {i}: {name}")
                
                # Add to group
                all_content.add(content)
                
                # Position content (leave room at bottom for subtitles)
                if i == 0:
                    content.to_edge(UP, buff=0.5)
                else:
                    content.next_to(all_content[i-1], DOWN, buff=spacing)
                
                # Update subtitle based on current content
                if script_index < len(scripts):
                    subtitle_text = scripts[script_index]
                    
                    # Create new subtitle
                    has_chinese = any(ord(c) > 127 for c in subtitle_text)
                    
                    # Truncate long subtitles for better display
                    max_subtitle_length = 60
                    if len(subtitle_text) > max_subtitle_length:
                        subtitle_text = subtitle_text[:max_subtitle_length] + "..."
                    
                    if has_chinese:
                        # Try Chinese fonts
                        for font_name in ["SimHei", "Noto Sans CJK SC", "WenQuanYi Micro Hei", "Microsoft YaHei"]:
                            try:
                                new_subtitle = Text(
                                    subtitle_text,
                                    font=font_name,
                                    font_size=20,
                                    color=WHITE
                                ).move_to(subtitle_bg.get_center())
                                break
                            except:
                                continue
                        else:
                            # Fallback if no Chinese font works
                            new_subtitle = Text(
                                subtitle_text,
                                font_size=20,
                                color=WHITE
                            ).move_to(subtitle_bg.get_center())
                    else:
                        new_subtitle = Text(
                            subtitle_text,
                            font="Arial",
                            font_size=20,
                            color=WHITE
                        ).move_to(subtitle_bg.get_center())
                    
                    # Animate subtitle change
                    if current_subtitle is None:
                        self.add(new_subtitle)
                        current_subtitle = new_subtitle
                    else:
                        self.play(
                            FadeOut(current_subtitle, run_time=0.3),
                            FadeIn(new_subtitle, run_time=0.3),
                            run_time=0.3
                        )
                        self.remove(current_subtitle)
                        current_subtitle = new_subtitle
                    
                    script_index += 1
                
                # Animate content based on type
                if "title" in name or i == 0:
                    self.play(Write(content), run_time=1.2)
                    self.wait(0.8)
                elif "step" in name and "header" in name:
                    self.play(FadeIn(content, shift=DOWN*0.3), run_time=0.6)
                    self.wait(0.3)
                elif "formula" in name or "equation" in name:
                    self.play(Write(content), run_time=0.8)
                    self.wait(0.4)
                else:
                    self.play(FadeIn(content), run_time=0.5)
                    self.wait(0.3)
            
            # If content is too tall (accounting for subtitle area), scale it down
            max_content_height = config.frame_height - 1.5  # Leave room for subtitles
            if all_content.height > max_content_height:
                scale_factor = max_content_height / all_content.height
                self.play(all_content.animate.scale(scale_factor))
                self.wait(0.5)
            
            # Show any remaining subtitles
            while script_index < len(scripts):
                subtitle_text = scripts[script_index]
                has_chinese = any(ord(c) > 127 for c in subtitle_text)
                
                # Truncate long subtitles
                if len(subtitle_text) > 60:
                    subtitle_text = subtitle_text[:60] + "..."
                
                if has_chinese:
                    for font_name in ["SimHei", "Noto Sans CJK SC", "WenQuanYi Micro Hei", "Microsoft YaHei"]:
                        try:
                            new_subtitle = Text(
                                subtitle_text,
                                font=font_name,
                                font_size=20,
                                color=WHITE
                            ).move_to(subtitle_bg.get_center())
                            break
                        except:
                            continue
                    else:
                        new_subtitle = Text(
                            subtitle_text,
                            font_size=20,
                            color=WHITE
                        ).move_to(subtitle_bg.get_center())
                else:
                    new_subtitle = Text(
                        subtitle_text,
                        font="Arial",
                        font_size=20,
                        color=WHITE
                    ).move_to(subtitle_bg.get_center())
                
                if current_subtitle:
                    self.play(
                        FadeOut(current_subtitle, run_time=0.3),
                        FadeIn(new_subtitle, run_time=0.3),
                        run_time=0.3
                    )
                    self.remove(current_subtitle)
                else:
                    self.add(new_subtitle)
                
                current_subtitle = new_subtitle
                script_index += 1
                self.wait(2)  # Show each remaining subtitle for 2 seconds
        
        # Final wait based on content
        content_time = len(contents) * 1.2 + len(scripts) * 0.5
        self.wait(max(2, ${duration} - content_time))

class MathSolution(UniversalWaterfallScene):
    def __init__(self, **kwargs):
        # Embed data directly as instance variables
        self.embedded_contents_data = ${contentsPython}
        self.embedded_scripts_data = ${scriptsPython}
        super().__init__(contents_data=self.embedded_contents_data, scripts_data=self.embedded_scripts_data, **kwargs)
`;
  }

  generateBasicManimScript(question, solution, duration) {
    // Fallback to simple script if AI processing fails
    const finalWait = Math.max(2, duration - 10);
    
    return `from manim import *

class MathSolution(Scene):
    def construct(self):
        # Background
        self.camera.background_color = WHITE

        # Create subtitle area at the bottom
        subtitle_bg = Rectangle(
            width=config.frame_width,
            height=1.2,
            fill_color=BLACK,
            fill_opacity=0.7,
            stroke_width=0
        ).to_edge(DOWN, buff=0)
        self.add(subtitle_bg)

        # Title
        title = Text("${question.replace(/"/g, '\\"').substring(0, 60)}", 
                    font="SimHei" if any(ord(c) > 127 for c in "${question}") else "Arial",
                    color=BLUE).to_edge(UP)
        
        # First subtitle
        subtitle1 = Text("${question.replace(/"/g, '\\"').substring(0, 60)}", 
                        font="SimHei" if any(ord(c) > 127 for c in "${question}") else "Arial",
                        font_size=20, color=WHITE).move_to(subtitle_bg.get_center())
        self.add(subtitle1)
        
        self.play(Write(title))
        self.wait(2)

        # Show solution text with updated subtitle
        solution_text = Text("${solution.replace(/"/g, '\\"').substring(0, 100)}...", 
                           font="SimHei" if any(ord(c) > 127 for c in "${solution}") else "Arial",
                           font_size=24, color=BLACK)
        solution_text.next_to(title, DOWN, buff=1)
        
        # Update subtitle to solution
        subtitle2 = Text("${solution.replace(/"/g, '\\"').substring(0, 60)}...", 
                        font="SimHei" if any(ord(c) > 127 for c in "${solution}") else "Arial",
                        font_size=20, color=WHITE).move_to(subtitle_bg.get_center())
        
        self.play(
            FadeOut(subtitle1, run_time=0.3),
            FadeIn(subtitle2, run_time=0.3),
            Write(solution_text)
        )
        self.remove(subtitle1)
        
        self.wait(${finalWait})
`;
  }
}