import {
    API_BASE_URL,
} from "../utils/constants";

export const fetchNearbyIncidents =
    async (
        latitude,
        longitude
    ) => {

        try {

            const response =
                await fetch(

                    `${API_BASE_URL}/nearby-incidents`,

                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({

                            latitude,
                            longitude,

                        }),

                    }

                );

            return await response.json();

        } catch (error) {

            console.error(error);

            return {
                incidents: [],
            };

        }

    };