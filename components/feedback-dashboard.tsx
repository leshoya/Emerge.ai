"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Clock,
  MessageSquare,
  ArrowLeft,
  RotateCcw,
  Check,
  Target,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Star,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { skillImprovementTips, questionFeedback } from "@/lib/feedback-data"

interface FeedbackDashboardProps {
  data: any
  onNewInterview: () => void
  onBackHome: () => void
}

export default function FeedbackDashboard({ data, onNewInterview, onBackHome }: FeedbackDashboardProps) {
  const [animated, setAnimated] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  useEffect(() => {
    setAnimated(true)
  }, [])

  const scores = [
    { label: "Structure & Framework", value: data.structure, color: "#22C55E", icon: Target },
    { label: "Communication", value: data.communication, color: "#3b82f6", icon: MessageSquare },
    { label: "Insights & Creativity", value: data.insights, color: "#8b5cf6", icon: Lightbulb },
    { label: "Response Time", value: data.responseTime, color: "#f59e0b", icon: Clock },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary"
    if (score >= 60) return "text-amber-500"
    return "text-destructive"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200"
    if (score >= 60) return "bg-amber-50 border-amber-200"
    return "bg-red-50 border-red-200"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Strong"
    if (score >= 70) return "Good"
    if (score >= 60) return "Developing"
    return "Needs Work"
  }

  const getDetailedFeedback = (response: string, questionIdx: number) => {
    const wordCount = response?.split(/\s+/).filter((w) => w.length > 0).length || 0
    const hasStructure = /first|second|third|framework|approach/i.test(response || "")
    const hasNumbers = /\d+/.test(response || "")
    const hasConclusion = /therefore|in conclusion|to summarize|recommend/i.test(response || "")

    const strengths: string[] = []
    const improvements: string[] = []
    const tips: string[] = []

    // Analyze strengths
    if (wordCount > 60) strengths.push("Comprehensive response with good detail")
    else if (wordCount > 30) strengths.push("Adequate response length")

    if (hasStructure) strengths.push("Good use of structured approach")
    if (hasNumbers) strengths.push("Effective use of quantification")
    if (hasConclusion) strengths.push("Clear conclusion or recommendation")

    // Analyze improvements
    if (wordCount < 30) improvements.push("Response could be more detailed")
    if (!hasStructure) improvements.push("Consider using a clearer framework or structure")
    if (!hasNumbers) improvements.push("Add specific numbers or metrics to strengthen your answer")
    if (!hasConclusion) improvements.push("End with a clear recommendation or summary")

    // Generate tips based on interview type
    if (data.interviewType === "Product Sense") {
      tips.push("Always start with user segmentation and pain points")
      tips.push("Use frameworks like CIRCLES or AARRR metrics")
    } else if (data.interviewType === "Case Interview") {
      tips.push("Structure your answer using issue trees or 2x2 matrices")
      tips.push("State assumptions clearly before calculations")
    } else if (data.interviewType === "Estimation") {
      tips.push("Break down the problem into smaller, estimable components")
      tips.push("Sanity check your final number against known benchmarks")
    } else {
      tips.push("Use the STAR format: Situation, Task, Action, Result")
      tips.push("Quantify your impact with specific metrics")
    }

    return {
      strength: strengths[0] || "Attempted the question",
      improvement: improvements[0] || "Keep practicing for more polish",
      tip: tips[questionIdx % tips.length] || tips[0],
    }
  }

  const getPersonalizedTips = () => {
    const currentRole = data.currentRole || "CS Student"
    const targetCategory = data.targetCategory || "Product Management"

    return (
      skillImprovementTips[currentRole]?.[targetCategory] || skillImprovementTips["CS Student"]["Product Management"]
    )
  }

  const getRecommendations = () => {
    const base = [
      "Structure your answers using frameworks like MECE, 2x2 matrices, or issue trees.",
      "Start with a clear hypothesis and validate it throughout your answer.",
      "Quantify your impact - use numbers and metrics wherever possible.",
      "Practice synthesizing your answer into a clear 'so what' at the end.",
    ]

    if (data.interviewType === "Product Sense") {
      return [
        "Always start by clarifying the user segment and their pain points.",
        "Use the CIRCLES framework: Comprehend, Identify, Report, Cut, List, Evaluate, Summarize.",
        ...base.slice(0, 2),
      ]
    } else if (data.interviewType === "Case Interview") {
      return [
        "Break down the problem into 3-4 buckets before diving deep.",
        "Always tie your recommendation back to the client's objective.",
        ...base.slice(0, 2),
      ]
    } else if (data.interviewType === "Estimation") {
      return [
        "State your assumptions clearly before starting calculations.",
        "Use multiple approaches (top-down, bottom-up) to validate your answer.",
        ...base.slice(2),
      ]
    }
    return base
  }

  const getQuestionFeedback = (idx: number) => {
    const feedbackOptions = questionFeedback[data.interviewType] || questionFeedback["Product Sense"]
    return feedbackOptions[idx % feedbackOptions.length]
  }

  return (
    <div className="min-h-screen bg-background grid-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="#22C55E" strokeWidth="2" />
              <path d="M12 16h8M16 12v8" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h1 className="text-2xl font-bold text-foreground">Interview Feedback</h1>
          </div>
          <Button
            variant="outline"
            onClick={onBackHome}
            className="flex items-center gap-2 rounded-full bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {data.currentRole && data.targetRole && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Your Path:</span>
                <span className="font-semibold text-foreground">{data.currentRole}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-primary" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">{data.targetRole}</span>
                <span className="text-sm text-muted-foreground">at {data.company}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Overall Score */}
        <div className="mb-12 flex flex-col lg:flex-row gap-8 items-stretch">
          <div
            className={`flex-1 ${getScoreBgColor(data.overallScore)} rounded-3xl border p-8 lg:p-12 text-center transition-all duration-1000 ${animated ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          >
            <p className="text-muted-foreground mb-4">Overall Performance Score</p>
            <div className={`text-6xl lg:text-7xl font-bold mb-2 ${getScoreColor(data.overallScore)}`}>
              {animated ? data.overallScore : 0}%
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${data.overallScore >= star * 20 ? "text-primary fill-primary" : "text-muted"}`}
                />
              ))}
            </div>
            <p className="text-lg font-medium text-foreground mb-2">{getScoreLabel(data.overallScore)}</p>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {data.overallScore >= 80
                ? `You're well-prepared for ${data.targetRole || "PM & consulting"} interviews!`
                : data.overallScore >= 60
                  ? "Good progress! Focus on the areas below to reach interview-ready status."
                  : "Keep practicing! Review frameworks and structure your answers more clearly."}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {scores.map((score) => (
              <Card key={score.label} className="p-5 bg-card border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${score.color}15` }}
                  >
                    <score.icon className="w-5 h-5" style={{ color: score.color }} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{score.label}</p>
                <div className="flex items-end gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor(score.value)}`}>{score.value}%</span>
                  <span className="text-xs text-muted-foreground mb-1">{getScoreLabel(score.value)}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full transition-all duration-1000 rounded-full"
                    style={{
                      width: animated ? `${score.value}%` : "0%",
                      backgroundColor: score.color,
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Question-by-Question Analysis</h2>
          <div className="space-y-4">
            {data.questions.map((question: string, idx: number) => {
              const feedback = getDetailedFeedback(data.responses[idx], idx)
              const isExpanded = expandedQuestion === idx
              const questionScore = data.questionScores?.[idx] || 60 + Math.floor(Math.random() * 35)

              return (
                <Card key={idx} className="bg-card border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                    className="w-full p-6 text-left hover:bg-muted/50 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                            Q{idx + 1}
                          </span>
                          <span className={`text-sm font-semibold ${getScoreColor(questionScore)}`}>
                            {questionScore}%
                          </span>
                        </div>
                        <p className="font-medium text-foreground">{question}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-border pt-4">
                      {/* Your Response */}
                      <div className="mb-6">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Your Response</p>
                        <div className="bg-muted/50 border border-border rounded-lg p-4">
                          <p className="text-sm text-foreground">{data.responses[idx] || "No response recorded"}</p>
                        </div>
                      </div>

                      {/* Feedback Grid */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-900">Strength</span>
                          </div>
                          <p className="text-sm text-green-800">{feedback.strength}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-900">Area to Improve</span>
                          </div>
                          <p className="text-sm text-amber-800">{feedback.improvement}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-900">Pro Tip</span>
                          </div>
                          <p className="text-sm text-blue-800">{feedback.tip}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {data.currentRole && (
          <div className="mb-12">
            <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Tips for {data.currentRole} → {data.targetCategory}
                  </h2>
                  <p className="text-sm text-muted-foreground">Personalized advice for your career transition</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {getPersonalizedTips().map((tip, idx) => (
                  <div key={idx} className="flex gap-3 p-4 bg-background rounded-lg border border-border">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Framework Recommendations */}
        <div className="mb-12 bg-card rounded-2xl border border-border p-8">
          <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {data.interviewType} Framework Tips
          </h2>
          <ul className="space-y-3">
            {getRecommendations().map((tip, idx) => (
              <li key={idx} className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onNewInterview}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 rounded-full px-8"
          >
            <RotateCcw className="w-5 h-5" />
            Practice Another Interview
          </Button>
          <Button
            onClick={onBackHome}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 rounded-full px-8 bg-transparent"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
