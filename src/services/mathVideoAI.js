// 数学视频AI服务 - 使用模块化架构
import { MathVideoController } from './mathVideoController.js'

export class MathVideoAIService {
  constructor() {
    this.controller = new MathVideoController()
    this.config = {
      qwen: {
        endpoint: 'http://localhost:8002/api/qwen',
        apiKey: process.env.VITE_QWEN_API_KEY || 'your-qwen-api-key'
      },
      openai: {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        apiKey: process.env.VITE_OPENAI_API_KEY || 'your-openai-api-key'
      }
    }
  }

  // 主入口方法 - 生成数学视频
  async generateMathVideo(question, solution, language = 'zh') {
    return await this.controller.generateMathVideo(question, solution, language)
  }

  // 问题类型分析
  analyzeQuestionType(question) {
    return this.controller.questionAnalyzer.analyzeQuestionType(question)
  }

  // 获取问题类型统计
  getQuestionTypeStats() {
    return this.controller.getQuestionTypeStats()
  }

  // 测试问题类型分析
  testQuestionAnalysis(questions) {
    return this.controller.testQuestionAnalysis(questions)
  }

  // 批量生成视频
  async batchGenerateVideos(questions, solutions, language = 'zh') {
    return await this.controller.batchGenerateVideos(questions, solutions, language)
  }
}