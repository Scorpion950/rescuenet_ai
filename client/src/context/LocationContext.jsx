/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchRef = useRef(null);

  const requestLocation = useCallback(({ watch = false } = {}) => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const failure = new Error("Location is not supported by this browser.");
      setError(failure.message);
      reject(failure);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coordinates);
        setError(null);
        if (watch && watchRef.current === null) {
          watchRef.current = navigator.geolocation.watchPosition(
            (next) => setUserLocation([
              next.coords.latitude, next.coords.longitude,
            ]),
            (issue) => setError(issue.message),
            { enableHighAccuracy: false, maximumAge: 60000, timeout: 20000 }
          );
          setIsTracking(true);
        }
        resolve(coordinates);
      },
      (issue) => {
        setError(issue.message);
        reject(issue);
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
    );
  }), []);

  const stopTracking = useCallback(() => {
    if (watchRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setIsTracking(false);
    setUserLocation(null);
  }, []);

  useEffect(() => () => {
    if (watchRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchRef.current);
    }
  }, []);

  return (
    <LocationContext.Provider value={{
      userLocation, error, isTracking, requestLocation, stopTracking,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const value = useContext(LocationContext);
  if (!value) throw new Error("useLocation requires LocationProvider.");
  return value;
}
