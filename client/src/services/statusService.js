import {
    API_BASE_URL,
} from "../utils/constants";

/* Update Incident Status */
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

                            "x-admin-key":
                                localStorage.getItem(
                                    "isAdmin"
                                ) === "true"
                                    ? "authorized"
                                    : process.env.ADMIN_PASSWORD,

                        },

                        body: JSON.stringify({

                            incidentId,
                            status,

                        }),

                    }

                );

            return await response.json();

        }

        catch (error) {

            console.error(error);

        }

    };