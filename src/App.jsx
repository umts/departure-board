import alertsFromGtfs from "./utils/alertsFromGtfs.js";
import DepartureBoard from "./components/DepartureBoard.jsx";
import departuresFromGtfs from "./utils/departuresFromGtfs.js";
import useConfig from "./hooks/useConfig.js";
import useGtfsRealtimeAlerts from "./hooks/useGtfsRealtimeAlerts.js";
import useGtfsScheduleData from "./hooks/useGtfsScheduleData.js";
import useGtfsTripUpdates from "./hooks/useGtfsTripUpdates.js";

export default function App() {
  const {
    gtfsScheduleUrl,
    gtfsRealtimeTripUpdatesUrl,
    gtfsRealtimeAlertsUrl,
    stopIds,
    routeIds,
    migrateWarning,
  } = useConfig();

  const gtfsSchedule = useGtfsScheduleData(gtfsScheduleUrl);

  const gtfsTripUpdates = useGtfsTripUpdates(gtfsRealtimeTripUpdatesUrl);

  const gtfsAlerts = useGtfsRealtimeAlerts(gtfsRealtimeAlertsUrl);

  const stops = departuresFromGtfs(gtfsSchedule, gtfsTripUpdates, stopIds, routeIds);
  const alerts = alertsFromGtfs(gtfsSchedule, gtfsAlerts, stopIds, routeIds);

  return stops === undefined || alerts === undefined ? null : (
    <DepartureBoard migrateWarning={migrateWarning} stops={stops} alerts={alerts} />
  );
}
