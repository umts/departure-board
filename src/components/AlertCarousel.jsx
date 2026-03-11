import { useState, useEffect } from 'react'
import classNames from './AlertCarousel.module.css'

export default function AlertCarousel ({ alerts }) {
  const [alertIndex, setAlertIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAlertIndex((index) => (index + 1) % alerts.length)
    }, 20000)
    return () => clearInterval(interval)
  }, [alerts])

  const currentAlert = alerts[alertIndex]

  return (
    <>
      {(currentAlert) && (
        <div role='alert' className={classNames['alert-carousel']}>
          <div className={classNames['alert-number']}>
            <div><i className='fa-regular fa-bell' /></div>
            {(alerts.length > 1) && <div>{alertIndex + 1}/{alerts.length}</div>}
          </div>
          <div className={classNames['alert-content']}>
            <div className={classNames['alert-subject']}>
              <div><strong>{currentAlert.header}</strong></div>
              <div className={classNames['alert-routes']}>
                {currentAlert.routes.map((route) => (
                  <span
                    key={`${currentAlert.id}-${route.id}`}
                    style={{ textDecorationLine: 'underline', textDecorationColor: `#${route.color}` }}
                  >
                    {route.name}
                  </span>
                ))}
              </div>
            </div>
            <div>{currentAlert.description}</div>
          </div>
        </div>
      )}
    </>
  )
}
