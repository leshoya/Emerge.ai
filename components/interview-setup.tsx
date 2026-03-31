"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lock, ChevronRight, ArrowRight, Lightbulb, Target, AlertTriangle, ChevronDown } from "lucide-react"
import {
  currentRoles,
  targetRoleCategories,
  companies,
  interviewTypes,
  difficulties,
  lengths,
  skillMappings,
  roleExpectations,
} from "@/lib/setup-data"

interface InterviewSetupProps {
  onStart: (config: any) => void
}

export default function InterviewSetup({ onStart }: InterviewSetupProps) {
  const [currentRole, setCurrentRole] = useState("")
  const [targetCategory, setTargetCategory] = useState<"Product Management" | "Consulting" | "">("")
  const [targetRole, setTargetRole] = useState("")
  const [company, setCompany] = useState("")
  const [interviewType, setInterviewType] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [length, setLength] = useState(5)
  const [loading, setLoading] = useState(false)
  const [showExpectations, setShowExpectations] = useState(false)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)

  const getSkillMapping = () => {
    const currentMapping = skillMappings[currentRole]
    if (!currentMapping) return skillMappings["CS Student"]["Product Management"]

    if (targetCategory === "Product Management") {
      return currentMapping["Product Management"] || skillMappings["CS Student"]["Product Management"]
    } else {
      return currentMapping["Consulting"] || skillMappings["CS Student"]["Consulting"]
    }
  }

  const getExpectations = () => {
    return roleExpectations[targetRole] || roleExpectations["Product Manager"]
  }

  const handleStart = async () => {
    if (!currentRole || !targetRole || !company || !difficulty || !interviewType) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)
    setTimeout(() => {
      onStart({
        currentRole,
        targetRole,
        targetCategory,
        company,
        interviewType,
        difficulty,
        length,
      })
    }, 1000)
  }

  const skillMapping = getSkillMapping()
  const expectations = getExpectations()

  return (
    <div className="min-h-screen bg-background grid-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="#22C55E" strokeWidth="2" />
              <path d="M12 16h8M16 12v8" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-bold">
              e<span className="text-primary">Merge</span>
            </span>
          </div>
        </div>
      </div>

      {/* Setup Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Configure Your Interview</h1>
          <p className="text-sm text-muted-foreground">
            Tell us about your background and target role to personalize your practice
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-semibold mb-1 text-foreground">Your Current Role</label>
            <p className="text-sm text-muted-foreground mb-3">Select your current position or background</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setCurrentRole(role.id)}
                  className={`p-5 rounded-xl border-2 transition text-left ${
                    currentRole === role.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold text-foreground mb-1">{role.label}</div>
                  <div className="text-sm text-muted-foreground">{role.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Path with Dropdown */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-foreground">Target Path</label>
            <p className="text-sm text-muted-foreground mb-3">Choose your career direction</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <button
                  onClick={() => {
                    if (targetCategory === "Product Management") {
                      setShowRoleDropdown(!showRoleDropdown)
                    } else {
                      setTargetCategory("Product Management")
                      setTargetRole("")
                      setCompany("")
                      setShowRoleDropdown(true)
                    }
                  }}
                  className={`w-full p-6 rounded-xl border-2 transition text-left ${
                    targetCategory === "Product Management"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl mb-2">🚀</div>
                      <div className="font-semibold text-foreground">Product Management</div>
                      <div className="text-sm text-muted-foreground">FAANG, startups, tech companies</div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ${targetCategory === "Product Management" && showRoleDropdown ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>
                {/* PM Roles Dropdown */}
                {targetCategory === "Product Management" && showRoleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden">
                    {targetRoleCategories["Product Management"].map((role) => (
                      <button
                        key={role.id}
                        onClick={() => {
                          setTargetRole(role.id)
                          setShowRoleDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-muted transition border-b border-border last:border-b-0 ${
                          targetRole === role.id ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="font-medium text-foreground">{role.label}</div>
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    if (targetCategory === "Consulting") {
                      setShowRoleDropdown(!showRoleDropdown)
                    } else {
                      setTargetCategory("Consulting")
                      setTargetRole("")
                      setCompany("")
                      setShowRoleDropdown(true)
                    }
                  }}
                  className={`w-full p-6 rounded-xl border-2 transition text-left ${
                    targetCategory === "Consulting"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl mb-2">📊</div>
                      <div className="font-semibold text-foreground">Consulting</div>
                      <div className="text-sm text-muted-foreground">MBB, Big 4, strategy firms</div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ${targetCategory === "Consulting" && showRoleDropdown ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>
                {/* Consulting Roles Dropdown */}
                {targetCategory === "Consulting" && showRoleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden">
                    {targetRoleCategories["Consulting"].map((role) => (
                      <button
                        key={role.id}
                        onClick={() => {
                          setTargetRole(role.id)
                          setShowRoleDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-muted transition border-b border-border last:border-b-0 ${
                          targetRole === role.id ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="font-medium text-foreground">{role.label}</div>
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Role Display */}
            {targetRole && (
              <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <span className="text-sm text-muted-foreground">Selected: </span>
                <span className="text-sm font-medium text-primary">{targetRole}</span>
              </div>
            )}
          </div>

          {/* Skill Mapping Card */}
          {currentRole && targetCategory && (
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ArrowRight className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Your Transition: {currentRole} → {targetCategory}
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium text-foreground">Transferable Skills</span>
                  </div>
                  <ul className="space-y-1">
                    {skillMapping.transferable.map((skill, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-primary">✓</span> {skill}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-sm font-medium text-foreground">Skills to Develop</span>
                  </div>
                  <ul className="space-y-1">
                    {skillMapping.toLearn.map((skill, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-orange-500">→</span> {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Target Company */}
          {targetCategory && (
            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground">Target Company</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {companies[targetCategory].map((comp) => (
                  <button
                    key={comp}
                    onClick={() => setCompany(comp)}
                    className={`p-3 rounded-lg border-2 transition font-medium text-sm ${
                      company === comp
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-foreground">Interview Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {interviewTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setInterviewType(type)}
                  className={`flex-1 p-3 rounded-lg border-2 transition font-medium text-sm ${
                    interviewType === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Length */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground">Difficulty</label>
              <div className="flex gap-3">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 p-3 rounded-lg border-2 transition font-medium text-sm ${
                      difficulty === diff
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground">Interview Length</label>
              <div className="flex gap-3">
                {lengths.map((len) => (
                  <button
                    key={len.value}
                    onClick={() => setLength(len.value)}
                    className={`flex-1 p-3 rounded-lg border-2 transition font-medium text-sm ${
                      length === len.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    {len.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Role Expectations Card */}
          {targetRole && (
            <Card className="bg-card border-border overflow-hidden">
              <button
                onClick={() => setShowExpectations(!showExpectations)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-muted/50 transition"
              >
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">What Interviewers Look For: {targetRole}</div>
                    <div className="text-sm text-muted-foreground">Key expectations and common mistakes to avoid</div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${showExpectations ? "rotate-180" : ""}`}
                />
              </button>

              {showExpectations && (
                <div className="px-6 pb-6 border-t border-border pt-4">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Key Skills</span>
                      </div>
                      <ul className="space-y-2">
                        {expectations.skills.map((skill, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-foreground">Expected Behaviors</span>
                      </div>
                      <ul className="space-y-2">
                        {expectations.behaviors.map((behavior, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {behavior}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold text-foreground">Common Mistakes</span>
                      </div>
                      <ul className="space-y-2">
                        {expectations.mistakes.map((mistake, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Security Notice */}
          <Card className="bg-muted/50 border-border p-4">
            <div className="flex gap-3">
              <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Your interview data is processed securely. We use speech recognition to transcribe your responses and
                  provide feedback. No recordings are stored permanently.
                </p>
              </div>
            </div>
          </Card>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            disabled={loading || !currentRole || !targetRole || !company || !difficulty || !interviewType}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 text-lg font-semibold disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Preparing Interview...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Start Interview
                <ChevronRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
