import { useContext } from 'react'
import DepartureTimeFormatterContext from '../contexts/DepartureTimeFormatterContext.js'
import classNames from './Departure.module.scss'

export default function Departure ({ route, destination, time, color }) {
  const timeFormatter = useContext(DepartureTimeFormatterContext)
  const colorings = { backgroundColor: `${color}55`, borderColor: color }
  return (
    <li className={classNames['departure-container']}>
      <div className={classNames['departure-route']} style={colorings}>
        {route}
      </div>
      <div className={classNames['departure-destination']} style={colorings}>
        {destination}
      </div>
      <div className={classNames['departure-time']} style={colorings}>
        {timeFormatter(time)}
      </div>
    </li>
  )
}
