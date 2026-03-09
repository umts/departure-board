import { useEffect, useState } from 'react'

export default function useOptimalGridDimensions (n) {
  const [gridDimensions, setGridDimensions] = useState(optimalGridDimensions(n))
  useEffect(() => {
    const handleResize = () => setGridDimensions(optimalGridDimensions(n))
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [n])
  return gridDimensions
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
