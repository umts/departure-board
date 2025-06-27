import { useEffect, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import TimeFormatterContext from '../contexts/DepartureTimeFormatterContext.js'
import classNames from './DepartureBoard.module.css'

export default function DepartureBoard ({ children }) {
  const [timeFormatter, setTimeFormatter] = useState(() => absoluteTime)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeFormatter((timeFormatter === absoluteTime) ? () => relativeTime : () => absoluteTime)
    }, 5000)
    return () => clearTimeout(timeout)
  }, [timeFormatter])

  return (
    <div className={classNames['departure-board']}>
      <TimeFormatterContext value={timeFormatter}>
        {children}
      </TimeFormatterContext>
    </div>
  )
}

const absoluteTime = (time) => format(time, 'h:mm aaa')

const relativeTime = formatDistanceToNow
