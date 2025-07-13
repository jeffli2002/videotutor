export class ProgressService {
  constructor() {
    this.storageKey = 'mathtutor_progress'
    this.init()
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify({
        user: null,
        sessions: [],
        achievements: [],
        streak: 0,
        totalPoints: 0,
        lastActivity: null
      }))
    }
  }

  getProgress() {
    return JSON.parse(localStorage.getItem(this.storageKey))
  }

  updateProgress(updates) {
    const current = this.getProgress()
    const updated = { ...current, ...updates }
    localStorage.setItem(this.storageKey, JSON.stringify(updated))
    return updated
  }

  recordSession(sessionData) {
    const progress = this.getProgress()
    const session = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...sessionData
    }
    
    progress.sessions.push(session)
    progress.lastActivity = new Date().toISOString()
    
    // Update streak
    if (this.isConsecutiveDay(progress.lastActivity)) {
      progress.streak += 1
    } else {
      progress.streak = 1
    }
    
    // Update points
    progress.totalPoints += sessionData.pointsEarned || 0
    
    this.updateProgress(progress)
    this.checkAchievements()
    
    return session
  }

  getSessionStats() {
    const progress = this.getProgress()
    const sessions = progress.sessions
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTime: 0,
        averageScore: 0,
        topicDistribution: {},
        weakAreas: [],
        strongAreas: []
      }
    }
    
    const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0)
    const scores = sessions.filter(s => s.score).map(s => s.score)
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0
    
    // Topic distribution
    const topicCount = {}
    sessions.forEach(session => {
      if (session.topic) {
        topicCount[session.topic] = (topicCount[session.topic] || 0) + 1
      }
    })
    
    // Identify weak and strong areas
    const topicScores = {}
    sessions.forEach(session => {
      if (session.topic && session.score) {
        if (!topicScores[session.topic]) {
          topicScores[session.topic] = []
        }
        topicScores[session.topic].push(session.score)
      }
    })
    
    const weakAreas = []
    const strongAreas = []
    
    Object.entries(topicScores).forEach(([topic, scores]) => {
      const avg = scores.reduce((a, b) => a + b) / scores.length
      if (avg < 70) {
        weakAreas.push({ topic, averageScore: avg })
      } else if (avg > 85) {
        strongAreas.push({ topic, averageScore: avg })
      }
    })
    
    return {
      totalSessions: sessions.length,
      totalTime,
      averageScore,
      topicDistribution: topicCount,
      weakAreas: weakAreas.sort((a, b) => a.averageScore - b.averageScore),
      strongAreas: strongAreas.sort((a, b) => b.averageScore - a.averageScore)
    }
  }

  getAchievements() {
    const progress = this.getProgress()
    return progress.achievements || []
  }

  checkAchievements() {
    const progress = this.getProgress()
    const stats = this.getSessionStats()
    const newAchievements = []
    
    const achievements = [
      {
        id: 'first_session',
        title: 'Getting Started',
        description: 'Completed your first session',
        condition: () => stats.totalSessions >= 1,
        points: 50
      },
      {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintained a 7-day learning streak',
        condition: () => progress.streak >= 7,
        points: 100
      },
      {
        id: 'sessions_10',
        title: 'Dedicated Learner',
        description: 'Completed 10 sessions',
        condition: () => stats.totalSessions >= 10,
        points: 150
      },
      {
        id: 'high_scorer',
        title: 'Math Master',
        description: 'Achieved 90%+ average score',
        condition: () => stats.averageScore >= 90,
        points: 200
      },
      {
        id: 'time_5h',
        title: 'Time Invested',
        description: 'Spent 5+ hours learning',
        condition: () => stats.totalTime >= 300, // 5 hours in minutes
        points: 100
      }
    ]
    
    const earned = progress.achievements.map(a => a.id)
    
    achievements.forEach(achievement => {
      if (!earned.includes(achievement.id) && achievement.condition()) {
        newAchievements.push({
          ...achievement,
          earnedAt: new Date().toISOString()
        })
        progress.totalPoints += achievement.points
      }
    })
    
    if (newAchievements.length > 0) {
      progress.achievements.push(...newAchievements)
      this.updateProgress(progress)
    }
    
    return newAchievements
  }

  getWeeklyReport() {
    const progress = this.getProgress()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const weeklySessions = progress.sessions.filter(session => 
      new Date(session.timestamp) >= oneWeekAgo
    )
    
    const dailyActivity = {}
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    // Initialize all days
    days.forEach(day => {
      dailyActivity[day] = { sessions: 0, time: 0, points: 0 }
    })
    
    weeklySessions.forEach(session => {
      const dayName = days[new Date(session.timestamp).getDay()]
      dailyActivity[dayName].sessions += 1
      dailyActivity[dayName].time += session.duration || 0
      dailyActivity[dayName].points += session.pointsEarned || 0
    })
    
    const totalWeeklyTime = weeklySessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const totalWeeklyPoints = weeklySessions.reduce((sum, s) => sum + (s.pointsEarned || 0), 0)
    
    return {
      totalSessions: weeklySessions.length,
      totalTime: totalWeeklyTime,
      totalPoints: totalWeeklyPoints,
      dailyBreakdown: dailyActivity,
      mostActiveDay: Object.entries(dailyActivity)
        .sort(([,a], [,b]) => b.time - a.time)[0]
    }
  }

  isConsecutiveDay(lastActivity) {
    if (!lastActivity) return false
    
    const last = new Date(lastActivity)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Check if last activity was yesterday
    return (
      last.getDate() === yesterday.getDate() &&
      last.getMonth() === yesterday.getMonth() &&
      last.getFullYear() === yesterday.getFullYear()
    )
  }

  exportProgress() {
    return {
      data: this.getProgress(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  }

  importProgress(data) {
    if (data.version === '1.0' && data.data) {
      localStorage.setItem(this.storageKey, JSON.stringify(data.data))
      return true
    }
    return false
  }

  resetProgress() {
    localStorage.removeItem(this.storageKey)
    this.init()
  }
}

export default new ProgressService()