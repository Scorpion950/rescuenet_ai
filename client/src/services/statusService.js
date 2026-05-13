import {
    API_BASE_URL,
} from "../utils/constants";

export const updateIncidentStatus =
    async (

        incidentId,
        status

    ) => {

        try {

            const response =
                await fetch(

                    `${API_BASE_URL}/incident/status`,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                        },

                        body: JSON.stringify({

                            incidentId,
                            status,

                        }),

                    }

                );

            return await response.json();

        } catch (error) {

            console.error(error);

            return {

                error:
                    "Failed to update status",

            };

        }

    };