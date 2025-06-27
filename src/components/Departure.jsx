import { useContext } from 'react'
import DepartureTimeFormatterContext from '../contexts/DepartureTimeFormatterContext.js'
import classNames from './Departure.module.css'

export default function Departure ({ route, destination, time, color, textColor }) {
  const timeFormatter = useContext(DepartureTimeFormatterContext)
  return (
    <div className={classNames['departure-container']} style={{ backgroundColor: color, color: textColor }}>
      <div className={classNames['departure-route']}>
        {route}
      </div>
      <div className={classNames['departure-destination']}>
        {destination}
      </div>
      <div className={classNames['departure-time']}>
        {timeFormatter(time)}
      </div>
    </div>
  )
}
