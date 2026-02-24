import { useState, useEffect } from 'react'
import classNames from './AlertCarousel.module.css'

export default function AlertCarousel ({ alerts }) {
  const [alertIndex, setAlertIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAlertIndex((index) => (index + 1) % alerts.length)
    }, 1000)
    return () => clearInterval(interval)
  }, [alerts])

  const currentAlert = alerts[alertIndex]

  return (
    <div className={classNames['alert-carousel']}>
      <div>{alertIndex + 1}/{alerts.length}</div>
      <div>{currentAlert.header}</div>
      <div>{currentAlert.description}</div>
    </div>
  )
}
