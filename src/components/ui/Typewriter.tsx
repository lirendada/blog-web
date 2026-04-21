'use client'

import { useState, useEffect, useRef } from 'react'

interface TypewriterProps {
  texts: string[]
  speed?: number
  deleteSpeed?: number
  pauseDuration?: number
  className?: string
  cursorClassName?: string
}

export default function Typewriter({
  texts,
  speed = 80,
  deleteSpeed = 40,
  pauseDuration = 2000,
  className = '',
  cursorClassName = '',
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    const currentText = texts[textIndex]

    if (!isDeleting && displayText === currentText) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseDuration)
      return () => clearTimeout(timeoutRef.current)
    }

    if (isDeleting && displayText === '') {
      setIsDeleting(false)
      setTextIndex((prev) => (prev + 1) % texts.length)
      return
    }

    const delay = isDeleting ? deleteSpeed : speed
    timeoutRef.current = setTimeout(() => {
      setDisplayText(
        isDeleting
          ? currentText.slice(0, displayText.length - 1)
          : currentText.slice(0, displayText.length + 1)
      )
    }, delay)

    return () => clearTimeout(timeoutRef.current)
  }, [displayText, isDeleting, textIndex, texts, speed, deleteSpeed, pauseDuration])

  return (
    <span className={className}>
      {displayText}
      <span className={`animate-pulse ${cursorClassName}`}>|</span>
    </span>
  )
}
