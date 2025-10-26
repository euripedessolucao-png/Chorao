"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProcessStep {
  id: string
  label: string
  duration: number // milliseconds
}

interface ProcessingStatusProps {
  isProcessing: boolean
  steps: ProcessStep[]
  onComplete?: () => void
  onError?: (step: string) => void
}

export function ProcessingStatus({ isProcessing, steps, onComplete, onError }: ProcessingStatusProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [failedStep, setFailedStep] = useState<string | null>(null)

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStepIndex(0)
      setCompletedSteps(new Set())
      setFailedStep(null)
      return
    }

    let timeoutId: NodeJS.Timeout
    let currentIndex = 0

    const processNextStep = () => {
      if (currentIndex >= steps.length) {
        onComplete?.()
        return
      }

      const step = steps[currentIndex]
      setCurrentStepIndex(currentIndex)

      timeoutId = setTimeout(() => {
        setCompletedSteps((prev) => new Set([...prev, step.id]))
        currentIndex++
        processNextStep()
      }, step.duration)
    }

    processNextStep()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isProcessing, steps, onComplete])

  if (!isProcessing && completedSteps.size === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-border bg-card/50 p-3 backdrop-blur-sm">
      <div className="space-y-1.5">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id)
          const isCurrent = index === currentStepIndex && isProcessing
          const isFailed = failedStep === step.id
          const isPending = index > currentStepIndex && isProcessing

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 text-xs transition-all duration-300",
                isCompleted && "text-green-600 dark:text-green-400",
                isCurrent && "text-blue-600 dark:text-blue-400 font-medium",
                isFailed && "text-red-600 dark:text-red-400",
                isPending && "text-muted-foreground/50",
              )}
            >
              {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />}
              {isCurrent && <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin" />}
              {isFailed && <XCircle className="h-3.5 w-3.5 flex-shrink-0" />}
              {isPending && <Circle className="h-3.5 w-3.5 flex-shrink-0" />}
              <span className="truncate">{step.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
