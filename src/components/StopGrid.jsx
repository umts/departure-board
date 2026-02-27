import { useEffect, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import TimeFormatterContext from '../contexts/DepartureTimeFormatterContext.js'
import Stop from './Stop.jsx'
import classNames from './StopGrid.module.css'

export default function StopGrid ({ stops }) {
  const [gridDimensions, setGridDimensions] = useState(optimalGridDimensions(stops.length))
  useEffect(() => {
    const handleResize = () => setGridDimensions(optimalGridDimensions(stops.length))
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [stops.length])

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
      style={{
        gridTemplateColumns: `repeat(${gridDimensions[0]}, 1fr)`,
        fontSize: `min(${3 / gridDimensions[0]}vw, ${4 / gridDimensions[1]}vh)`
      }}
    >
      <TimeFormatterContext value={timeFormatter}>
        {stops.map((stop) => (<Stop key={stop.id} name={stop.name} departures={stop.departures} />))}
      </TimeFormatterContext>
    </div>
  )
}

const GRID_ITEM_ASPECT_RATIO = 1

function optimalGridDimensions (numItems) {
  let pixelWidth = window.innerWidth
  let pixelHeight = window.innerHeight
  let gridWidth = 1
  let gridHeight = 1
  while (gridWidth * gridHeight < numItems) {
    if ((pixelWidth / pixelHeight) > GRID_ITEM_ASPECT_RATIO) {
      pixelWidth = pixelWidth / 2
      gridWidth++
    } else {
      pixelHeight = pixelHeight / 2
      gridHeight++
    }
  }
  return [gridWidth, gridHeight]
}

const absoluteTime = (time) => format(time, 'h:mm aaa')

const relativeTime = formatDistanceToNow
