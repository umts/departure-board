import { useContext } from 'react'
import DepartureTimeFormatterContext from '../contexts/DepartureTimeFormatterContext.js'
import classNames from './Departure.module.css'

export default function Departure ({ route, destination, time, color, textColor }) {
  const timeFormatter = useContext(DepartureTimeFormatterContext)
  return (
    <>
      <div className={classNames['departure-route']} style={{ backgroundColor: color, color: textColor }}>
        {route}
      </div>
      <div className={classNames['departure-destination']} style={{ backgroundColor: color, color: textColor }}>
        {destination}
      </div>
      <div className={classNames['departure-time']} style={{ backgroundColor: color, color: textColor }}>
        {timeFormatter(time)}
      </div>
    </>
  )
}
