import { useState, useEffect } from "react";
import classNames from "./AlertCarousel.module.css";
import AlertRoute from "./AlertRoute.jsx";

export default function AlertCarousel({ alerts }) {
  const [alertIndex, setAlertIndex] = useState(0);

  useEffect(() => {
    if (alerts.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setAlertIndex((index) => (index + 1) % alerts.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  const currentAlert = alerts[alertIndex];

  return (
    currentAlert && (
      <div role="alert" className={classNames["alert-carousel"]}>
        <div className={classNames["alert-number"]}>
          <div>
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          {alerts.length > 1 && (
            <div>
              {alertIndex + 1}/{alerts.length}
            </div>
          )}
        </div>
        <div className={classNames["alert-content"]}>
          <div className={classNames["alert-subject"]}>
            <div>
              <strong>{currentAlert.header}</strong>
            </div>
            <div className={classNames["alert-routes"]}>
              {currentAlert.routes.map((route) => (
                <AlertRoute
                  key={`${currentAlert.id}-${route.id}`}
                  name={route.name}
                  color={route.color}
                />
              ))}
            </div>
          </div>
          <div>{currentAlert.description}</div>
        </div>
        {alerts.length > 1 && (
          <div className={classNames["countdown"]} key={currentAlert.id}>
            <div className={classNames["countdown-bar"]} />
          </div>
        )}
      </div>
    )
  );
}
