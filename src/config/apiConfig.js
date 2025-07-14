import { getConfig } from './environment.js';

// 环境配置
const config = getConfig();

// API配置
export const API_BASE_URL = config.apiBaseUrl;
export const QWEN_API_URL = config.qwenApiUrl;
export const QWEN_API_KEY = import.meta.env.VITE_QWEN_API_KEY || '';

// 环境变量配置模板
export const API_CONFIG = {
  // 必需的API密钥 - 请在.env文件中配置
  REQUIRED_APIS: {
    // OpenAI API - 用于英文数学问题理解
    OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY,
    
    // 阿里云通义千问 - 用于中文数学问题理解 (性价比最高)
    QWEN_API_KEY: process.env.REACT_APP_QWEN_API_KEY,
    
    // Azure Speech Services - 用于多语言TTS
    AZURE_SPEECH_KEY: process.env.REACT_APP_AZURE_SPEECH_KEY,
    AZURE_REGION: process.env.REACT_APP_AZURE_REGION,
    
    // D-ID API - 用于虚拟讲师视频生成
    DID_API_KEY: process.env.REACT_APP_DID_API_KEY,
  },
  
  // 可选的API服务
  OPTIONAL_APIS: {
    // HeyGen API - D-ID的替代方案
    HEYGEN_API_KEY: process.env.REACT_APP_HEYGEN_API_KEY,
    
    // Synthesia API - 另一个视频生成选项
    SYNTHESIA_API_KEY: process.env.REACT_APP_SYNTHESIA_API_KEY,
    
    // Google Cloud Speech - Azure TTS的替代方案
    GOOGLE_CLOUD_KEY: process.env.REACT_APP_GOOGLE_CLOUD_KEY,
  }
}

// 成本效益分析和推荐配置
export const COST_ANALYSIS = {
  // 推荐的性价比配置
  RECOMMENDED_SETUP: {
    mathSolver: {
      chinese: {
        service: 'Qwen Plus',
        cost: '$0.0008/1K tokens',
        accuracy: '95%+',
        reasoning: '专门优化中文数学理解，成本最低'
      },
      english: {
        service: 'GPT-3.5-turbo',
        cost: '$0.002/1K tokens', 
        accuracy: '98%+',
        reasoning: '数学推理能力强，成本适中'
      }
    },
    
    textToSpeech: {
      service: 'Azure Speech Services',
      cost: '$4/1M characters',
      quality: 'Neural voices',
      languages: '100+',
      reasoning: '支持多语言，质量高，数学术语发音准确'
    },
    
    videoGeneration: {
      primary: {
        service: 'D-ID',
        cost: '$0.30/minute',
        quality: '1080p',
        features: ['多语言虚拟讲师', '自然表情', '快速生成'],
        reasoning: '性价比最高的AI虚拟讲师服务'
      },
      alternative: {
        service: 'HeyGen',
        cost: '$0.50/minute',
        quality: '1080p',
        features: ['更自然的动作', '更多虚拟形象选择'],
        reasoning: '质量更高但成本稍高的选择'
      }
    },
    
    mathAnimation: {
      service: 'Manim Community + Custom API',
      cost: '$0.10/scene',
      quality: 'Professional math animations',
      reasoning: '开源Manim提供最佳数学可视化效果'
    }
  },
  
  // 每个视频的预估成本 (3-5分钟教学视频)
  ESTIMATED_COSTS: {
    perVideo: {
      mathSolving: '$0.004',     // AI解题成本
      scriptGeneration: '$0.006', // 脚本生成成本  
      voiceover: '$0.020',       // 语音合成成本
      videoGeneration: '$1.50',  // 虚拟讲师视频成本
      mathAnimation: '$0.50',    // 数学动画成本
      total: '$2.03'             // 总成本约2美元/视频
    },
    
    monthlyVolume: {
      '100videos': '$203',
      '500videos': '$1,015', 
      '1000videos': '$2,030',
      '5000videos': '$10,150'
    },
    
    // 与传统方案对比
    comparison: {
      humanTutor: '$50-100/hour',
      professionalVideo: '$500-2000/video',
      ourSolution: '$2.03/video',
      savingsRatio: '99%+ cost reduction'
    }
  }
}

// API使用优化策略
export const OPTIMIZATION_STRATEGIES = {
  // 缓存策略
  caching: {
    mathSolutions: {
      strategy: 'Hash-based caching',
      duration: '30 days',
      savings: 'Up to 60% on repeat questions'
    },
    audioFiles: {
      strategy: 'Script fingerprint caching', 
      duration: '90 days',
      savings: 'Up to 40% on similar explanations'
    },
    animations: {
      strategy: 'Math pattern caching',
      duration: '120 days',
      savings: 'Up to 70% on common math operations'
    }
  },
  
  // 智能路由
  intelligentRouting: {
    languageDetection: 'Auto-route to optimal AI service',
    loadBalancing: 'Distribute across multiple providers',
    fallbackChain: ['Primary API', 'Secondary API', 'Cached response', 'Error handling']
  },
  
  // 质量优化
  qualityOptimization: {
    mathAccuracy: 'Multi-model validation for critical calculations',
    voiceQuality: 'SSML optimization for math terminology',
    videoQuality: 'Adaptive bitrate based on content complexity'
  }
}

// 实际API调用示例
export const API_USAGE_EXAMPLES = {
  // 完整的视频生成流程
  generateMathVideo: async (question, language = 'en') => {
    const mathVideoAI = new MathVideoAIService()
    
    try {
      const result = await mathVideoAI.generateMathVideo(question, {
        language,
        difficulty: 'auto-detect',
        style: 'step-by-step',
        includeAnimation: true,
        voiceGender: 'female'
      })
      
      if (result.success) {
        console.log('视频生成成功:', result.video.videoUrl)
        console.log('预估成本:', mathVideoAI.estimateCost(result.metadata.duration, language))
        return result
      } else {
        console.error('视频生成失败:', result.error)
        return result.fallback
      }
    } catch (error) {
      console.error('API调用失败:', error)
      throw error
    }
  },
  
  // 批量视频生成
  batchGenerate: async (questions, language = 'en') => {
    const mathVideoAI = new MathVideoAIService()
    const results = []
    
    for (const question of questions) {
      try {
        const result = await mathVideoAI.generateMathVideo(question, { language })
        results.push(result)
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`问题 "${question}" 处理失败:`, error)
        results.push({ success: false, error: error.message, question })
      }
    }
    
    return results
  }
}

// 部署配置说明
export const DEPLOYMENT_GUIDE = {
  environmentSetup: {
    '.env配置': `
# AI服务API密钥
REACT_APP_OPENAI_API_KEY=your_openai_key_here
REACT_APP_QWEN_API_KEY=your_qwen_key_here  
REACT_APP_AZURE_SPEECH_KEY=your_azure_key_here
REACT_APP_AZURE_REGION=your_azure_region
REACT_APP_DID_API_KEY=your_did_key_here

# 可选服务
REACT_APP_HEYGEN_API_KEY=your_heygen_key_here
REACT_APP_MANIM_API_ENDPOINT=http://your-manim-server:8001
`,
    
    'Docker配置': `
# Dockerfile for Manim animation service
FROM manimcommunity/manim:latest
COPY manim_server.py /app/
EXPOSE 8001
CMD ["python", "/app/manim_server.py"]
`,
    
    '成本控制': `
# API使用限制
- 设置每日/每月API调用限制
- 实现用户配额管理
- 添加成本监控告警
- 使用缓存减少重复调用
`
  },
  
  scalingStrategy: {
    stage1: '小规模测试 (100用户) - 预算$500/月',
    stage2: '中等规模 (1000用户) - 预算$2000/月', 
    stage3: '大规模部署 (10000用户) - 预算$15000/月',
    enterprise: '企业级 (100000用户) - 需要专门的成本优化策略'
  }
}