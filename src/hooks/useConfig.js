import { useMemo } from 'react'

export default function useConfig () {
  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return {
      stopIds: parseArray(import.meta.env.VITE_STOP_IDS || searchParams.get('stopIds'))
    }
  }, [])
}

function parseArray (arg) {
  return arg?.split(',')?.filter((item) => !!(item))
}
