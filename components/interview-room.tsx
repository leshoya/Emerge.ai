"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { VideoOff, Loader2, Mic } from "lucide-react"
import AvatarDisplay from "./avatar-display"
import TranscriptBubble from "./transcript-bubble"
import ControlBar from "./control-bar"
import { interviewQuestions, followUpQuestions } from "@/lib/interview-data"

interface InterviewRoomProps {
  config: any
  onComplete: (feedback: any) => void
}

export default function InterviewRoom({ config, onComplete }: InterviewRoomProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questions, setQuestions] = useState<string[]>([])
  const [responses, setResponses] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [transcript, setTranscript] = useState("")
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [responseTime, setResponseTime] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [liveCaption, setLiveCaption] = useState("")
  const [hasAskedFollowUp, setHasAskedFollowUp] = useState(false)
  const [currentFollowUp, setCurrentFollowUp] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const recognitionRef = useRef<any>(null)
  const recognitionRunningRef = useRef(false)
  const streamRef = useRef<MediaStream | null>(null)
  const questionSpokenRef = useRef<number>(-1)
  const isSpeakingRef = useRef(false)

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        const preferredVoices = [
          "Google UK English Female",
          "Google US English",
          "Samantha",
          "Karen",
          "Microsoft Zira",
          "Microsoft David",
          "Alex",
        ]

        let selected = null
        for (const preferred of preferredVoices) {
          selected = voices.find((v) => v.name.includes(preferred))
          if (selected) break
        }

        if (!selected) {
          selected = voices.find((v) => v.lang.startsWith("en")) || voices[0]
        }

        setSelectedVoice(selected)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  useEffect(() => {
    const typeQuestions = interviewQuestions[config.interviewType as keyof typeof interviewQuestions]
    if (typeQuestions) {
      const qs = typeQuestions[config.difficulty as keyof typeof typeQuestions] || []
      setQuestions(qs.slice(0, config.length))
    }
  }, [config])

  useEffect(() => {
    const setupCamera = async () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      if (!isVideoOn) {
        setCameraError(null)
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        })

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error)
          }
        }
        setCameraError(null)
      } catch (err: any) {
        console.error("Camera error:", err)
        if (err.name === "NotAllowedError") {
          setCameraError("Camera access denied. Please allow camera access in your browser settings.")
        } else if (err.name === "NotFoundError") {
          setCameraError("No camera found. Please connect a camera.")
        } else {
          setCameraError("Unable to access camera. Please check your settings.")
        }
      }
    }

    setupCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isVideoOn])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      recognitionRunningRef.current = true
      setUserSpeaking(true)
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " "
        } else {
          interimTranscript += result[0].transcript
        }
      }

      const fullTranscript = (finalTranscript + interimTranscript).trim()
      setTranscript(fullTranscript)
      // Live caption shows the most recent portion of speech
      setLiveCaption(interimTranscript || finalTranscript.split(" ").slice(-10).join(" "))
    }

    recognition.onend = () => {
      recognitionRunningRef.current = false
      setUserSpeaking(false)
      setLiveCaption("")
    }

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("Speech recognition error:", event.error)
      }
      recognitionRunningRef.current = false
      setUserSpeaking(false)
      setLiveCaption("")
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
      recognitionRunningRef.current = false
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((t) => t + 1)
      if (isRecording) {
        setResponseTime((t) => t + 1)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isRecording])

  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => {
        isSpeakingRef.current = true
        setAiSpeaking(true)
      }

      utterance.onend = () => {
        isSpeakingRef.current = false
        setAiSpeaking(false)
        if (onEnd) onEnd()
      }

      utterance.onerror = (event) => {
        if (event.error !== "interrupted") {
          console.error("Speech error:", event.error)
        }
        isSpeakingRef.current = false
        setAiSpeaking(false)
      }

      window.speechSynthesis.speak(utterance)
    },
    [selectedVoice],
  )

  const safeStartRecognition = useCallback(() => {
    if (!recognitionRef.current || recognitionRunningRef.current || !isMicOn) return

    try {
      recognitionRef.current.start()
    } catch (e) {}
  }, [isMicOn])

  const safeStopRecognition = useCallback(() => {
    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
    } catch (e) {}
    recognitionRunningRef.current = false
  }, [])

  useEffect(() => {
    if (questions.length === 0 || isInitialized) return

    const timeout = setTimeout(() => {
      if (questionSpokenRef.current === -1) {
        questionSpokenRef.current = 0
        setIsInitialized(true)

        speakText(questions[0], () => {
          setIsRecording(true)
          setResponseTime(0)
          setTimeout(safeStartRecognition, 300)
        })
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [questions, isInitialized, speakText, safeStartRecognition])

  const needsFollowUp = useCallback(
    (response: string): boolean => {
      if (hasAskedFollowUp) return false // Only ask one follow-up per question

      const wordCount = response.split(/\s+/).filter((w) => w.length > 0).length

      // Too short response
      if (wordCount < 20) return true

      // Check for structure indicators
      const structureKeywords = ["first", "second", "because", "for example", "specifically", "let me"]
      const hasStructure = structureKeywords.some((kw) => response.toLowerCase().includes(kw))

      // Check for depth indicators
      const depthKeywords = ["metric", "user", "customer", "revenue", "cost", "percent", "million", "stakeholder"]
      const hasDepth = depthKeywords.some((kw) => response.toLowerCase().includes(kw))

      // If response is medium length but lacks structure or depth, ask follow-up
      if (wordCount < 50 && !hasStructure && !hasDepth) return true

      return false
    },
    [hasAskedFollowUp],
  )

  const getFollowUpQuestion = useCallback(
    (response: string): string => {
      const typeFollowUps =
        followUpQuestions[config.interviewType as keyof typeof followUpQuestions] || followUpQuestions["Behavioral"]

      const wordCount = response.split(/\s+/).filter((w) => w.length > 0).length

      // Very short response - ask for elaboration
      if (wordCount < 15) {
        return typeFollowUps[0]
      }

      // Check what's missing
      const hasMetrics = /\d+|percent|metric|kpi/i.test(response)
      const hasExample = /example|instance|time when|specifically/i.test(response)
      const hasStructure = /first|second|three|framework|approach/i.test(response)

      if (!hasMetrics && (config.interviewType === "Product Sense" || config.interviewType === "Estimation")) {
        return typeFollowUps[2] // Ask to quantify
      }

      if (!hasExample && config.interviewType === "Behavioral") {
        return typeFollowUps[0] // Ask for specific example
      }

      if (!hasStructure && config.interviewType === "Case Interview") {
        return typeFollowUps[0] // Ask to structure
      }

      // Default: pick a random follow-up
      return typeFollowUps[Math.floor(Math.random() * typeFollowUps.length)]
    },
    [config.interviewType],
  )

  const handleNextQuestion = useCallback(() => {
    safeStopRecognition()
    setIsRecording(false)
    setUserSpeaking(false)
    setLiveCaption("")

    const currentTranscript = transcript

    // Check if we need to ask a follow-up
    if (needsFollowUp(currentTranscript) && !hasAskedFollowUp) {
      const followUp = getFollowUpQuestion(currentTranscript)
      setCurrentFollowUp(followUp)
      setHasAskedFollowUp(true)

      setTimeout(() => {
        speakText(followUp, () => {
          setIsRecording(true)
          setResponseTime(0)
          setTimeout(safeStartRecognition, 300)
        })
      }, 500)
      return
    }

    // Combine original transcript with any follow-up response
    const fullResponse = currentFollowUp
      ? `${responses[responses.length - 1] || ""} [Follow-up: ${currentFollowUp}] ${currentTranscript}`
      : currentTranscript

    const newResponses = currentFollowUp ? [...responses.slice(0, -1), fullResponse] : [...responses, currentTranscript]

    setResponses(newResponses)
    setTranscript("")
    setHasAskedFollowUp(false)
    setCurrentFollowUp(null)

    const nextIndex = currentQuestion + 1

    if (nextIndex < questions.length) {
      setCurrentQuestion(nextIndex)
      questionSpokenRef.current = nextIndex

      setTimeout(() => {
        speakText(questions[nextIndex], () => {
          setIsRecording(true)
          setResponseTime(0)
          setTimeout(safeStartRecognition, 300)
        })
      }, 800)
    } else {
      calculateFeedback(newResponses)
    }
  }, [
    currentQuestion,
    questions,
    responses,
    transcript,
    speakText,
    safeStartRecognition,
    safeStopRecognition,
    needsFollowUp,
    hasAskedFollowUp,
    getFollowUpQuestion,
    currentFollowUp,
  ])

  // Auto-advance when user finishes speaking
  useEffect(() => {
    if (!isRecording || aiSpeaking || !isMicOn) return

    // Only auto-advance if user has stopped speaking and there's a transcript
    if (!userSpeaking && transcript.trim().length > 0) {
      const wordCount = transcript.split(/\s+/).filter((w) => w.length > 0).length
      
      // Only auto-advance if there's a meaningful response (at least 5 words)
      if (wordCount >= 5) {
        const autoAdvanceTimeout = setTimeout(() => {
          // Double-check conditions before auto-advancing
          if (!userSpeaking && !aiSpeaking && isRecording && transcript.trim().length > 0) {
            handleNextQuestion()
          }
        }, 4000) // Wait 4 seconds of silence before auto-advancing

        return () => clearTimeout(autoAdvanceTimeout)
      }
    }
  }, [userSpeaking, transcript, isRecording, aiSpeaking, isMicOn, handleNextQuestion])

  const calculateResponseScore = (response: string, questionType: string) => {
    if (!response || response.trim().length === 0) {
      return { score: 20, breakdown: { structure: 15, communication: 20, insights: 15, responseTime: 30 } }
    }

    const wordCount = response.split(/\s+/).filter((w) => w.length > 0).length
    const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : 0

    // Structure indicators
    const structureKeywords = [
      "first",
      "second",
      "third",
      "finally",
      "additionally",
      "moreover",
      "framework",
      "approach",
      "structure",
      "bucket",
      "category",
      "on one hand",
      "on the other hand",
      "in conclusion",
      "to summarize",
      "let me break this down",
      "there are three",
      "there are two",
    ]
    const structureMatches = structureKeywords.filter((kw) => response.toLowerCase().includes(kw)).length

    // PM-specific keywords
    const pmKeywords = [
      "user",
      "customer",
      "metric",
      "kpi",
      "engagement",
      "retention",
      "prioritize",
      "roadmap",
      "mvp",
      "hypothesis",
      "segment",
      "persona",
      "pain point",
      "value proposition",
      "trade-off",
      "data",
      "a/b test",
    ]

    // Consulting-specific keywords
    const consultingKeywords = [
      "client",
      "stakeholder",
      "revenue",
      "cost",
      "profit",
      "market",
      "competitor",
      "growth",
      "synergy",
      "implementation",
      "recommendation",
      "analysis",
      "assumption",
      "estimate",
      "million",
      "billion",
      "percent",
    ]

    const relevantKeywords =
      questionType === "Case Interview" || questionType === "Estimation" ? consultingKeywords : pmKeywords

    const keywordMatches = relevantKeywords.filter((kw) => response.toLowerCase().includes(kw)).length

    // Quantification indicators
    const hasNumbers = /\d+/.test(response)
    const hasPercentages = /%|percent/i.test(response)
    const hasMetrics = /\d+[kmb]|\d+\s*(million|billion|thousand)/i.test(response)

    // Calculate scores
    let structureScore = 50
    structureScore += Math.min(structureMatches * 8, 30)
    structureScore += wordCount > 50 ? 10 : wordCount > 25 ? 5 : 0
    structureScore += avgWordsPerSentence > 8 && avgWordsPerSentence < 25 ? 10 : 0
    structureScore = Math.min(Math.max(structureScore, 30), 98)

    let communicationScore = 55
    communicationScore += sentences >= 3 ? 15 : sentences >= 2 ? 8 : 0
    communicationScore += wordCount >= 40 ? 15 : wordCount >= 20 ? 8 : 0
    communicationScore += avgWordsPerSentence > 5 && avgWordsPerSentence < 30 ? 10 : 0
    communicationScore = Math.min(Math.max(communicationScore, 35), 98)

    let insightsScore = 45
    insightsScore += Math.min(keywordMatches * 5, 25)
    insightsScore += hasNumbers ? 10 : 0
    insightsScore += hasPercentages ? 8 : 0
    insightsScore += hasMetrics ? 12 : 0
    insightsScore = Math.min(Math.max(insightsScore, 30), 98)

    // Overall score is weighted average
    const overall = Math.round(
      structureScore * 0.3 + communicationScore * 0.25 + insightsScore * 0.3 + 75 * 0.15, // baseline response time score
    )

    return {
      score: Math.min(Math.max(overall, 25), 95),
      breakdown: {
        structure: structureScore,
        communication: communicationScore,
        insights: insightsScore,
        responseTime: 70 + Math.floor(Math.random() * 20),
      },
    }
  }

  const calculateFeedback = (allResponses: string[]) => {
    window.speechSynthesis.cancel()
    safeStopRecognition()

    const responseScores = allResponses.map((response) => calculateResponseScore(response, config.interviewType))

    const avgStructure = Math.round(
      responseScores.reduce((sum, r) => sum + r.breakdown.structure, 0) / Math.max(responseScores.length, 1),
    )
    const avgCommunication = Math.round(
      responseScores.reduce((sum, r) => sum + r.breakdown.communication, 0) / Math.max(responseScores.length, 1),
    )
    const avgInsights = Math.round(
      responseScores.reduce((sum, r) => sum + r.breakdown.insights, 0) / Math.max(responseScores.length, 1),
    )
    const avgResponseTime = Math.round(
      responseScores.reduce((sum, r) => sum + r.breakdown.responseTime, 0) / Math.max(responseScores.length, 1),
    )

    const overallScore = Math.round(
      avgStructure * 0.3 + avgCommunication * 0.25 + avgInsights * 0.3 + avgResponseTime * 0.15,
    )

    const feedback = {
      overallScore: Math.min(Math.max(overallScore, 25), 95),
      structure: avgStructure,
      communication: avgCommunication,
      insights: avgInsights,
      responseTime: avgResponseTime,
      responses: allResponses,
      questions: questions,
      interviewType: config.interviewType,
      currentRole: config.currentRole,
      targetRole: config.targetRole,
      targetCategory: config.targetCategory,
      company: config.company,
      questionScores: responseScores.map((r) => r.score),
    }
    onComplete(feedback)
  }

  const handleEndInterview = useCallback(() => {
    window.speechSynthesis.cancel()
    safeStopRecognition()
    setIsRecording(false)
    setLiveCaption("")

    const allResponses = transcript ? [...responses, transcript] : responses
    calculateFeedback(allResponses)
  }, [responses, transcript, safeStopRecognition])

  const handleToggleMic = useCallback(() => {
    if (isMicOn) {
      safeStopRecognition()
    } else if (isRecording) {
      setTimeout(safeStartRecognition, 100)
    }
    setIsMicOn(!isMicOn)
  }, [isMicOn, isRecording, safeStartRecognition, safeStopRecognition])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {config.interviewType} • Question {currentQuestion + 1} of {questions.length}
              {currentFollowUp && " • Follow-up"}
            </p>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-xl font-mono font-semibold text-foreground">{formatTime(timeElapsed)}</div>
        </div>
      </div>

      {/* Main Interview Area */}
      <div className="flex-1 flex items-center justify-center p-4 grid-background">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">
          {/* AI Avatar */}
          <div className="flex flex-col items-center">
            <div className="mb-4 text-sm text-muted-foreground">
              {aiSpeaking ? "Interviewer Speaking..." : "Listening..."}
            </div>
            <AvatarDisplay speaking={aiSpeaking} />
          </div>

          {/* User Video */}
          <div className="flex flex-col items-center">
            <div className="mb-4 text-sm text-muted-foreground">
              {userSpeaking ? "You are Speaking..." : isRecording ? "Your turn to respond" : "Ready"}
            </div>
            <div className="relative w-full">
              {isVideoOn && !cameraError && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video bg-card rounded-2xl border border-border object-cover shadow-lg transform scale-x-[-1]"
                />
              )}
              {isVideoOn && cameraError && (
                <div className="w-full aspect-video bg-card rounded-2xl border border-border flex flex-col items-center justify-center shadow-lg p-4">
                  <VideoOff className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">{cameraError}</p>
                </div>
              )}
              {!isVideoOn && (
                <div className="w-full aspect-video bg-card rounded-2xl border border-border flex items-center justify-center shadow-lg">
                  <VideoOff className="w-12 h-12 text-muted-foreground" />
                </div>
              )}

              {liveCaption && isRecording && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Mic className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-xs text-primary font-medium">LIVE</span>
                    </div>
                    <p className="text-white text-sm">{liveCaption}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="bg-card border-t border-border p-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-muted-foreground mb-2">
            {currentFollowUp ? "Follow-up Question" : "Current Question"}
          </p>
          <TranscriptBubble speaker="ai" text={currentFollowUp || questions[currentQuestion]} />
          {transcript && (
            <>
              <p className="text-xs text-muted-foreground mt-4 mb-2">Your Response</p>
              <TranscriptBubble speaker="user" text={transcript} />
            </>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <ControlBar
        isMicOn={isMicOn}
        isVideoOn={isVideoOn}
        onToggleMic={handleToggleMic}
        onToggleVideo={() => setIsVideoOn(!isVideoOn)}
        onNext={handleNextQuestion}
        onEnd={handleEndInterview}
        isRecording={isRecording}
        disabled={aiSpeaking}
      />
    </div>
  )
}
