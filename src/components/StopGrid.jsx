import { useEffect, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import TimeFormatterContext from '../contexts/DepartureTimeFormatterContext.js'
import Stop from './Stop.jsx'
import classNames from './StopGrid.module.css'

export default function StopGrid ({ stops, width }) {
  const [timeFormatter, setTimeFormatter] = useState(() => absoluteTime)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeFormatter((timeFormatter === absoluteTime) ? () => relativeTime : () => absoluteTime)
    }, 5000)
    return () => clearTimeout(timeout)
  }, [timeFormatter])

  return (
    <div
      className={classNames['stop-grid']}
      style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}
    >
      <TimeFormatterContext value={timeFormatter}>
        {stops.map((stop) => (<Stop key={stop.id} name={stop.name} departures={stop.departures} />))}
      </TimeFormatterContext>
    </div>
  )
}

const absoluteTime = (time) => format(time, 'h:mm aaa')

const relativeTime = formatDistanceToNow
