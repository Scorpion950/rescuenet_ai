import {
    API_BASE_URL,
} from "../utils/constants";

export const analyzeEmergency =
    async (description, mediaUrls = []) => {

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
                            mediaUrls,
                        }),

                    }

                );

            if (!response.ok) {

                return {
                    severity: "PENDING",
                    department: "Police", // Default fallback
                    error: true,
                };

            }

            const data =
                await response.json();

            return {
                severity:
                    data.severity,
                department:
                    data.department,
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