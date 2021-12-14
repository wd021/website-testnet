import { ReactNode, useEffect, useState } from 'react'
import {
  differenceInHours,
  differenceInMinutes,
  formatDistanceStrict,
} from 'date-fns'

const updateDay = (time: Date, goalTime: Date) =>
  time > goalTime
    ? '0 days'
    : formatDistanceStrict(goalTime, time, {
        unit: 'day',
        roundingMethod: 'floor',
      })
const updateHours = (time: Date, goalTime: Date) => {
  if (time > goalTime) return '0 hours'
  const hours = differenceInHours(goalTime, time) % 24
  return `${hours} hour${hours !== 1 ? 's' : ''}`
}
const updateMinutes = (time: Date, goalTime: Date) => {
  if (time > goalTime) return '0 minutes'
  const minutes = differenceInMinutes(goalTime, time) % 60
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`
}

const updateTimeRemaining = (goalTime: string | number) => {
  const LAUNCH_DATE = new Date(goalTime)
  const now = new Date()

  const hours = updateHours(now, LAUNCH_DATE)
  const days = updateDay(now, LAUNCH_DATE)
  const minutes = updateMinutes(now, LAUNCH_DATE)

  return { days, hours, minutes }
}

type CountdownProps = {
  goalTime: string | number
  message: string | ReactNode
  addendum: string | ReactNode
}

const Countdown = ({ goalTime, message, addendum = null }: CountdownProps) => {
  const [time, setTime] = useState(updateTimeRemaining(goalTime))

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTime(updateTimeRemaining(goalTime))
    }, 10000)

    return () => clearTimeout(timeout)
  })
  const { days, minutes, hours } = time

  return (
    <div
      style={{
        background: '#e1ddff',
        height: 'auto',
        fontSize: 18,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0.7rem',
      }}
    >
      <span>
        {message} in {days}, {hours}, and {minutes}&nbsp;
        {addendum}
      </span>
    </div>
  )
}

export default Countdown
