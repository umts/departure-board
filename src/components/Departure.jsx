import { useContext } from 'react'
import DepartureTimeFormatterContext from '../contexts/DepartureTimeFormatterContext.js'
import classNames from './Departure.module.css'

export default function Departure ({ route, destination, time, color, textColor }) {
  const timeFormatter = useContext(DepartureTimeFormatterContext)
  const colorings = { backgroundColor: `${color}77`, borderColor: color }
  return (
    <>
      <div className={`${classNames['departure-item']} ${classNames['departure-route']}`} style={colorings}>
        {route}
      </div>
      <div className={`${classNames['departure-item']} ${classNames['departure-destination']}`} style={colorings}>
        {destination}
      </div>
      <div className={`${classNames['departure-item']} ${classNames['departure-time']}`} style={colorings}>
        {timeFormatter(time)}
      </div>
    </>
  )
}
