import { formatDistanceToNow } from 'date-fns'
import classNames from './Departure.module.css'

export default function Departure ({ route, destination, time, color, textColor }) {
  const relativeTime = formatDistanceToNow(time)
  return (
    <div className={classNames['departure-container']} style={{ backgroundColor: color, color: textColor }}>
      <div className={classNames['departure-route']}>
        {route}
      </div>
      <div className={classNames['departure-destination']}>
        {destination}
      </div>
      <div className={classNames['departure-time']}>
        {relativeTime}
      </div>
    </div>
  )
}
