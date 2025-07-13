import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, X, RefreshCw, Play, Award } from 'lucide-react'

export default function PracticeMode() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(false)

  const questions = [
    {
      id: 1,
      question: "Solve for x: 2x + 5 = 15",
      options: ["x = 5", "x = 10", "x = 7", "x = 3"],
      correct: 0,
      explanation: "Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5"
    },
    {
      id: 2,
      question: "What is the area of a triangle with base 8 and height 6?",
      options: ["24", "48", "14", "32"],
      correct: 0,
      explanation: "Area = (1/2) × base × height = (1/2) × 8 × 6 = 24"
    },
    {
      id: 3,
      question: "Simplify: 3x + 2x - x",
      options: ["4x", "5x", "6x", "2x"],
      correct: 0,
      explanation: "Combine like terms: 3x + 2x - x = (3 + 2 - 1)x = 4x"
    }
  ]

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex)
    const correct = answerIndex === questions[currentQuestion].correct
    setIsCorrect(correct)
    setShowResult(true)
    if (correct) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const isComplete = currentQuestion === questions.length - 1 && showResult
  const progress = ((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Practice Mode</h1>
          <p className="text-gray-600 mt-2">Test your understanding with interactive problems</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-4 text-sm">
              <span>Score: {score}/{questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </CardContent>
        </Card>

        {!isComplete ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Question {currentQuestion + 1}</span>
                <Badge variant="outline">Algebra</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  {questions[currentQuestion].question}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions[currentQuestion].options.map((option, index) => (
                    <Button
                      key={index}
                      variant={
                        showResult
                          ? index === questions[currentQuestion].correct
                            ? "default"
                            : selectedAnswer === index
                            ? "destructive"
                            : "outline"
                          : selectedAnswer === index
                          ? "secondary"
                          : "outline"
                      }
                      className="p-4 h-auto text-left justify-start"
                      onClick={() => !showResult && handleAnswerSelect(index)}
                      disabled={showResult}
                    >
                      <div className="flex items-center">
                        {showResult && index === questions[currentQuestion].correct && (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        )}
                        {showResult && selectedAnswer === index && index !== questions[currentQuestion].correct && (
                          <X className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </div>
                    </Button>
                  ))}
                </div>

                {showResult && (
                  <div className={`p-4 rounded-lg border-l-4 ${
                    isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                  }`}>
                    <div className="flex items-center mb-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className="font-semibold">
                        {isCorrect ? "Correct!" : "Incorrect"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      {questions[currentQuestion].explanation}
                    </p>
                    <Button
                      onClick={handleNext}
                      disabled={currentQuestion === questions.length - 1}
                    >
                      {currentQuestion === questions.length - 1 ? "View Results" : "Next Question"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-6 w-6 text-yellow-500 mr-2" />
                Practice Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-blue-600">
                    {score}/{questions.length}
                  </div>
                  <div className="text-lg text-gray-600">
                    {Math.round((score / questions.length) * 100)}% Score
                  </div>
                </div>

                <div className="flex justify-center">
                  <Badge 
                    variant={score === questions.length ? "default" : score >= questions.length * 0.7 ? "secondary" : "outline"}
                    className="text-lg px-4 py-2"
                  >
                    {score === questions.length ? "Perfect!" : score >= questions.length * 0.7 ? "Good Job!" : "Keep Practicing!"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">+{score * 10}</div>
                    <div className="text-sm text-gray-600">Points Earned</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">+{score}</div>
                    <div className="text-sm text-gray-600">Streak Bonus</div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={handleRestart}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Explanation Videos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}