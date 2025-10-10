"use client"

import { useState, useCallback } from "react"
import { validateSertanejoLyrics } from "./validateLyrics"
import { validateChorusBatch } from "./validateChorus"
import { parseLyricSections, parseChorusOptions } from "./parser"

export function useSertanejoValidator() {
  const [isProcessing, setIsProcessing] = useState(false)

  const validateFullLyric = useCallback((rawLyric: string) => {
    const sections = parseLyricSections(rawLyric)
    return validateSertanejoLyrics(sections)
  }, [])

  const validateChoruses = useCallback((rawChoruses: string) => {
    const chorusOptions = parseChorusOptions(rawChoruses)
    return validateChorusBatch(chorusOptions)
  }, [])

  return {
    validateFullLyric,
    validateChoruses,
    isProcessing,
    setIsProcessing,
  }
}
