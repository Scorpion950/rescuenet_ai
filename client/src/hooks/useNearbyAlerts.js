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

        navigator.geolocation.watchPosition(

            async (position) => {

                try {

                    const data =
                        await fetchNearbyIncidents(

                            position.coords.latitude,
                            position.coords.longitude

                        );

                    setNearbyAlerts(
                        data.incidents || []
                    );

                } catch (error) {

                    console.error(error);

                }

            }

        );

    }, []);

    return nearbyAlerts;

}

export default useNearbyAlerts;