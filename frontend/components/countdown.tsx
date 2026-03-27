"use client"

import { useState, useEffect } from "react"

interface CountdownProps {
  targetDate: Date
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        // If we've reached the target date
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    // Calculate immediately
    calculateTimeLeft()

    // Then set up interval
    const timer = setInterval(calculateTimeLeft, 1000)

    // Clean up
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="time">
      <div className="it-time">
        <span className="days">{timeLeft.days}</span>
        <p>days</p>
      </div>

      <div className="it-time">
        <span className="hours">{timeLeft.hours}</span>
        <p>hours</p>
      </div>

      <div className="it-time">
        <span className="minutes">{timeLeft.minutes}</span>
        <p>minutes</p>
      </div>

      <div className="it-time">
        <span className="seconds">{timeLeft.seconds}</span>
        <p>seconds</p>
      </div>
    </div>
  )
}
