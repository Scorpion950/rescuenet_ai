import {
    useEffect,
    useState,
} from "react";

import {
    fetchNearbyIncidents,
} from "../services/incidentService";

function useNearbyAlerts() {

    const [
        nearbyAlerts,
        setNearbyAlerts
    ] = useState([]);

    useEffect(() => {

        let watchId;

        if (

            navigator.geolocation

        ) {

            watchId =

                navigator.geolocation
                    .watchPosition(

                        async (position) => {

                            try {

                                const latitude =
                                    position.coords.latitude;

                                const longitude =
                                    position.coords.longitude;

                                const data =
                                    await fetchNearbyIncidents(

                                        latitude,
                                        longitude

                                    );

                                setNearbyAlerts(data);

                            } catch (error) {

                                console.error(error);

                            }

                        },

                        (error) => {

                            // Silently ignore permission denied errors to keep console clean
                            if (error.code !== error.PERMISSION_DENIED) {
                                console.warn("Geolocation warning:", error.message);
                            }

                        },

                        {

                            enableHighAccuracy:
                                false,

                            timeout: 5000,

                            maximumAge: 60000,

                        }

                    );

        }

        // Cleanup
        return () => {

            if (

                watchId !== undefined

            ) {

                navigator.geolocation
                    .clearWatch(watchId);

            }

        };

    }, []);

    return nearbyAlerts;

}

export default useNearbyAlerts;