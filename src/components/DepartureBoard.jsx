import { useEffect, useRef, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import TimeFormatterContext from '../contexts/DepartureTimeFormatterContext.js'
import classNames from './DepartureBoard.module.scss'

export default function DepartureBoard ({ children }) {
  const [timeFormatter, setTimeFormatter] = useState(() => absoluteTime)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeFormatter((timeFormatter === absoluteTime) ? () => relativeTime : () => absoluteTime)
    }, 5000)
    return () => clearTimeout(timeout)
  }, [timeFormatter])

  const [aspectRatio, setAspectRatio] = useState(getAspectRatio())

  useEffect(() => {
    const handleResize = () => {
      setAspectRatio(getAspectRatio())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const multi = Math.floor(Math.sqrt(children.length / (aspectRatio[0] * aspectRatio[1])))

  const gridWidth = aspectRatio[0] * multi
  const gridHeight = aspectRatio[1] * multi

  console.log(`aspectRatio: ${aspectRatio}`)
  console.log(`dim: ${gridWidth} ${gridHeight}`)

  return (
    <div className={classNames['departure-board']} style={{ gridTemplateColumns: `repeat(${1}, 1fr)` }}>
      <TimeFormatterContext value={timeFormatter}>
        {children}
      </TimeFormatterContext>
    </div>
  )
}

const absoluteTime = (time) => format(time, 'h:mm aaa')

const relativeTime = formatDistanceToNow

function getAspectRatio () {
  const width = window.innerWidth
  const height = window.innerHeight

  const min = Math.min(width, height)
  const x = width / min
  const y = height / min

  return [Math.round(x), Math.round(y)]
}
