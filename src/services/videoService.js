import { supabase } from '../config/supabase'
import authService from './authService'

class VideoService {
  constructor() {
    this.storagePolicy = {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
      bucketName: 'videos'
    }
  }

  // Save video metadata to database
  async saveVideoMetadata(videoData) {
    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('videos')
        .insert([{
          user_id: user.id,
          title: videoData.title || this.generateVideoTitle(videoData.question),
          description: videoData.description || '',
          question: videoData.question,
          video_url: videoData.videoUrl,
          thumbnail_url: videoData.thumbnailUrl || '',
          duration: videoData.duration || 0,
          language: videoData.language || 'zh',
          math_topics: videoData.mathTopics || [],
          difficulty_level: videoData.difficultyLevel || 'intermediate',
          solution_data: videoData.solutionData || {},
          processing_status: videoData.processingStatus || 'completed'
        }])
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        video: data
      }
    } catch (error) {
      console.error('Error saving video metadata:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get user's videos
  async getUserVideos(options = {}) {
    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      let query = supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Apply filters
      if (options.language) {
        query = query.eq('language', options.language)
      }

      if (options.mathTopics && options.mathTopics.length > 0) {
        query = query.contains('math_topics', options.mathTopics)
      }

      if (options.difficultyLevel) {
        query = query.eq('difficulty_level', options.difficultyLevel)
      }

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,question.ilike.%${options.search}%`)
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return {
        success: true,
        videos: data
      }
    } catch (error) {
      console.error('Error getting user videos:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get single video by ID
  async getVideoById(videoId) {
    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        video: data
      }
    } catch (error) {
      console.error('Error getting video:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Update video metadata
  async updateVideo(videoId, updates) {
    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('videos')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', videoId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        video: data
      }
    } catch (error) {
      console.error('Error updating video:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Delete video
  async deleteVideo(videoId) {
    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // First get the video to check if it exists and get file paths
      const { data: video, error: getError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .eq('user_id', user.id)
        .single()

      if (getError) {
        throw getError
      }

      // Delete video file from storage if it exists
      if (video.video_url) {
        const fileName = this.extractFileNameFromUrl(video.video_url)
        if (fileName) {
          const { error: deleteFileError } = await supabase.storage
            .from(this.storagePolicy.bucketName)
            .remove([fileName])

          if (deleteFileError) {
            console.warn('Error deleting video file:', deleteFileError)
          }
        }
      }

      // Delete thumbnail file if it exists
      if (video.thumbnail_url) {
        const thumbFileName = this.extractFileNameFromUrl(video.thumbnail_url)
        if (thumbFileName) {
          const { error: deleteThumbError } = await supabase.storage
            .from(this.storagePolicy.bucketName)
            .remove([thumbFileName])

          if (deleteThumbError) {
            console.warn('Error deleting thumbnail file:', deleteThumbError)
          }
        }
      }

      // Delete video record from database
      const { error: deleteError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)
        .eq('user_id', user.id)

      if (deleteError) {
        throw deleteError
      }

      return {
        success: true,
        message: 'Video deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting video:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Upload video file to Supabase storage
  async uploadVideoFile(file, videoId) {
    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // Validate file
      const validationResult = this.validateVideoFile(file)
      if (!validationResult.valid) {
        throw new Error(validationResult.error)
      }

      // Generate unique filename
      const fileName = `${user.id}/${videoId}/${Date.now()}_${file.name}`
      
      // Upload file
      const { data, error } = await supabase.storage
        .from(this.storagePolicy.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.storagePolicy.bucketName)
        .getPublicUrl(fileName)

      return {
        success: true,
        fileName: fileName,
        publicUrl: urlData.publicUrl
      }
    } catch (error) {
      console.error('Error uploading video file:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Generate video share link
  async generateShareLink(videoId) {
    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // Get video to ensure it exists and belongs to user
      const { data: video, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        throw error
      }

      // Generate share token (you might want to implement a proper token system)
      const shareToken = this.generateShareToken(videoId, user.id)
      
      return {
        success: true,
        shareUrl: `${window.location.origin}/share/${shareToken}`,
        video: video
      }
    } catch (error) {
      console.error('Error generating share link:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get video statistics
  async getVideoStats() {
    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      const stats = {
        totalVideos: data.length,
        totalDuration: data.reduce((sum, video) => sum + (video.duration || 0), 0),
        languageBreakdown: this.calculateLanguageBreakdown(data),
        topicBreakdown: this.calculateTopicBreakdown(data),
        difficultyBreakdown: this.calculateDifficultyBreakdown(data),
        createdThisWeek: this.countVideosThisWeek(data),
        createdThisMonth: this.countVideosThisMonth(data)
      }

      return {
        success: true,
        stats
      }
    } catch (error) {
      console.error('Error getting video stats:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Helper methods
  generateVideoTitle(question) {
    if (!question) return 'Math Problem Solution'
    
    const truncated = question.length > 50 ? question.substring(0, 50) + '...' : question
    return `Math: ${truncated}`
  }

  validateVideoFile(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' }
    }

    if (file.size > this.storagePolicy.maxFileSize) {
      return { valid: false, error: 'File too large. Maximum size is 100MB.' }
    }

    if (!this.storagePolicy.allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only MP4, WebM, and QuickTime files are allowed.' }
    }

    return { valid: true }
  }

  extractFileNameFromUrl(url) {
    if (!url) return null
    
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      return pathParts[pathParts.length - 1]
    } catch (error) {
      console.error('Error extracting filename from URL:', error)
      return null
    }
  }

  generateShareToken(videoId, userId) {
    // Simple token generation - in production, use proper JWT or similar
    const timestamp = Date.now()
    const data = `${videoId}:${userId}:${timestamp}`
    return btoa(data).replace(/[+=]/g, '').substring(0, 12)
  }

  calculateLanguageBreakdown(videos) {
    const breakdown = {}
    videos.forEach(video => {
      const lang = video.language || 'unknown'
      breakdown[lang] = (breakdown[lang] || 0) + 1
    })
    return breakdown
  }

  calculateTopicBreakdown(videos) {
    const breakdown = {}
    videos.forEach(video => {
      const topics = video.math_topics || []
      topics.forEach(topic => {
        breakdown[topic] = (breakdown[topic] || 0) + 1
      })
    })
    return breakdown
  }

  calculateDifficultyBreakdown(videos) {
    const breakdown = {}
    videos.forEach(video => {
      const difficulty = video.difficulty_level || 'unknown'
      breakdown[difficulty] = (breakdown[difficulty] || 0) + 1
    })
    return breakdown
  }

  countVideosThisWeek(videos) {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    return videos.filter(video => {
      const createdAt = new Date(video.created_at)
      return createdAt >= weekAgo
    }).length
  }

  countVideosThisMonth(videos) {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    
    return videos.filter(video => {
      const createdAt = new Date(video.created_at)
      return createdAt >= monthAgo
    }).length
  }
}

export default new VideoService()