import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Users, TrendingUp, Clock, BookOpen, AlertCircle, Star } from 'lucide-react'

export default function ParentDashboard() {
  const [children] = useState([
    {
      name: "Alex Johnson",
      grade: "8th Grade",
      streak: 7,
      weeklyTime: 4.5,
      weeklyProgress: 78,
      strengths: ["Algebra", "Geometry"],
      weaknesses: ["Fractions", "Word Problems"],
      recentScores: [85, 92, 78, 88, 95]
    },
    {
      name: "Sarah Johnson",
      grade: "5th Grade",
      streak: 3,
      weeklyTime: 3.2,
      weeklyProgress: 65,
      strengths: ["Addition", "Subtraction"],
      weaknesses: ["Multiplication", "Division"],
      recentScores: [78, 82, 75, 90, 85]
    }
  ])

  const [insights] = useState([
    {
      type: "warning",
      title: "Math Concepts Need Attention",
      description: "Alex is struggling with quadratic functions. Consider additional practice.",
      action: "Schedule Review Session"
    },
    {
      type: "success",
      title: "Great Progress!",
      description: "Sarah has improved 15% in multiplication this week.",
      action: "Send Encouragement"
    },
    {
      type: "info",
      title: "Learning Streak",
      description: "Alex has maintained a 7-day learning streak. Keep it up!",
      action: "View Details"
    }
  ])

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertCircle className="h-5 w-5 text-orange-500" />
      case 'success': return <Star className="h-5 w-5 text-green-500" />
      case 'info': return <BookOpen className="h-5 w-5 text-blue-500" />
      default: return <BookOpen className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your children's learning progress and insights</p>
        </div>

        {/* Children Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {children.map((child, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{child.name}</span>
                  <Badge variant="outline">{child.grade}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{child.streak}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{child.weeklyTime}h</div>
                    <div className="text-sm text-gray-600">This Week</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Weekly Progress</span>
                      <span>{child.weeklyProgress}%</span>
                    </div>
                    <Progress value={child.weeklyProgress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-green-600 mb-1">Strengths</h4>
                      <div className="space-y-1">
                        {child.strengths.map((strength, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-orange-600 mb-1">Needs Work</h4>
                      <div className="space-y-1">
                        {child.weaknesses.map((weakness, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {weakness}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Insights & Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          {getInsightIcon(insight.type)}
                          <h4 className="font-semibold text-sm ml-2">{insight.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        <Button size="sm" variant="outline" className="text-xs">
                          {insight.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">12.5</div>
                  <div className="text-sm text-gray-600">Total Hours This Week</div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Videos Watched</span>
                      <span>23</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Problems Solved</span>
                      <span>67</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Score</span>
                      <span>85%</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-2">Most Active Days</h4>
                    <div className="flex justify-between">
                      <div className="text-center">
                        <div className="text-sm font-medium">Mon</div>
                        <div className="text-xs text-gray-600">2.5h</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Wed</div>
                        <div className="text-xs text-gray-600">3.2h</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Fri</div>
                        <div className="text-xs text-gray-600">2.8h</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Schedule Parent-Teacher Meeting
          </Button>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            View Detailed Reports
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Set Learning Goals
          </Button>
        </div>
      </div>
    </div>
  )
}