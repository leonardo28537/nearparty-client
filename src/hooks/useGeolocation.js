import { useState, useEffect } from 'react'

export const useGeolocation = (options = {}) => {
  const [state, setState] = useState({
    loading: true,
    error:   null,
    coords:  null, // { lat, lng }
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ loading: false, error: 'Geolocalización no soportada', coords: null })
      return
    }

    const onSuccess = ({ coords }) => {
      setState({
        loading: false,
        error:   null,
        coords:  { lat: coords.latitude, lng: coords.longitude },
      })
    }

    const onError = (err) => {
      setState({ loading: false, error: err.message, coords: null })
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout:            10000,
      maximumAge:         60000,
      ...options,
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, defaultOptions)
  }, [])

  return state
}
