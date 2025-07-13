import { useState } from 'react'
import { Button } from './src/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './src/components/ui/card.jsx'
import { Textarea } from './src/components/ui/textarea.jsx'
import { Badge } from './src/components/ui/badge.jsx'
import { Progress } from './src/components/ui/progress.jsx'
import { Calculator, Upload, Mic, Play, Star, Trophy, BookOpen, Users, CheckCircle } from 'lucide-react'

function App() {
  const [question, setQuestion] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState(null)

  const handleGenerateVideo = async () => {
    if (!question.trim()) return
    
    setIsGenerating(true)
    // Simulate video generation
    setTimeout(() => {
      setGeneratedVideo({
        title: "Solving: " + question.substring(0, 50) + "...",
        duration: "2:34",
        steps: [
          "Identify the problem type",
          "Apply the appropriate formula",
          "Solve step by step",
          "Verify the answer"
        ]
      })
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">MathTutor AI</span>
              <Badge variant="secondary">Beta</Badge>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">My Videos</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Progress</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Ask Anything, Learn Visually
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Clear, AI-powered explanations for K12 math — perfect for homework help and concept mastery
          </p>

          {/* Question Input */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Try typing: 'What's a function?' or 'Solve 2x + 5 = 15'"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px] text-lg"
                />
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mic className="h-4 w-4 mr-2" />
                      Voice Input
                    </Button>
                  </div>
                  <Button 
                    onClick={handleGenerateVideo}
                    disabled={!question.trim() || isGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Create Video Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Video Preview */}
          {generatedVideo && (
            <Card className="max-w-2xl mx-auto mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Video Generated Successfully!
                </CardTitle>
                <CardDescription>{generatedVideo.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 mb-4">
                  <div className="flex items-center justify-center">
                    <Play className="h-16 w-16 text-blue-600" />
                  </div>
                  <p className="text-center text-gray-600 mt-2">Duration: {generatedVideo.duration}</p>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold mb-2">Solution Steps:</h4>
                  <ul className="space-y-1">
                    {generatedVideo.steps.map((step, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Indicator */}
          {isGenerating && (
            <Card className="max-w-2xl mx-auto mb-8">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Generating your personalized explanation...</h3>
                  <Progress value={66} className="w-full" />
                  <p className="text-sm text-gray-600">Analyzing problem and creating visual explanation</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Supported Topics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Supported Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Elementary Math", desc: "Basic arithmetic and number sense", icon: "🔢" },
              { title: "Algebra", desc: "Linear equations and functions", icon: "📐" },
              { title: "Geometry", desc: "Shapes, angles, and measurements", icon: "📏" },
              { title: "Pre-Calculus", desc: "Advanced functions and trigonometry", icon: "📊" }
            ].map((topic, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{topic.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                  <p className="text-gray-600 text-sm">{topic.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose MathTutor AI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Star className="h-8 w-8 text-yellow-500" />,
                title: "Personalized Learning",
                desc: "AI adapts to your learning style and pace"
              },
              {
                icon: <Trophy className="h-8 w-8 text-blue-500" />,
                title: "Gamified Experience",
                desc: "Earn rewards and track your progress"
              },
              {
                icon: <Users className="h-8 w-8 text-green-500" />,
                title: "Parent Dashboard",
                desc: "Monitor your child's learning journey"
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Videos */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Recent Explanations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Solving Linear Equations", views: "2,789", duration: "01:55" },
              { title: "Understanding Functions", views: "3,683", duration: "03:50" },
              { title: "Area of Triangles", views: "599", duration: "01:11" },
              { title: "Quadratic Formula", views: "1,094", duration: "01:39" },
              { title: "Probability Basics", views: "484", duration: "02:38" },
              { title: "Fractions and Decimals", views: "1,192", duration: "01:44" }
            ].map((video, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="bg-gray-100 rounded-lg p-6 mb-3 flex items-center justify-center">
                    <Play className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{video.title}</h3>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{video.views} views</span>
                    <span>{video.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calculator className="h-6 w-6" />
                <span className="text-xl font-bold">MathTutor AI</span>
              </div>
              <p className="text-gray-400">
                Empowering K12 students with AI-powered math explanations
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bug Report</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MathTutor AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

