import { useEffect, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import TimeFormatterContext from '../contexts/DepartureTimeFormatterContext.js'
import classNames from './DepartureBoard.module.css'

export default function DepartureBoard ({ children }) {
  const [gridDimensions, setGridDimensions] = useState(optimalGridDimensions(children.length))
  useEffect(() => {
    const handleResize = () => setGridDimensions(optimalGridDimensions(children.length))
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [children.length])

  const [timeFormatter, setTimeFormatter] = useState(() => absoluteTime)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeFormatter((timeFormatter === absoluteTime) ? () => relativeTime : () => absoluteTime)
    }, 5000)
    return () => clearTimeout(timeout)
  }, [timeFormatter])

  return (
    <div
      className={classNames['departure-board']}
      style={{
        gridTemplateColumns: `repeat(${gridDimensions[0]}, 1fr)`,
        fontSize: `min(${3 / gridDimensions[0]}vw, ${4 / gridDimensions[1]}vh)`
      }}
    >
      <TimeFormatterContext value={timeFormatter}>
        {children}
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
  /* v8 ignore start */
  while (gridWidth * gridHeight < numItems) {
    if ((pixelWidth / pixelHeight) > GRID_ITEM_ASPECT_RATIO) {
      pixelWidth = pixelWidth / 2
      gridWidth++
    } else {
      pixelHeight = pixelHeight / 2
      gridHeight++
    }
  }
  /* v8 ignore stop */
  return [gridWidth, gridHeight]
}

const absoluteTime = (time) => format(time, 'h:mm aaa')

const relativeTime = formatDistanceToNow
