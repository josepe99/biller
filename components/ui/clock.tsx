'use client'

import { useState, useEffect } from 'react'
import { Clock as ClockIcon, CalendarDays } from 'lucide-react'

interface ClockProps {
  showDate?: boolean
  className?: string
}

export function Clock({ showDate = false, className = '' }: ClockProps) {
  const [time, setTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(new Date())
    
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Prevent hydration mismatch by not rendering on server
  if (!mounted || !time) {
    return (
      <div className={`flex items-center ${className}`}>
        <ClockIcon className="h-4 w-4 mr-1" />
        <span>--:--:--</span>
        {showDate && (
          <>
            <CalendarDays className="h-4 w-4 mr-1 ml-4" />
            <span>--/--/----</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center ${className}`}>
      <ClockIcon className="h-4 w-4 mr-1" />
      <span>{time.toLocaleTimeString()}</span>
      {showDate && (
        <>
          <CalendarDays className="h-4 w-4 mr-1 ml-4" />
          <span>{time.toLocaleDateString()}</span>
        </>
      )}
    </div>
  )
}
