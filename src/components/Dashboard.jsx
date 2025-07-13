import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Target, Clock, BookOpen, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [user] = useState({
    name: "Alex Johnson",
    grade: "8th Grade",
    level: "Intermediate",
    streak: 7,
    totalPoints: 1250,
    videosWatched: 45,
    problemsSolved: 189
  })

  const [recentActivity] = useState([
    { topic: "Linear Equations", time: "2 hours ago", score: 85 },
    { topic: "Fractions", time: "1 day ago", score: 92 },
    { topic: "Geometry Basics", time: "2 days ago", score: 78 },
    { topic: "Algebra Word Problems", time: "3 days ago", score: 88 }
  ])

  const [achievements] = useState([
    { title: "Problem Solver", description: "Solved 100+ problems", icon: Target, earned: true },
    { title: "Streak Master", description: "7-day learning streak", icon: Trophy, earned: true },
    { title: "Video Enthusiast", description: "Watched 50+ videos", icon: BookOpen, earned: false },
    { title: "Math Wizard", description: "90%+ average score", icon: Star, earned: false }
  ])

  const [weakAreas] = useState([
    { topic: "Quadratic Functions", score: 65, improvement: "+5%" },
    { topic: "Trigonometry", score: 72, improvement: "+8%" },
    { topic: "Statistics", score: 78, improvement: "+3%" }
  ])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">{user.grade} • {user.level} Level</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold">{user.totalPoints.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold">{user.streak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Videos Watched</p>
                  <p className="text-2xl font-bold">{user.videosWatched}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Problems Solved</p>
                  <p className="text-2xl font-bold">{user.problemsSolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{activity.topic}</h4>
                      <p className="text-sm text-gray-600">{activity.time}</p>
                    </div>
                    <Badge variant={activity.score >= 85 ? "default" : "secondary"}>
                      {activity.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-center p-3 rounded-lg ${
                    achievement.earned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                  }`}>
                    <achievement.icon className={`h-6 w-6 mr-3 ${
                      achievement.earned ? 'text-yellow-500' : 'text-gray-400'
                    }`} />
                    <div>
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Improvement Areas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weakAreas.map((area, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{area.topic}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600">{area.improvement}</span>
                        <Badge variant="outline">{area.score}%</Badge>
                      </div>
                    </div>
                    <Progress value={area.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" variant="default">
                  Continue Learning
                </Button>
                <Button className="w-full" variant="outline">
                  Practice Problems
                </Button>
                <Button className="w-full" variant="outline">
                  Review Videos
                </Button>
                <Button className="w-full" variant="outline">
                  Take Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}