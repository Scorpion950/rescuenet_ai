import {
    API_BASE_URL,
} from "../utils/constants";

export const analyzeEmergency =
    async (description) => {

        try {

            const response =
                await fetch(

                    `${API_BASE_URL}/analyze-report`,

                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            description,
                        }),

                    }

                );

            if (!response.ok) {

                return {
                    severity: "PENDING",
                    error: true,
                };

            }

            const data =
                await response.json();

            return {
                severity:
                    data.severity,
                error: false,
            };

        } catch (error) {

            console.error(error);

            return {
                severity: "PENDING",
                error: true,
            };

        }

    };