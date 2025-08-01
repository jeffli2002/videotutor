// Enhanced Math Video AI Service - with image input support
import { MathVideoController } from './mathVideoController.js';
import { ImageInputService } from './imageInputService.js';

export class MathVideoAIService {
  constructor() {
    this.controller = new MathVideoController();
    this.imageService = new ImageInputService();
    this.config = {
      kimi: {
        endpoint: 'http://localhost:3001/api/kimi/chat',
        apiKey: import.meta?.env?.VITE_KIMI_API_KEY || 'your-kimi-api-key'
      },
      openai: {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        apiKey: import.meta?.env?.VITE_OPENAI_API_KEY || 'your-openai-api-key'
      }
    };
  }

  /**
   * Main entry method - generate math video from text question
   * @param {string} question - The mathematical question
   * @param {string} solution - The solution to the question
   * @param {string} language - Language for the video (en, zh, fr, es, ja)
   * @returns {Promise<Object>} Video generation result
   */
  async generateMathVideo(question, solution, language = 'en') {
    return await this.controller.generateMathVideo(question, solution, language);
  }

  /**
   * Generate video from image input
   * @param {File} imageFile - The image file to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Video generation result
   */
  async generateVideoFromImage(imageFile, options = {}) {
    console.log('🖼️ Processing image for video generation...');
    
    try {
      // Process the image
      const processingResult = await this.imageService.processImage(imageFile, {
        language: options.language || 'en'
      });

      if (!processingResult.success) {
        throw new Error(processingResult.error);
      }

      // Generate video from processed image data
      const videoResult = await this.controller.generateVideoFromImage(
        processingResult,
        options.language
      );

      return {
        success: true,
        imageId: processingResult.imageId,
        videoResult,
        processing: processingResult,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Image-based video generation failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Batch process multiple images
   * @param {File[]} imageFiles - Array of image files
   * @param {Object} options - Processing options
   * @returns {Promise<Array>} Array of processing results
   */
  async batchProcessImages(imageFiles, options = {}) {
    console.log(`🔄 Starting batch processing of ${imageFiles.length} images...`);
    
    const results = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      console.log(`📝 Processing image ${i + 1}/${imageFiles.length}...`);
      
      try {
        const result = await this.generateVideoFromImage(imageFiles[i], options);
        results.push({
          index: i,
          fileName: imageFiles[i].name,
          ...result
        });
      } catch (error) {
        results.push({
          index: i,
          fileName: imageFiles[i].name,
          success: false,
          error: error.message
        });
      }
      
      // Add delay to avoid overwhelming the server
      if (i < imageFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Get processing status
   * @param {string} processId - Processing ID
   * @returns {Promise<Object>} Status information
   */
  async getProcessingStatus(processId) {
    return await this.imageService.getStatus(processId);
  }

  /**
   * Cancel ongoing processing
   * @param {string} processId - Processing ID to cancel
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelProcessing(processId) {
    return await this.imageService.cancelProcessing(processId);
  }

  /**
   * Get supported formats and capabilities
   * @returns {Object} System capabilities
   */
  getCapabilities() {
    return {
      image: {
        formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'],
        maxSize: '10MB',
        languages: ['en', 'zh', 'fr', 'es', 'ja']
      },
      ocr: {
        providers: ['kimi', 'tesseract'],
        languages: ['en', 'zh', 'fr', 'es', 'ja']
      },
      video: {
        formats: ['mp4'],
        quality: '1080p',
        audio: true
      }
    };
  }

  /**
   * Analyze question type
   * @param {string} question - The question to analyze
   * @returns {Object} Question analysis
   */
  analyzeQuestionType(question) {
    return this.controller.questionAnalyzer.analyzeQuestionType(question);
  }

  /**
   * Get question type statistics
   * @returns {Object} Statistics for different question types
   */
  getQuestionTypeStats() {
    return this.controller.getQuestionTypeStats();
  }

  /**
   * Test question analysis with sample questions
   * @param {string[]} questions - Array of questions to test
   * @returns {Array} Analysis results
   */
  testQuestionAnalysis(questions) {
    return this.controller.testQuestionAnalysis(questions);
  }

  /**
   * Get configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration values
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Validate API configuration
   * @returns {Object} Validation result
   */
  validateConfiguration() {
    const results = {
      kimi: {
        configured: !!this.config.kimi.apiKey && this.config.kimi.apiKey !== 'your-kimi-api-key',
        endpoint: this.config.kimi.endpoint
      },
      openai: {
        configured: !!this.config.openai.apiKey && this.config.openai.apiKey !== 'your-openai-api-key',
        endpoint: this.config.openai.endpoint
      }
    };

    return {
      valid: results.kimi.configured || results.openai.configured,
      details: results
    };
  }
}

export default MathVideoAIService;