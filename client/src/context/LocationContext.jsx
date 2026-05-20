import { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        if (!navigator.geolocation) {
            const errMsg = "Geolocation is not supported by your browser";
            setError(errMsg);
            console.error(errMsg);
            return;
        }

        setIsTracking(true);
        console.log("Starting geolocation tracking...");

        // Using watchPosition for continuous tracking without repeated popups
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const newLocation = [
                    position.coords.latitude,
                    position.coords.longitude,
                ];
                console.log("Location updated:", newLocation);
                setUserLocation(newLocation);
                setError(null);
            },
            (err) => {
                const errorMsg = `Geolocation error: ${err.message}`;
                setError(errorMsg);
                console.warn("Location error:", err);
            },
            {
                enableHighAccuracy: false, // Set to false for faster initial location
                timeout: 30000, // Increased timeout for reliability
                maximumAge: 5000, // Cache location for 5 seconds
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
            setIsTracking(false);
            console.log("Stopped geolocation tracking");
        };
    }, []);

    return (
        <LocationContext.Provider value={{ userLocation, error, isTracking }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error("useLocation must be used within a LocationProvider");
    }
    return context;
};
