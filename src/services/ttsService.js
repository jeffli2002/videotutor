// TTS服务模块 - 根据问题类型生成不同的语音内容
import { getConfig } from '../config/environment.js'

export class TTSService {
  constructor() {
    // Use kimi_api_server for TTS (port 3001)
    this.baseURL = getConfig().apiBaseUrl || 'http://localhost:3001'
  }

  // 生成TTS音频
  async generateTTSAudio(text, language = 'zh', method = 'auto') {
    try {
      console.log('🎤 生成TTS音频...')
      console.log('📝 文本:', text.substring(0, 100) + '...')
      console.log('🌍 语言:', language)
      console.log('🔧 方法:', method)

      const response = await fetch(`${this.baseURL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language,
          method
        })
      })

      if (!response.ok) {
        throw new Error(`TTS请求失败: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ TTS音频生成成功:', result.audio_path)
        return result
      } else {
        throw new Error(result.error || 'TTS生成失败')
      }
    } catch (error) {
      console.error('❌ TTS音频生成异常:', error)
      throw error
    }
  }

  // 生成理论问题TTS内容
  generateTheoreticalTTSContent(question, concepts = []) {
    console.log('🎤 生成理论问题TTS内容...')
    
    let content = `让我们来学习${concepts.join('、')}。今天我们要探讨的问题是：${question}。`
    
    if (concepts.length > 0) {
      content += `通过这个动画演示，我们可以直观地看到这些原理是如何在几何图形中体现的。`
    }
    
    content += `接下来，**问题分析**
题目要求我们${question}。这是一个理论性的问题，需要我们从概念和原理的角度来理解。

**核心概念**
${concepts.map(concept => `- ${concept}`).join('\n')}

**解题思路**
1. 理解基本概念和定义
2. 分析问题的关键要素
3. 运用相关原理和公式
4. 通过动画演示加深理解

**总结**
通过这个动画演示，我们深入理解了${concepts.join('、')}的核心原理。这种可视化学习方式帮助我们更好地掌握数学概念。`

    console.log('✅ TTS内容生成完成:', content.substring(0, 100) + '...')
    return content
  }

  // 生成具体问题TTS内容
  generateConcreteTTSContent(question, solution, steps = []) {
    console.log('🎤 生成具体问题TTS内容...')
    
    let content = `让我们来解决这个数学问题：${question}。`
    
    // 根据具体步骤生成内容
    if (steps.length > 0) {
      content += `\n\n**解题步骤**\n`
      steps.forEach((step, index) => {
        content += `${index + 1}. ${step}\n`
      })
    }
    
    if (solution) {
      content += `\n**解答过程**\n${solution}`
    }
    
    content += `\n\n让我们验证一下答案的正确性。通过这个动画演示，我们可以清楚地看到每一步的计算过程和逻辑推理。`
    
    console.log('✅ TTS内容生成完成:', content.substring(0, 100) + '...')
    return content
  }

  // 生成几何问题TTS内容
  generateGeometryTTSContent(question, geometryInfo = {}) {
    console.log('🎤 生成几何问题TTS内容...')
    
    let content = `让我们来解决这个几何问题：${question}。`
    
    if (geometryInfo.shapes) {
      content += `\n\n**几何图形分析**\n`
      geometryInfo.shapes.forEach(shape => {
        content += `- ${shape}\n`
      })
    }
    
    if (geometryInfo.formulas) {
      content += `\n**相关公式**\n`
      geometryInfo.formulas.forEach(formula => {
        content += `- ${formula}\n`
      })
    }
    
    content += `\n**解题思路**\n1. 识别几何图形和已知条件\n2. 应用相关公式和定理\n3. 逐步计算求解\n4. 验证答案的合理性\n\n通过这个动画演示，我们可以直观地看到几何图形的变化过程和计算步骤。`
    
    console.log('✅ TTS内容生成完成:', content.substring(0, 100) + '...')
    return content
  }

  // 清理文本内容
  cleanText(text) {
    if (!text) return ''
    
    // 移除Markdown标记
    let cleaned = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
      .replace(/\*(.*?)\*/g, '$1')     // 移除斜体
      .replace(/`(.*?)`/g, '$1')       // 移除代码标记
      .replace(/#{1,6}\s+/g, '')       // 移除标题标记
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接
      .replace(/\n{3,}/g, '\n\n')      // 合并多个换行
      .trim()
    
    return cleaned
  }

  // 从脚本生成语音内容
  generateVoiceScriptFromScript(script) {
    console.log('🎤 从脚本生成语音内容...')
    
    let voiceScript = ''
    
    if (script.pages && Array.isArray(script.pages)) {
      script.pages.forEach((page, index) => {
        if (page.content) {
          const cleanedContent = this.cleanText(page.content)
          if (cleanedContent) {
            voiceScript += cleanedContent
          }
        }
        // 添加停顿
        if (index < script.pages.length - 1) {
          voiceScript += ' '
        }
      })
    }
    
    console.log('✅ 语音脚本生成完成，长度:', voiceScript.length)
    return voiceScript
  }
} 