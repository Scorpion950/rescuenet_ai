import {
    API_BASE_URL,
} from "../utils/constants";

export const sendSOSRequest =
    async (
        service,
        latitude,
        longitude
    ) => {

        try {

            const response =
                await fetch(

                    `${API_BASE_URL}/send-sos`,

                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({

                            service,
                            latitude,
                            longitude,

                        }),

                    }

                );

            return await response.json();

        } catch (error) {

            console.error(error);

            return {
                error:
                    "Failed to send SOS",
            };

        }

    };