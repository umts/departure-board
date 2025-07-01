import { useEffect, useState } from 'react'

const n = 2
const r = 0.8

const keys = []
for (let i = 0; i < n; i++) {
  keys[i] = i
}

export default function App () {
  const [dimensions, setDimensions] = useState([window.innerWidth, window.innerHeight])
  useEffect(() => {
    const handleResize = () => setDimensions([window.innerWidth, window.innerHeight])
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const width = gridWidth(n, dimensions[0], dimensions[1])

  return (
    <div className='grid' style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
      {keys.map((key) => (
        <div key={key} className='item' />
      ))}
    </div>
  )
}

function gridWidth (n, x, y) {
  let width = 1
  let height = 1

  while (width * height < n) {
    if ((x / y) > r) {
      x = x / 2
      width++
    } else {
      y = y / 2
      height++
    }
  }

  return width
}
