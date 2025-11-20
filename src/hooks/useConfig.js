import { useMemo } from 'react'

export default function useConfig () {
  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return {
      stopIds: parseArray(searchParams.get('stopIds') || import.meta.env.VITE_STOP_IDS),
      routeIds: parseArray(searchParams.get('routeIds') || import.meta.env.VITE_ROUTE_IDS),
    }
  }, [])
}

function parseArray (arg) {
  return arg?.split(',')?.filter((item) => !!(item))
}
