import { format, formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import classNames from './Departure.module.css'

export default function Departure ({ route, destination, time, color, textColor }) {
  const [timeToggle, setTimeToggle] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setTimeToggle(!(timeToggle)), 5000)
    return () => clearTimeout(timeout)
  }, [timeToggle])

  return (
    <div className={classNames['departure-container']} style={{ backgroundColor: color, color: textColor }}>
      <div className={classNames['departure-route']}>
        {route}
      </div>
      <div className={classNames['departure-destination']}>
        {destination}
      </div>
      <div className={classNames['departure-time']}>
        {(timeToggle) ? format(time, 'h:mm aaa') : formatDistanceToNow(time)}
      </div>
    </div>
  )
}
