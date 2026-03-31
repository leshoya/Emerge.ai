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
  const [responseTimes, setResponseTimes] = useState<number[]>([])
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
  const pendingBaseResponseRef = useRef<string | null>(null)
  const pendingBaseResponseTimeRef = useRef<number>(0)
  const lastTranscriptAtRef = useRef<number | null>(null)
  const silenceLockRef = useRef(false)
  const isRecordingRef = useRef(false)
  const isMicOnRef = useRef(isMicOn)
  const aiSpeakingRef = useRef(aiSpeaking)

  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording])

  useEffect(() => {
    isMicOnRef.current = isMicOn
  }, [isMicOn])

  useEffect(() => {
    aiSpeakingRef.current = aiSpeaking
  }, [aiSpeaking])

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
      lastTranscriptAtRef.current = Date.now()
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
            pendingBaseResponseRef.current = null
            silenceLockRef.current = false
            lastTranscriptAtRef.current = null
            setTranscript("")
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

      const lower = response.toLowerCase()
      const wordCount = response.split(/\s+/).filter((w) => w.length > 0).length

      const minWords =
        config.difficulty === "Entry" ? 35 : config.difficulty === "Mid-Level" ? 50 : /* Senior */ 65

      const structureKeywords = [
        "first",
        "second",
        "third",
        "finally",
        "because",
        "for example",
        "specifically",
        "let me",
        "framework",
        "approach",
        "in conclusion",
        "to summarize",
      ]
      const hasStructure = structureKeywords.some((kw) => lower.includes(kw))

      const hasNumbers = /\d+/.test(lower)
      const hasPercent = /%|percent/.test(lower)
      const hasMetrics = /(metric|kpi|engagement|retention|revenue|cost|profit|stakeholder|customer|user)/i.test(
        lower,
      )
      const hasQuant = hasNumbers || hasPercent || hasMetrics

      const hasRecommendation = /(recommend|therefore|so what|next steps|timeline|in conclusion|to summarize|action plan)/i.test(
        lower,
      )

      const hasSTAR = /(situation|task|action|result|star|what i learned|what I learned|outcome|impact)/i.test(lower)

      // Harsh: too short or missing the key interview "shape"
      if (wordCount < minWords) return true

      if (config.interviewType === "Behavioral") {
        if (!hasSTAR) return true
        if (!hasRecommendation && !hasSTAR) return true
        return false
      }

      if (config.interviewType === "Case Interview") {
        if (!hasStructure) return true
        if (!hasQuant) return true
        if (!hasRecommendation) return true
        return false
      }

      if (config.interviewType === "Estimation") {
        if (!hasStructure) return true
        if (!hasNumbers && !hasPercent) return true
        if (!/(assumption|validate|sanity|range|uncertainty)/i.test(lower)) return true
        return false
      }

      // Product Sense
      if (!hasStructure) return true
      if (!hasQuant) return true
      if (!/(risk|trade-off|prioritize|roadmap|success|metric|kpi)/i.test(lower)) return true
      return false
    },
    [hasAskedFollowUp, config.difficulty, config.interviewType],
  )

  const getFollowUpQuestion = useCallback(
    (response: string): string => {
      const typeFollowUps =
        followUpQuestions[config.interviewType as keyof typeof followUpQuestions] || followUpQuestions["Behavioral"]

      const lower = response.toLowerCase()
      const wordCount = response.split(/\s+/).filter((w) => w.length > 0).length

      const minWords =
        config.difficulty === "Entry" ? 35 : config.difficulty === "Mid-Level" ? 50 : /* Senior */ 65

      const hasStructure = /(first|second|third|framework|approach|in conclusion|to summarize)/i.test(lower)
      const hasNumbersOrPercents = /\d+/.test(lower) || /%|percent/.test(lower)
      const hasMetrics = /(metric|kpi|engagement|retention|revenue|cost|profit|stakeholder|customer|user)/i.test(lower)
      const hasRecommendation = /(recommend|therefore|so what|next steps|timeline|action plan|in conclusion|to summarize)/i.test(
        lower,
      )
      const hasSTAR = /(situation|task|action|result|star|outcome|impact|what i learned|learned)/i.test(lower)

      if (wordCount < minWords) return typeFollowUps[0]

      if (config.interviewType === "Behavioral") {
        if (!hasSTAR) return typeFollowUps[0]
        if (!/(outcome|result|impact|what i learned|learned)/i.test(lower)) return typeFollowUps[1]
        return typeFollowUps[2]
      }

      if (config.interviewType === "Case Interview") {
        if (!hasStructure) return typeFollowUps[0]
        if (!/(assumption)/i.test(lower)) return typeFollowUps[1]
        if (!hasNumbersOrPercents && !hasMetrics) return typeFollowUps[2]
        if (!hasRecommendation) return typeFollowUps[4]
        return typeFollowUps[3]
      }

      if (config.interviewType === "Estimation") {
        if (!hasStructure) return typeFollowUps[0]
        if (!hasNumbersOrPercents) return typeFollowUps[1]
        if (!/(assumption|validate|sanity|range|uncertainty)/i.test(lower)) return typeFollowUps[2]
        if (!/(range|uncertainty)/i.test(lower)) return typeFollowUps[3]
        return typeFollowUps[4]
      }

      // Product Sense
      if (!hasStructure) return typeFollowUps[4]
      if (!hasMetrics) return typeFollowUps[1]
      if (!hasRecommendation) return typeFollowUps[3]
      return typeFollowUps[2]
    },
    [config.interviewType],
  )

  const handleNextQuestion = useCallback(() => {
    safeStopRecognition()
    setIsRecording(false)
    setUserSpeaking(false)
    setLiveCaption("")

    if (silenceLockRef.current) return
    silenceLockRef.current = true

    const currentTranscript = transcript.trim()

    // If we're coming back from a follow-up, merge base + follow-up into one response.
    if (currentFollowUp) {
      const base = pendingBaseResponseRef.current || ""
      const baseTime = pendingBaseResponseTimeRef.current
      const combinedTime = baseTime + responseTime
      const fullResponse = base
        ? `${base} [Follow-up: ${currentFollowUp}] ${currentTranscript}`
        : `[Follow-up: ${currentFollowUp}] ${currentTranscript}`

      const newResponses = [...responses, fullResponse]
      pendingBaseResponseRef.current = null
      pendingBaseResponseTimeRef.current = 0

      const newResponseTimes = [...responseTimes, combinedTime]
      setResponses(newResponses)
      setResponseTimes(newResponseTimes)
      setTranscript("")
      setHasAskedFollowUp(false)
      setCurrentFollowUp(null)

      const nextIndex = currentQuestion + 1
      if (nextIndex < questions.length) {
        setCurrentQuestion(nextIndex)
        questionSpokenRef.current = nextIndex

        setTimeout(() => {
          speakText(questions[nextIndex], () => {
            silenceLockRef.current = false
            lastTranscriptAtRef.current = null
            setTranscript("")
            setIsRecording(true)
            setResponseTime(0)
            setTimeout(safeStartRecognition, 300)
          })
        }, 800)
      } else {
        calculateFeedback(newResponses, newResponseTimes)
      }

      return
    }

    // Normal flow: decide whether we should ask a follow-up, or move on.
    if (needsFollowUp(currentTranscript) && !hasAskedFollowUp) {
      const followUp = getFollowUpQuestion(currentTranscript)

      pendingBaseResponseRef.current = currentTranscript
      pendingBaseResponseTimeRef.current = responseTime
      setCurrentFollowUp(followUp)
      setHasAskedFollowUp(true)

      // Clear transcript so the next chunk is purely the follow-up answer.
      setTranscript("")
      lastTranscriptAtRef.current = null
      silenceLockRef.current = true

      setTimeout(() => {
        speakText(followUp, () => {
          silenceLockRef.current = false
          lastTranscriptAtRef.current = null
          setIsRecording(true)
          setResponseTime(0)
          setTimeout(safeStartRecognition, 300)
        })
      }, 500)
      return
    }

    const newResponses = [...responses, currentTranscript]
    const newResponseTimes = [...responseTimes, responseTime]
    setResponses(newResponses)
    setResponseTimes(newResponseTimes)
    setTranscript("")
    setHasAskedFollowUp(false)
    setCurrentFollowUp(null)
    pendingBaseResponseRef.current = null
    pendingBaseResponseTimeRef.current = 0

    const nextIndex = currentQuestion + 1
    if (nextIndex < questions.length) {
      setCurrentQuestion(nextIndex)
      questionSpokenRef.current = nextIndex

      setTimeout(() => {
        speakText(questions[nextIndex], () => {
          silenceLockRef.current = false
          lastTranscriptAtRef.current = null
          setTranscript("")
          setIsRecording(true)
          setResponseTime(0)
          setTimeout(safeStartRecognition, 300)
        })
      }, 800)
    } else {
      calculateFeedback(newResponses, newResponseTimes)
    }
  }, [
    currentQuestion,
    questions,
    responses,
    responseTimes,
    transcript,
    responseTime,
    speakText,
    safeStartRecognition,
    safeStopRecognition,
    needsFollowUp,
    hasAskedFollowUp,
    getFollowUpQuestion,
    currentFollowUp,
  ])

  // Auto-advance when the interviewee has been silent for a bit.
  // This keeps the "interviewer AI" moving even if SpeechRecognition doesn't fire `onend` reliably.
  useEffect(() => {
    if (!isRecording || !isMicOn || aiSpeakingRef.current || isSpeakingRef.current) return

    const text = transcript.trim()
    if (!text) return

    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length
    if (wordCount < 5) return

    const SILENCE_MS = 2200
    const timeout = setTimeout(() => {
      const lastAt = lastTranscriptAtRef.current
      const sinceLast = lastAt ? Date.now() - lastAt : Infinity

      if (
        silenceLockRef.current === false &&
        isRecordingRef.current &&
        isMicOnRef.current &&
        !aiSpeakingRef.current &&
        !isSpeakingRef.current &&
        sinceLast >= SILENCE_MS
      ) {
        handleNextQuestion()
      }
    }, SILENCE_MS)

    return () => clearTimeout(timeout)
  }, [transcript, isRecording, isMicOn, handleNextQuestion])

  const calculateResponseScore = (response: string, questionType: string, responseSeconds: number) => {
    const lower = response?.toLowerCase() ?? ""
    const trimmed = response?.trim() ?? ""

    if (!trimmed) {
      // If SpeechRecognition captured nothing, treat as 0% to avoid misleading "minimum" grades.
      return { score: 0, breakdown: { structure: 0, communication: 0, insights: 0, responseTime: 0 } }
    }

    const wordCount = trimmed.split(/\s+/).filter((w) => w.length > 0).length
    const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : wordCount

    const structureKeywords = [
      "first",
      "second",
      "third",
      "finally",
      "because",
      "for example",
      "specifically",
      "framework",
      "approach",
      "bucket",
      "category",
      "in conclusion",
      "to summarize",
      "on the other hand",
      "on one hand",
      "let me break this down",
    ]
    const structureMatches = structureKeywords.filter((kw) => lower.includes(kw)).length
    const hasStructure = structureMatches > 0

    const hasNumbers = /\d+/.test(lower)
    const hasPercent = /%|percent/.test(lower)
    const hasQuantWords = /(metric|kpi|engagement|retention|revenue|cost|profit|stakeholder|customer|user)/i.test(
      lower,
    )
    const hasQuant = hasNumbers || hasPercent || hasQuantWords

    const hasRecommendation = /(recommend|therefore|so what|next steps|timeline|action plan|in conclusion|to summarize)/i.test(
      lower,
    )

    const hasSTAR = /(situation|task|action|result|star|outcome|impact|learned|what i learned)/i.test(lower)

    // Response time scoring (harsher + deterministic)
    const t = responseSeconds
    const responseTimeScore =
      t <= 25 ? 35 : t <= 60 ? 85 : t <= 150 ? 92 : t <= 240 ? 78 : 55

    // Structure scoring: cap hard if missing signposts/framework.
    let structureScore = hasStructure ? 70 + Math.min(structureMatches * 7, 20) : 40
    if (wordCount < 35) structureScore = Math.min(structureScore, 55)
    if (!hasStructure) structureScore = Math.min(structureScore, 55)

    // Communication scoring: penalize very low sentence count and rambling.
    let communicationScore = 60
    communicationScore += sentences >= 3 ? 20 : sentences === 2 ? 10 : sentences === 1 ? 0 : -10
    if (avgWordsPerSentence > 35) communicationScore -= 10
    if (avgWordsPerSentence < 6 && wordCount < 50) communicationScore -= 5
    communicationScore = Math.max(25, Math.min(95, communicationScore))

    // Insights scoring: question-type aware requirements.
    let insightsScore = 45
    if (questionType === "Case Interview") {
      insightsScore = hasQuant ? 75 : 35
      if (!hasRecommendation) insightsScore -= 10
    } else if (questionType === "Estimation") {
      const hasAssumptionLike = /(assumption|sanity|range|uncertainty)/i.test(lower)
      insightsScore = hasNumbers && hasAssumptionLike ? 80 : hasNumbers ? 60 : 30
    } else if (questionType === "Behavioral") {
      insightsScore = hasSTAR ? 75 : 35
      if (!/outcome|result|impact|learned/i.test(lower)) insightsScore -= 10
    } else {
      // Product Sense
      insightsScore = hasQuant ? 75 : 40
      if (!/(risk|trade-off|prioritize|roadmap|success|metric|kpi)/i.test(lower)) insightsScore -= 10
    }
    insightsScore = Math.max(20, Math.min(95, insightsScore))

    // Overall: slightly more weight on structure + insights, harsher than before.
    const overallRaw = structureScore * 0.36 + communicationScore * 0.22 + insightsScore * 0.32 + responseTimeScore * 0.1
    const overall = Math.round(overallRaw)

    return {
      score: Math.min(Math.max(overall, 0), 95),
      breakdown: {
        structure: Math.round(structureScore),
        communication: Math.round(communicationScore),
        insights: Math.round(insightsScore),
        responseTime: Math.round(responseTimeScore),
      },
    }
  }

  const calculateFeedback = (allResponses: string[], allResponseTimes: number[]) => {
    window.speechSynthesis.cancel()
    safeStopRecognition()

    const responseScores = allResponses.map((response, i) =>
      calculateResponseScore(response, config.interviewType, allResponseTimes[i] ?? 0),
    )

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
      overallScore: Math.min(Math.max(overallScore, 0), 95),
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

    const trimmed = transcript?.trim() ?? ""
    const hasFollowUp = Boolean(currentFollowUp)
    const base = pendingBaseResponseRef.current

    const followUpSeconds = hasFollowUp ? responseTime : 0
    const baseSeconds = hasFollowUp ? pendingBaseResponseTimeRef.current : 0

    const allResponses = hasFollowUp
      ? [
          ...responses,
          base
            ? `${base} [Follow-up: ${currentFollowUp}] ${trimmed}`
            : `[Follow-up: ${currentFollowUp}] ${trimmed}`,
        ]
      : trimmed
        ? [...responses, trimmed]
        : responses

    const allResponseTimes = hasFollowUp
      ? [...responseTimes, baseSeconds + followUpSeconds]
      : trimmed
        ? [...responseTimes, responseTime]
        : responseTimes

    calculateFeedback(allResponses, allResponseTimes)
  }, [responses, responseTimes, transcript, responseTime, safeStopRecognition, currentFollowUp])

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
