import { supabase } from '../config/supabase'
import authService from './authService'

class UserService {
  constructor() {
    this.currentUser = null
  }

  // Get current user profile with full details
  async getCurrentUserProfile() {
    try {
      const user = authService.getCurrentUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error getting user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getCurrentUserProfile:', error)
      return null
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        data,
        message: 'Profile updated successfully!'
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get user preferences
  async getUserPreferences() {
    try {
      const user = authService.getCurrentUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error getting user preferences:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserPreferences:', error)
      return null
    }
  }

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        data,
        message: 'Preferences updated successfully!'
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Save generated video to database
  async saveVideo(videoData) {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const videoRecord = {
        user_id: user.id,
        title: videoData.title || `Math Video - ${new Date().toLocaleString()}`,
        description: videoData.description || 'AI-generated math teaching video',
        question: videoData.question,
        video_url: videoData.videoUrl,
        thumbnail_url: videoData.thumbnailUrl || null,
        duration: videoData.duration || 0,
        language: videoData.language || 'zh',
        math_topics: videoData.mathTopics || [],
        difficulty_level: videoData.difficultyLevel || 'intermediate',
        solution_data: videoData.solutionData || null,
        processing_status: 'completed'
      }

      const { data, error } = await supabase
        .from('videos')
        .insert([videoRecord])
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        data,
        message: 'Video saved successfully!'
      }
    } catch (error) {
      console.error('Error saving video:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get user's videos
  async getUserVideos(limit = 50, offset = 0) {
    try {
      console.log('🔍 userService.getUserVideos 开始...')
      const user = authService.getCurrentUser()
      if (!user) {
        console.error('❌ 用户未认证')
        throw new Error('User not authenticated')
      }
      
      console.log('👤 当前用户:', user.email)

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      console.log('📊 Supabase查询结果:', { data, error })

      if (error) {
        console.error('❌ Supabase查询错误:', error)
        throw error
      }

      console.log('✅ 成功获取视频数据，数量:', data?.length || 0)
      return {
        success: true,
        data: data || [],
        count: data?.length || 0
      }
    } catch (error) {
      console.error('❌ getUserVideos异常:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  // Get single video by ID
  async getVideoById(videoId) {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

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
        data
      }
    } catch (error) {
      console.error('Error getting video:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Update video
  async updateVideo(videoId, updates) {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

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
        data,
        message: 'Video updated successfully!'
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
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Video deleted successfully!'
      }
    } catch (error) {
      console.error('Error deleting video:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get video count
      const { data: videos, error: videoError } = await supabase
        .from('videos')
        .select('id, created_at, math_topics, difficulty_level')
        .eq('user_id', user.id)

      if (videoError) {
        throw videoError
      }

      // Calculate statistics
      const stats = {
        totalVideos: videos.length,
        videosThisWeek: videos.filter(v => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(v.created_at) > weekAgo
        }).length,
        videosThisMonth: videos.filter(v => {
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return new Date(v.created_at) > monthAgo
        }).length,
        topicCounts: {},
        difficultyLevels: {}
      }

      // Count topics and difficulty levels
      videos.forEach(video => {
        if (video.math_topics) {
          video.math_topics.forEach(topic => {
            stats.topicCounts[topic] = (stats.topicCounts[topic] || 0) + 1
          })
        }
        if (video.difficulty_level) {
          stats.difficultyLevels[video.difficulty_level] = 
            (stats.difficultyLevels[video.difficulty_level] || 0) + 1
        }
      })

      return {
        success: true,
        data: stats
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Search user's videos
  async searchUserVideos(query, filters = {}) {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      let queryBuilder = supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)

      // Add search conditions
      if (query) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,question.ilike.%${query}%,description.ilike.%${query}%`
        )
      }

      // Add filters
      if (filters.language) {
        queryBuilder = queryBuilder.eq('language', filters.language)
      }
      if (filters.difficulty_level) {
        queryBuilder = queryBuilder.eq('difficulty_level', filters.difficulty_level)
      }
      if (filters.math_topics && filters.math_topics.length > 0) {
        queryBuilder = queryBuilder.contains('math_topics', filters.math_topics)
      }

      // Order by creation date
      queryBuilder = queryBuilder.order('created_at', { ascending: false })

      const { data, error } = await queryBuilder

      if (error) {
        throw error
      }

      return {
        success: true,
        data,
        count: data.length
      }
    } catch (error) {
      console.error('Error searching videos:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Check if user can generate video (rate limiting)
  async canGenerateVideo() {
    try {
      console.log('🔍 userService.canGenerateVideo 开始...')
      const user = authService.getCurrentUser()
      if (!user) {
        console.log('❌ 用户未认证')
        return { canGenerate: false, reason: 'Not authenticated' }
      }
      
      console.log('👤 当前用户:', user.email)

      // 添加超时处理
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Rate limit check timeout')), 5000) // 5秒超时
      })

      const rateLimitPromise = (async () => {
        // Check recent video generation (last hour)
        const oneHourAgo = new Date()
        oneHourAgo.setHours(oneHourAgo.getHours() - 1)

        const { data, error } = await supabase
          .from('videos')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', oneHourAgo.toISOString())

        if (error) {
          console.error('❌ Supabase查询错误:', error)
          throw error
        }

        // Allow up to 10 videos per hour
        const videosLastHour = data.length
        const maxVideosPerHour = 10

        console.log('✅ 速率限制检查完成，过去1小时视频数:', videosLastHour)
        return {
          canGenerate: videosLastHour < maxVideosPerHour,
          reason: videosLastHour >= maxVideosPerHour ? 
            `Rate limit exceeded. You can generate ${maxVideosPerHour} videos per hour.` : null,
          videosRemaining: Math.max(0, maxVideosPerHour - videosLastHour)
        }
      })()

      // 使用 Promise.race 实现超时
      const result = await Promise.race([rateLimitPromise, timeoutPromise])
      return result

    } catch (error) {
      console.error('❌ canGenerateVideo异常:', error)
      // 如果出现任何错误（包括超时），允许生成视频
      return { 
        canGenerate: true, 
        reason: null,
        videosRemaining: 10,
        error: error.message 
      }
    }
  }
}

export default new UserService()